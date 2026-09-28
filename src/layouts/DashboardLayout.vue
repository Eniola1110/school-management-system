<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore()
const router = useRouter()
const sidebarOpen = ref(false)

const logout = () => {
  authStore.logout()
  router.push('/')
}

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}
</script>

<template>
  <div class="dashboard">
    <div class="sidebar" :class="{ 'sidebar-open': sidebarOpen}">
      <div class="sidebar-header">
        <h2>EduTrack</h2>
      </div>

      <nav class="sidebar-nav">
        <RouterLink to="/dashboard" class="nav-link"><i class="fa-solid fa-gauge"></i> Dashboard</RouterLink>
        <RouterLink to="/dashboard/students" class="nav-link"><i class="fa-solid fa-user-graduate"></i>Students</RouterLink>
        <RouterLink to="/dashboard/teachers" class="nav-link"><i class="fa-solid fa-chalkboard-user"></i>Teachers</RouterLink>
        <RouterLink to="/dashboard/parents" class="nav-link"><i class="fa-solid fa-people-roof"></i>Parents</RouterLink>
        <RouterLink to="/dashboard/classes" class="nav-link"><i class="fa-solid fa-school"></i>Classes</RouterLink>
        <RouterLink to="/dashboard/subjects" class="nav-link"><i class="fa-solid fa-book"></i>Subjects</RouterLink>
        <RouterLink to="/dashboard/attendance" class="nav-link"><i class="fa-solid fa-clipboard-check"></i>Attendance</RouterLink>
        <RouterLink to="/dashboard/results" class="nav-link"><i class="fa-solid fa-chart-line"></i>Results</RouterLink>
        <RouterLink to="/dashboard/fees" class="nav-link"><i class="fa-solid fa-money-bill-wave"></i>Fees</RouterLink>
        <RouterLink to="/dashboard/payments" class="nav-link"><i class="fa-solid fa-credit-card"></i>Payment</RouterLink>
         <RouterLink to="/dashboard/announcements" class="nav-link"><i class="fa-solid fa-bullhorn"></i>Announcements</RouterLink>
      </nav>
      <button class="logout-btn" @click="logout"><i class="fa-solid fa-right-from-bracket"></i>Logout</button>
    </div>

        <div v-if="sidebarOpen" class="overlay" @click="sidebarOpen = false"></div>

    <div class="content">
        <header class="topbar">
          <button class="hamburger" @click="toggleSidebar"><i class="fa fa-bars" aria-hidden="true"></i>
          </button>
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
.dashboard{
  display: flex;
  min-height: 100vh;
}
 
.sidebar {
  width: 180px;
  background-color: var(--color-sidebar);
  color: white;
  display: flex;
  flex-direction: column;
  padding: 1.0rem 0.5rem;
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
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  transition: background-color 0.2s;
  font-size: 0.8rem;
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
  width: 18px;
  margin-right: 0.5rem;
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
  padding: 1rem;
  flex: 1;
  background-color: var(--color-background);
}

.hamburger {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text);
}

.overlay {
  display: none;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 1000;
  }

  .sidebar-open {
    transform: translateX(0);
  }

  .hamburger {
    display: block;
  }

  .overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }

  .topbar {
    padding: 1rem;
  }

  .page-content {
    padding: 1rem;
  }
}
</style>