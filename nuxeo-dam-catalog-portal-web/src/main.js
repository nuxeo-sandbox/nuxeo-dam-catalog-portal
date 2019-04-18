import Vue from 'vue'
import App from './App.vue'
import router from './router.js'
import store from './store.js'
import VueLazyload from 'vue-lazyload'
import BootstrapVue from 'bootstrap-vue'
import Icon from 'vue-awesome/components/Icon'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'material-design-iconic-font/dist/css/material-design-iconic-font.css'
import './scss/styles.scss'
import 'vue-awesome/icons'
import Toasted from 'vue-toasted';
import UUID from 'vue-uuid'
import VueLocalStorage from 'vue-localstorage'
// eslint-disable-next-line
import classlist from 'classlist-polyfill'
import VueI18n from 'vue-i18n'
import i18n_en from './lang/en.json'
import i18n_ja from './lang/ja.json'
import i18n_fr from './lang/fr.json'
import Carousel3d from 'vue-carousel-3d'

Vue.config.productionTip = false

Vue.use(BootstrapVue);
Vue.use(VueLazyload);
Vue.use(Toasted)
Vue.use(UUID)
Vue.use(VueLocalStorage)
Vue.use(VueI18n)
Vue.use(Carousel3d)

Vue.component('icon', Icon)

const messages = {
  en: i18n_en,
  ja: i18n_ja,
  fr: i18n_fr
}

const i18n = new VueI18n({
  locale: (navigator.language || navigator.userLanguage).substring(0,2),
  messages
})

var Nuxeo = require('nuxeo/es5');
Object.defineProperty(Vue.prototype, '$nuxeo', {
  value: new Nuxeo({
    baseURL: '/nuxeo'
  })
});

new Vue({
  i18n,
  router,
  store,
  render: createEle => createEle(App)
}).$mount('#app')
