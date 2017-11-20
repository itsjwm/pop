// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'

import Vuetify from 'vuetify'
import './stylus/main.styl'

import App from './App'
import router from './router'

// import Primus from 'Primus'
import Primus from './plugins/primus'
// Vue.prototype.$primus = new Primus('http://localhost:8081');
// Vue.prototype.$primus = primus;

Vue.use(Vuetify)
Vue.use(Primus, 'http://localhost:8081')

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
