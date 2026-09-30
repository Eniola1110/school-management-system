<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const announcements = ref([])
const loading = ref(true)
const errorMessage = ref('')

const showForm = ref(false)

const form = ref({
  title: '',
  body: ''
})

const fetchAnnouncements = async () => {
  try {
    loading.value = true
    const res = await api.get('/announcements')
    announcements.value = res.data.announcements
  } catch (err) {
    errorMessage.value = 'Failed to load announcements'
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAnnouncements()
})

const openCreateForm = () => {
  form.value = {
    title: '',
    body: ''
  }
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  errorMessage.value = ''
}

const submitForm = async () => {
  try {
    errorMessage.value = ''
    await api.post('/announcements', {
      title: form.value.title,
      body: form.value.body,
      posted_by: authStore.user?.id
    })
    closeForm()
    fetchAnnouncements()
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'Something went wrong'
    console.error(err)
  }
}

const deleteAnnouncement = async (id) => {
  if (!confirm('Are you sure you want to delete this announcement?')) return
  try {
    await api.delete(`/announcements/${id}`)
    fetchAnnouncements()
  } catch (err) {
    errorMessage.value = 'Failed to delete announcement'
    console.error(err)
  }
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1>Announcements</h1>
      <button class="btn-primary" @click="openCreateForm">New Announcement</button>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="loading">Loading announcements...</p>

    <div v-else class="announcements-list">
      <div v-if="announcements.length === 0" class="empty-state">
        No announcements yet. Click "New Announcement" to post one.
      </div>

      <div v-for="item in announcements" :key="item.id" class="announcement-card">
        <div class="announcement-header">
          <h3>{{ item.title }}</h3>
          <button class="btn-delete" @click="deleteAnnouncement(item.id)">Delete</button>
        </div>
        <p class="announcement-body">{{ item.body }}</p>
        <p class="announcement-date">{{ formatDate(item.created_at) }}</p>
      </div>
    </div>

    <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
      <div class="modal">
        <h2>New Announcement</h2>
        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label>Title</label>
            <input v-model="form.title" type="text" placeholder="e.g. Mid-term break" required />
          </div>
          <div class="form-group">
            <label>Message</label>
            <textarea v-model="form.body" rows="5" placeholder="Write the announcement..." required></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="closeForm">Cancel</button>
            <button type="submit" class="btn-primary">Post</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.page-header h1 {
  font-size: 1.6rem;
  color: var(--color-text);
}
.btn-primary {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 0.7rem 1.3rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.9rem;
}
.btn-primary:hover {
  background-color: var(--color-primary-hover);
}
.error {
  color: var(--color-danger);
  margin-bottom: 1rem;
}

.announcements-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.announcement-card {
  background: white;
  border-radius: var(--radius-md);
  padding: 1.2rem 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-left: 4px solid var(--color-primary);
}

.announcement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.announcement-header h3 {
  color: var(--color-text);
  font-size: 1.1rem;
}

.announcement-body {
  color: var(--color-text);
  margin: 0.6rem 0;
  line-height: 1.5;
}

.announcement-date {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.btn-delete {
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.8rem;
  color: white;
  background-color: var(--color-danger);
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-muted);
  background: white;
  border-radius: var(--radius-md);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: var(--radius-md);
  padding: 2rem;
  width: 100%;
  max-width: 500px;
}

.modal h2 {
  margin-bottom: 1.5rem;
  color: var(--color-text);
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

.form-group label {
  font-size: 0.85rem;
  margin-bottom: 0.4rem;
  color: var(--color-text);
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  padding: 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-family: inherit;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
  margin-top: 1.5rem;
}

.btn-secondary {
  background: var(--color-background);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  padding: 0.6rem 1.2rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
}
</style>