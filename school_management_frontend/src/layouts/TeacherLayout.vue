<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';


const authStore = useAuthStore()
const router = useRouter()

const logout = () => {
  authStore.logout()
  router.push('/')
}
</script>

<template>
  <div class="teacher-dashboard">
    <div class="sidebar">
      <div class="sidebar-header">
        <h2>EduTrack</h2>
      </div>

      <nav class="sidebar-nav">
        <RouterLink to="/teacher" class="nav-link"><i class="fa-solid fa-gauge"></i>Dashboard</RouterLink>
        <RouterLink to="/teacher/students" class="nav-link"><i class="fa-solid fa-user-graduate"></i>Students</RouterLink>
        <RouterLink to="/teacher/assignments" class="nav-link"><i class="fa-solid fa-book"></i>Assignments</RouterLink>
        <RouterLink to="/teacher/attendance" class="nav-link"><i class="fa-solid fa-clipboard-check"></i>Attendance</RouterLink>
        <RouterLink to="/teacher/results" class="nav-link"><i class="fa-solid fa-chart-line"></i>Results</RouterLink>
         <RouterLink to="/teacher/announcements" class="nav-link"><i class="fa-solid fa-bullhorn"></i>Announcements</RouterLink>
      </nav>
      <button class="logout-btn" @click="logout"><i class="fa-solid fa-right-from-bracket"></i>Logout</button>
    </div>
    <div class="content">
        <header class="topbar">
          <p>Welcome! <span>{{ authStore.user?.full_name }}</span></p>
          <span class="role">{{ authStore.role }}</span>
        </header>

        <main class="page-content">
          <RouterView />
        </main>
    </div>
    </div>
</template>

<style scoped>
.teacher-dashboard{
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 200px;
  background-color: var(--color-sidebar);
  color: white;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 0.5rem;
}

.sidebar-header h2 {
  margin-bottom: 2rem;
  text-align: center;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.nav-link {
  color: #CBD5E1;
  text-decoration: none;
  padding: 0.7rem 1rem;
  border-radius: var(--radius-sm);
  transition: background-color 0.2s;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.router-link-active {
  background-color: var(--color-primary);
  color: white;
}

.logout-btn {
  background-color: var(--color-danger);
  color: white;
  border: none;
  padding: 0.7rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  margin-top: 20px;
}

.nav-link i,
.logout-btn i {
  width: 20px;
  margin-right: 0.6rem;
  text-align: center;
}
.topbar {
  background: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
}

.role{
  background-color: var(--color-primary);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  font-size: 0.8rem;
  text-transform: capitalize;
}

.content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.content p span{
  font-weight: bold;
}
.page-content {
  padding: 2rem;
  flex: 1;
  background-color: var(--color-background);
}
</style>