<script setup>
import { ref, onMounted, computed } from 'vue'

const portfolio = ref({
  name: "",
  about: "",
  photos: []
})

const loading = ref(true)
let carouselInstance = null

// Create computed properties for image URLs
const profileImageUrl = computed(() => {
  return `${import.meta.env.VITE_API_URL.replace('/api', '')}/assets/images/drei.jpg`
})

const getPhotoUrl = (photo) => {
  return `${import.meta.env.VITE_API_URL.replace('/api', '')}/assets/images/${photo}`
}

onMounted(async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/hero`)
    const data = await response.json()
    portfolio.value = data
    loading.value = false
    
    initCarousel()
  } catch (error) {
    console.error('Error fetching hero data:', error)
    loading.value = false
  }
})

function initCarousel() {
  setTimeout(() => {
    startCarousel()
  }, 300)
  
  setTimeout(() => {
    startCarousel()
  }, 1000)
  
  setTimeout(() => {
    const carouselElement = document.getElementById('heroCarousel')
    if (carouselElement) {
      setInterval(() => {
        const nextButton = carouselElement.querySelector('.carousel-control-next')
        if (nextButton) {
          nextButton.click()
          console.log('Manually advancing carousel')
        }
      }, 2000)
    }
  }, 1500)
}

function startCarousel() {
  if (typeof bootstrap !== 'undefined') {
    const carouselElement = document.getElementById('heroCarousel')
    if (carouselElement) {
      if (!carouselInstance) {
        carouselInstance = new bootstrap.Carousel(carouselElement, {
          interval: 2000, 
          wrap: true,
          ride: 'carousel'
        })
        
        carouselInstance.cycle()
        
        console.log('Carousel initialized and cycling started')
      }
    } else {
      console.error('Carousel element not found', document.getElementById('heroCarousel'))
    }
  } else {
    console.error('Bootstrap is not defined')
  }
}
</script>

<template>
  <section id="hero-section" class="hero">
    <div class="container">
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-light" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      
      <div v-else class="text-center mb-5">
        <h1 class="display-4 fw-bold mb-4">Hi, I'm {{ portfolio.name }}!</h1>
        <img :src="profileImageUrl" 
            class="rounded-circle img-fluid mb-4" 
            alt="Andrei's photo" 
            style="width: 200px; height: 200px; object-fit: cover;">
        <p class="lead">{{ portfolio.about }}</p>
        
        <div class="text-center mt-5">
          <div id="heroCarousel" 
               class="carousel slide carousel-fade mx-auto" 
               data-bs-ride="carousel" 
               data-bs-interval="2000"
               style="max-width: 700px;">
              
              <div class="carousel-indicators">
                <button v-for="(photo, index) in portfolio.photos" 
                        :key="index"
                        type="button" 
                        data-bs-target="#heroCarousel" 
                        :data-bs-slide-to="index" 
                        :class="{ active: index === 0 }"
                        :aria-current="index === 0 ? 'true' : 'false'"
                        :aria-label="`Slide ${index + 1}`">
                </button>
              </div>

              <div class="carousel-inner rounded-3 shadow">
                <div v-for="(photo, index) in portfolio.photos" 
                     :key="index"
                     class="carousel-item" 
                     :class="{ active: index === 0 }" 
                     style="max-height: 400px; overflow: hidden;">
                  <img :src="getPhotoUrl(photo)" 
                       class="d-block w-100" 
                       :alt="`Photo ${index + 1}`"
                       style="width: 100%; height: auto; max-height: 400px; object-fit: contain;">
                </div>
              </div>

              <button class="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
              </button>
              <button class="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
              </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  background: #343a40;
  color: white;
  text-align: center;
  padding: 80px 20px;
}
</style>