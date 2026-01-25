<script setup>
import RecipeCard from './RecipeCard.vue'

defineProps({
  recipesByCategory: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['edit', 'delete', 'import-ingredients', 'save-ingredients'])
</script>

<template>
  <div class="recipe-list">
    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p class="text-muted">Loading recipes...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="recipesByCategory.length === 0" class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
      <h3>No recipes found</h3>
      <p class="text-muted">Try adjusting your search or add a new recipe.</p>
    </div>

    <!-- Recipe groups by category -->
    <div v-else class="category-groups">
      <section
        v-for="group in recipesByCategory"
        :key="group.category.id || 'uncategorized'"
        class="category-section"
      >
        <h2 class="category-title">{{ group.category.name }}</h2>
        <div class="recipe-grid">
          <RecipeCard
            v-for="recipe in group.recipes"
            :key="recipe.id"
            :recipe="recipe"
            @edit="$emit('edit', $event)"
            @delete="$emit('delete', $event)"
            @import-ingredients="$emit('import-ingredients', $event)"
            @save-ingredients="$emit('save-ingredients', $event)"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.recipe-list {
  padding: 1.5rem 0;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-state svg {
  color: var(--text-light);
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin-bottom: 0.5rem;
  color: var(--text);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.category-groups {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.category-section {
  animation: slideUp 0.3s ease;
}

.category-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--primary);
  display: inline-block;
}

.recipe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

@media (max-width: 640px) {
  .recipe-grid {
    grid-template-columns: 1fr;
  }
}
</style>
