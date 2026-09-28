```vue
<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios'

// ==================== STATE ====================
const subjects = ref([])
const loading = ref(true)
const errorMessage = ref('')

const showForm = ref(false)
const isEditing = ref(false)
const editingId = ref(null)

const form = ref({
  subject_name: ''
})

// ==================== FETCH SUBJECTS ====================
const fetchSubjects = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    const res = await api.get('/subjects')
    subjects.value = res.data.subjects
  } catch (err) {
    console.error(err)
    errorMessage.value = 'Failed to load subjects'
  } finally {
    loading.value = false
  }
}

// ==================== OPEN CREATE FORM ====================
const openCreateForm = () => {
  isEditing.value = false
  editingId.value = null

  form.value = {
    subject_name: ''
  }

  errorMessage.value = ''
  showForm.value = true
}

// ==================== OPEN EDIT FORM ====================
const openEditForm = (subject) => {
  isEditing.value = true
  editingId.value = subject.id

  form.value = {
    subject_name: subject.subject_name
  }

  errorMessage.value = ''
  showForm.value = true
}

// ==================== CLOSE FORM ====================
const closeForm = () => {
  showForm.value = false
  errorMessage.value = ''
}

// ==================== SUBMIT FORM ====================
const submitForm = async () => {
  try {
    errorMessage.value = ''

    if (!form.value.subject_name.trim()) {
      errorMessage.value = 'Subject name is required.'
      return
    }

    if (isEditing.value) {
      await api.put(`/subjects/${editingId.value}`, {
        subject_name: form.value.subject_name.trim()
      })
    } else {
      await api.post('/subjects', {
        subject_name: form.value.subject_name.trim()
      })
    }

    closeForm()
    await fetchSubjects()

  } catch (err) {
    console.error(err)

    errorMessage.value =
      err.response?.data?.message || 'Something went wrong.'
  }
}

// ==================== DELETE SUBJECT ====================
const deleteSubject = async (id) => {
  if (!confirm('Are you sure you want to delete this subject?')) {
    return
  }

  try {
    errorMessage.value = ''

    await api.delete(`/subjects/${id}`)

    await fetchSubjects()

  } catch (err) {
    console.error(err)

    errorMessage.value =
      err.response?.data?.message || 'Failed to delete subject.'
  }
}

// ==================== PAGE LOAD ====================
onMounted(() => {
  fetchSubjects()
})
</script>

<template>
  <div class="page">

    <!-- PAGE HEADER -->
    <div class="page-header">
      <h1>Subjects</h1>

      <button
        class="btn-primary"
        @click="openCreateForm"
      >
        Add Subject
      </button>
    </div>

    <!-- ERROR -->
    <p
      v-if="errorMessage"
      class="error"
    >
      {{ errorMessage }}
    </p>

    <!-- LOADING -->
    <p v-if="loading">
      Loading subjects...
    </p>

    <!-- SUBJECT TABLE -->
    <div
      v-else
      class="table-card"
    >

      <table v-if="subjects.length > 0">

        <thead>
          <tr>
            <th>Subject Name</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>

          <tr
            v-for="subject in subjects"
            :key="subject.id"
          >
            <td>
              {{ subject.subject_name }}
            </td>

            <td class="actions">

              <button
                class="btn-edit"
                @click="openEditForm(subject)"
              >
                Edit
              </button>

              <button
                class="btn-delete"
                @click="deleteSubject(subject.id)"
              >
                Delete
              </button>

            </td>
          </tr>

        </tbody>

      </table>

      <p
        v-else
        class="empty-state"
      >
        No subjects found. Click "Add Subject" to create one.
      </p>

    </div>

    <!-- MODAL -->
    <div
      v-if="showForm"
      class="modal-overlay"
      @click.self="closeForm"
    >

      <div class="modal">

        <h2>
          {{ isEditing ? 'Edit Subject' : 'Add New Subject' }}
        </h2>

        <form @submit.prevent="submitForm">

          <div class="form-group">

            <label>
              Subject Name
            </label>

            <input
              v-model="form.subject_name"
              type="text"
              placeholder="e.g. Mathematics"
              required
            />

          </div>

          <div class="modal-actions">

            <button
              type="button"
              class="btn-secondary"
              @click="closeForm"
            >
              Cancel
            </button>

            <button
              type="submit"
              class="btn-primary"
            >
              {{ isEditing ? 'Update' : 'Save' }}
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
}

.btn-secondary:hover {
  background-color: var(--color-background);
}

.btn-edit,
.btn-delete {
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

.btn-edit:hover,
.btn-delete:hover {
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
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
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

.form-group input {
  padding: 0.7rem 0.9rem;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.92rem;
  font-family: inherit;
  transition: border-color 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-primary);
}

@media (max-width: 600px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .actions {
    flex-wrap: wrap;
  }
}
</style>