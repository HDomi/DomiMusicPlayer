import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueYoutubeEmbed from 'vue-youtube-embed';

Vue.use(VueYoutubeEmbed, { global: true, componentId: "youtube-media" });
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
