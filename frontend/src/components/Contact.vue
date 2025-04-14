<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'

const formData = ref({
  name: '',
  email: '',
  role: '', // No role selected initially
  course: '',
  message: ''
})

// Add new refs for name checking
const existingUserSuggestions = ref([])
const isCheckingName = ref(false)
const nameCheckTimeout = ref(null)
const emailCheckTimeout = ref(null)

// track if user have submitted.
const hasSubmitted = ref(false)

const courses = ref([
  'BS Information Technology',
  'BSBA Major in Marketing Management',
  'BSBA Major in Human Resource Management',
  'BSED Major in English',
  'BS Electrical Engineering'
])

const isMessageEnabled = computed(() => {
  return formData.value.role === 'admin' || 
         (formData.value.role === 'student' && formData.value.course !== '');
})

const isFormValid = computed(() => {
  const hasRequiredFields = formData.value.name && formData.value.email && formData.value.role;
  
  if (formData.value.role === 'student') {
    return hasRequiredFields && formData.value.course && formData.value.message;
  }
  
  return hasRequiredFields && formData.value.message;
})

const suggestions = ref([])
const loading = ref(true)
const editingId = ref(null)
const showArchived = ref(false)
const archivedSuggestions = ref([])

// confirm delete modal
const showDeleteModal = ref(false)
const deleteItemId = ref(null)
const isPermanentDelete = ref(false)

// toast
const toast = ref({
  show: false,
  message: '',
  type: 'success' 
})

const selectedRole = ref('')
const userEmail = ref('')

