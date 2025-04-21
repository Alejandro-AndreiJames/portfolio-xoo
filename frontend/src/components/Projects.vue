<script setup>
import { ref, onMounted, computed } from 'vue'

const projects = ref([])
const loading = ref(true)

// Create a function to get the image URL
const getImageUrl = (imagePath) => {
  return `${import.meta.env.VITE_API_URL.replace('/api', '')}${imagePath}`
}

onMounted(async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/projects`)
    const data = await response.json()
    projects.value = data
    loading.value = false
  } catch (error) {
    console.error('Error fetching projects data:', error)
    loading.value = false
  }
})
</script>

<template>
  <section id="projects-section" class="py-5">
    <div class="container">
      <h2 class="fw-bold mb-4 text-center text-dark">Projects</h2>
      
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-light" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      
      <div v-else class="row row-cols-1 row-cols-md-2 g-4">
        <div v-for="(project, index) in projects" :key="index" class="col">
          <div class="card h-100 bg-secondary bg-opacity-10 text-dark border-0 shadow-sm card-hover">
            <img :src="getImageUrl(project.image)" 
                 class="card-img-top" 
                 :alt="project.title" 
                 style="height: 250px; object-fit: cover;"
                 loading="lazy">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title fw-bold">{{ project.title }}</h5>
              <p class="card-text">{{ project.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.card-hover {
  transition: transform 0.3s ease;
  overflow: hidden;
  border-radius: 10px;
}

.card-hover:hover {
  transform: translateY(-5px);
}

.card-img-top {
  transition: transform 0.3s ease;
}

.card:hover .card-img-top {
  transform: scale(1.05);
}
</style>