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
      providerName: {
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
        this.isLoading = true;
        this.options.splice(0,this.options.length);
        this.$nuxeo.operation('Repository.PageProvider')
        .params({
          page:0,
          pageProviderName:this.providerName,
          pageSize:20,
          providerName:this.providerName,
          repository:"default",
          searchTerm:query
          })
        .execute()
        .then(function(data) {
          this.isLoading = false;
          data.entries.forEach(function(entry) {
            this.options.push({
              value: entry.uid,
              label: entry.title
            });
          }.bind(this));
        }.bind(this))
        .catch(function(error) {
          this.isLoading = false;
        }.bind(this));
      },

      searchAll(id) {
        //this.search('');
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
