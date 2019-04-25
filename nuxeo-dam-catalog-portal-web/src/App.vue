<template>
  <div class="app-container">
    <header class="app-header">
      <b-container class="app-header-container">
        <div class="app-header-logo">
          <router-link to="/" class="app-header-logo-link">
            <img src="logo.png" class="app-header-logo-img">
          </router-link>
            <h2 class="section-title">{{ $t("message.home-banner-title") }}</h2>
        </div>
        <nav class="app-header-cart-nav">
          <router-link class="app-header-link cart-link" to="/cart">
            <i class="zmdi zmdi-shopping-cart"></i>
              {{ $t("message.cart-title") }}
            <b-badge v-if="cartSize>0">{{cartSize}}</b-badge>
          </router-link>
        </nav>
        <nav class="app-header-nav">
          <router-link class="app-header-link" to="/">
            <i class="zmdi zmdi-home"></i>
            {{ $t("message.app-home") }}
          </router-link>
          <router-link class="app-header-link" to="/search">
            <i class="zmdi zmdi-search"></i>
            {{ $t("message.app-search") }}
          </router-link>
          <!--a class="app-header-link"
             @click="login()"
             v-if="isGuest">
            <i class="zmdi zmdi-account"></i>
            {{ $t("message.app-login") }}
          </a-->
          <a class="app-header-link"
             @click="logout()"
             v-if="!isGuest">
            <i class="zmdi zmdi-account"></i>
            {{ $t("message.app-logout") }}
          </a>
        </nav>
      </b-container>
    </header>
    <router-view></router-view>
    <footer class="app-footer">
      <div class="container d-flex align-items-center justify-content-between">
        <p>
          {{ $t('message.app-copyright') }}
        </p>
        <img class="app-footer-logo"
             src="logo-white.png">
      </div>
    </footer>
  </div>
</template>

<script>
import {
  constants
} from './constants.js'

export default {

  data() {
    return {
      isGuest: null
    }
  },

  computed: {
    cartSize() {
      return this.$store.state.cartSize
    }
  },

  created() {
    // Handle cart ID
    var cartId = this.$localStorage.get(constants.CART_ID_LABEL, constants.CART_NOT_FOUND);
    if (cartId === constants.CART_NOT_FOUND) {
      cartId = this.$uuid.v4();
      this.$localStorage.set(constants.CART_ID_LABEL, cartId);
    }
    this.$store.commit('setCartId', cartId);
    this.$store.dispatch('updateCart');
    this.testGuest();
  },

  methods: {

    login() {
      var loginURL = "/nuxeo/logout?nxtimeout=true&forceAnonymousLogin=true&requestedUrl=catalog";
      window.location = loginURL;
    },

    logout() {
      var logoutURL = "/nuxeo/logout?nxtimeout=true&forceAnonymousLogin=false&requestedUrl=catalog";
      window.location = logoutURL;
    },

    // Note: this is used for filtering buttons. It is NOT related to security.
    testGuest() {
      this.$nuxeo.operation('login')
        .execute()
        .then(function(user) {
          if (user.username === "Guest") {
            this.isGuest = true;
          } else {
            this.isGuest = false;
          }
        }.bind(this))
        .catch(function(error) {
          // something went wrong
          throw error;
        });
    }
  } // End of methods


}
</script>
