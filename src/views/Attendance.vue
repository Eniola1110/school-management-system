<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '@/api/axios'

// ==================== DATA ====================

const records = ref([])
const studentsList = ref([])
const classesList = ref([])

const loading = ref(true)
const errorMessage = ref('')

const showForm = ref(false)
const isEditing = ref(false)
const editingId = ref(null)

// ==================== FORM ====================

const form = ref({
  student_id: '',
  class_id: '',
  date: '',
  status: '',
  term: '',
  session: '2025/2026'
})

// ==================== FILTERS ====================

const search = ref('')
const filterStatus = ref('')
const filterTerm = ref('')
const filterSession = ref('2025/2026')

// ==================== PAGINATION ====================

const currentPage = ref(1)
const itemsPerPage = 10

// ==================== FETCH ATTENDANCE ====================

const fetchAttendance = async () => {
  try {
    loading.value = true

    const res = await api.get('/attendance')

    records.value = res.data.attendance || []
  } catch (err) {
    errorMessage.value = 'Failed to load attendance'
    console.error(err)
  } finally {
    loading.value = false
  }
}

// ==================== FETCH STUDENTS ====================

const fetchStudentsList = async () => {
  try {
    const res = await api.get('/students')

    studentsList.value = res.data.students || []
  } catch (err) {
    console.error('Failed to load students:', err)
  }
}

// ==================== FETCH CLASSES ====================

const fetchClassesList = async () => {
  try {
    const res = await api.get('/classes')

    classesList.value = res.data.classes || []
  } catch (err) {
    console.error('Failed to load classes:', err)
  }
}

// ==================== INITIAL LOAD ====================

onMounted(() => {
  fetchAttendance()
  fetchStudentsList()
  fetchClassesList()
})

// ==================== GET STUDENT NAME ====================

const getStudentName = (id) => {
  const student = studentsList.value.find(
    student => Number(student.id) === Number(id)
  )

  return student ? student.full_name : 'Unknown Student'
}

// ==================== GET CLASS NAME ====================

const getClassName = (id) => {
  const cls = classesList.value.find(
    cls => Number(cls.id) === Number(id)
  )

  if (!cls) return 'Unknown Class'

  return `${cls.class_name} ${cls.arm || ''}`.trim()
}

// ==================== FILTERED RECORDS ====================

const filteredRecords = computed(() => {
  const searchText = search.value.toLowerCase().trim()

  return records.value.filter(record => {
    const studentName = getStudentName(record.student_id).toLowerCase()
    const className = getClassName(record.class_id).toLowerCase()

    const matchesSearch =
      !searchText ||
      studentName.includes(searchText) ||
      className.includes(searchText)

    const matchesStatus =
      !filterStatus.value ||
      record.status === filterStatus.value

    const matchesTerm =
      !filterTerm.value ||
      record.term === filterTerm.value

    const matchesSession =
      !filterSession.value ||
      record.session === filterSession.value

    return (
      matchesSearch &&
      matchesStatus &&
      matchesTerm &&
      matchesSession
    )
  })
})

// ==================== PAGINATION ====================

const totalPages = computed(() => {
  return Math.ceil(filteredRecords.value.length / itemsPerPage)
})

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage

  return filteredRecords.value.slice(start, end)
})

// ==================== CHANGE PAGE ====================

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return

  currentPage.value = page
}

// ==================== RESET PAGE WHEN FILTER CHANGES ====================

watch(
  [search, filterStatus, filterTerm, filterSession],
  () => {
    currentPage.value = 1
  }
)

// ==================== CREATE FORM ====================

const openCreateForm = () => {
  isEditing.value = false
  editingId.value = null

  form.value = {
    student_id: '',
    class_id: '',
    date: '',
    status: '',
    term: '',
    session: '2025/2026'
  }

  errorMessage.value = ''
  showForm.value = true
}

// ==================== EDIT FORM ====================

const openEditForm = (record) => {
  isEditing.value = true
  editingId.value = record.id

  form.value = {
    student_id: record.student_id,
    class_id: record.class_id,
    date: record.date
      ? String(record.date).split('T')[0]
      : '',
    status: record.status,
    term: record.term,
    session: record.session
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

    if (
      !form.value.student_id ||
      !form.value.class_id ||
      !form.value.date ||
      !form.value.status ||
      !form.value.term ||
      !form.value.session
    ) {
      errorMessage.value = 'Please fill in all fields.'
      return
    }

    if (isEditing.value) {
      await api.put(
        `/attendance/${editingId.value}`,
        form.value
      )
    } else {
      await api.post(
        '/attendance',
        form.value
      )
    }

    closeForm()

    await fetchAttendance()

  } catch (err) {
    errorMessage.value =
      err.response?.data?.message ||
      'Something went wrong.'

    console.error(err)
  }
}

