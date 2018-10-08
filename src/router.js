import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from './pages/Home.vue'
import Search from './pages/Search.vue'
import Cart from './pages/Cart.vue'

Vue.use( VueRouter )

const router = new VueRouter({
  routes: [{
    path: '/',
    name: 'home',
    component: Home
  },{
    path: '/search',
    name: 'search',
    component: Search,
    props: (route) => ({
      brand: route.query.brand,
      productline: route.query.productline,
      productid: route.query.productid,
      query: route.query.q,
    })
  },{
    path: '/cart',
    name: 'cart',
    component: Cart
  }]
});

export default router;
