<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  activeSection: String
})
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow sticky-top">
    <div class="container">
      <router-link class="navbar-brand" to="/">Andrei's Portfolio</router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" 
              aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <router-link class="nav-link" :class="{ active: activeSection === 'home' }" to="/">Home</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :class="{ active: activeSection === 'projects' }" to="/projects">Projects</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :class="{ active: activeSection === 'hobbies' }" to="/hobbies">Hobbies</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :class="{ active: activeSection === 'contact' }" to="/contact">Contact Me</router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>