const showToast = (message, type = 'success') => {
  toast.value.message = message
  toast.value.type = type
  toast.value.show = true
  
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

const fetchSuggestions = async () => {
  try {
    console.log('API URL:', import.meta.env.VITE_API_URL);
    const apiUrl = `${import.meta.env.VITE_API_URL}/suggestions`;
    const params = new URLSearchParams();
    
    const storedUserInfo = localStorage.getItem('userInfo')
    const userInfo = storedUserInfo ? JSON.parse(storedUserInfo) : null
    
    // Add role parameter
    if (userInfo?.role) {
      params.append('role', userInfo.role);
      selectedRole.value = userInfo.role;
    }
    
    // For students, add email parameter
    if (userInfo?.role === 'student' && userInfo?.email) {
      params.append('email', userInfo.email);
      userEmail.value = userInfo.email;
    }
    
    console.log('Fetching suggestions from:', apiUrl);
    
    const response = await fetch(`${apiUrl}?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Suggestions response:', data);
    
    if (data.success) {
      suggestions.value = data.data;
      loading.value = false;
      hasSubmitted.value = true;
    } else {
      throw new Error(data.error || 'Failed to load suggestions');
    }
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    loading.value = false;
    showToast('Failed to load suggestions', 'danger');
  }
};

// Add new ref for tracking form changes
const hasUnsavedChanges = computed(() => {
  return formData.value.name !== '' || 
         formData.value.email !== '' || 
         formData.value.role !== '' || 
         formData.value.course !== '' || 
         formData.value.message !== '';
})

// Function to clear form and storage
const clearFormAndStorage = () => {
  // Clear form data
  formData.value = {
    name: '',
    email: '',
    role: '',
    course: '',
    message: ''
  }
  // Clear stored user info
  localStorage.removeItem('userInfo')
  // Reset other states
  hasSubmitted.value = false
  selectedRole.value = ''
  userEmail.value = ''
  existingUserSuggestions.value = []
}

// Handle page unload/navigation
const handleBeforeUnload = (e) => {
  if (hasUnsavedChanges.value) {
    e.preventDefault()
    e.returnValue = ''
    return ''
  } else {
    clearFormAndStorage() // Clear everything if no unsaved changes
  }
}

// Setup event listeners on mount
onMounted(() => {
  console.log('Component mounted')
  const storedUserInfo = localStorage.getItem('userInfo')
  if (storedUserInfo) {
    const userInfo = JSON.parse(storedUserInfo)
    selectedRole.value = userInfo.role
    userEmail.value = userInfo.email
    hasSubmitted.value = true
  }
  fetchSuggestions()
  
  // Add event listeners for navigation
  window.addEventListener('beforeunload', handleBeforeUnload)
})

// Cleanup event listeners on unmount
onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
  clearFormAndStorage()
})

const submitForm = async (event) => {
  event.preventDefault()
  console.log('Submitting form:', formData.value)
  
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: formData.value.name,
        email: formData.value.email,
        role_id: formData.value.role === 'student' ? 2 : 1,
        course: formData.value.role === 'student' ? formData.value.course : null,
        message: formData.value.message
      })
    })
    
    console.log('Response status:', response.status)
    const result = await response.json()
    console.log('Response data:', result)
    
    if (result.success) {
      // Store role and user info before clearing form
      const submittedRole = formData.value.role
      const submittedEmail = formData.value.email
      const submittedName = formData.value.name
      
      // Store user info for filtering
      const userInfo = {
        name: submittedName,
        email: submittedEmail,
        role: submittedRole
      }
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
      
      // Set the role and email first
      selectedRole.value = submittedRole
      userEmail.value = submittedEmail
      hasSubmitted.value = true
      
      // Fetch updated suggestions
      await fetchSuggestions()
      
      // Clear the form after fetching suggestions
      formData.value = {
        name: '',
        email: '',
        role: '',
        course: '',
        message: ''
      }
      
      showToast('Suggestion submitted successfully!')
    } else {
      console.error('Submission failed:', result.error)
      showToast(result.error || 'Failed to submit suggestion', 'danger')
    }
  } catch (error) {
    console.error('Error submitting suggestion:', error)
    showToast('Failed to submit suggestion', 'danger')
  }
}

const startEditing = (suggestion) => {
  editingId.value = suggestion.id
  suggestions.value = suggestions.value.map(s => {
    if (s.id === suggestion.id) {
      return { ...s, editing: true, editData: { ...s } }
    }
    return s
  })
}

const cancelEditing = (suggestion) => {
  editingId.value = null
  suggestions.value = suggestions.value.map(s => {
    if (s.id === suggestion.id) {
      delete s.editing
      delete s.editData
    }
    return s
  })
}

const saveEdit = async (suggestion) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/suggestions/${suggestion.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(suggestion.editData)
    })
    
    const result = await response.json()
    
    if (result.success) {
      await fetchSuggestions()
      editingId.value = null
      showToast('Suggestion updated successfully!')
    } else {
      showToast(result.error || 'Failed to update suggestion', 'danger')
    }
  } catch (error) {
    console.error('Error updating suggestion:', error)
    showToast('Failed to update suggestion', 'danger')
  }
}

// will open a confirmation modal before deletion
const confirmDelete = (id, permanent = false) => {
  deleteItemId.value = id
  isPermanentDelete.value = permanent
  showDeleteModal.value = true
}

// confirm delete
const proceedWithDeletion = async () => {
  if (isPermanentDelete.value) {
    await permanentlyDeleteSuggestion(deleteItemId.value)
  } else {
    await deleteSuggestion(deleteItemId.value)
  }
  showDeleteModal.value = false
}

const deleteSuggestion = async (id) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/suggestions/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      suggestions.value = suggestions.value.filter(s => s.id !== id);
      showToast('Suggestion archived successfully');
      // Refresh both lists to ensure proper state
      await fetchSuggestions();
      if (showArchived.value) {
        await fetchInactiveSuggestions();
      }
    } else {
      showToast(result.error || 'Failed to archive suggestion', 'danger');
    }
  } catch (error) {
    console.error('Error archiving suggestion:', error);
    showToast('Failed to archive suggestion', 'danger');
  }
};

const toggleArchived = async () => {
  showArchived.value = !showArchived.value
  if (showArchived.value) {
    await fetchInactiveSuggestions()
  }
}

const fetchInactiveSuggestions = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/suggestions/archived`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    const data = await response.json();
    if (data.success) {
      archivedSuggestions.value = data.data;
    } else {
      console.error('Failed to load inactive suggestions:', data.error);
      showToast('Failed to load inactive suggestions', 'danger');
    }
  } catch (error) {
    console.error('Error fetching inactive suggestions:', error);
    showToast('Failed to load inactive suggestions', 'danger');
  }
};

const restoreSuggestion = async (id) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/suggestions/${id}/restore`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Refresh both active and archived suggestions
      await fetchSuggestions();
      await fetchInactiveSuggestions();
      showToast('Suggestion restored successfully');
    } else {
      showToast(result.error || 'Failed to restore suggestion', 'danger');
    }
  } catch (error) {
    console.error('Error restoring suggestion:', error);
    showToast('Failed to restore suggestion', 'danger');
  }
};

const toggleView = (archived) => {
  currentPage.value = 1
  showArchived.value = archived
  if (archived) {
    fetchInactiveSuggestions()
  }
}

const permanentlyDeleteSuggestion = async (id) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/suggestions/${id}/permanent`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const result = await response.json()
    
    if (result.success) {
      // Remove from both active and archived lists
      suggestions.value = suggestions.value.filter(s => s.id !== id)
      archivedSuggestions.value = archivedSuggestions.value.filter(s => s.id !== id)
      showToast('Suggestion permanently deleted')
      
      // Refresh the lists to ensure proper state
      await fetchSuggestions()
      if (showArchived.value) {
        await fetchInactiveSuggestions()
      }
    } else {
      showToast(result.error || 'Failed to delete suggestion', 'danger')
    }
  } catch (error) {
    console.error('Error permanently deleting suggestion:', error)
    showToast('Failed to delete suggestion', 'danger')
  }
}

