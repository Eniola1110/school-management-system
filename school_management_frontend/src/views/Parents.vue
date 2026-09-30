<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/api/axios'
import Pagination from '@/components/Pagination.vue'

const parents = ref([])
const studentsList = ref([])
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
  phone: '',
  gender: '',
  student_id: ''
})

const fetchParents = async () => {
  try {
    loading.value = true
    const res = await api.get('/parents')
    parents.value = res.data.parents
  } catch (err) {
    errorMessage.value = 'Failed to load parents'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const fetchStudentsList = async () => {
  try {
    const res = await api.get('/students')
    studentsList.value = res.data.students
  } catch (err) {
    console.error(err)
  }
}

onMounted(() => {
  fetchParents()
  fetchStudentsList()
})

const getStudentName = (studentId) => {
  const student = studentsList.value.find(s => s.id === studentId)
  return student ? student.full_name : studentId
}

const openCreateForm = () => {
  isEditing.value = false
  editingId.value = null
  form.value = {
    full_name: '',
    phone: '',
    gender: '',
    student_id: ''
  }
  showForm.value = true
}

const openEditForm = (parent) => {
  isEditing.value = true
  editingId.value = parent.id
  form.value = {
    full_name: parent.full_name,
    phone: parent.phone,
    gender: parent.gender,
    student_id: parent.student_id
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
      await api.put(`/parents/${editingId.value}`, {
        full_name: form.value.full_name,
        phone: form.value.phone,
        gender: form.value.gender,
        student_id: form.value.student_id
      })
    } else {
      const cleanName = form.value.full_name.toLowerCase().replace(/\s+/g, '')
      const randomNum = Math.floor(Math.random() * 1000)
      const username = cleanName + randomNum
      const generatedPassword = 'Edu@' + Math.random().toString(36).slice(2, 8).toUpperCase()

      const registerRes = await api.post('/auth/register', {
        full_name: form.value.full_name,
        username,
        password: generatedPassword,
        role: 'parent'
      })

      const newUserId = registerRes.data.user_id

      await api.post('/parents', {
        user_id: newUserId,
        full_name: form.value.full_name,
        phone: form.value.phone,
        gender: form.value.gender,
        student_id: form.value.student_id
      })
    createdUsername.value = username
      createdPassword.value = generatedPassword
    }

    // closeForm()
    fetchParents()
    setTimeout(() => {
  closeForm()
  createdUsername.value = ''
  createdPassword.value = ''
}, 5000)
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'Something went wrong'
    console.error(err)
  }
}

const deleteParent = async (id) => {
  if (!confirm('Are you sure you want to delete this parent?')) return
  try {
    await api.delete(`/parents/${id}`)
    fetchParents()
  } catch (err) {
    errorMessage.value = 'Failed to delete parent'
    console.error(err)
  }
}

const totalPages = computed(() => {
  return Math.ceil(parents.value.length / itemsPerPage)
})

const paginatedParents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return parents.value.slice(start, end)
})
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1>Parents</h1>
      <button class="btn-primary" @click="openCreateForm">Add Parent</button>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="loading">Loading parents...</p>

    <div v-else class="table-card">
      <table v-if="parents.length > 0">
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Phone</th>
            <th>Gender</th>
            <th>Student</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="parent in paginatedParents" :key="parent.id">
            <td>{{ parent.full_name }}</td>
            <td>{{ parent.phone }}</td>
            <td class="capitalize">{{ parent.gender }}</td>
            <td>{{ getStudentName(parent.student_id) }}</td>
            <td class="actions">
              <button class="btn-edit" @click="openEditForm(parent)">Edit</button>
              <button class="btn-delete" @click="deleteParent(parent.id)">Delete</button>
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
        <h2>{{ isEditing ? 'Edit Parent' : 'Add New Parent' }}</h2>

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
            <div class="form-group">
              <label>Phone</label>
              <input v-model="form.phone" type="text" required />
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
              <label>Linked Student</label>
              <select v-model="form.student_id" required>
                <option value="">Select Student</option>
                <option v-for="student in studentsList" :key="student.id" :value="student.id">
                  {{ student.full_name }} 
                </option>
              </select>
            </div>
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
  margin-bottom: 1.8rem;
}

.page-header h1 {
  font-size: 1.7rem;
  font-weight: 700;
  color: var(--color-text);
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 0.75rem 1.4rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(37, 99, 235, 0.3);
}

.btn-secondary {
  background: white;
  color: var(--color-text);
  border: 1.5px solid var(--color-border);
  padding: 0.65rem 1.3rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.btn-secondary:hover {
  background-color: var(--color-background);
}

.btn-edit, .btn-delete {
  border: none;
  padding: 0.45rem 0.9rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 600;
  color: white;
  transition: opacity 0.2s ease;
}

.btn-edit {
  background-color: var(--color-primary);
}

.btn-delete {
  background-color: var(--color-danger);
}

.btn-edit:hover, .btn-delete:hover {
  opacity: 0.85;
}

.error {
  background-color: #FEF2F2;
  color: var(--color-danger);
  padding: 0.8rem 1rem;
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--color-danger);
  margin-bottom: 1.2rem;
  font-size: 0.9rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.table-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 1.2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  text-align: left;
  padding: 1rem;
  background-color: var(--color-background);
  color: var(--color-text-muted);
  font-size: 0.78rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  font-weight: bold;
  border-bottom: 2px solid var(--color-border);
}

td {
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
  font-size: 0.92rem;
  color: var(--color-text);
}

tbody tr {
  transition: background-color 0.15s ease;
}

tbody tr:hover {
  background-color: var(--color-background);
}

.capitalize {
  text-transform: capitalize;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: var(--radius-lg);
  padding: 2.2rem;
  width: 100%;
  max-width: 550px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.25s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal h2 {
  margin-bottom: 1.6rem;
  color: var(--color-text);
  font-size: 1.3rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
  margin-top: 1.8rem;
  padding-top: 1.2rem;
  border-top: 1px solid var(--color-border);
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.2rem;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  color: var(--color-text);
  font-weight: 600;
}

.form-group input, .form-group select {
  padding: 0.7rem 0.9rem;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.92rem;
  font-family: inherit;
  transition: border-color 0.2s ease;
}

.form-group input:focus, .form-group select:focus {
  outline: none;
  border-color: var(--color-primary);
}

@media (max-width: 600px) {
  .form-row {
    flex-direction: column;
  }
}
</style>