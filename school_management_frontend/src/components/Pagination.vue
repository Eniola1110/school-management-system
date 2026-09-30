<script setup>
  defineProps({
  currentPage: Number,
  totalPages: Number
})

defineEmits(['change-page'])
</script>

<template>
  <div>
   <div class="pagination" v-if="totalPages > 1">
    <button
      @click="$emit('change-page', currentPage - 1)"
      :disabled="currentPage === 1"
    >
      Previous
    </button>

    <button
      v-for="page in totalPages"
      :key="page"
      @click="$emit('change-page', page)"
      :class="{ active: currentPage === page }"
    >
      {{ page }}
    </button>

    <button
      @click="$emit('change-page', currentPage + 1)"
      :disabled="currentPage === totalPages"
    >
      Next
    </button>
  </div>
  </div>
</template>

<style scoped>
.pagination{
  display:flex;
  justify-content:center;
  align-items:center;
  gap:8px;
  margin-top:20px;
  flex-wrap:wrap;
}

.pagination button{
  padding:8px 14px;
  border:none;
  border-radius:6px;
  cursor:pointer;
  background:#f2f2f2;
}

.pagination button:hover{
  background:#ddd;
}

.pagination button.active{
  background:#2563eb;
  color:white;
}

.pagination button:disabled{
  opacity:.5;
  cursor:not-allowed;
}
</style>