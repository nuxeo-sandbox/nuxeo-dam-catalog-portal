<template>
  <div>
    <div v-for="bucket in buckets" :key="bucket.key" class="search-termfacet">
      <input type="checkbox" :id="bucket.key" v-model="bucket.checked" v-on:change="_notifyChange">
      <label :for="bucket.key">
        {{bucket.label}} <span class="search-termfacet-count">{{bucket.docCount}}</span>
      </label>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      data: {
        type: Object,
        value: {}
      },
      facetName: {
        type:String,
        value: ''
      }
    },
    data() {
      return {
        buckets:[]
      }
    },

    watch: {
      data(data) {
        this._updateBuckets();
      },
    },

    mounted() {
      this._updateBuckets();
    },

    methods: {
      _notifyChange() {
        const values = [];
        this.buckets.forEach((item) => {
          if (item.checked) {
            values.push(item.key);
          }
        });
        this.$emit('selection-change',{
          values: values,
          facetName: this.data.id
        })
      },

      _updateBuckets() {
        const buckets = this.data.extendedBuckets;
        const selectedBuckets = this.data.selection;
        buckets.forEach((item) => {
          item.checked = selectedBuckets.indexOf(item.key) >= 0;
          item.label = this._computeLabel(item);
        });
        if (this.sortByLabel) {
          buckets.sort((a, b) => {
            if (a.label < b.label) {
              return -1;
            } else if (a.label > b.label) {
              return 1;
            }
            return 0;
          });
        }
        this.buckets = buckets;
      },

      _computeLabel(item) {
        if (item.fetchedKey) {
          const entry = item.fetchedKey;
          if (entry['entity-type'] === 'directoryEntry') {
            return this.labelForDirectoryEntry(entry);
          } else if (entry['entity-type'] === 'user') {
            return this.labelForUserEntry(entry);
          } else if (entry['entity-type'] === 'document') {
            return entry.properties['dc:title'];
          } else {
            return item.key;
          }
        } else {
            return item.key;
        }
      },

      labelForDirectoryEntry(entry) {
        //let lang = window.nuxeo.I18n.language || 'en';
        let lang = 'en';
        if (lang.indexOf('-') > -1) {
          lang = lang.split('-')[0];
        }
        const labels = [];
        while (entry) {
          if (entry.properties[`label_${lang}`]) {
            labels.push(entry.properties[`label_${lang}`]);
          } else if (entry.properties.label) {
            labels.push(entry.properties.label);
          } else if (entry.properties.label_en) {
            labels.push(entry.properties.label_en);
          } else {
            labels.push(entry.properties.id);
          }
          entry = entry.properties.parent;
        }
        //return labels.reverse().join('/');
        return labels[0];
      },

      labelForUserEntry(entry) {
        if (entry.properties === undefined) {
          return entry.id;
        } else if (entry.properties.firstName && entry.properties.firstName.length > 0
         && entry.properties.lastName && entry.properties.lastName.length > 0) {
          return `${entry.properties.firstName} ${entry.properties.lastName}`;
        } else {
          return entry.properties.username;
        }
      }

    }
  }
</script>

<style scoped>

</style>
