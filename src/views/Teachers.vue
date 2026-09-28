<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/api/axios'
import Pagination from '@/components/Pagination.vue'

const teachers = ref([])
const loading = ref(true)
const errorMessage = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

const showForm = ref(false)
const isEditing = ref(false)
const editingId = ref(null)

const createdUsername = ref('')
const createdPassword = ref('')

const form = ref({
  full_name: '',
  gender: '',
  phone: '',
  specialization: ''
})

const fetchTeachers = async () => {
  try {
    loading.value = true
    const res = await api.get('/teachers')
    teachers.value = res.data.teachers
  } catch (err) {
    errorMessage.value = 'Failed to load teachers'
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTeachers()
})

const openCreateForm = () => {
  isEditing.value = false
  editingId.value = null
  form.value = {
    full_name: '',
    gender: '',
    phone: '',
    specialization: ''
  }
  showForm.value = true
}

const openEditForm = (teacher) => {
  isEditing.value = true
  editingId.value = teacher.id
  form.value = {
    full_name: teacher.full_name,
    gender: teacher.gender,
    phone: teacher.phone,
    specialization: teacher.specialization
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

    if (isEditing.value) {
      await api.put(`/teachers/${editingId.value}`, {
        full_name: form.value.full_name,
        gender: form.value.gender,
        phone: form.value.phone,
        specialization: form.value.specialization
      })
    } else {
      const cleanName = form.value.full_name.toLowerCase().replace(/\s+/g, '')
      const randomNum = Math.floor(Math.random() * 1000)
      const username = cleanName + randomNum
      const generatedPassword = 'Edu@' + Math.random().toString(36).slice(2, 8).toUpperCase()

      console.log('Generated password:', generatedPassword)

      const registerRes = await api.post('/auth/register', {
        full_name: form.value.full_name,
        username,
        password: generatedPassword,
        role: 'teacher'
      })

      const newUserId = registerRes.data.user_id

      await api.post('/teachers', {
        user_id: newUserId,
        full_name: form.value.full_name,
        gender: form.value.gender,
        phone: form.value.phone,
        specialization: form.value.specialization
      })
      createdUsername.value = username
      createdPassword.value = generatedPassword
    }

    fetchTeachers()
    setTimeout(() => {
  closeForm()
  createdUsername.value = ''
  createdPassword.value = ''
}, 5000)
  } catch (err) {
   console.log(err)
  console.log(err.response)
  console.log(err.response?.data)

  errorMessage.value = err.response?.data?.message || 'Something went wrong'
  }
}

const deleteTeacher = async (id) => {
  if (!confirm('Are you sure you want to delete this teacher?')) return
  try {
    await api.delete(`/teachers/${id}`)
    fetchTeachers()
  } catch (err) {
    errorMessage.value = 'Failed to delete teacher'
    console.error(err)
  }
}

const totalPages = computed(() => {
  return Math.ceil(teachers.value.length / itemsPerPage)
})

const paginatedTeachers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return teachers.value.slice(start, end)
})
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1>Teachers</h1>
      <button class="btn-primary" @click="openCreateForm">Add Teacher</button>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="loading">Loading teachers...</p>

    <div v-else class="table-card">
      <table v-if="teachers.length > 0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Full Name</th>
            <th>Gender</th>
            <th>Phone</th>
            <th>Specialization</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(teacher, index) in paginatedTeachers" :key="teacher.id">
            <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
            <td>{{ teacher.full_name }}</td>
            <td class="capitalize">{{ teacher.gender }}</td>
            <td>{{ teacher.phone }}</td>
            <td>{{ teacher.specialization }}</td>
            <td class="actions">
              <button class="btn-edit" @click="openEditForm(teacher)">Edit</button>
              <button class="btn-delete" @click="deleteTeacher(teacher.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      <Pagination
      :currentPage="currentPage"
      :totalPages="totalPages"
      @change-page="currentPage = $event"
      />
    </div>

    <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
      <div class="modal">
        <h2>{{ isEditing ? 'Edit Teacher' : 'Add New Teacher' }}</h2>

        <div v-if="createdUsername && !isEditing" class="credential">
          <h3>Teacher Login Credentials</h3>
          <p><strong>Username:</strong>
          {{ createdUsername }}</p>
          <p><strong>Password:</strong>
          {{ createdPassword }}</p>
        </div>
        <form @submit.prevent="submitForm">

          <div class="form-row">
           
            <div class="form-group">
              <label>Full Name</label>
              <input v-model="form.full_name" type="text" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Gender</label>
              <select v-model="form.gender" required>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div class="form-group">
              <label>Phone</label>
              <input v-model="form.phone" type="text" required />
            </div>
          </div>

          <div class="form-group">
            <label>Specialization</label>
            <input v-model="form.specialization" type="text" placeholder="e.g. Mathematics" required />
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="closeForm">Cancel</button>
            <button type="submit" class="btn-primary">{{ isEditing ? 'Update' : 'Create' }}</button>
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
.table-card { 
  background: white; 
  border-radius: var(--radius-md); 
  padding: 1rem; 
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); 
  overflow-x: auto; 
}
table { 
  width: 100%; 
  border-collapse: collapse; 
}
th { 
  text-align: left; 
  padding: 0.8rem; 
  background-color: var(--color-background); 
  color: var(--color-text-muted); 
  font-size: 0.8rem; 
  text-transform: uppercase; 
}
td { 
  padding: 0.8rem; 
  border-bottom: 1px solid var(--color-border); 
  font-size: 0.9rem; 
}
.capitalize { 
  text-transform: capitalize;
}
.actions { 
  display: flex; 
  gap: 0.5rem; 
}
.btn-edit, .btn-delete { 
  border: none; 
  padding: 0.4rem 0.8rem; 
  border-radius: var(--radius-sm); 
  cursor: pointer; 
  font-size: 0.8rem; 
  color: white; 
}
.btn-edit { 
  background-color: var(--color-primary); 
}
.btn-delete { 
  background-color: var(--color-danger); 
}
.empty-state { 
  text-align: center; 
  padding: 2rem; 
  color: var(--color-text-muted); 
}
.modal-overlay { 
  position: fixed; 
  top: 0; left: 0; 
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
  max-width: 550px; 
  max-height: 90vh; 
  overflow-y: auto; 
}
.modal h2 { 
  margin-bottom: 1.5rem; 
  color: var(--color-text); 
}
.form-row { 
  display: flex; 
  gap: 1rem; 
  margin-bottom: 1rem; 
}
.form-group { 
  flex: 1; 
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
.form-group input, .form-group select { 
  padding: 0.6rem; 
  border: 1px solid var(--color-border); 
  border-radius: var(--radius-sm); 
  font-size: 0.9rem; 
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
@media (max-width: 600px) { 
  .form-row { 
    flex-direction: column; 
    }
}
</style>