<template>
  <main class="main-content">
    <Lightbox :images="images" ref="lightbox"></Lightbox>

    <div class="search">
      <aside
        class="search-filters"
        v-bind:class="[{ sticky: searchFilters.isSticky, stickybottom: searchFilters.isStickyBottom, visible: searchFilters.isVisibleOnMobile }]">

        <h2 class="search-suggestions">
          {{ $t('message.search-filters') }}
        </h2>

        <NuxeoDirectorySuggestion
          ref="brandFilter"
          class="search-suggestion"
          :placeholder="$t('message.search-filter-brand')"
          v-on:change="brandFilterChanged"
          directory-name="brands">
        </NuxeoDirectorySuggestion>

        <!--NuxeoDirectorySuggestion
          ref="productLineFilter"
          class="search-suggestion"
          :placeholder="$t('message.search-filter-product-line')"
          v-on:change="productLineFilterChanged"
          directory-name="product_lines">
        </NuxeoDirectorySuggestion-->

        <NuxeoDocumentSuggestion
          class="search-suggestion"
          :placeholder="$t('message.search-filter-product')"
          v-on:change="productFilterChanged"
          provider-name="product-suggestions">
        </NuxeoDocumentSuggestion>

        <h2 class="search-insights">
          {{ $t('message.search-results-facets') }}
        </h2>

        <div class="search-filters-group" v-if="hasFacet('relations_denormalized_products_brand_agg')">
          <h3 class="search-filters-group-title">
            {{ $t('message.search-filter-brand') }}
          </h3>
          <div class="search-filters-group-content">
            <TermFacet
              v-bind:data="facets.relations_denormalized_products_brand_agg"
              v-on:selection-change="refresh">
            </TermFacet>
          </div>
        </div>
        <!--div class="search-filters-group" v-if="hasFacet('business_product_line_agg')">
          <h3 class="search-filters-group-title">
            {{ $t('message.search-filter-product-line') }}
          </h3>
          <div class="search-filters-group-content">
            <TermFacet
              v-bind:data="facets.business_product_line_agg"
              v-on:selection-change="refresh">
            </TermFacet>
          </div>
        </div-->
        <div class="search-filters-group" v-if="hasFacet('relations_products_agg')">
          <h3 class="search-filters-group-title">
            {{ $t('message.search-filter-product') }}
          </h3>
          <div class="search-filters-group-content">
            <TermFacet
              v-bind:data="facets.relations_products_agg"
              v-on:selection-change="refresh">
            </TermFacet>
          </div>
        </div>
        <div class="search-filters-group" v-if="hasFacet('system_mixinType_agg')">
          <h3 class="search-filters-group-title">
            {{ $t('message.search-filter-type') }}
          </h3>
          <div class="search-filters-group-content">
            <TermFacet
              v-bind:data="facets.system_mixinType_agg"
              v-on:selection-change="refresh">
            </TermFacet>
          </div>
        </div>
        <!--div class="search-filters-group" v-if="hasFacet('digital_rights_authorized_usage_agg')">
          <h3 class="search-filters-group-title">
            {{ $t('message.search-filter-rights') }}
          </h3>
          <div class="search-filters-group-content">
            <TermFacet
              v-bind:data="facets.digital_rights_authorized_usage_agg"
              v-on:selection-change="refresh">
            </TermFacet>
          </div>
        </div-->
      </aside>
      <div class="search-content">
        <div class="search-form">
          <input
            class="search-form-input"
            v-model="fulltext"
            :placeholder="$t('message.search-fulltext-placeholder')"
            v-on:keyup.13="_fulltext">
          <b-button variant="primary" class="search-form-submit-btn" @click="_fulltext">
            <i class="zmdi zmdi-search"></i>
            <span class="search-form-submit-btn-label">
              {{ $t('message.search-action-search') }}
            </span>
          </b-button>
          <button class="search-form-filters-btn" @click="toggleFiltersOnMobile()">
            <i class="zmdi zmdi-filter-list"></i>
          </button>
        </div>
        <div class="search-results">
          <header class="search-results-header">
            <h2 class="search-results-header-title">
              {{ $t('message.search-result-count') }}: <strong>{{total}}</strong>
            </h2>
            <div class="search-results-header-parameters pagesize">
              <label for="pagesize" style="width:250px;text-align:right;">
                {{ $t('message.search-results-per-page') }}
              </label>
              <multiselect v-model="pagesize" :options="sizes" track-by="value" label="label" :allow-empty="false" :showLabels="false" placeholder="Size">
              </multiselect>
            </div>
          </header>
          <div class="search-results-content">
            <div class="search-results-loader" v-if="loading">
              <spinner :color="'#ef6d22'" :size="100" :depth="5"></spinner>
              <span class="search-results-loader-label">
                {{ $t('message.search-loading')}}
              </span>
            </div>
            <!--b-btn v-b-modal.modal1>Selection {{selects.length}}</b-btn-->

            <!-- Modal Component -->
            <b-modal id="modal1" title="Bootstrap-Vue" ref="selectionModal">
              <div v-for="(select,index) in selects" v-bind:key="select.uid" class="select">
                <img :src="select.contextParameters.thumbnail.url" @click="openGallery(index)" class="minithumb"/>
                <div>{{select.title}}</div>
                <b-button @click="unselect(select)">Unselect</b-button>
              </div>
              <b-button @click="addSelectionToCart()">Add Selection to Cart</b-button>
              <b-button @click="clearSelects()">Clear Selection</b-button>
            </b-modal>
            <!--div v-if="selects.length>0">
              <b-button @click="addSelectionToCart()">Add Selection to Cart</b-button>
              <b-button @click="clearSelects()">Clear Selection</b-button>
            </div-->

            <b-row v-if="!loading">
              <b-col md="6" lg="4" xl="3" v-for="(result,index) in results" v-bind:key="result.uid">
                <article class="product-item">
                  <div class="product-item-cover-wrapper">
                    <div
                      class="product-item-cover"
                      v-bind:style="{ backgroundImage: 'url(' + result.contextParameters.thumbnail.url + ')' }">
                    </div>
                    <div class="product-item-cover-actions">
                      <b-button @click="openGallery(index)" class="btn-primary preview-btn">
                        <i class="zmdi zmdi-zoom-in"></i>
                        {{ $t('message.search-action-details') }}
                      </b-button>
                      <div v-if="isInCart(result)">
                        <b-button @click="removeFromCart(result)">
                          {{ $t('message.search-action-remove-from-cart')}}
                        </b-button>
                      </div>
                      <div v-else>
                        <b-button @click="addToCart(result)" class="btn-primary cart-btn">
                          <i class="zmdi zmdi-shopping-cart-plus"></i>
                          {{ $t('message.search-action-add-to-cart')}}
                        </b-button>
                      </div>
                    </div>
                  </div>
                  <header class="product-item-header" @click="openGallery(index)">
                    <h4 class="product-item-title">
                      {{result.title}}
                    </h4>
                  </header>
                  <!--div v-if="isSelect(result)">
                    <b-button @click="unselect(result)">Unselect</b-button>
                  </div>
                  <div v-else>
                    <b-button @click="select(result)">Select</b-button>
                  </div-->
                </article>
              </b-col>
            </b-row>
          </div>
          <footer class="search-results-footer">
            <b-pagination
              :total-rows="total"
              v-model="currentPage"
              :per-page="pagesize.value">
            </b-pagination>
          </footer>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css'
