<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios'

const subjects = ref([])
const classesList = ref([])
const loading = ref(true)
const errorMessage = ref('')

const showForm = ref(false)
const isEditing = ref(false)
const editingId = ref(null)

const form = ref({
  subject_name: '',
  class_ids: [],
  class_id: ''
})

const fetchSubjects = async () => {
  try {
    loading.value = true
    const res = await api.get('/subjects')
    subjects.value = res.data.subjects
  } catch (err) {
    errorMessage.value = 'Failed to load subjects'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const fetchClassesList = async () => {
  try {
    const res = await api.get('/classes')
    classesList.value = res.data.classes
  } catch (err) {
    console.error(err)
  }
}

onMounted(() => {
  fetchSubjects()
  fetchClassesList()
})

const getClassName = (classId) => {
  const cls = classesList.value.find(c => c.id === classId)
  return cls ? `${cls.class_name} ${cls.arm}` : classId
}

const openCreateForm = () => {
  isEditing.value = false
  editingId.value = null
  form.value = { subject_name: '', class_ids: [], class_id: '' }
  showForm.value = true
}

const openEditForm = (subject) => {
  isEditing.value = true
  editingId.value = subject.id
  form.value = {
    subject_name: subject.subject_name,
    class_ids: [],
    class_id: subject.class_id
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
      // editing: just update the one subject record
      await api.put(`/subjects/${editingId.value}`, {
        subject_name: form.value.subject_name,
        class_id: form.value.class_id
      })
    } else {
      // creating: validate at least one class is selected
      if (form.value.class_ids.length === 0) {
        errorMessage.value = 'Please select at least one class'
        return
      }

      // create one subject row per selected class simultaneously
      await Promise.all(
        form.value.class_ids.map(class_id =>
          api.post('/subjects', {
            subject_name: form.value.subject_name,
            class_id
          })
        )
      )
    }

    closeForm()
    fetchSubjects()
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'Something went wrong'
    console.error(err)
  }
}

const deleteSubject = async (id) => {
  if (!confirm('Are you sure you want to delete this subject?')) return
  try {
    await api.delete(`/subjects/${id}`)
    fetchSubjects()
  } catch (err) {
    errorMessage.value = 'Failed to delete subject'
    console.error(err)
  }
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1>Subjects</h1>
      <button class="btn-primary" @click="openCreateForm">+ Add Subject</button>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="loading">Loading subjects...</p>

    <div v-else class="table-card">
      <table v-if="subjects.length > 0">
        <thead>
          <tr>
            <th>Subject Name</th>
            <th>Class</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="subject in subjects" :key="subject.id">
            <td>{{ subject.subject_name }}</td>
            <td>{{ getClassName(subject.class_id) }}</td>
            <td class="actions">
              <button class="btn-edit" @click="openEditForm(subject)">Edit</button>
              <button class="btn-delete" @click="deleteSubject(subject.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="empty-state">No subjects found. Click "Add Subject" to create one.</p>
    </div>

    <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
      <div class="modal">
        <h2>{{ isEditing ? 'Edit Subject' : 'Add New Subject' }}</h2>
        <form @submit.prevent="submitForm">

          <div class="form-group">
            <label>Subject Name</label>
            <input
              v-model="form.subject_name"
              type="text"
              placeholder="e.g. Mathematics"
              required
            />
          </div>

          <!-- CREATE MODE: checkbox list for multiple classes -->
          <div v-if="!isEditing" class="form-group">
            <label>Assign to Classes <span class="label-hint">(select one or more)</span></label>
            <div class="checkbox-list">
              <label
                v-for="cls in classesList"
                :key="cls.id"
                class="checkbox-item"
              >
                <input
                  type="checkbox"
                  :value="cls.id"
                  v-model="form.class_ids"
                />
                {{ cls.class_name }} {{ cls.arm }}
                <span class="level-badge capitalize">{{ cls.level }}</span>
              </label>
            </div>
            <p v-if="form.class_ids.length > 0" class="selection-count">
              {{ form.class_ids.length }} class{{ form.class_ids.length > 1 ? 'es' : '' }} selected
            </p>
          </div>

          <!-- EDIT MODE: single class dropdown -->
          <div v-else class="form-group">
            <label>Class</label>
            <select v-model="form.class_id" required>
              <option value="">Select Class</option>
              <option v-for="cls in classesList" :key="cls.id" :value="cls.id">
                {{ cls.class_name }} {{ cls.arm }}
              </option>
            </select>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="closeForm">Cancel</button>
            <button type="submit" class="btn-primary">
              {{ isEditing ? 'Update' : `Create for ${form.class_ids.length || 0} class${form.class_ids.length !== 1 ? 'es' : ''}` }}
            </button>
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
  font-weight: 600;
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
  max-width: 460px;
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

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.2rem;
}

.form-group label {
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  color: var(--color-text);
  font-weight: 600;
}

.label-hint {
  font-weight: 400;
  color: var(--color-text-muted);
  font-size: 0.8rem;
  margin-left: 0.3rem;
}

.form-group input[type="text"],
.form-group select {
  padding: 0.7rem 0.9rem;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.92rem;
  font-family: inherit;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--color-primary);
}

/* ---------- Checkbox List ---------- */
.checkbox-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.8rem;
  background-color: var(--color-background);
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.9rem;
  color: var(--color-text);
  cursor: pointer;
  padding: 0.3rem 0.4rem;
  border-radius: var(--radius-sm);
  transition: background-color 0.15s ease;
}

.checkbox-item:hover {
  background-color: white;
}

.checkbox-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--color-primary);
  flex-shrink: 0;
}

.level-badge {
  margin-left: auto;
  font-size: 0.72rem;
  color: var(--color-text-muted);
  background: white;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  border: 1px solid var(--color-border);
}

.capitalize {
  text-transform: capitalize;
}

.selection-count {
  margin-top: 0.5rem;
  font-size: 0.82rem;
  color: var(--color-primary);
  font-weight: 600;
}
</style>