<script setup>
defineProps({
  categories: {
    type: Array,
    required: true
  },
  selectedCategoryId: {
    type: [Number, null],
    default: null
  }
})

defineEmits(['select'])
</script>

<template>
  <div class="category-filter">
    <button
      class="filter-btn"
      :class="{ active: selectedCategoryId === null }"
      @click="$emit('select', null)"
    >
      All
    </button>
    <button
      v-for="category in categories"
      :key="category.id"
      class="filter-btn"
      :class="{ active: selectedCategoryId === category.id }"
      @click="$emit('select', category.id)"
    >
      {{ category.name }}
    </button>
  </div>
</template>

<style scoped>
.category-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-btn {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  background-color: var(--surface);
  color: var(--text-muted);
  border: 1px solid var(--border);
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.filter-btn:hover {
  border-color: var(--border-dark);
  color: var(--text);
}

.filter-btn.active {
  background-color: var(--primary);
  border-color: var(--primary);
  color: white;
}
</style>
