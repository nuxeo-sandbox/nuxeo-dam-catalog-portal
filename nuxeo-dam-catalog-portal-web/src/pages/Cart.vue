<template>
<main class="main-content">
  <b-container>
    <section class="section">

      <header class="section-header">
        <h2 class="section-title">
          {{ $t("message.cart-title") }}
        </h2>
      </header>

      <div class="section-content">
        <b-list-group class="table-wrapper"
                      v-if="total > 0 && !loading">
          <b-list-group-item class="d-flex flex-row flex-wrap"
                             v-for="(asset, index) in cartAssets"
                             v-bind:key="asset.uid">

            <!-- Thumb, title -->
            <div class="d-flex align-self-center flex-row flex-nowrap left">
              <div class="p-2 align-self-center product-item-cover-wrapper thumb"
                   v-bind:style="{ 'background-image': 'url(' + asset.contextParameters.thumbnail.url + ')' }">
              </div>
              <div class="p-2 align-self-center">
                {{ asset.title }}
              </div>
            </div>

            <!-- rendition, size -->
            <div class="d-flex align-self-center flex-row flex-nowrap">
              <div class="rendition">
                <v-select v-model="asset.rendition"
                          :options="getAdditionalFormats(asset)"
                          v-on:input="renditionChanged(asset,index)">
                </v-select>
              </div>
              <div class="p-2 align-self-center badge file-size">
                {{ asset.renditionSizeString }}
              </div>
            </div>

            <!-- actions -->
            <div class="align-self-center ml-auto actions">
              <b-btn variant="danger"
                     size="sm"
                     v-on:click="removeFromCart(asset.uid)">
                <i class="zmdi zmdi-delete"></i>
              </b-btn>
            </div>

          </b-list-group-item>
        </b-list-group>
      </div>

      <div class="search-results-loader"
           v-if="loading">
        <spinner :color="'#ef6d22'"
                 :size="100"
                 :depth="5"></spinner>
        <span class="search-results-loader-label">
              {{ $t("message.cart-loading") }}
            </span>
      </div>

      <p v-if="total === 0 && !loading">
        {{ $t("message.cart-is-empty") }}
      </p>

      <footer class="section-footer"
              v-if="total > 0 && !loading">
        <b-btn variant="secondary"
               v-on:click="clearCart()">
          <i class="zmdi zmdi-refresh"></i>
          <span class="text-with-icon">{{ $t("message.cart-clear") }}</span>
        </b-btn>
        <b-btn variant="primary"
               v-on:click="downloadCart()"
               class="ml-3">
          <i class="zmdi zmdi-download"></i>
          <span class="text-with-icon">{{ $t("message.cart-download") }}</span>
          <spinner :color="'#ffffff'"
                   :size="16"
                   :depth="2"
                   v-if="downloading"></spinner>
        </b-btn>
      </footer>

    </section>
  </b-container>
</main>
</template>

<script>
import vSelect from 'vue-select'
import Spinner from 'vue-spinner-component/src/Spinner.vue'
import {
  constants
} from '../constants.js'