// ==================== DELETE ====================

const deleteRecord = async (id) => {
  const confirmed = confirm(
    'Are you sure you want to delete this attendance record?'
  )

  if (!confirmed) return

  try {
    await api.delete(`/attendance/${id}`)

    await fetchAttendance()

    // If deleting the last item on a page,
    // move back to the previous page.
    if (
      currentPage.value > 1 &&
      paginatedRecords.value.length === 0
    ) {
      currentPage.value--
    }

  } catch (err) {
    errorMessage.value = 'Failed to delete attendance record'
    console.error(err)
  }
}
</script>


<template>
  <div class="page">

    <!-- ================= HEADER ================= -->

    <div class="page-header">

      <div>
        <h1>Attendance</h1>
        <p class="page-description">
          Manage and track student attendance records.
        </p>
      </div>

      <button
        class="btn-primary"
        @click="openCreateForm"
      >
        + Mark Attendance
      </button>

    </div>


    <!-- ================= ERROR ================= -->

    <p
      v-if="errorMessage && !showForm"
      class="error"
    >
      {{ errorMessage }}
    </p>


    <!-- ================= FILTERS ================= -->

    <div class="toolbar">

      <input
        v-model="search"
        type="text"
        class="search-input"
        placeholder="Search student or class..."
      />

      <select v-model="filterStatus">
        <option value="">All Status</option>
        <option value="present">Present</option>
        <option value="absent">Absent</option>
        <option value="late">Late</option>
        <option value="excused">Excused</option>
      </select>

      <select v-model="filterTerm">
        <option value="">All Terms</option>
        <option value="first">First Term</option>
        <option value="second">Second Term</option>
        <option value="third">Third Term</option>
      </select>

      <select v-model="filterSession">
        <option value="">All Sessions</option>
        <option value="2025/2026">2025/2026</option>
      </select>

    </div>


    <!-- ================= LOADING ================= -->

    <p
      v-if="loading"
      class="loading"
    >
      Loading attendance...
    </p>


    <!-- ================= TABLE ================= -->

    <div
      v-else
      class="table-card"
    >

      <table v-if="paginatedRecords.length > 0">

        <thead>
          <tr>
            <th>Student</th>
            <th>Class</th>
            <th>Date</th>
            <th>Status</th>
            <th>Term</th>
            <th>Session</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>

          <tr
            v-for="record in paginatedRecords"
            :key="record.id"
          >

            <td class="student-name">
              {{ getStudentName(record.student_id) }}
            </td>

            <td>
              {{ getClassName(record.class_id) }}
            </td>

            <td>
              {{ record.date?.split('T')[0] }}
            </td>

            <td>

              <span
                class="status-badge"
                :class="`status-${record.status}`"
              >
                {{ record.status }}
              </span>

            </td>

            <td class="capitalize">
              {{ record.term }}
            </td>

            <td>
              {{ record.session }}
            </td>

            <td class="actions">

              <button
                class="btn-edit"
                @click="openEditForm(record)"
              >
                Edit
              </button>

              <button
                class="btn-delete"
                @click="deleteRecord(record.id)"
              >
                Delete
              </button>

            </td>

          </tr>

        </tbody>

      </table>


      <!-- EMPTY -->

      <p
        v-else
        class="empty-state"
      >
        No attendance records found.
      </p>

    </div>


    <!-- ================= PAGINATION ================= -->

    <div
      v-if="totalPages > 1"
      class="pagination"
    >

      <button
        class="page-btn"
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
      >
        Previous
      </button>

      <button
        v-for="page in totalPages"
        :key="page"
        class="page-number"
        :class="{ active: currentPage === page }"
        @click="changePage(page)"
      >
        {{ page }}
      </button>

      <button
        class="page-btn"
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
      >
        Next
      </button>

    </div>


    <!-- ================= MODAL ================= -->

    <div
      v-if="showForm"
      class="modal-overlay"
      @click.self="closeForm"
    >

      <div class="modal">

        <h2>
          {{ isEditing ? 'Edit Attendance' : 'Mark Attendance' }}
        </h2>

        <p
          v-if="errorMessage"
          class="error"
        >
          {{ errorMessage }}
        </p>


        <form @submit.prevent="submitForm">

          <!-- STUDENT + CLASS -->

          <div class="form-row">

            <div class="form-group">

              <label>Student</label>

              <select
                v-model="form.student_id"
                required
              >

                <option value="">
                  Select Student
                </option>

                <option
                  v-for="student in studentsList"
                  :key="student.id"
                  :value="student.id"
                >
                  {{ student.full_name }}
                </option>

              </select>

            </div>


            <div class="form-group">

              <label>Class</label>

              <select
                v-model="form.class_id"
                required
              >

                <option value="">
                  Select Class
                </option>

                <option
                  v-for="cls in classesList"
                  :key="cls.id"
                  :value="cls.id"
                >
                  {{ cls.class_name }} {{ cls.arm }}
                </option>

              </select>

            </div>

          </div>


          <!-- DATE + STATUS -->

          <div class="form-row">

            <div class="form-group">

              <label>Date</label>

              <input
                v-model="form.date"
                type="date"
                required
              />

            </div>


            <div class="form-group">

              <label>Status</label>

              <select
                v-model="form.status"
                required
              >

                <option value="">
                  Select Status
                </option>

                <option value="present">
                  Present
                </option>

                <option value="absent">
                  Absent
                </option>

                <option value="late">
                  Late
                </option>

                <option value="excused">
                  Excused
                </option>

              </select>

            </div>

          </div>


          <!-- TERM + SESSION -->

          <div class="form-row">

            <div class="form-group">

              <label>Term</label>

              <select
                v-model="form.term"
                required
              >

                <option value="">
                  Select Term
                </option>

                <option value="first">
                  First Term
                </option>

                <option value="second">
                  Second Term
                </option>

                <option value="third">
                  Third Term
                </option>

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

          </div>


          <!-- ACTIONS -->

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

