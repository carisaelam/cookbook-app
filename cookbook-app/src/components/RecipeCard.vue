<script setup>
import { ref } from 'vue'

const props = defineProps({
  recipe: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete', 'import-ingredients', 'save-ingredients'])

function getDomain(url) {
  if (!url) return null
  try {
    const hostname = new URL(url).hostname
    return hostname.replace('www.', '')
  } catch {
    return null
  }
}

const statusLabels = {
  pending: 'Pending',
  success: 'Ready',
  failed: 'Failed'
}

function getIngredientsStatus(recipe) {
  if (recipe.ingredients_status) return recipe.ingredients_status
  if (Array.isArray(recipe.ingredients) && recipe.ingredients.length) return 'success'
  if (!recipe.url) return 'failed'
  return 'pending'
}

function getStatusLabel(status) {
  return statusLabels[status] || 'Pending'
}

function formatUpdatedAt(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString()
}

const isEditingIngredients = ref(false)
const manualIngredients = ref('')
const isIngredientsOpen = ref(false)

function hasIngredients(recipe) {
  return Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0
}

function toggleIngredientsEditor() {
  if (!isEditingIngredients.value) {
    manualIngredients.value = hasIngredients(props.recipe)
      ? props.recipe.ingredients.join('\n')
      : ''
    isIngredientsOpen.value = true
  }
  isEditingIngredients.value = !isEditingIngredients.value
}

function saveIngredients() {
  const items = manualIngredients.value
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)

  emit('save-ingredients', {
    recipe: props.recipe,
    ingredients: items
  })
  isEditingIngredients.value = false
}
</script>

<template>
  <div class="recipe-card card">
    <div class="recipe-content">
      <a
        v-if="recipe.url"
        :href="recipe.url"
        target="_blank"
        rel="noopener noreferrer"
        class="recipe-name recipe-link"
      >
        {{ recipe.name }}
      </a>
      <span v-else class="recipe-name">{{ recipe.name }}</span>

      <div class="recipe-meta">
        <span v-if="recipe.url" class="recipe-domain text-muted text-sm">
          {{ getDomain(recipe.url) }}
        </span>
        <span v-else class="no-link text-muted text-sm">No link added</span>
      </div>

      <p v-if="recipe.notes" class="recipe-notes text-muted text-sm">
        {{ recipe.notes }}
      </p>

      <div class="ingredients-block">
        <div class="ingredients-status text-sm">
          <span class="status-text">
            Status: {{ getStatusLabel(getIngredientsStatus(recipe)) }}
          </span>
          <span v-if="formatUpdatedAt(recipe.ingredients_updated_at)" class="text-muted text-xs">
            Updated {{ formatUpdatedAt(recipe.ingredients_updated_at) }}
          </span>
        </div>
        <p v-if="getIngredientsStatus(recipe) === 'failed' && recipe.ingredients_error" class="text-muted text-xs">
          {{ recipe.ingredients_error }}
        </p>
        <button
          class="ingredients-toggle text-sm"
          type="button"
          :aria-expanded="isIngredientsOpen"
          :aria-controls="`ingredients-panel-${recipe.id}`"
          @click="isIngredientsOpen = !isIngredientsOpen"
        >
          <span class="ingredients-toggle-label">Ingredients</span>
          <span class="text-muted text-xs">{{ isIngredientsOpen ? 'Hide' : 'Show' }}</span>
        </button>
        <div v-if="isIngredientsOpen" :id="`ingredients-panel-${recipe.id}`" class="ingredients-panel">
          <ul
            v-if="Array.isArray(recipe.ingredients) && recipe.ingredients.length"
            class="ingredients-list text-sm"
          >
            <li v-for="(item, index) in recipe.ingredients" :key="`${recipe.id}-ingredient-${index}`">
              {{ item }}
            </li>
          </ul>
          <p v-else class="text-muted text-xs">No ingredients yet.</p>
        </div>

        <button
          class="btn btn-secondary btn-sm ingredients-edit-btn"
          type="button"
          @click="toggleIngredientsEditor"
        >
          {{ isEditingIngredients ? 'Cancel' : (hasIngredients(recipe) ? 'Edit ingredients' : 'Add ingredients') }}
        </button>

        <div v-if="isEditingIngredients" class="ingredients-editor">
          <textarea
            v-model="manualIngredients"
            class="input textarea"
            rows="4"
            placeholder="One ingredient per line"
          ></textarea>
          <button class="btn btn-secondary btn-sm" type="button" @click="saveIngredients">
            Save ingredients
          </button>
        </div>
      </div>
    </div>

    <div class="recipe-actions">
      <button
        class="btn btn-secondary btn-sm"
        :disabled="!recipe.url || getIngredientsStatus(recipe) === 'pending'"
        @click="$emit('import-ingredients', recipe)"
      >
        Import Ingredients
      </button>
      <button class="btn btn-secondary btn-sm" @click="emit('edit', recipe)">
        Edit
      </button>
      <button class="btn btn-danger btn-sm" @click="emit('delete', recipe)">
        Delete
      </button>
    </div>
  </div>
</template>

<style scoped>
.recipe-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.recipe-content {
  flex: 1;
  min-width: 0;
}

.recipe-name {
  font-weight: 600;
  color: var(--text);
  display: block;
  margin-bottom: 0.25rem;
}

.recipe-link {
  text-decoration: none;
}

.recipe-link:hover {
  text-decoration: underline;
}

.recipe-meta {
  margin-bottom: 0.25rem;
}

.ingredients-block {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.ingredients-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-text {
  font-weight: 600;
}

.ingredients-list {
  margin: 0;
  padding-left: 1.1rem;
  color: var(--text);
}

.ingredients-list li + li {
  margin-top: 0.2rem;
}

.ingredients-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0;
  background: none;
  border: none;
  color: var(--text);
  cursor: pointer;
}

.ingredients-toggle:hover {
  text-decoration: underline;
}

.ingredients-panel {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.ingredients-edit-btn {
  align-self: flex-start;
  padding: 0.25rem 0.6rem;
  min-height: 2rem;
}

.ingredients-editor {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.recipe-domain {
  display: inline-block;
}

.no-link {
  font-style: italic;
}

.recipe-notes {
  margin-top: 0.5rem;
  white-space: pre-wrap;
}

.recipe-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .recipe-actions {
    width: 100%;
  }
}
</style>
