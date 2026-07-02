<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios'

const classes = ref([])
const loading = ref(true)
const errorMessage = ref('')

const showForm = ref(false)
const isEditing = ref(false)
const editingId = ref(null)

const form = ref({
  class_name: '',
  arm: '',
  level: '',
  class_teacher_id: ''
})

const fetchClasses = async () => {
  try {
    loading.value = true
    const res = await api.get('/classes')
    classes.value = res.data.classes
  } catch (err) {
    errorMessage.value = 'Failed to load classes'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const teachersList = ref([])
const fetchTeachersList = async () => {
  try {
    const res = await api.get('/teachers')
    teachersList.value = res.data.teachers
  }
  catch (err) {
    console.error(err)
  }
}

const getTeacherName = (id) => {
  const teacher = teachersList.value.find(t => t.id === id)
  return teacher ? teacher.full_name : 'Not assigned'
}

onMounted(() => {
  fetchClasses()
  fetchTeachersList()
})

const openCreateForm = () => {
  isEditing.value = false
  editingId.value = null
  form.value = {
    class_name: '',
    arm: '',
    level: '',
    class_teacher_id: ''
  }
  showForm.value = true
}

const openEditForm = (cls) => {
  isEditing.value = true
  editingId.value = cls.id
  form.value = {
    class_name: cls.class_name,
    arm: cls.arm,
    level: cls.level,
    class_teacher_id: cls.class_teacher_id
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

    const payload = {
      class_name: form.value.class_name,
      arm: form.value.arm,
      level: form.value.level,
      class_teacher_id: form.value.class_teacher_id || null
    }
    if (isEditing.value) {
      await api.put(`/classes/${editingId.value}`, payload)
    } else {
      await api.post('/classes', payload)
    }
    closeForm()
    fetchClasses()
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'Something went wrong'
    console.error(err)
  }
}

const deleteClass = async (id) => {
  if (!confirm('Are you sure you want to delete this class?')) return
  try {
    await api.delete(`/classes/${id}`)
    fetchClasses()
  } catch (err) {
    errorMessage.value = 'Failed to delete class'
    console.error(err)
  }
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1>Classes</h1>
      <button class="btn-primary" @click="openCreateForm">Add Class</button>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="loading">Loading classes...</p>

    <div v-else class="table-card">
      <table v-if="classes.length > 0">
        <thead>
          <tr>
            <th>Class Name</th>
            <th>Arm</th>
            <th>Level</th>
            <th>Class Teacher</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cls in classes" :key="cls.id">
            <td>{{ cls.class_name }}</td>
            <td>{{ cls.arm }}</td>
            <td class="capitalize">{{ cls.level }}</td>
            <td>{{ getTeacherName(cls.class_teacher_id) }}</td>
            <td class="actions">
              <button class="btn-edit" @click="openEditForm(cls)">Edit</button>
              <button class="btn-delete" @click="deleteClass(cls.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="empty-state">No classes found. Click "Add Class" to create one.</p>
    </div>

    <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
      <div class="modal">
        <h2>{{ isEditing ? 'Edit Class' : 'Add New Class' }}</h2>
        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label>Class Name</label>
            <input v-model="form.class_name" type="text" placeholder="e.g. Primary 4" required />
          </div>
          <div class="form-group">
            <label>Arm</label>
            <input v-model="form.arm" type="text" placeholder="e.g. A" required />
          </div>
          <div class="form-group">
            <label>Level</label>
            <select v-model="form.level" required>
              <option value="">Select</option>
              <option value="nursery">Nursery</option>
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
            </select>
          </div>
          <div class="form-group">
            <label>Class Teacher</label>
            <select v-model="form.class_teacher_id">
              <option value="">No teacher assigned yet</option>
              <option  v-for="teacher in teachersList" :key="teacher.id" :value="teacher.id">
                {{ teacher.full_name }}
              </option>
            </select>
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
  max-width: 450px;
  max-height: 90vh;
  overflow-y: auto;
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
</style>