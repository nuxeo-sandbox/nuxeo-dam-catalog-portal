// TODO: this needs to be refactored to use session cart.

import Vue from 'vue'
import Vuex from 'vuex'
import Nuxeo from 'nuxeo/es5'
Vue.use(Vuex)

const store = new Vuex.Store({

  state: {
    cartId: "",
    cart: [],
    cartSize: 0
  },

  getters: {
    isInCart: (state) => (uid) => {
      if (!state.cart || !state.cart.length) {
        return false;
      } else {
        return state.cart.find(document => document.uid === uid);
      }
    }
  },

  mutations: {
    setCartId(state,cartId) {
      state.cartId = cartId;
    },

     updateCart(state,cart) {
      state.cart = cart;
      if (cart && cart.length) {
        state.cartSize = cart.length;
      } else {
        state.cartSize = 0;
      }
     }
  },

  actions: {
    updateCart(context) {
      var nuxeo = new Nuxeo({
          baseURL: '/nuxeo'
        });
     nuxeo.operation('javascript.api_shopping_cart_get_content')
        .params({
          'cartId': context.state.cartId
        })
        .execute()
        .then(function(data) {
          context.commit('updateCart',data.entries);
        }.bind(this))
        .catch(function(error) {
          throw error
        });
    }
  }

});

export default store;