// Add new function to check existing user
const checkExistingUser = async () => {
  if (!formData.value.name || !formData.value.email || formData.value.role !== 'student') return;
  
  isCheckingName.value = true;
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/suggestions/check-user?name=${encodeURIComponent(formData.value.name)}&email=${encodeURIComponent(formData.value.email)}`
    );
    const result = await response.json();
    
    if (result.success && result.data.exists) {
      existingUserSuggestions.value = result.data.suggestions;
      // Update form data with the found user's information
      formData.value.name = result.data.user.name;
      formData.value.email = result.data.user.email;
    } else {
      existingUserSuggestions.value = [];
    }
  } catch (error) {
    console.error('Error checking existing user:', error);
  } finally {
    isCheckingName.value = false;
  }
};

// Add watchers for name and email changes
watch([() => formData.value.name, () => formData.value.email], ([newName, newEmail]) => {
  if (nameCheckTimeout.value) {
    clearTimeout(nameCheckTimeout.value);
  }
  if (emailCheckTimeout.value) {
    clearTimeout(emailCheckTimeout.value);
  }
  
  if (newName && newEmail) {
    nameCheckTimeout.value = setTimeout(() => {
      checkExistingUser();
    }, 500);
  }
});

// Modify the filteredSuggestions computed property
const filteredSuggestions = computed(() => {
  if (selectedRole.value === 'admin') {
    //admins can see all suggestions
    return suggestions.value
  } else if (selectedRole.value === 'student') {
    //students can see their own submissions
    const storedUserInfo = localStorage.getItem('userInfo')
    if (storedUserInfo) {
      const userInfo = JSON.parse(storedUserInfo)
      return suggestions.value.filter(s => 
        s.user && s.user.email === userInfo.email
      );
    }
    return suggestions.value.filter(s => 
      s.user && s.user.email === formData.value.email
    );
  }
  return []
})

// page filtering
const itemsPerPage = 6
const currentPage = ref(1)

const paginatedSuggestions = computed(() => {
  const suggestions = showArchived.value ? archivedSuggestions.value : filteredSuggestions.value
  const startIndex = (currentPage.value - 1) * itemsPerPage
  return suggestions.slice(startIndex, startIndex + itemsPerPage)
})

const totalPages = computed(() => {
  const suggestions = showArchived.value ? archivedSuggestions.value : filteredSuggestions.value
  return Math.ceil(suggestions.length / itemsPerPage)
})

// change page
const changePage = (page) => {
  currentPage.value = page
}

// Add these refs after the existing modal refs
const showRestoreModal = ref(false)
const restoreItemId = ref(null)

// Add new function to confirm restore
const confirmRestore = (id) => {
  restoreItemId.value = id
  showRestoreModal.value = true
}

// Add new function to proceed with restore
const proceedWithRestore = async () => {
  await restoreSuggestion(restoreItemId.value)
  showRestoreModal.value = false
}

// Add watcher for role changes to refresh suggestions
watch(() => selectedRole.value, () => {
  if (hasSubmitted.value) {
    fetchSuggestions();
  }
});
</script>

<template>
  <section id="contact-section" class="container my-5">
    <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 1050">
      <div 
        class="toast align-items-center text-white border-0"
        :class="`bg-${toast.type} ${toast.show ? 'show' : ''}`"
        role="alert" 
        aria-live="assertive" 
        aria-atomic="true" 
        style="display: block; min-width: 250px;"
        v-if="toast.show"
      >
        <div class="d-flex">
          <div class="toast-body">
            {{ toast.message }}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close" @click="toast.show = false"></button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading suggestions...</p>
    </div>

    <h2 class="fw-bold text-center mb-4">Your Suggestions</h2>
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">
        <div class="card shadow-sm p-4">
          <form @submit="submitForm">
            <div class="mb-3">
              <label for="name" class="form-label">Name</label>
              <input 
                type="text" 
                class="form-control" 
                id="name" 
                placeholder="Your name"
                v-model="formData.name"
                required
              >
            </div>
            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input 
                type="email" 
                class="form-control" 
                id="email" 
                placeholder="your.email@example.com"
                v-model="formData.email"
                required
              >
            </div>
            <div v-if="isCheckingName" class="form-text text-muted mb-3">
              Checking for existing suggestions...
            </div>
            <div class="mb-3">
              <label for="role" class="form-label">Role</label>
              <select 
                class="form-select" 
                id="role" 
                v-model="formData.role"
                required
              >
                <option value="" disabled>Select Role</option>
                <option value="admin">Admin</option>
                <option value="student">Student</option>
              </select>
            </div>
            <div class="mb-3" v-if="formData.role === 'student'">
              <label for="course" class="form-label">Course</label>
              <select 
                class="form-select" 
                id="course" 
                v-model="formData.course"
                required
              >
                <option value="" disabled>Select a course</option>
                <option v-for="course in courses" :key="course" :value="course">
                  {{ course }}
                </option>
              </select>
            </div>
            <div class="mb-3">
              <label for="message" class="form-label">Message</label>
              <textarea 
                class="form-control" 
                id="message" 
                rows="5" 
                placeholder="What are your suggestions?"
                v-model="formData.message"
                required
              ></textarea>
            </div>
            <div class="text-center">
              <button 
                type="submit" 
                class="btn px-4" 
                :class="isFormValid ? 'btn-primary' : 'btn-secondary'"
                :disabled="!isFormValid"
              >
                Send Suggestion
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Only show recent suggestions section if user has submitted a suggestion -->
    <div class="mt-5" v-if="hasSubmitted">
      <h3 class="fw-bold text-center mb-4">Recent Suggestions</h3>
      
      <div class="d-flex justify-content-center gap-3 mb-4">
        <button 
          @click="toggleView(false)" 
          class="btn"
          :class="showArchived ? 'btn-outline-primary' : 'btn-primary'"
        >
          Active
        </button>
        <button 
          @click="toggleView(true)" 
          class="btn"
          :class="[
            selectedRole === 'student' ? 'btn-secondary' : 
            (showArchived ? 'btn-primary' : 'btn-outline-primary')
          ]"
          :disabled="selectedRole === 'student'"
        >
          Inactive
        </button>
      </div>
      
      <div v-if="(showArchived ? archivedSuggestions : filteredSuggestions).length === 0" class="text-center text-muted">
        <p>{{ showArchived ? 'No inactive suggestions.' : 'No suggestions yet. Be the first to share your ideas!' }}</p>
      </div>
      
      <div v-else class="row justify-content-center g-4">
        <div v-for="suggestion in paginatedSuggestions" :key="suggestion.id" class="col-md-6 col-lg-4">
          <div class="card h-100 shadow-sm border-0 bg-light">
            <div class="card-body p-4">
              <h5 class="card-title fw-bold mb-0">{{ suggestion.user ? suggestion.user.name : 'Unknown' }}</h5>
              <h6 class="card-subtitle mb-3 text-muted">{{ suggestion.user ? suggestion.user.email : 'No email' }}</h6>
              
              <div v-if="suggestion.editing">
                <div class="mb-3">
                  <textarea 
                    class="form-control"
                    v-model="suggestion.editData.message"
                    rows="3"
                  ></textarea>
                </div>
                <div class="d-flex justify-content-end gap-2">
                  <button @click="cancelEditing(suggestion)" class="btn btn-sm btn-secondary">
                    Cancel
                  </button>
                  <button @click="saveEdit(suggestion)" class="btn btn-sm btn-success">
                    Save
                  </button>
                </div>
              </div>
              
              <div v-else>
                <p class="card-text mb-4">{{ suggestion.message }}</p>
                <div class="d-flex flex-column gap-2 align-items-end">
                  <template v-if="!showArchived">
                    <button 
                      @click="startEditing(suggestion)"
                      class="btn btn-sm btn-primary w-25"
                    >
                      Edit
                    </button>
                  </template>
                  <button 
                    v-if="showArchived"
                    @click="confirmRestore(suggestion.id)"
                    class="btn btn-sm btn-success w-25"
                  >
                    Restore
                  </button>
                  <button 
                    @click="confirmDelete(suggestion.id, showArchived)"
                    class="btn btn-sm btn-danger w-25"
                  >
                    {{ showArchived ? 'Delete DB' : 'Delete' }}
                  </button>
                </div>
              </div>
              
              <div class="text-muted small mt-3">
                Submitted: {{ new Date(suggestion.createdAt).toLocaleString() }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Pagination -->
      <div v-if="(showArchived ? archivedSuggestions : filteredSuggestions).length > 0" class="d-flex justify-content-center mt-4">
        <nav aria-label="Suggestions pagination">
          <ul class="pagination">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
              </a>
            </li>
            <li 
              v-for="page in totalPages" 
              :key="page" 
              class="page-item"
              :class="{ active: page === currentPage }"
            >
              <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages || totalPages === 0 }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- Add this section before the Recent Suggestions section -->
    <div v-if="formData.role === 'student' && existingUserSuggestions.length > 0" class="mt-4">
      <h4 class="text-center mb-3">Previous Suggestions by {{ formData.name }}</h4>
      <div class="row justify-content-center g-4">
        <div v-for="suggestion in existingUserSuggestions" :key="suggestion.id" class="col-md-6 col-lg-4">
          <div class="card h-100 shadow-sm border-0 bg-light">
            <div class="card-body p-4">
              <h5 class="card-title fw-bold mb-0">{{ suggestion.user.name }}</h5>
              <h6 class="card-subtitle mb-3 text-muted">{{ suggestion.user.email }}</h6>
              <p class="card-text mb-4">{{ suggestion.message }}</p>
              <div class="text-muted small mt-3">
                Submitted: {{ new Date(suggestion.createdAt).toLocaleString() }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal fade" tabindex="-1" :class="{ 'show': showDeleteModal }" 
         :style="{ display: showDeleteModal ? 'block' : 'none' }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirm Deletion</h5>
            <button type="button" class="btn-close" @click="showDeleteModal = false" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>{{ isPermanentDelete ? 
              'Are you sure you want to permanently delete this suggestion? This action cannot be undone.' : 
              'Are you sure you want to delete this suggestion? It will be moved to the archive.' }}
            </p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">Cancel</button>
            <button type="button" class="btn btn-danger" @click="proceedWithDeletion">
              {{ isPermanentDelete ? 'Delete Permanently' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Restore Confirmation Modal -->
    <div class="modal fade" tabindex="-1" :class="{ 'show': showRestoreModal }" 
         :style="{ display: showRestoreModal ? 'block' : 'none' }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirm Restore</h5>
            <button type="button" class="btn-close" @click="showRestoreModal = false" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to restore this suggestion? It will be moved back to active suggestions.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showRestoreModal = false">Cancel</button>
            <button type="button" class="btn btn-success" @click="proceedWithRestore">
              Restore
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal backdrops -->
    <div class="modal-backdrop fade show" v-if="showDeleteModal || showRestoreModal"></div>
  </section>
</template>