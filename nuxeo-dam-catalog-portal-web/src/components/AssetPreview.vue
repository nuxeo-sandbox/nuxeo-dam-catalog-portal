<template>
  <div class="product-detail">
    <div class="product-detail-preview-wrapper">
      <img-preview :url="imageUrl" v-if="asset.type === 'Picture'" class="product-detail-preview"></img-preview>
      <div
        class="product-detail-preview"
        v-else-if="asset.type === 'Video'">
        <video-player  class="video-player-box product-detail-preview-video"
               ref="videoPlayer"
               :options="playerOptions"
               :playsinline="true">
         </video-player>
      </div>
      <iframe
        class="product-detail-preview iframe"
        v-else-if="asset.type === 'File'"
        :src="pdfUrl"
         frameborder="0">
      </iframe>
    </div>
    <div class="product-detail-infos">
      <header class="product-detail-header">
        <h1 class="product-detail-title">
          {{title}}
        </h1>
        <ul class="product-detail-metas-list">
          <li class="product-detail-metas-list-item">
            <span class="product-detail-metas-list-item-label" v-if="productline">
             {{ $t("message.assetPreview-product-line") }}
            </span>
            <span class="product-detail-metas-list-item-value">
              {{productline}}
            </span>
          </li>
          <li class="product-detail-metas-list-item" v-if="product">
            <span class="product-detail-metas-list-item-label">
             {{ $t("message.assetPreview-product") }}
            </span>
            <span class="product-detail-metas-list-item-value">
              {{product}}
            </span>
          </li>
          <li class="product-detail-metas-list-item" v-if="usage">
            <span class="product-detail-metas-list-item-label">
             {{ $t("message.assetPreview-usage") }}
            </span>
            <span class="product-detail-metas-list-item-value">
              {{usage}}
            </span>
          </li>
        </ul>
      </header>
      <footer class="product-detail-footer">
        <div v-if="isInCart()">
          <b-button @click="removeFromCart()" class="btn-primary btn-lg">
            {{ $t("message.assetPreview-remove-from-cart") }}
          </b-button>
        </div>
        <div v-else>
          <b-button @click="addToCart()" class="btn-primary btn-lg">
            <i class="zmdi zmdi-shopping-cart-plus"></i>
            {{ $t("message.assetPreview-add-to-cart") }}
          </b-button>
        </div>
      </footer>
    </div>
  </div>
</template>

<script>
  import { constants } from '../constants.js'
  import ImgPreview from './ImgPreview.vue'

  import 'video.js/dist/video-js.css'
  import { videoPlayer } from 'vue-video-player'

  export default {

    components: {
      ImgPreview,
      videoPlayer
    },

    props: {
      asset: {
        type: Object
      }
    },

    computed: {
      pdfUrl() {
        return this.asset.contextParameters.preview.url;
      },
      imageUrl() {
        return this.asset.properties['picture:views'][3].content.data;
      },
      playerOptions() {
        return {
          // videojs options
          muted: true,
          playbackRates: [0.7, 1.0, 1.5, 2.0],
          sources: [{
            type: "video/mp4",
            src: this.asset.properties['vid:transcodedVideos'][1].content.data
          }],
          poster: this.asset.properties['picture:views'][1].content.data,
        }
      },
      title() {
        return this.asset.title;
      },
      productline() {
        var line = this.asset.properties['business:product_line'];
        return line ? line.properties.label : null;
      },
      product() {
        var product = this.asset.properties['business:product'];
        return product ? product.title : null;
      },
      usage() {
        var usage = this.asset.properties['dr:authorized_usage'];
        if (usage && usage.length>0) {
          return usage[0].properties.label;
        } else {
          return null;
        }
      }
    },

    methods: {

      stop() {
        if (this.$refs.videoPlayer) {
          this.$refs.videoPlayer.$refs.video.pause();
        }
      },

      addToCart() {
        this.$nuxeo.operation('javascript.CART_AddToCart')
          .input(this.asset.uid)
          .params({
            'cartId': this.$store.state.cartId
          })
          .execute()
          .then(function() {
            this.$toasted.success(this.$t('message.assetPreview-added-to-cart'), constants.TOASTED_DEFAULT_OPTIONS);
            this.$store.dispatch('updateCart');
          }.bind(this))
          .catch(function(error) {
            this.$toasted.error(this.$t('message.assetPreview-unable-to-add'), constants.TOASTED_DEFAULT_OPTIONS);
            throw error;
          });
      },

      removeFromCart() {
        this.$nuxeo.operation('javascript.CART_RemoveFromCart')
          .input(this.asset.uid)
          .params({
            'cartId': this.$store.state.cartId
          })
          .execute()
          .then(function() {
            this.$toasted.success(this.$t('message.assetPreview-removed-from-cart'), constants.TOASTED_DEFAULT_OPTIONS);
            this.$store.dispatch('updateCart');
          }.bind(this))
          .catch(function(error) {
            this.$toasted.error(this.$t('message.assetPreview-unable-to-remove'), constants.TOASTED_DEFAULT_OPTIONS);
            throw error;
          });
      },

      isInCart() {
        var isInCart = this.$store.getters.isInCart(this.asset.uid);
        return isInCart;
      }
    }

  }
</script>

<style>

  .video-js {
    height:100% !important;
    width:100% !important;
  }

</style>
