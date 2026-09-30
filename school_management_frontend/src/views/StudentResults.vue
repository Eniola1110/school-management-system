<script setup>
import { ref, computed, onMounted } from "vue"
import { useRoute } from "vue-router";
import api from "@/api/axios";

const route = useRoute();
const studentId = route.params.studentId;
console.log(route.params.studentId)

const student = ref({});
const results = ref([]);

const loading = ref(true);
const errorMessage = ref("")

const fetchStudentResults = async () => {
  try {
    loading.value = true;

    const res = await api.get(`/results/student/${studentId}`);

    results.value = res.data;

    if (results.value.length > 0) {
      student.value = {
        full_name: results.value[0].student_name,
        class_name: results.value[0].class_name,
        term: results.value[0].term,
        session: results.value[0].session,
      };
    }
  }
  catch (err) {
    console.error(err);
    errorMessage.value = "Failed to load student's results.";
  }
  finally {
    loading.value = false;
  }
};

const totalScore = computed(() =>
  results.value.reduce((sum, item) => sum + Number(item.total), 0));

const averageScore = computed(() => {
  if (!results.value.length) return 0;
  return (totalScore.value / results.value.length).toFixed(2);
});

onMounted(fetchStudentResults);
</script>

<template>
  <div class="page">
    <p class="bts">
       <RouterLink to="/dashboard/students"><- Back to students</RouterLink>
    </p>
    <div class="header">
      <h1>Student Result</h1>
    </div>
    
    <div v-if="loading">
      Loading...
    </div>

    <div v-else-if="errorMessage">
      {{ errorMessage }}
    </div>

     <div v-else>

       <div class="student-card">

        <h2>{{ student.full_name }}</h2>

        <div class="details">
          <p><strong>Class:</strong> {{ student.class_name }}</p>
          <p><strong>Term:</strong> {{ student.term }}</p>
          <p><strong>Session:</strong> {{ student.session }}</p>
        </div>

       </div>
     <div class="table-card">

        <table>

          <thead>

            <tr>
              <th>Subject</th>
              <th>CA</th>
              <th>Exam</th>
              <th>Total</th>
              <th>Grade</th>
            </tr>

          </thead>

          <tbody>

            <tr
              v-for="result in results"
              :key="result.id"
            >
              <td>{{ result.subject_name }}</td>
              <td>{{ result.ca_score }}</td>
              <td>{{ result.exam_score }}</td>
              <td>{{ result.total }}</td>
              <td>{{ result.grade }}</td>
            </tr>

          </tbody>

        </table>

      </div>
      <div class="summary">

        <div class="card">
          <h3>Total Score</h3>
          <p>{{ totalScore }}</p>
        </div>

        <div class="card">
          <h3>Average</h3>
          <p>{{ averageScore }}</p>
        </div>

        <div class="card">
          <h3>Subjects</h3>
          <p>{{ results.length }}</p>
        </div>

      </div>

     </div>
  </div>
</template>

<style scoped>
.page{
    padding:20px;
}

.page .bts{
  margin-bottom: 10px;
  font-size: 15px;
}
.header{
    margin-bottom:20px;
}

.student-card{
    background:white;
    border-radius:10px;
    padding:20px;
    margin-bottom:20px;
    box-shadow:0 2px 10px rgba(0,0,0,.05);
}

.student-card h2{
    margin-bottom:10px;
}

.details{
    display:flex;
    gap:40px;
    flex-wrap:wrap;
}

.table-card{
    background:white;
    border-radius:10px;
    padding:20px;
    box-shadow:0 2px 10px rgba(0,0,0,.05);
}

table{
    width:100%;
    border-collapse:collapse;
}

th,
td{
    padding:14px;
    border-bottom:1px solid #eee;
    text-align:left;
}

th{
    background:#f7f7f7;
}

.summary{
    display:grid;
    grid-template-columns:repeat(3,1fr);
    gap:20px;
    margin-top:25px;
}

.card{
    background:white;
    padding:20px;
    border-radius:10px;
    box-shadow:0 2px 10px rgba(0,0,0,.05);
    text-align:center;
}

.card h3{
    margin-bottom:10px;
}

.card p{
    font-size:25px;
    font-weight:bold;
}

@media(max-width:768px){

.summary{
    grid-template-columns:1fr;
}

.details{
    flex-direction:column;
    gap:10px;
}

}
</style>