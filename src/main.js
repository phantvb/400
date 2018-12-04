// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import '@/assets/css/main.css';
import router from './router';
import axios from 'axios';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';


Vue.use(ElementUI);
Vue.prototype.$ajax = axios;
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json;charset=UTF-8'
axios.defaults.baseURL = '/data'

Vue.config.productionTip = false;
Vue.prototype.$global={
  pageSize:[10, 20, 30, 50]
}

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
