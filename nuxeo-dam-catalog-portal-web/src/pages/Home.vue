<template>
  <main class="main-content">
    <section class="section banner-section" style="background-image: url('./images/covers/home.jpg')">
      <b-container>
        <header class="banner-section-header">
          <h1 class="banner-section-title">
            {{ $t("message.home-banner-title") }}
          </h1>
          <div class="banner-section-desc">
            <p>
              {{ $t("message.home-banner-description") }}
            </p>
          </div>
          <div class="banner-section-cta">
            <router-link class="btn btn-primary" to="/search">
              {{ $t("message.home-banner-cta") }}
              <i class="zmdi zmdi-arrow-right"></i>
            </router-link>
          </div>
        </header>
      </b-container>
    </section>
    <b-container>
      <section class="section">
        <header class="section-header">
          <h2 class="section-title">
            {{ $t("message.home-brands") }}
          </h2>
        </header>
        <div class="section-content">
          <b-row class="category-list">
          <b-col md="6" xl="3" v-for="brand in brands">
            <article class="category-item">
              <router-link class="category-item-link" :to="getBrandLink(brand)">
                <div class="category-item-cover" :style="getBrandStyle(brand)"></div>
                <header class="category-item-header">
                  <h3 class="category-item-title">
                    {{getBrandName(brand)}}
                  </h3>
                </header>
              </router-link>
            </article>
          </b-col>
          </b-row>
        </div>
      </section>
      <section class="section">
        <footer class="section-footer">
          <router-link class="btn btn-primary btn-lg" to="/search">
            {{ $t("message.home-all-products") }}
            <i class="zmdi zmdi-arrow-right"></i>
          </router-link>
        </footer>
      </section>
    </b-container>
  </main>
</template>

<script>

export default {
  components: {},

  data() {
    return {
      brands: []
    }
  },

  created() {
    this.fetchBrands();
  },

  methods: {

    fetchBrands() {
      this.$nuxeo.request('search/pp/channel_list/execute', {
        schemas : '*',
        headers : {
          'enrichers.document': 'thumbnail',
          'fetch.document': 'business:brand',
          'X-NXtranslate.directoryEntry': 'label'
        }
      })
      .get()
      .then(function(data) {
        console.log(data);
        this.brands = data.entries;
      }.bind(this))
      .catch(function(error) {
        throw error
      });
    },

    getBrandLink(brand) {
      return "/search?brand="+brand.properties['business:brand'].id;
    },

    getBrandName(brand) {
      return brand.properties['business:brand'].properties.label;
    },

    getBrandStyle(brand) {
      return "background-image: url('"+brand.contextParameters.thumbnail.url+"')";
    },

  }
}
</script>

<style lang="scss">

</style>
