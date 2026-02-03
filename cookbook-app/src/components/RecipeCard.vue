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
        <svg class="external-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15 3 21 3 21 9"/>
          <line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
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
          <span class="status-pill" :class="`status-${getIngredientsStatus(recipe)}`">
            {{ getStatusLabel(getIngredientsStatus(recipe)) }}
          </span>
          <span v-if="formatUpdatedAt(recipe.ingredients_updated_at)" class="text-muted text-xs">
            Updated {{ formatUpdatedAt(recipe.ingredients_updated_at) }}
          </span>
        </div>
        <p v-if="getIngredientsStatus(recipe) === 'failed' && recipe.ingredients_error" class="text-muted text-xs">
          {{ recipe.ingredients_error }}
        </p>
        <button
          class="btn btn-primary btn-sm ingredients-toggle"
          type="button"
          :aria-expanded="isIngredientsOpen"
          :aria-controls="`ingredients-panel-${recipe.id}`"
          @click="isIngredientsOpen = !isIngredientsOpen"
        >
          {{ isIngredientsOpen ? 'Hide ingredients' : 'Show ingredients' }}
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
          class="btn btn-ghost btn-sm ingredients-edit-btn"
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
        class="btn btn-ghost btn-sm"
        :disabled="!recipe.url || getIngredientsStatus(recipe) === 'pending'"
        @click="$emit('import-ingredients', recipe)"
        aria-label="Import ingredients"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 3v12"/>
          <path d="M8 11l4 4 4-4"/>
          <path d="M4 21h16"/>
        </svg>
      </button>
      <button class="btn btn-ghost btn-sm" @click="emit('edit', recipe)" aria-label="Edit recipe">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>
      <button class="btn btn-ghost btn-sm" @click="emit('delete', recipe)" aria-label="Delete recipe">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
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
  transition: box-shadow 0.15s ease;
}

.recipe-card:hover {
  box-shadow: var(--shadow-lg);
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
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}

.recipe-link:hover {
  color: var(--primary);
}

.external-icon {
  opacity: 0;
  transition: opacity 0.15s ease;
}

.recipe-link:hover .external-icon {
  opacity: 1;
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

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-weight: 600;
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text);
}

.status-success {
  border-color: rgba(34, 197, 94, 0.4);
  background: rgba(34, 197, 94, 0.08);
  color: #15803d;
}

.status-pending {
  border-color: rgba(234, 179, 8, 0.4);
  background: rgba(234, 179, 8, 0.12);
  color: #a16207;
}

.status-failed {
  border-color: rgba(239, 68, 68, 0.4);
  background: rgba(239, 68, 68, 0.08);
  color: #b91c1c;
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
  align-self: flex-start;
}

.ingredients-panel {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.ingredients-edit-btn {
  align-self: flex-start;
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
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recipe-actions {
  display: flex;
  gap: 0.25rem;
  align-items: center;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.recipe-card:hover .recipe-actions {
  opacity: 1;
}

@media (max-width: 768px) {
  .recipe-actions {
    opacity: 1;
  }
}
</style>
