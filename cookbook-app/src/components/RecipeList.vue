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
      <p class="text-muted">Loading recipes...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="recipesByCategory.length === 0" class="empty-state">
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
  padding: 1rem 0;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding: 2rem 0;
  text-align: left;
}

.category-groups {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.category-section {
  border-top: 1px solid var(--border);
  padding-top: 0.75rem;
}

.category-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 0.5rem;
  padding-bottom: 0.25rem;
  border-bottom: 1px solid var(--border-dark);
  display: inline-block;
}

.recipe-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

@media (max-width: 640px) {
  .recipe-grid {
    grid-template-columns: 1fr;
  }
}
</style>
