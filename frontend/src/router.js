import { createRouter, createWebHistory } from 'vue-router'
import Hero from './components/Hero.vue'
import Projects from './components/Projects.vue'
import Hobbies from './components/Hobbies.vue'
import Contact from './components/Contact.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Hero
  },
  {
    path: '/projects',
    name: 'Projects',
    component: Projects
  },
  {
    path: '/hobbies',
    name: 'Hobbies',
    component: Hobbies
  },
  {
    path: '/contact',
    name: 'Contact',
    component: Contact
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
