<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/axios'

const router = useRouter()

const totalStudents = ref(0)
const totalTeachers = ref(0)
const totalClasses = ref(0)
const totalSubjects = ref(0)
const totalParents = ref(0)
const totalAttendance = ref(0)
const presentCount = ref(0)
const absentCount = ref(0)

const latestAnnouncements = ref([])
const recentStudents = ref([])

const loading = ref(true)
const errorMessage = ref('')

onMounted(async () => {
  try {
    const [studentsRes, teachersRes, classesRes, subjectsRes, parentsRes, attendanceRes, announcementsRes] = await Promise.all([
      api.get('/students'),
      api.get('/teachers'),
      api.get('/classes'),
      api.get('/subjects'),
      api.get('/parents'),
      api.get('/attendance'),
      api.get('/announcements')
    ])

    const students = studentsRes.data.students
    const attendance = attendanceRes.data.attendance

    totalStudents.value = students.length
    totalTeachers.value = teachersRes.data.teachers.length
    totalClasses.value = classesRes.data.classes.length
    totalSubjects.value = subjectsRes.data.subjects.length
    totalParents.value = parentsRes.data.parents.length
    totalAttendance.value = attendance.length

    latestAnnouncements.value = announcementsRes.data.announcements.slice(0, 3)

    presentCount.value = attendance.filter(item => item.status?.toLowerCase() === "present").length
    absentCount.value = attendance.filter(item => item.status?.toLowerCase() === "absent").length

    recentStudents.value = [...students]
      .sort((a, b) => b.id - a.id)
      .slice(0, 5)

  } catch (err) {
    errorMessage.value = 'Failed to load dashboard data'
    console.error(err)
  } finally {
    loading.value = false
  }
})

