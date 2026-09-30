<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api/axios'

const route = useRoute()
const router = useRouter()

const attendance = ref([])
const student = ref(null)

const loading = ref(true)
const errorMessage = ref('')

const studentId = route.params.studentId

// Fetch student information
const fetchStudent = async () => {
  try {
    const res = await api.get(`/students/${studentId}`)
    student.value = res.data.student
  } catch (err) {
    console.error(err)
  }
}

// Fetch student's attendance
const fetchAttendance = async () => {
  try {
    loading.value = true

    const res = await api.get(`/attendance/student/${studentId}`)

    attendance.value = res.data.attendance
  } catch (err) {
    errorMessage.value =
      err.response?.data?.message || 'Failed to load attendance'

    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStudent()
  fetchAttendance()
})

// Format date
const formatDate = (date) => {
  if (!date) return ''

  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

// Attendance statistics
const totalDays = computed(() => attendance.value.length)

const presentDays = computed(() => {
  return attendance.value.filter(
    record => record.status === 'present'
  ).length
})

const absentDays = computed(() => {
  return attendance.value.filter(
    record => record.status === 'absent'
  ).length
})

const lateDays = computed(() => {
  return attendance.value.filter(
    record => record.status === 'late'
  ).length
})

const excusedDays = computed(() => {
  return attendance.value.filter(
    record => record.status === 'excused'
  ).length
})

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="page">

    <!-- Header -->
    <div class="page-header">
      <div>
        <p class="bts">
       <RouterLink to="/dashboard/students" ><- Back to students</RouterLink>
        </p>

        <h1>Student Attendance</h1>

        <p v-if="student" class="student-name">
          {{ student.full_name }}
        </p>
      </div>
    </div>

    <!-- Error -->
    <p v-if="errorMessage" class="error">
      {{ errorMessage }}
    </p>

    <!-- Loading -->
    <p v-if="loading">
      Loading attendance...
    </p>

    <div v-else>

      <!-- Statistics -->
      <div class="stats-grid">

        <div class="stat-card">
          <span class="stat-label">Total Days</span>
          <strong>{{ totalDays }}</strong>
        </div>

        <div class="stat-card present">
          <span class="stat-label">Present</span>
          <strong>{{ presentDays }}</strong>
        </div>

        <div class="stat-card absent">
          <span class="stat-label">Absent</span>
          <strong>{{ absentDays }}</strong>
        </div>

        <div class="stat-card late">
          <span class="stat-label">Late</span>
          <strong>{{ lateDays }}</strong>
        </div>

        <div class="stat-card excused">
          <span class="stat-label">Excused</span>
          <strong>{{ excusedDays }}</strong>
        </div>

      </div>

      <!-- Attendance table -->
      <div class="table-card">

        <div class="table-header">
          <h2>Attendance Records</h2>
        </div>

        <table v-if="attendance.length > 0">

          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Status</th>
              <th>Term</th>
              <th>Session</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(record, index) in attendance"
              :key="record.id"
            >
              <td>{{ index + 1 }}</td>

              <td>
                {{ formatDate(record.date) }}
              </td>

              <td>
                <span
                  class="status-badge"
                  :class="record.status"
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
            </tr>
          </tbody>

        </table>

        <p v-else class="empty-state">
          No attendance records found for this student.
        </p>

      </div>

    </div>

  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 1.8rem;
}

.page-header h1 {
  font-size: 1.7rem;
  font-weight: 700;
  color: var(--color-text);
  margin-top: 0.8rem;
}

.student-name {
  color: var(--color-text-muted);
  margin-top: 0.3rem;
  font-size: 0.95rem;
}

.back-btn {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0;
}

.back-btn:hover {
  text-decoration: underline;
}

.error {
  background-color: #fef2f2;
  color: var(--color-danger);
  padding: 0.8rem 1rem;
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--color-danger);
  margin-bottom: 1.2rem;
}

/* Statistics */

.stats-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 1.2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.stat-card strong {
  display: block;
  font-size: 1.6rem;
  margin-top: 0.4rem;
  color: var(--color-text);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  font-weight: 600;
}

.present strong {
  color: #16a34a;
}

.absent strong {
  color: #dc2626;
}

.late strong {
  color: #d97706;
}

.excused strong {
  color: #6366f1;
}

/* Table */

.table-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 1.2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
}

.table-header {
  margin-bottom: 1rem;
}

.table-header h2 {
  font-size: 1.1rem;
  color: var(--color-text);
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

.capitalize {
  text-transform: capitalize;
}

/* Status */

.status-badge {
  display: inline-block;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-badge.present {
  background: #dcfce7;
  color: #166534;
}

.status-badge.absent {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge.late {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.excused {
  background: #e0e7ff;
  color: #3730a3;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--color-text-muted);
}

/* Responsive */

@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
