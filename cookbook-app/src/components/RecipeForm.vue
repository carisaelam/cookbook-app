<script setup>
import { ref, watch, computed } from 'vue'
import BaseModal from './BaseModal.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  isSaving: {
    type: Boolean,
    default: false
  },
  recipe: {
    type: Object,
    default: null
  },
  categories: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['save', 'close'])

const form = ref({
  name: '',
  url: '',
  category_id: null,
  notes: ''
})

const isEditing = computed(() => !!props.recipe)
const title = computed(() => isEditing.value ? 'Edit Recipe' : 'Add Recipe')

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    if (props.recipe) {
      form.value = {
        name: props.recipe.name || '',
        url: props.recipe.url || '',
        category_id: props.recipe.category_id || null,
        notes: props.recipe.notes || ''
      }
    } else {
      form.value = {
        name: '',
        url: '',
        category_id: null,
        notes: ''
      }
    }
  }
})

const isValid = computed(() => {
  return form.value.name.trim().length > 0
})

function handleSubmit() {
  if (!isValid.value) return

  const recipeData = {
    name: form.value.name.trim(),
    url: form.value.url.trim(),
    category_id: form.value.category_id,
    notes: form.value.notes.trim()
  }

  if (isEditing.value) {
    recipeData.id = props.recipe.id
  }

  emit('save', recipeData)
}
</script>

<template>
  <BaseModal :is-open="isOpen" :title="title" @close="$emit('close')">
    <form @submit.prevent="handleSubmit" class="recipe-form">
      <div class="form-group">
        <label for="name" class="form-label">Recipe Name *</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          class="input"
          placeholder="e.g., Chicken Teriyaki"
          required
          :disabled="isSaving"
        />
      </div>

      <div class="form-group">
        <label for="url" class="form-label">Recipe URL</label>
        <input
          id="url"
          v-model="form.url"
          type="url"
          class="input"
          placeholder="https://..."
          :disabled="isSaving"
        />
        <p class="form-hint">Link to the recipe page (optional)</p>
      </div>

      <div class="form-group">
        <label for="category" class="form-label">Category</label>
        <select
          id="category"
          v-model="form.category_id"
          class="input select"
          :disabled="isSaving"
        >
          <option :value="null">Select a category...</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="notes" class="form-label">Notes</label>
        <textarea
          id="notes"
          v-model="form.notes"
          class="input textarea"
          placeholder="Any notes about this recipe..."
          rows="3"
          :disabled="isSaving"
        ></textarea>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="$emit('close')">
          Cancel
        </button>
        <button type="submit" class="btn btn-primary" :disabled="!isValid || isSaving">
          <span v-if="isSaving" class="spinner" aria-hidden="true"></span>
          {{ isSaving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Recipe') }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<style scoped>
.recipe-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  width: 0.85rem;
  height: 0.85rem;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
