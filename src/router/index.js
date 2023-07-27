import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AddMusic from '../views/AddMusic.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/addMusic',
    name: 'addmusic',
    component: AddMusic
  }
]

const router = new VueRouter({
  routes
})

export default router
