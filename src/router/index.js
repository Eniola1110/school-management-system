import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import Login from '../views/Login.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import DashboardHome from '@/views/DashboardHome.vue'
import Students from '@/views/Students.vue'
import Teachers from '@/views/Teachers.vue'
import Parents from '@/views/Parents.vue'
import Classes from '@/views/Classes.vue'
import Attendance from '@/views/Attendance.vue'
import Results from '@/views/Results.vue'
import payments from '@/views/Payments.vue'
import Fees from '@/views/Fees.vue'
import Subjects from '@/views/Subjects.vue'
import Announcements from '@/views/Announcements.vue'
import TeacherLayout from '@/layouts/TeacherLayout.vue'
import StudentLayout from '@/layouts/StudentLayout.vue'
import ParentLayout from '@/layouts/ParentLayout.vue'
import TeacherDashboard from '@/views/TeacherDashboard.vue'
import StudentDashboard from '@/views/StudentDashboard.vue'
import ParentDashboard from '@/views/ParentDashboard.vue'
import TeacherStudent from '@/views/TeacherStudent.vue'
import TeacherAssignment from '@/views/TeacherAssignment.vue'
import TeacherAttendance from '@/views/TeacherAttendance.vue'
import TeacherResults from '@/views/TeacherResults.vue'
import TeacherAnnouncements from '@/views/TeacherAnnouncements.vue'
import StudentAssignments from '@/views/StudentAssignments.vue'
import StudentResults from '@/views/StudentResults.vue'
import StudentAnnouncements from '@/views/StudentAnnouncements.vue'
import ParentAttendance from '@/views/ParentAttendance.vue'
import ParentResults from '@/views/ParentResults.vue'
import ParentAnnounments from '@/views/ParentAnnounments.vue'
import StudentAttendance from '@/views/StudentAttendance.vue'
import ClassTimetable from '@/views/ClassTimetable.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: Login },
    {
      path: '/dashboard', component: DashboardLayout, 
      children: [
        { path: '', component: DashboardHome },
        { path: 'students', component: Students },
        { path: 'teachers', component: Teachers },
        { path: 'parents', component: Parents },
        { path: 'classes', component: Classes },
        { path: 'attendance', component: Attendance },
        { path: 'results', component: Results },
        { path: 'fees', component: Fees },
        { path: 'subjects', component: Subjects },
        { path: 'payments', component: payments},
        { path: 'announcements', component: Announcements },
        { path: 'student-results/:studentId', name: 'StudentResults', component: StudentResults },
        { path: 'students/:studentId/attendance', name: 'StudentAttendance', component: StudentAttendance },
        {path: 'classes/:classId/timetable', name: 'ClassTimetable', component: ClassTimetable}
      ]
    },
    {
      path: '/teacher', component: TeacherLayout,
      children: [
        { path: '', component: TeacherDashboard },
        { path: 'students', component: TeacherStudent },
        { path: 'assignments', component: TeacherAssignment },
        { path: 'attendance', component: TeacherAttendance },
        { path: 'results', component: TeacherResults },
        { path: 'announcements', component: TeacherAnnouncements}
      ]
    },
    {
      path: '/student', component: StudentLayout,
      children: [
        { path: '', component: StudentDashboard },
        { path: 'assignments', component: StudentAssignments },
        { path: 'results', component: StudentResults },
        { path: 'announcements', component: StudentAnnouncements}
      ]
     },
    {
      path: '/parent', component: ParentLayout, 
      children: [
        { path: '', component: ParentDashboard },
        { path: 'attendance', component: ParentAttendance },
        { path: 'results', component: ParentResults },
        { path: 'announcements', component: ParentAnnounments}
      ]
    }
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.path.startsWith('/dashboard') && !authStore.isLoggedIn) {
    next('/')
  }
  else if (to.path.startsWith('/dashboard') && authStore.role !== 'admin') {
    next('/')
  }
  else if (to.path.startsWith('/teacher') && authStore.role !== 'teacher') {
    next('/')
  }
  else if (to.path.startsWith('/student') && authStore.role !== 'student') {
    next('/')
  }
  else if (to.path.startsWith('/parent') && authStore.role !== 'parent') {
    next('/')
  }
  else if (to.path === '/' && authStore.isLoggedIn && authStore.role === 'admin') {
    next('/dashboard')
  }
  else if (to.path === '/' && authStore.isLoggedIn && authStore.role === 'teacher') {
    next('/teacher')
  }
    else if (to.path === '/' && authStore.isLoggedIn && authStore.role === 'student') {
    next('/student')
  }
  else if (to.path === '/' && authStore.isLoggedIn && authStore.role === 'parent') {
    next('/parent')
  }
  else {
    next()
  }
})
export default router
