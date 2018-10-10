<template>
  <div>
    <img ref="image" :src="url" class="source">
  </div>
</template>

<script>

  import Viewer from 'viewerjs'
  import 'viewerjs/dist/viewer.css'

  export default {
    props: {
      url: {
        type:String
      }
    },

    mounted () {
      this.createViewer();
    },

    destroyed () {
      this.$viewer && this.$viewer.destroy()
    },

    watch: {
      url(url) {
        this.$nextTick(function () {
          if (this.$viewer) {
            this.$viewer.update();
          } else {
            this.createViewer();
          }
        })
      },
    },

    methods: {
      createViewer () {
        //this.$viewer && this.$viewer.destroy();
        this.$viewer = new Viewer(this.$refs.image, {
          inline: true,
          navbar: false,
          title:false,
          loading: true,
          fullscreen: false,
          toolbar: {
            zoomIn: 4,
            zoomOut: 4,
            oneToOne: 4,
            reset: 4,
            prev: {
              show: false
            },
            play: {
              show: false
            },
            next: {
              show: false
            },
            rotateLeft: 4,
            rotateRight: 4,
            flipHorizontal: 4,
            flipVertical: 4,
            fullscreen: {
              show: false
            }
          }
        });
        this.$viewer.show();
      }
  },

  }
</script>

<style>
 .source {
   display:none;
 }

</style>
