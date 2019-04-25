  <template>
  <main class="main-content">
    <section
      class="section banner-section"
      style="background-image: url('./images/covers/home.jpg')"
    >
      <b-container>
        <section class="section">
          <div class="section-content">
            <carousel-3d :autoplay="true" :autoplay-timeout="5000" :display="10">
              <slide v-for="(slide, i) in images" :index="i" :key="i">
                <figure>
                  <img v-bind:src="slide.src">
                  <figcaption>
                    <p>{{slide.caption}}</p>
                  </figcaption>
                </figure>
              </slide>
            </carousel-3d>
          </div>
        </section>
      </b-container>
    </section>
    <b-container>
      <section class="section">
        <header class="section-header">
          <h2 class="section-title">{{ $t("message.home-brands") }}</h2>
        </header>
        <div class="section-content">
          <b-row class="category-list">
            <b-col md="6" xl="3" v-for="brand in brands" v-bind:key="brand.uid">
              <article class="category-item">
                <router-link class="category-item-link" :to="getBrandLink(brand)">
                  <div class="category-item-cover" :style="getBrandStyle(brand)"></div>
                  <header class="category-item-header">
                    <h3 class="category-item-title">{{getBrandName(brand)}}</h3>
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
import { Carousel3d, Slide } from "vue-carousel-3d";

export default {
  components: {
    Carousel3d,
    Slide
  },

  data() {
    return {
      brands: [],
      results: [],
      images: []
    };
  },

  created() {
    this.fetchBrands();
    this.fetchImages();
  },

  methods: {
    fetchBrands() {
      this.$nuxeo.request("search/pp/channel_list/execute", {
          schemas: "*",
          headers: {
            "enrichers.document": "thumbnail",
            "fetch.document": "business:brand",
            "X-NXtranslate.directoryEntry": "label"
          }
        })
        .get()
        .then(
          function(data) {
            console.log(data);
            this.brands = data.entries;
          }.bind(this)
        )
        .catch(function(error) {
          throw error;
        });
    },

    fetchImages() {
      this.$nuxeo.request("search/pp/asset-search-portal/execute", {
          schemas : ['dublincore','business','picture','video'],
          headers : {
            'enrichers.document': 'thumbnail,preview,permissions',
            'X-NXfetch.aggregate': 'key',
            'fetch.document': 'business:product,business:product_line',
            'X-NXtranslate.directoryEntry': 'label'
          },
          queryParams : this.queryParams
        })
        .get()
        .then(function(data) {
          this.results.splice(0,this.results.length);
          data.entries.forEach(function(entry) {
            this.results.push(entry);
            this.images.push({
                thumb : entry.contextParameters.thumbnail.url,
                src : entry.contextParameters.thumbnail.url,
                caption : entry.title,
                document: entry
              });

          }.bind(this))
        }.bind(this))
        .catch(function(error) {
          throw error;
        });
    },

    getBrandLink(brand) {
      return "/search?brand=" + brand.properties["business:brand"].id;
    },

    getBrandName(brand) {
      return brand.properties["business:brand"].properties.label;
    },

    getBrandStyle(brand) {
      return (
        "background-image: url('" + brand.contextParameters.thumbnail.url + "')"
      );
    }
  }
};
</script>

<style lang="scss">
figure {
  padding: 0;
  margin: 0;
}
figure figcaption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  color: #fff;
  padding: 10px;
  background-color: black;
  /* IE 8 */
  -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=50)";
  /* IE 5-7 */
  filter: alpha(opacity=50);
  /* Netscape */
  -moz-opacity: 0.5;
  /* Safari 1.x */
  -khtml-opacity: 0.5;
  /* Good browsers */
  opacity: 0.5;
}
</style>
