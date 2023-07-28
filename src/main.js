import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueYoutubeEmbed from 'vue-youtube-embed';
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import VueBottomSheet from "@webzlodimir/vue-bottom-sheet";

Vue.use(VueYoutubeEmbed, { global: true, componentId: "youtube-media" })
Vue.config.productionTip = false
Vue.use(Toast, {
  transition: "Vue-Toastification__bounce",
  maxToasts: 20,
  newestOnTop: true
});
Vue.use(VueBottomSheet);
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
