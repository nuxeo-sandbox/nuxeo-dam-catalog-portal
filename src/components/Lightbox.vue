//basd on https://github.com/pexea12/vue-image-lightbox

<template>
  <div @click.stop="closeLightBox">
  <div
    class="vue-lb-container"
    v-show="lightBoxOn"
    v-if="images && images.length > 0"
    ref="container">
    <div class="vue-lb-content">
      <div class="vue-lb-header">
        <button
          type="button"
          :title="$t('message.lightbox-close-esc')"
          class="vue-lb-button-close"
        >
          <i class="zmdi zmdi-close"></i>
        </button> <!-- .vue-lb-button-close -->

      </div> <!-- .vue-lb-header -->
      <div
        class="vue-lb-figure"
        @click.stop>
        <transition
          mode="out-in"
          name="fade">
            <asset-preview ref="preview" v-if="hasSelect" :asset="currentAsset"></asset-preview>
        </transition>

        <div class="vue-lb-footer">
          <div class="vue-lb-footer-info"></div>
          <div class="vue-lb-footer-count">
            {{ select + 1 }}/{{ images.length }}
          </div>
        </div>

      </div>
    </div> <!-- .vue-lb-content -->
    <button
      v-if="images.length > 1"
      type="button"
      class="vue-lb-arrow vue-lb-left"
      :title="$t('message.lightbox-previous')"
      @click.stop="previousImage()"
    >
      <i class="zmdi zmdi-chevron-left"></i>
    </button>

    <button
      v-if="images.length > 1"
      type="button"
      class="vue-lb-arrow vue-lb-right"
      :title="$t('message.lightbox-next')"
      @click.stop="nextImage()"
    >
      <i class="zmdi zmdi-chevron-right"></i>
    </button>
  </div> <!-- .vue-lb-container -->
</div>
</template>

<script>

import AssetPreview from './AssetPreview.vue'

export default {

  components: {
    AssetPreview
  },

  props: {
    images: {
      type: Array,
      required: true,
    },

    disableScroll: {
      type: Boolean,
      default: true,
    },

    showLightBox: {
      type: Boolean,
      default: false,
    },

    startAt: {
      type: Number,
      default: -1,
    },

    nThumbs: {
      type: Number,
      default: 7,
    },

    showThumbs: {
      type: Boolean,
      default: true,
    },

    // Mode
    autoPlay: {
      type: Boolean,
      default: false,
    },

    autoPlayTime: {
      type: Number,
      default: 3000,
    },

    siteLoading: {
      default: null,
    },

    showCaption: {
      type: Boolean,
      default: false,
    },

    lengthToLoadMore: {
      type: Number,
      default: 0
    },
  },

  data() {
    return {
      select: this.startAt,
      lightBoxOn: this.showLightBox,
      timer: null,
    }
  },

  computed: {
    thumbIndex() {
      const halfDown = Math.floor(this.nThumbs / 2)

      if (this.select >= halfDown && this.select < this.images.length - halfDown)
        return {
          begin: this.select - halfDown + (1 - this.nThumbs % 2),
          end: this.select + halfDown,
        }

      if (this.select < halfDown)
        return {
          begin: 0,
          end: this.nThumbs - 1,
        }

      return {
        begin: this.images.length - this.nThumbs,
        end: this.images.length - 1,
      }
    },

    imagesThumb() {
      if (this.siteLoading) {
        return this.images.map(({thumb}) => ({
          src: thumb,
          loading: this.siteLoading,
          error: this.siteLoading,
        }));
      }

      return this.images.map(({thumb}) => thumb)
    },

    currentAsset() {
      return this.images[this.select].document;
    },

    hasSelect() {
      return this.select >= 0;
    }

  },

  watch: {
    lightBoxOn(value) {
      if (document != null) {
        this.onToggleLightBox(value);
      }
    },

    select() {
      if (this.select >= this.images.length - this.lengthToLoadMore - 1)
        this.$emit('onLoad');

      if (this.select === this.images.length - 1)
        this.$emit('onLastIndex');

      if (this.select === 0);
        this.$emit('onFirstIndex');

      if (this.select === this.startAt)
        this.$emit('onStartIndex');
    },
  },

  mounted() {
    if (this.autoPlay) {
      this.timer = setInterval(() => {
        this.nextImage();
      }, this.autoPlayTime)
    }

    this.onToggleLightBox(this.lightBoxOn);

  },

  methods: {
    onToggleLightBox(value) {
      if (this.disableScroll) {
        document.querySelector('html').classList.toggle('no-scroll', value);
      }

      document.querySelector('body').classList.toggle('vue-lb-open', value);
      this.$emit('onOpened', value);

      if (value) {
        document.addEventListener('keydown', this.addKeyEvent);
      } else {
        document.removeEventListener('keydown', this.addKeyEvent);
        if (this.$refs.preview) {
          this.$refs.preview.stop();
        }
      }
    },

    showImage(index) {
      this.$set(this, 'lightBoxOn', true);
      this.$set(this, 'select', index);
    },

    addKeyEvent(event) {
      if (event.keyCode === 37) this.previousImage(); // left arrow
      if (event.keyCode === 39) this.nextImage(); // right arrow
      if (event.keyCode === 27) this.closeLightBox(); // esc
    },

    closeLightBox() {
      this.$set(this, 'lightBoxOn', false);
    },

    nextImage() {
      this.$set(this, 'select', (this.select + 1) % this.images.length);
    },

    previousImage() {
      this.$set(this, 'select', (this.select + this.images.length - 1) % this.images.length);
    },
  },

  beforeDestroy() {
    document.removeEventListener('keydown', this.addKeyEvent);

    if (this.autoPlay) {
      clearInterval(this.timer);
    }
  },
}
</script>
