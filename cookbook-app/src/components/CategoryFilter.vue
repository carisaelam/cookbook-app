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
  padding: 0.25rem 0.6rem;
  font-size: 0.85rem;
  font-weight: 600;
  background-color: var(--surface);
  color: var(--text);
  border: 1px solid var(--border);
  cursor: pointer;
  white-space: nowrap;
}

.filter-btn:hover {
  background-color: var(--primary-light);
}

.filter-btn.active {
  background-color: var(--primary-light);
  border-color: var(--border-dark);
  color: var(--text);
}
</style>
