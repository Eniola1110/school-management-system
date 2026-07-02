<script setup>
import { ref } from 'vue'
import api from '../api/axios'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js' 

const email = ref('')
const password = ref('')
const errorMessage = ref('')

const router = useRouter()
const authStore = useAuthStore()

const login = async () => {
  try {
    const response = await api.post('/auth/login', {
      email: email.value,
      password: password.value,
    })
    authStore.login(response.data.token, response.data.user)
  }
  catch (err) {
    errorMessage.value = err.response?.data?.message || 'Login failed'
  }

  const role = authStore.role
    if(role === 'admin') router.push('/dashboard')
  else if (role === 'teacher') router.push('/teacher')
  else if (role === 'student') router.push('/student')
  else if (role === 'parent') router.push('/parent')
}
</script>

<template>
  <div>
    <div class="login-page">
      <div class="login-card">
        <div class="login-header">
          <div class="login-logo">
            <img src="../assets/login-image.png">
          </div>
          <h1>EduTrack</h1>
          <p> Smart Management for Smarter Schools </p>
          <div class="features">
            <div class="feature">Student Management</div>
            <div class="feature">Teacher Management</div>
            <div class="feature">Attendance Tracking</div>
            <div class="feature">Parent Records</div>
            <div class="feature">Result Management</div>
          </div>
        </div>

        <form @submit.prevent="login">
          <h2>Welcome Back!</h2>
          <p class="subtitle">Sign in to access your dashboard</p>
          <div class="form"> 
            <label for="fullname"> Email </label>
            <input type="email" id="email" placeholder="Enter email" v-model="email">
          </div>
          <div class="form"> 
            <label for="password"> Password </label>
            <input type="password" id="password" placeholder="Enter password" v-model="password">
          </div>
          <div class="form">
            <label for="role">Role</label>
           <select v-model="role">
            <option value="">Admin</option>
            <option value="">Teacher</option>
            <option value="">Student</option>
            <option value="">Parent</option>
           </select>
          </div>
          <button type="submit">Login</button>
          <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        </form> 
      </div>
    </div>
  </div>
  
</template>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: var(--color-primary);
  padding: 2rem;
}

.login-card {
  display: flex;
  background: var(--color-white);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 900px;
  width: 100%;
}

.login-header {
  background-color: var(--color-sidebar);
  color: var(--color-white);
  flex: 1;
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  justify-content: center;
}

.login-logo img {
  width: 80px;
  height: 80px;
  margin-bottom: 1rem;
  border-radius: var(--radius-lg);
}

.login-header h1 {
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
}

.login-header p {
  color: #CBD5E1;
  font-size: 1rem;
  margin-bottom: 2rem;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.feature {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.6rem 1rem;
  border-radius: var(--radius-sm);
  font-size: 1rem;
  text-align: left;
}

form {
  flex: 1;
  padding: 3rem 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

form h2 {
  font-size: 1.7rem;
  margin-bottom: 0.25rem;
  color: var(--color-text);
}

.subtitle {
  color: var(--color-text-muted);
  margin-bottom: 1.5rem;
  font-size: 1rem;
}

.form {
  margin-bottom: 1.2rem;
  display: flex;
  flex-direction: column;
}

.form label {
  font-size: 0.85rem;
  margin-bottom: 0.4rem;
  color: var(--color-text);
  font-weight: 500;
}

.form input,
form select{
  padding: 0.7rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}

.form input:focus{
  border-color: var(--color-primary);
}

button {
  background-color: var(--color-primary);
  color: var(--color-white);
  padding: 0.8rem;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 0.5rem;
}

button:hover {
  background-color: var(--color-primary-hover);
}

.error {
  color: var(--color-danger);
  font-size: 0.9rem;
  margin-top: 1rem;
  text-align: center;
}

.sign-up{
  margin-top: 10px;
  font-size: 1rem;
}

.sign-up a{
  color: var(--color-text);
}

/* Responsive: stack on smaller screens */
@media (max-width: 768px) {
  .login-card {
    flex-direction: column;
  }
}
</style>