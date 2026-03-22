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
  },
  canEdit: {
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
        <div class="category-heading">
          <h2 class="category-title">{{ group.category.name }}</h2>
          <p class="category-count text-sm text-muted">
            {{ group.recipes.length }} {{ group.recipes.length === 1 ? 'recipe' : 'recipes' }}
          </p>
        </div>
        <div class="recipe-grid">
          <RecipeCard
            v-for="recipe in group.recipes"
            :key="recipe.id"
            :recipe="recipe"
            :can-edit="canEdit"
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
  padding: 1.75rem 0 2.25rem;
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
  margin-bottom: 1.35rem;
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
  margin-bottom: 1.35rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.category-groups {
  display: flex;
  flex-direction: column;
  gap: 2.7rem;
}

.category-section {
  animation: slideUp 0.3s ease;
}

.category-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.category-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.03em;
}

.category-count {
  white-space: nowrap;
}

.recipe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0.95rem;
}

@media (max-width: 640px) {
  .category-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.2rem;
    margin-bottom: 0.8rem;
  }

  .recipe-grid {
    grid-template-columns: 1fr;
  }
}
</style>
