<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/axios'
import socket from '@/socket'
import Pagination from '@/components/Pagination.vue'

const router = useRouter()

const students = ref([])
const notification = ref('')
const loading = ref(true)
const errorMessage = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

const showForm = ref(false)
const isEditing = ref(false)
const editingId = ref(null)

const form = ref({
  class_id: '',
  full_name: '',
  date_of_birth: '',
  gender: '',
  guardian_name: '',
  guardian_phone: ''
})

const fetchStudents = async () => {
  try {
    loading.value = true
    const res = await api.get('/students')
    students.value = res.data.students
  } catch (err) {
    errorMessage.value = 'Failed to load students'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const handleStudentAdded = (newStudent) => {
  students.value.push(newStudent)
  notification.value = `New application received: ${newStudent.full_name}`

  setTimeout(() => {
    notification.value = ''
  }, 5000)
}

const classesList = ref([])

const fetchClassesList = async () => {
  try {
    const res = await api.get('/classes')
    classesList.value = res.data.classes
  } catch (err) {
    console.error(err)
  }
}

onMounted(() => {
  fetchStudents()
  socket.on('student:added', handleStudentAdded)
  fetchClassesList()
})

onUnmounted(() => {
  socket.off('student:added', handleStudentAdded)
})

const openCreateForm = () => {
  isEditing.value = false
  editingId.value = null
  form.value = {
    class_id: '',
    full_name: '',
    date_of_birth: '',
    gender: '',
    guardian_name: '',
    guardian_phone: ''
  }
  showForm.value = true
}

const openEditForm = (student) => {
  isEditing.value = true
  editingId.value = student.id
  form.value = {
    class_id: student.class_id,
    full_name: student.full_name,
    date_of_birth: student.date_of_birth?.split('T')[0],
    gender: student.gender,
    guardian_name: student.guardian_name,
    guardian_phone: student.guardian_phone
  }
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  errorMessage.value = ''
}

const getClassName = (id) => {
  const cls = classesList.value.find(c => c.id === id)
  return cls ? `${cls.class_name} ${cls.arm}` : id
}

const submitForm = async () => {
  try {
    errorMessage.value = ''

    if (isEditing.value) {
      await api.put(`/students/${editingId.value}`, {
        class_id: form.value.class_id,
        full_name: form.value.full_name,
        date_of_birth: form.value.date_of_birth,
        gender: form.value.gender,
        guardian_name: form.value.guardian_name,
        guardian_phone: form.value.guardian_phone
      })
    } else {
      await api.post('/students', {
        class_id: form.value.class_id,
        full_name: form.value.full_name,
        date_of_birth: form.value.date_of_birth,
        gender: form.value.gender,
        guardian_name: form.value.guardian_name,
        guardian_phone: form.value.guardian_phone
      })
    }

    fetchStudents()
    closeForm()
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'Something went wrong'
    console.error(err)
  }
}

const deleteStudent = async (id) => {
  if (!confirm('Are you sure you want to delete this student?')) return
  try {
    await api.delete(`/students/${id}`)
    fetchStudents()
  } catch (err) {
    errorMessage.value = 'Failed to delete student'
    console.error(err)
  }
}

const approveStudent = async (id) => {
  try {
    await api.put(`/students/${id}/approve`)
    fetchStudents()
  } catch (err) {
    errorMessage.value = 'Failed to approve student'
    console.error(err)
  }
}

const viewResults = (studentId) => {
  router.push({
    name: 'StudentResults',
    params: {
      studentId
    }
  })
}

const viewAttendance = (studentId) => {
  router.push({
    name: 'StudentAttendance',
    params: {
      studentId
    }
  })
}

const totalPages = computed(() => {
  return Math.ceil(students.value.length / itemsPerPage)
})

const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return students.value.slice(start, end)
})
</script>

<template>
  <div class="page">
    <div v-if="notification" class="notification-header">
      {{ notification }}
    </div>
    <div class="page-header">
      <h1>Students</h1>
      <button class="btn-primary" @click="openCreateForm"> Add Student</button>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="loading">Loading students...</p>

    <div v-else class="table-card">
      <table v-if="students.length > 0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Full Name</th>
            <th>Gender</th>
            <th>Class</th>
            <th>Guardian</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(student, index) in paginatedStudents" :key="student.id">
            <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
            <td>{{ student.full_name }}</td>
            <td class="capitalize">{{ student.gender }}</td>
            <td>{{ getClassName(student.class_id) }}</td>
            <td>{{ student.guardian_name }}</td>
            <td>{{ student.guardian_phone }}</td>
            <td>
              <span :class="student.status === 'pending' ? 'badge-pending' : 'badge-approved' ">
                {{ student.status }}
              </span>
            </td>
            <td class="actions">
            <button
             class="btn-result"
             @click="viewResults(student.id)"
             >
             View Results
            </button>

            <button
             class="btn-attendance"
             @click="viewAttendance(student.id)"
             >
             View Attendance
            </button>

            <button
            v-if="student.status === 'pending'"
            class="btn-approve"
            @click="approveStudent(student.id)"
            >
            Approve
          </button>

          <button
          class="btn-edit"
          @click="openEditForm(student)"
          >
          Edit
          </button>

          <button
          class="btn-delete"
          @click="deleteStudent(student.id)"
          >
          Delete
          </button>
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
        <h2>{{ isEditing ? 'Edit Student' : 'Add New Student' }}</h2>

        <form @submit.prevent="submitForm">
          <div class="form-row">
            <div class="form-group">
              <label>Class</label>
              <select v-model="form.class_id" required>
                <option value="">Select Class</option>
                <option v-for="cls in classesList" :key="cls.id" :value="cls.id">
                  {{ cls.class_name }} {{ cls.arm }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Full Name</label>
              <input v-model="form.full_name" type="text" required />
            </div>
            <div class="form-group">
              <label>Date of Birth</label>
              <input v-model="form.date_of_birth" type="date" required />
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
              <label>Guardian Phone</label>
              <input v-model="form.guardian_phone" type="text" required />
            </div>
          </div>

          <div class="form-group">
            <label>Guardian Name</label>
            <input v-model="form.guardian_name" type="text" required />
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

.notification-header {
  background-color: #4CAF50;
  color: white;
  padding: 12px 20px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-weight: 500;
  position: relative;
  z-index: 2500;
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

.badge-pending {
  background-color: #FFA726;
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}

.badge-approved {
  background-color: #4CAF50;
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-approve {
  background-color: #2196F3;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.8rem;
  color: white;
}

.btn-result{
  background:#10b981;
  color:white;
  border:none;
  padding:0.4rem 0.8rem;
  border-radius:var(--radius-sm);
  cursor:pointer;
  font-size:0.8rem;
}

.btn-attendance {
  background: #6366f1;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.8rem;
}

.btn-attendance:hover {
  opacity: 0.9;
}

.btn-result:hover{
  opacity:.9;
}
@media (max-width: 600px) {
  .form-row {
    flex-direction: column;
  }
}
</style>