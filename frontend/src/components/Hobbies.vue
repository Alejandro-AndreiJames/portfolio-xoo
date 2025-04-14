<script setup>
import { ref, onMounted } from 'vue'

const hobbies = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const response = await fetch('http://localhost:5000/api/hobbies')
    const data = await response.json()
    hobbies.value = data
    loading.value = false
  } catch (error) {
    console.error('Error fetching hobbies data:', error)
    loading.value = false
  }
})
</script>

<template>
  <section id="hobbies-section" class="py-5 text-center">
    <div class="container">
      <h2 class="fw-bold mb-4">Hobbies</h2>
      
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-light" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      
      <div v-else class="row row-cols-1 row-cols-md-2 g-4">
        <div v-for="(hobby, index) in hobbies" :key="index" class="col d-flex align-items-stretch">
          <div class="card p-5 shadow-sm w-100">
            <div class="d-flex flex-column justify-content-center h-100">
              <i class="fas hobby-icon" :class="hobby.icon"></i>
              <h5 class="mt-3 fw-bold">{{ hobby.title }}</h5>
              <p class="mb-0">{{ hobby.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hobby-icon {
  font-size: 2rem;
  color: #0d6efd;
}
</style>