<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router';
import api from '@/api/axios';

const route = useRoute()

const timetable = ref([])
const subjectList = ref([])
const className = ref('')
const classArm = ref('')
const loading = ref(true)
const errorMessage = ref('')
const showForm = ref(false)
const isEditing = ref(false)
const editingId = ref(null)

const form = ref({
  subject_id: '', day: '', start_time: '', end_time: '', term: '', session: ''
})

const classId = route.params.classId

const fetchTimetable = async () => {
  try {
    loading.value = true

    const res = await api.get(`/timetable/class/${classId}`)
    timetable.value = res.data.timetable

    if (timetable.value.length > 0) {
      className.value = timetable.value[0].class_name
      classArm.value = timetable.value[0].arm
    }
  }

  catch (err) {
    errorMessage.value = err.response?.data?.message || 'Failed to load timetable'
    console.error(err)
  }
  finally {
    loading.value = false
  }
}

const fetchSubjectsList = async () => {
  try {
    const res = await api.get('/subjects')
    subjectList.value = res.data.subjects
  }
  catch (err) {
    console.error(err)
  }
}
onMounted(() => {
  fetchTimetable()
  fetchSubjectsList()
})

const openCreateForm = () => {
  isEditing.value = false
  editingId.value = null

  form.value = {
    subject_id: '', day: '', start_time: '', end_time: '', term: '', session: ''
  }
  showForm.value = true
}

const openEditForm = (item) => {
  isEditing.value = true
  editingId.value = item.id

  form.value = {
    subject_id: item.subject_id, day: item.day, start_time: item.start_time,
    end_time: item.end_time, term: item.term, session: item.session
  }

  showForm.value = true
}

const submitForm = async () => {
  try {
    errorMessage.value = ''

    const payload = {
      class_id: classId,
      subject_id: form.value.subject_id,
      day: form.value.day,
      start_time: form.value.start_time,
      end_time: form.value.end_time,
      term: form.value.term,
      session: form.value.session
    }

    if (isEditing.value) {
      await api.put(`/timetable/${editingId.value}`, payload)
    }
    else {
      await api.post('/timetable', payload)
    }

    showForm.value = false

    fetchTimetable()

  } catch (err) {
    errorMessage.value =
      err.response?.data?.message || 'Failed to create timetable'

    console.error(err)
  }
}

const deleteTimetable = async (id) => {
  if (!confirm('Are sure you want to delete this timetable?')) return

  try {
    await api.delete(`/timetable/${id}`)
    fetchTimetable()
  }
  catch (err) {
    errorMessage.value = err.response?.data?.message || 'Failed to delete timetable'

    console.error(err)
  }
}
</script>

<template>
  <div class="page">
    <RouterLink to="/dashboard/classes"><- Back to classes</RouterLink>
    <div class="page-header">
      <h1>{{ className }} ({{ classArm }}) Timetable</h1>
    </div>
    <p class="error" v-if="errorMessage"> {{ errorMessage }}</p>

    <p v-if="loading"> Loading timetable...</p>

    <div v-else class="table-card">

      <div class="table-header">
        <h2>Weekly Timetable</h2>

        <button class="btn-primary" @click="openCreateForm">
          Add Timetable
        </button>
      </div>
      <table v-if="timetable.length > 0">
        <thead>
          <tr>
            <th>Day</th>
            <th>Subject</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Term</th>
            <th>Session</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="item in timetable"
            :key="item.id"
          >
            <td class="capitalize">
              {{ item.day }}
            </td>

            <td>
              {{ item.subject_name }}
            </td>

            <td>
              {{ item.start_time }}
            </td>

            <td>
              {{ item.end_time }}
            </td>

            <td class="capitalize">
              {{ item.term }}
            </td>

            <td>
              {{ item.session }}
            </td>

            <td class="actions">
              <button class="btn-edit" @click="openEditForm(item)">Edit</button>
              <button class="btn-delete" @click="deleteTimetable(item.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="empty-state">
       <p> No timetable has been created for this class.</p>
       <button @click="openCreateForm">
        Create Timetable
       </button>
      </div>
      <div v-if="showForm" class="modal-overlay">
        <div class="modal">
          <h2>{{isEditing ? 'Edit Timetable': 'Create Timetable'}}</h2>

          <form action="" @submit.prevent="submitForm">
            <div class="form-group">
              <label for="Subject"></label>

              <select v-model="form.subject_id" required>
                <option value="">Select Subject</option>
                <option v-for="subject in subjectList" :key="subject.id" :value="subject.id"> {{ subject.subject_name }}</option>
              </select>
            </div>

            <div class="form-group">
             <label>Day</label>

              <select v-model="form.day" required>
               <option value="">Select Day</option>
               <option value="monday">Monday</option>
               <option value="tuesday">Tuesday</option>
               <option value="wednesday">Wednesday</option>
               <option value="thursday">Thursday</option>
               <option value="friday">Friday</option>
             </select>
            </div>
            <div class="form-group">
        <label>Start Time</label>
        <input
          v-model="form.start_time"
          type="time"
          required
        />
      </div>

      <div class="form-group">
        <label>End Time</label>
        <input
          v-model="form.end_time"
          type="time"
          required
        />
      </div>

      <div class="form-group">
        <label>Term</label>

        <select v-model="form.term" required>
          <option value="">Select Term</option>
          <option value="first">First</option>
          <option value="second">Second</option>
          <option value="third">Third</option>
        </select>
      </div>

      <div class="form-group">
        <label>Session</label>

        <input
          v-model="form.session"
          type="text"
          placeholder="e.g. 2025/2026"
          required
        />
      </div>
         <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="showForm = false">Cancel</button>

          <button type="submit" class="btn-primary">
            {{ isEditing ? 'Update Timetable' : 'Save Timetable' }}
          </button>
         </div>
          </form>
        </div>
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

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-muted);
}

.empty-state button{
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 0.7rem 1.3rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  margin-top: 10px;
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
.actions {
  display: flex;
  gap: 0.5rem;
}
.btn-primary {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 0.7rem 1.3rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

.form-group label {
  margin-bottom: 0.4rem;
  font-size: 0.85rem;
  font-weight: 500;
}

.form-group input,
.form-group select {
  padding: 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: var(--radius-md);
  width: 100%;
  max-width: 450px;
}

.modal h2 {
  margin-bottom: 1.5rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
  margin-top: 1.5rem;
}

.btn-secondary {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  padding: 0.6rem 1.2rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.table-header h2 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--color-text);
}
</style>