.page {
  width: 100%;
}


/* ================= HEADER ================= */

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-header h1 {
  margin: 0;
  font-size: 1.7rem;
  font-weight: 700;
  color: var(--color-text);
}

.page-description {
  margin: 0.35rem 0 0;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}


/* ================= BUTTONS ================= */

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
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
  transform: translateY(-1px);
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

.btn-edit,
.btn-delete {
  border: none;
  padding: 0.45rem 0.85rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 600;
  color: white;
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


/* ================= TOOLBAR ================= */

.toolbar {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
  margin-bottom: 1.2rem;
}

.search-input,
.toolbar select {
  padding: 0.7rem 0.9rem;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: white;
  color: var(--color-text);
  font-size: 0.9rem;
  font-family: inherit;
}

.search-input {
  flex: 1;
  min-width: 220px;
}

.toolbar select {
  min-width: 150px;
}

.search-input:focus,
.toolbar select:focus {
  outline: none;
  border-color: var(--color-primary);
}


/* ================= TABLE ================= */

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

tbody tr:hover {
  background-color: var(--color-background);
}

.student-name {
  font-weight: 600;
}

.capitalize {
  text-transform: capitalize;
}


/* ================= STATUS ================= */

.status-badge {
  display: inline-block;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-present {
  background: #dcfce7;
  color: #166534;
}

.status-absent {
  background: #fee2e2;
  color: #991b1b;
}

.status-late {
  background: #fef3c7;
  color: #92400e;
}

.status-excused {
  background: #dbeafe;
  color: #1e40af;
}


/* ================= ACTIONS ================= */

.actions {
  display: flex;
  gap: 0.5rem;
}


/* ================= EMPTY / ERROR ================= */

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-muted);
}

.error {
  background-color: #fef2f2;
  color: var(--color-danger);
  padding: 0.8rem 1rem;
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--color-danger);
  margin-bottom: 1.2rem;
  font-size: 0.9rem;
}


/* ================= PAGINATION ================= */

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.4rem;
  margin-top: 1.5rem;
}

.page-btn,
.page-number {
  border: 1px solid var(--color-border);
  background: white;
  color: var(--color-text);
  padding: 0.55rem 0.8rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.85rem;
}

.page-number {
  min-width: 38px;
}

.page-number.active {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.page-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.page-btn:not(:disabled):hover,
.page-number:not(.active):hover {
  background-color: var(--color-background);
}


/* ================= MODAL ================= */

.modal-overlay {
  position: fixed;
  inset: 0;
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
  margin: 0 0 1.6rem;
  color: var(--color-text);
  font-size: 1.3rem;
}


/* ================= FORM ================= */

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

.form-group input,
.form-group select {
  padding: 0.7rem 0.9rem;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.92rem;
  font-family: inherit;
  background: white;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--color-primary);
}


/* ================= MODAL ACTIONS ================= */

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
  margin-top: 1.8rem;
  padding-top: 1.2rem;
  border-top: 1px solid var(--color-border);
}


/* ================= RESPONSIVE ================= */

@media (max-width: 700px) {

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .form-row {
    flex-direction: column;
  }

  .toolbar {
    flex-direction: column;
  }

  .search-input,
  .toolbar select {
    width: 100%;
  }

  .actions {
    flex-direction: column;
  }

  .pagination {
    flex-wrap: wrap;
  }

}

</style>