const goTo = (path) => {
  router.push(path)
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="dashboard-home">
    <div class="title">
      <h1>Dashboard Overview</h1>
      <p class="subtitle">Welcome to your school management dashboard</p>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="loading">Loading dashboard data...</p>

    <template v-else>
      <!-- Summary Cards -->
      <div class="cards-grid">
        <div class="card">
          <div class="card-icon"><i class="fa-solid fa-graduation-cap"></i></div>
          <div class="card-info">
            <p class="card-number">{{ totalStudents }}</p>
            <p class="card-label">Total Students</p>
          </div>
        </div>

        <div class="card">
          <div class="card-icon"><i class="fa-solid fa-chalkboard-user"></i></div>
          <div class="card-info">
            <p class="card-number">{{ totalTeachers }}</p>
            <p class="card-label">Total Teachers</p>
          </div>
        </div>

        <div class="card">
          <div class="card-icon"><i class="fa-solid fa-school"></i></div>
          <div class="card-info">
            <p class="card-number">{{ totalClasses }}</p>
            <p class="card-label">Active Classes</p>
          </div>
        </div>

        <div class="card">
          <div class="card-icon"><i class="fa-solid fa-book-open"></i></div>
          <div class="card-info">
            <p class="card-number">{{ totalSubjects }}</p>
            <p class="card-label">Total Subjects</p>
          </div>
        </div>

        <div class="card">
          <div class="card-icon"><i class="fa-solid fa-people-roof"></i></div>
          <div class="card-info">
            <p class="card-number">{{ totalParents }}</p>
            <p class="card-label">Registered Parents</p>
          </div>
        </div>

        <div class="card attendance-card">
          <div class="card-icon"><i class="fa-solid fa-user-check"></i></div>
          <div class="card-info">
            <p class="card-number">{{ totalAttendance }}</p>
            <p class="card-label">Attendance Records</p>
            <small>Present: {{ presentCount }} | Absent: {{ absentCount }}</small>
          </div>
        </div>
      </div>

      <div class="bottom-grid">
        <div class="recent-section">
          <h2>Recently Added Students</h2>
          <table v-if="recentStudents.length > 0">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Gender</th>
                <th>Guardian</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in recentStudents" :key="student.id">
                <td>{{ student.full_name }}</td>
                <td class="capitalize">{{ student.gender }}</td>
                <td>{{ student.guardian_name }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="empty-state">No students added yet.</p>
        </div>

        <!-- Latest Announcements -->
        <div class="announcements-section">
          <div class="announcements-header">
            <h2>Latest Announcements</h2>
            <button class="view-all-btn" @click="goTo('/dashboard/announcements')">View All</button>
          </div>

          <div v-if="latestAnnouncements.length > 0" class="announcements-preview">
            <div v-for="item in latestAnnouncements" :key="item.id" class="mini-announcement">
              <div class="mini-announcement-header">
                <i class="fa-solid fa-bullhorn"></i>
                <strong>{{ item.title }}</strong>
              </div>
              <p>{{ item.body }}</p>
              <span class="mini-date">{{ formatDate(item.created_at) }}</span>
            </div>
          </div>
          <p v-else class="empty-state">No announcements yet.</p>
        </div>
      </div>

       <div class="quick-action">
      <h2>Quick Actions</h2>
      <div class="quick-actions">
        <button @click="goTo('/dashboard/students')">Add Student</button>
        <button @click="goTo('/dashboard/teachers')">Add Teacher</button>
        <button @click="goTo('/dashboard/classes')">Add Class</button>
        <button @click="goTo('/dashboard/results')">Enter Results</button>
        <button @click="goTo('/dashboard/attendance')">Mark Attendance</button>
      </div>
      </div>

    </template>
  </div>
</template>

<style scoped>
.dashboard-home h1 {
  font-size: 2rem;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.title{
  background: white;
  padding: 20px;
  border-radius: var(--radius-lg);
}

.subtitle {
  color: var(--color-text-muted);
  font-size: 1.2rem;
  margin-bottom: 1.6rem;
}

.error {
  color: var(--color-danger);
  margin-bottom: 1rem;
}

.quick-action h2{
  margin: 25px 0;
  font-size: 1.7rem;
}
.quick-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 2.5rem;
}

.quick-actions button {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 0.7rem 1.2rem;
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.quick-actions button:hover {
  background-color: var(--color-primary-hover);
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  margin-top: 2rem;
}

.card {
  background: white;
  border-radius: var(--radius-md);
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 250px;
  height: 120px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.card-icon {
  font-size: 2.2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  background-color: var(--color-background);
  flex-shrink: 0;
}

.card-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: inherit;
}

.card-label {
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.attendance-card small {
  display: block;
  margin-top: 0.4rem;
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

/* Bottom two-column layout */
.bottom-grid {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 1.5rem;
}

.recent-section,
.announcements-section {
  background: white;
  border-radius: var(--radius-md);
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.recent-section h2 {
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: var(--color-text);
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
  font-size: 0.85rem;
  text-transform: uppercase;
}

td {
  padding: 0.8rem;
  border-bottom: 1px solid var(--color-border);
  font-size: 0.95rem;
}

.capitalize {
  text-transform: capitalize;
}

.empty-state {
  color: var(--color-text-muted);
  text-align: center;
  padding: 2rem;
}

/* Announcements preview */
.announcements-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.announcements-header h2 {
  font-size: 1.3rem;
  color: var(--color-text);
}

.view-all-btn {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 0.85rem;
  cursor: pointer;
  font-weight: 600;
}

.announcements-preview {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mini-announcement {
  border-left: 3px solid var(--color-primary);
  padding: 0.6rem 1rem;
  background-color: var(--color-background);
  border-radius: var(--radius-sm);
}

.mini-announcement-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.3rem;
  color: var(--color-text);
}

.mini-announcement-header i {
  color: var(--color-primary);
  font-size: 0.9rem;
}

.mini-announcement p {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  margin-bottom: 0.4rem;
  line-height: 1.4;
}

.mini-date {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

@media (max-width: 768px) {
  .bottom-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }
  .quick-actions {
    flex-direction: column;
  }
  table {
    font-size: 0.85rem;
  }
}
</style>