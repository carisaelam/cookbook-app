<script setup>
import { computed } from 'vue'

defineEmits(['select', 'toggle'])

const props = defineProps({
  categories: {
    type: Array,
    required: true
  },
  selectedCategoryIds: {
    type: Array,
    default: () => []
  }
})

const sortedCategories = computed(() => {
  return [...props.categories].sort((a, b) => a.name.localeCompare(b.name))
})
</script>

<template>
  <section class="category-shell" aria-label="Category filters">
    <div class="category-heading">
      <p class="category-title">Categories</p>
      <p class="text-sm text-muted">Choose any combination.</p>
    </div>
    <div class="category-filter">
      <button
        v-for="category in sortedCategories"
        :key="category.id"
        class="filter-btn"
        :class="{ active: selectedCategoryIds.includes(category.id) }"
        @click="$emit('toggle', category.id)"
      >
        {{ category.name }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.category-shell {
  display: grid;
  gap: 0.7rem;
}

.category-heading {
  display: grid;
  gap: 0.2rem;
}

.category-title {
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.category-filter {
  display: flex;
  gap: 0.6rem;
  overflow-x: auto;
  padding-bottom: 0.2rem;
  scroll-snap-type: x proximity;
}

.category-filter::-webkit-scrollbar {
  height: 6px;
}

.category-filter::-webkit-scrollbar-thumb {
  background: var(--border-dark);
  border-radius: 999px;
}

.filter-btn {
  padding: 0.55rem 0.9rem;
  font-size: 0.875rem;
  font-weight: 600;
  background-color: var(--surface-strong);
  color: var(--text-muted);
  border: 1px solid var(--border);
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.18s ease;
  white-space: nowrap;
  scroll-snap-align: start;
  min-height: 42px;
}

.filter-btn:hover {
  border-color: rgba(181, 126, 66, 0.4);
  color: var(--text);
  transform: translateY(-1px);
}

.filter-btn.active {
  background-color: var(--text);
  border-color: var(--text);
  color: var(--surface);
}

@media (min-width: 768px) {
  .category-filter {
    flex-wrap: wrap;
    overflow: visible;
  }
}
</style>