import TermFacet from '../components/TermFacet.vue'
import Lightbox from '../components/Lightbox.vue'
import Spinner from 'vue-spinner-component/src/Spinner.vue'
import { constants } from '../constants.js'
import NuxeoDirectorySuggestion from '../components/NuxeoDirectorySuggestion.vue'
import NuxeoDocumentSuggestion from '../components/NuxeoDocumentSuggestion.vue'

export default {

  components: {
    Multiselect,
    TermFacet,
    Lightbox,
    Spinner,
    NuxeoDirectorySuggestion,
    NuxeoDocumentSuggestion
  },

  props: {
    productline: {
      type: String
    },
    productid: {
      type: String
    },
    brand: {
      type: String
    }
  },

  data() {

    return {
      fulltext: undefined,
      results: [],
      pagesize: {value:24, label:'24'},
      currentPage: 1,
      total: 0,
      sizes: [
        {value:12, label:'12'},
        {value:24, label:'24'},
        {value:48, label:'48'},
        {value:96, label:'96'},
      ],
      productlineSuggestions:[],
      productLineFilter: undefined,
      productSuggestions:[],
      productFilter: [],
      facets: {},
      queryParams: {},
      selects: [],
      loading: false,
      searchFilters: {
        isSticky: false,
        isStickyBottom: false,
        offsetTop: 0,
        isVisibleOnMobile: false
      },
      scrollTop: 0
    }
  },

  computed: {
    images: function () {
      var images = [];
      this.results.forEach(function(item) {
        images.push({
          thumb : item.contextParameters.thumbnail.url,
          src : item.contextParameters.thumbnail.url,
          caption : item.title,
          document: item
        })
      })
      return images;
    }
  },

  watch: {
      pagesize: function(val) {
          this.queryParams.pageSize = val.value;
          this.search();
      },
      currentPage: function() {
          this.queryParams.currentPageIndex = this.currentPage - 1;
          this.search();
      },
      '$route' () {
        this.setInitialFiltersFromRoute()
        this.search();
      }
  },

  // TODO: Remove this so Mika doesn't get mad :troll:
  mounted () {
    this.setInitialFiltersFromRoute();
    this.queryParams.pageSize = this.pagesize.value;
    this.search();
    this.calculateSearchFiltersPosition();
  },

  methods: {
    _fulltext() {
      this.queryParams.system_fulltext = this.fulltext;
      this.search();
    },

    /*productLineFilterChanged(selection) {
      var values = [];
      selection.forEach(function(item) {
        values.push(item.value);
      });
      this.queryParams.relations_denormalized_products_brand = values;
      this.search();
    },*/

    productFilterChanged(selection) {
      var values = [];
      selection.forEach(function(item) {
        values.push(item.value);
      });
      this.queryParams.relations_products = JSON.stringify(values);
      this.search();
    },

    brandFilterChanged(selection) {
      var values = [];
      selection.forEach(function(item) {
        values.push(item.value);
      });
      this.queryParams.relations_denormalized_products_brand = JSON.stringify(values);
      this.search();
    },

    search() {
      this.loading = true;
      this.searchFilters.isVisibleOnMobile = false;
      this.$nuxeo.request('search/pp/asset-search-portal/execute', {
          schemas : ['dublincore','relations','picture','video'],
          headers : {
            'enrichers.document': 'thumbnail,preview,permissions',
            'X-NXfetch.aggregate': 'key',
            'fetch.document': 'relations:product',
            'X-NXtranslate.directoryEntry': 'label'
          },
          queryParams : this.queryParams
        })
        .get()
        .then(function(data) {
          this.results.splice(0,this.results.length);
          data.entries.forEach(function(entry) {
            this.results.push(entry);
          }.bind(this))
          this.total = parseInt(data.totalSize);
          this.facets = data.aggregations;
          this.loading = false;
        }.bind(this))
        .catch(function(error) {
          this.loading = false;
          this.$toasted.error(this.$t('message.search-error'), constants.TOASTED_DEFAULT_OPTIONS);
          throw error;
        });
    },

    refresh(e) {
      this.queryParams[e.facetName] = JSON.stringify(e.values);
      this.search();
    },

    openGallery(index) {
      this.$refs.lightbox.showImage(index)
    },

    setInitialFiltersFromRoute() {
      /*if (this.productline) {
        this.queryParams.business_product_line_1 = this.productline;
        this.$refs.productLineFilter.value = {
          value: this.productline,
          label: this.productline
        }
        this.productlineSuggestions.push(this.productLineFilter);
      }*/
      if (this.productid) {
        this.queryParams.relations_products_agg = JSON.stringify([this.productid]);
      }
      if (this.brand) {
        this.queryParams.relations_denormalized_products_brand = JSON.stringify([this.brand]);
        this.$refs.brandFilter.value = {
          value: this.brand,
          label: this.brand
        };
      }
    },

    addToCart(result) {
      this.$nuxeo.operation('javascript.api_shopping_cart_add_content')
        .input(result.uid)
        .params({
          'cartId': this.$store.state.cartId
        })
        .execute()
        .then(function() {
          this.$toasted.success(this.$t('message.search-added-to-cart'), constants.TOASTED_DEFAULT_OPTIONS);
          this.$store.dispatch('updateCart');
        }.bind(this))
        .catch(function(error) {
          this.$toasted.error(this.$t('message.search-unable-to-add'), constants.TOASTED_DEFAULT_OPTIONS);
          throw error;
        });
    },

    removeFromCart(result) {
      this.$nuxeo.operation('javascript.api_shopping_cart_remove_content')
        .input(result.uid)
        .params({
          'cartId': this.$store.state.cartId
        })
        .execute()
        .then(function() {
          this.$toasted.success(this.$t('message.search-removed-from-cart'), constants.TOASTED_DEFAULT_OPTIONS);
          this.$store.dispatch('updateCart');
        }.bind(this))
        .catch(function(error) {
          this.$toasted.error(this.$t('message.search-unable-to-remove'), constants.TOASTED_DEFAULT_OPTIONS);
          throw error;
        });
    },

    select(result) {
      if (this.selects.indexOf(result)<0) {
        this.selects.push(result);
      }
    },

    unselect(result) {
      var index = this.selects.indexOf(result);
      if (index >= 0) {
        this.selects.splice(index,1);
      }
    },

    isSelect(result) {
      return this.selects.indexOf(result)>=0;
    },

    addSelectionToCart() {
      this.$nuxeo.operation('Collection.AddToCollection')
        .input(this.selects)
        .param('collection', '/default-domain/UserWorkspaces/Guest/Shopping_Cart')
        .execute()
        .then(function() {
          this.$store.dispatch('updateCart');
          this.clearSelects();
          this.$refs.selectionModal.hide();
          this.$toasted.success(this.$t('message.Selection Added to Cart'), constants.TOASTED_DEFAULT_OPTIONS);
        }.bind(this))
        .catch(function(error) {
          this.$toasted.error(this.$t('message.Could Not Add Selection to Cart'), constants.TOASTED_DEFAULT_OPTIONS);
          throw error;
        });
    },

    clearSelects() {
      this.selects.splice(0,this.selects.length);
    },

    isInCart(result) {
      var isInCart = this.$store.getters.isInCart(result.uid);
      return isInCart;
    },

    /*productLineFilterChange(productLine) {
      this.queryParams.business_product_line = productLine  ? productLine.value : undefined;
      this.search();
    },*/

    hasFacet(facetName) {
      return this.facets[facetName] &&  this.facets[facetName].buckets && this.facets[facetName].buckets.length>0;
    },

    //UI stuff

    calculateSearchFiltersPosition() {
      var $searchFilters = this.$el.querySelector('.search-filters');
      this.searchFilters.offsetTop = $searchFilters.getBoundingClientRect().top;
    },

    handleScroll() {
      this.scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset
      : (document.documentElement || document.body.parentNode || document.body)
      .scrollTop;

      if (this.scrollTop > this.searchFilters.offsetTop) {
        var appFooterOffsetTop = document.querySelector('.app-footer').getBoundingClientRect().top;
        var searchFiltersHeight = this.$el.querySelector('.search-filters').clientHeight;

        if (appFooterOffsetTop < searchFiltersHeight) {
          this.searchFilters.isStickyBottom = true
          this.searchFilters.isSticky = false
        } else {
          this.searchFilters.isSticky = true
          this.searchFilters.isStickyBottom = false
        }
      } else {
        this.searchFilters.isSticky = false
        this.searchFilters.isStickyBottom = false
      }
    },

    toggleFiltersOnMobile () {
      this.searchFilters.isVisibleOnMobile = !this.searchFilters.isVisibleOnMobile
    }

  },

  created () {
    window.addEventListener('scroll', this.handleScroll);
  },

  destroyed () {
    window.removeEventListener('scroll', this.handleScroll);
  }

};
</script>

<style lang="scss">

</style>