export default {

  components: {
    vSelect,
    Spinner
  },

  data() {
    return {
      cartAssets: [],
      pagesize: 25,
      total: 0,
      fields: [{
        key: 'thumbnail',
        label: this.$t('message.message.cart-column-preview')
      }, {
        key: 'title',
        label: this.$t('message.message.cart-column-title')
      }, {
        key: 'renditions',
        label: this.$t('message.message.cart-column-rendition')
      }, {
        key: 'size',
        label: this.$t('message.message.cart-column-size')
      }, {
        key: 'actions',
        label: ''
      }],
      loading: false,
      downloading: false
    }
  },

  watch: {},

  created() {
    this.loading = true;
    this.fetchCart();
  },

  methods: {

    fetchCart() {
      var opts = {
        'schemas': '*',
        'headers': {
          'enrichers.document': 'thumbnail,permissions'
        }
      };

      this.$nuxeo.operation('javascript.CART_GetCartContents')
        .params(this.getCartIdParams())
        .execute(opts)
        .then(function(data) {
          if (data.entries) {
            this.cartAssets = data.entries;
            // Add default rendition value.
            this.cartAssets.forEach(function(entry) {
              entry.rendition = this.getDefaultRenditionValue(entry);
              entry.renditionSizeString = this.getRenditionSizeString(entry);
            }.bind(this));
            this.total = this.cartAssets.length;
          } else {
            // This happens when an Automation Script returns no documents;
            // Nuxeo returns a "list", not an empty document array.
            this.cartAssets = [];
            this.total = 0;
          }
          this.loading = false;
        }.bind(this))
        .catch(function(error) {
          this.loading = false;
          this.$toasted.error(this.$t('message.cart-cart-access-failed'), constants.TOASTED_DEFAULT_OPTIONS);
          throw error
        }.bind(this));
    },

    refresh() {
      this.fetchCart();
      this.$toasted.clear();
    },

    removeFromCart(docId) {
      this.$nuxeo.operation('javascript.CART_RemoveFromCart')
        .input('docs:' + docId)
        .params(this.getCartIdParams())
        .execute()
        .then(function() {
          this.$toasted.success(this.$t('message.cart-removed-from-cart'), constants.TOASTED_DEFAULT_OPTIONS);
          this.refresh();
          this.$store.dispatch('updateCart');
        }.bind(this))
        .catch(function(error) {
          this.$toasted.error(this.$t('message.cart-unable-to-remove'), constants.TOASTED_DEFAULT_OPTIONS);
          throw error
        });
    },

    getDefaultRenditionValue: function(asset) {
      var defaultRenditionValue;
      var masterAccessGranted = false;

      if (asset && asset.contextParameters && asset.contextParameters.permissions) {
        var permissions = asset.contextParameters.permissions;
        masterAccessGranted = permissions.indexOf('DOWNLOAD') > -1;
      }

      if (asset && asset.facets && (asset.facets.indexOf('Picture') > -1)) {
        defaultRenditionValue = {
          "label": "Medium"
        };
      } else if (asset && asset.type && asset.type === "File") {
        defaultRenditionValue = {
          "label": "PDF"
        };
      } else if (asset && asset.facets && (asset.facets.indexOf('Video') > -1)) {
        defaultRenditionValue = {
          "label": "MP4 720p"
        };
      }

      if (masterAccessGranted) {
        defaultRenditionValue = {
          "label": "Master"
        };
      }

      return defaultRenditionValue;

    },

    getAdditionalFormats(asset) {
      var additionalFormats = [];
      if (asset && asset.facets && (asset.facets.indexOf('Picture') > -1)) {
        additionalFormats = asset.properties['picture:views'].map(function(view) {
          return {
            label: view.title
          };
        });
      } else if (asset && asset.type && asset.type === "File") {
        additionalFormats = [{
          label: 'Original'
        }, {
          label: 'PDF'
        }];
      } else if (asset && asset.facets && (asset.facets.indexOf('Video') > -1)) {
        additionalFormats = asset.properties['vid:transcodedVideos'].map(function(view) {
          return {
            label: view.name
          };
        });
      }
      return additionalFormats;
    },

    downloadCart() {
      this.downloading = true;
      let renditionNames = [];
      this.cartAssets.forEach(function(oneAsset) {
        let name = oneAsset.rendition.label;
        renditionNames.push(name);
      }.bind(this));
      let params = {
        renditionNames: renditionNames
      };

      this.$toasted.info(this.$t('message.cart-zipping'), constants.TOASTED_PERSIST_OPTIONS);

      this.$nuxeo.operation('javascript.CART_ZipCart')
        .input(this.cartAssets)
        .params(params)
        .execute()
        .then(function(data) {
          this.$toasted.clear();
          this.$toasted.info(this.$t('message.cart-downloading'), constants.TOASTED_PERSIST_OPTIONS);
          this.downloadCartFile(data);
        }.bind(this))
        .catch(function(error) {
          this.dowloading = false;
          this.$toasted.error(this.$t('message.cart-unable-to-download'), constants.TOASTED_DEFAULT_OPTIONS);
          throw error;
        }.bind(this));
    },

    downloadCartFile(operationResult) {
      let contentDisposition = operationResult.headers.get('Content-Disposition');
      if (contentDisposition) {
        let filenameMatches = contentDisposition
          .match(/filename[^;=\n]*=([^;\n]*''([^;\n]*)|[^;\n]*)/)
          .filter(function(match) {
            return !!match;
          });
        let filename = decodeURI(filenameMatches[filenameMatches.length - 1]);
        operationResult.blob()
          .then(function(blob) {
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
              window.navigator.msSaveBlob(blob, filename);
            } else {
              let a = document.createElement('a');
              a.style = 'display: none';
              a.download = filename;
              a.href = URL.createObjectURL(blob);
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(a.href);
            }
            this.$toasted.clear();
            this.downloading = false;
            this.$toasted.success(this.$t('message.cart-cart-downloaded'), constants.TOASTED_DEFAULT_OPTIONS);
          }.bind(this));
      }
    },

    clearCart() {
      if (this.cartAssets && this.cartAssets.length > 0) {
        var uids = this.cartAssets.map(function(asset) {
            return asset.uid;
          })
          .join(',');

        this.$nuxeo.operation("javascript.CART_RemoveFromCart")
          .input('docs:' + uids)
          .params(this.getCartIdParams())
          .execute()
          .then(function() {
            this.$toasted.success(this.$t('message.cart-cart-cleared'), constants.TOASTED_DEFAULT_OPTIONS);
            this.$store.dispatch('updateCart');
            this.refresh();
          }.bind(this))
          .catch(function(error) {
            this.$toasted.error(this.$t('message.cart-unable-to-clear'), constants.TOASTED_DEFAULT_OPTIONS);
            throw error
          });
      }
    },

    // I moved this to a function to reduce redundant code since it's used in
    // several places.
    getCartIdParams() {
      var cartId = this.$store.state.cartId;
      var params = {
        'cartId': cartId
      }
      return params;
    },

    renditionChanged(asset, index) {
      this.cartAssets[index].renditionSizeString = this.getRenditionSizeString(asset);
      // Vue.js won't watch the properties of this.cartAssets even though
      // it's bound to the v-for. Here I guess I'm replacing the element,
      // forcing a copy? Taken from: https://stackoverflow.com/a/46985184
      this.$set(this.cartAssets, index, this.cartAssets[index])
    },

    getRenditionSizeString(asset) {
      if (asset.rendition.label === "Master") {
        renditionSizeString = asset.properties['file:content'].length;
      } else {
        if (asset && asset.facets && (asset.facets.indexOf('Picture') > -1)) {
          renditionSizeString = asset.properties['picture:views'][asset.properties['picture:views'].findIndex(function(picView) {
            return picView.title == asset.rendition.label
          })].content.length;
        } else if (asset && asset.type && asset.type === "File") {
          renditionSizeString = asset.properties['file:content'].length;
        } else if (asset && asset.facets && (asset.facets.indexOf('Video') > -1)) {
          renditionSizeString = asset.properties['vid:transcodedVideos'][asset.properties['vid:transcodedVideos'].findIndex(function(picView) {
            return picView.name == asset.rendition.label
          })].content.length;
        }
      }
      var renditionSizeString = this.formatBytes(renditionSizeString, 0);
      return renditionSizeString;
    },

    // Adapted from https://stackoverflow.com/a/18650828
    formatBytes: function(a, b) {
      if (0 == a) return "0 Bytes";
      var c = 1024,
        d = typeof b != 'undefined' ? b : 2,
        e = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
        f = Math.floor(Math.log(a) / Math.log(c));
      return parseFloat((a / Math.pow(c, f))
        .toFixed(d)) + " " + e[f]
    },

    debug(asset) {
      // debugger;
      return asset;
    }

  } // End of `methods`

};
</script>

<style lang="scss">
.thumb {
  width: 80px;
  height: 60px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  margin-bottom: 0 !important;
}

.text-with-icon {
  margin-left: 5px;
}

/* This makes it so the thumb+title pushes everything else to the right. */
.left {
  flex: auto;
}

/* If you set the v-select width to anything smaller than 287px it starts rendering strangely, I don't know why. None of the options are that long. If you don't set a size at all, it also behaves strangely; it will render really wide and then shrink when you select a value. */
.rendition {
  width: 290px;
  margin-top: 5px;
  margin-bottom: 5px;
}

.file-size {
  width: 50px;
}

.actions {
  padding-left: 5px;
}
</style>
