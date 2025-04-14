<script setup>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const activeSection = computed(() => {
  const path = route.path
  if (path === '/') return 'home'
  if (path === '/projects') return 'projects'
  if (path === '/hobbies') return 'hobbies'
  if (path === '/contact') return 'contact'
  return 'home'
})
</script>

<template>
  <div class="app-container">
    <Header :activeSection="activeSection" />
    
    <main>
      <router-view />
    </main>
    
    <Footer />
  </div>
</template>

<style>
body {
  margin: 0;
  background-color: #343a40;
  color: white;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}

.card {
  transition: transform 0.3s ease-in-out;
}

.card:hover {
  transform: scale(1.05);
}
</style>
