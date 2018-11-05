<template>

  <multiselect
    v-model="value"
    :options="options"
    :placeholder="placeholder"
    :showLabels="false"
    :hideSelected="false"
    @search-change="search"
    :loading="isLoading"
    track-by="value"
    :custom-label="getLabel"
    @open="searchAll"
    @input="selectionChanged"
    :multiple="true">
  </multiselect>

</template>

<script>

  import Multiselect from 'vue-multiselect'
  import 'vue-multiselect/dist/vue-multiselect.min.css'

  export default {

    components: {
      Multiselect
    },

    props: {
      placeholder: {
        type: String
      },
      directoryName: {
        type: String
      }
    },

    data () {
      return {
        value: null,
        options: [],
        isLoading: false
      }
    },

    computed: {

    },

    methods: {

      search(query) {
        this.options.splice(0,this.options.length);
        this.isLoading = true;
        this.$nuxeo.operation('Directory.SuggestEntries')
        .params({
            directoryName: this.directoryName,
            searchTerm: query,
            canSelectParent: true,
            filterParent: true,
            dbl10n: false,
            lang: (navigator.language || navigator.userLanguage).substring(0,2),
            localize: true
          })
        .execute()
        .then(function(data) {
          var entries = [];
          data.forEach(function(entry) {
            this.pushEntries(entry, entries, 0, '');
          }.bind(this))
          this.options = entries;
          this.isLoading = false;
        }.bind(this))
        .catch(function(error) {
          this.isLoading = false;
        }.bind(this));
      },

      searchAll(id) {
        this.search('');
      },

      pushEntries(entry, entries, level, labelPrefix) {
        entries.push({
          value: entry.computedId,
          label: labelPrefix + ' ' +entry.label
        });
        if (entry.children) {
          entry.children.forEach(function(child) {
            this.pushEntries(child,entries,level+1,labelPrefix+'+');
          }.bind(this));
        }
      },

      getLabel(entry) {
        return entry.label;
      },

      selectionChanged(selectedOption, id) {
        this.$emit('change', selectedOption);
      }

    }

  }
</script>

<style>

</style>
