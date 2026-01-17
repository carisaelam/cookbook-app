<script setup>
import { ref, computed } from 'vue'
import BaseModal from './BaseModal.vue'
import { parseRecipes } from '../utils/importParser'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['import', 'close'])

const rawText = ref('')
const parseResult = ref(null)
const isParsing = ref(false)

const hasContent = computed(() => rawText.value.trim().length > 0)

function handleParse() {
  if (!hasContent.value) return
  isParsing.value = true

  try {
    parseResult.value = parseRecipes(rawText.value)
  } catch (e) {
    console.error('Parse error:', e)
    parseResult.value = { error: e.message }
  } finally {
    isParsing.value = false
  }
}

function handleImport() {
  if (parseResult.value && !parseResult.value.error) {
    emit('import', parseResult.value)
  }
}

function reset() {
  rawText.value = ''
  parseResult.value = null
}

function handleClose() {
  reset()
  emit('close')
}
</script>

<template>
  <BaseModal :is-open="isOpen" title="Import Recipes" @close="handleClose">
    <div class="import-modal">
      <!-- Step 1: Paste content -->
      <div v-if="!parseResult" class="import-step">
        <p class="import-instructions text-muted text-sm">
          Paste your recipe list below. Each recipe should be on its own line with the format:
          <br><code>Recipe Name - https://recipe-url.com</code>
          <br>Or just the recipe name if no URL is available.
        </p>

        <div class="form-group">
          <textarea
            v-model="rawText"
            class="input textarea"
            placeholder="Paste your recipes here..."
            rows="10"
          ></textarea>
        </div>

        <div class="import-actions">
          <button class="btn btn-secondary" @click="handleClose">
            Cancel
          </button>
          <button
            class="btn btn-primary"
            :disabled="!hasContent || isParsing"
            @click="handleParse"
          >
            {{ isParsing ? 'Parsing...' : 'Preview Import' }}
          </button>
        </div>
      </div>

      <!-- Step 2: Preview & confirm -->
      <div v-else class="import-step">
        <div v-if="parseResult.error" class="import-error">
          <p class="text-danger">Error: {{ parseResult.error }}</p>
          <button class="btn btn-secondary" @click="reset">Try Again</button>
        </div>

        <div v-else class="import-preview">
          <div class="preview-summary">
            <h4>Import Summary</h4>
            <p class="text-muted text-sm">
              Found <strong>{{ parseResult.recipes.length }}</strong> recipes
              in <strong>{{ parseResult.categories.length }}</strong> categories
            </p>
          </div>

          <div class="preview-categories">
            <div
              v-for="cat in parseResult.categories"
              :key="cat"
              class="preview-category"
            >
              <h5>{{ cat }}</h5>
              <ul class="preview-list">
                <li
                  v-for="recipe in parseResult.recipes.filter(r => r.category === cat)"
                  :key="recipe.name"
                  class="text-sm"
                >
                  {{ recipe.name }}
                  <span v-if="recipe.url" class="text-muted"> (has link)</span>
                </li>
              </ul>
            </div>
          </div>

          <div class="import-actions">
            <button class="btn btn-secondary" @click="reset">
              Back
            </button>
            <button class="btn btn-primary" @click="handleImport">
              Import {{ parseResult.recipes.length }} Recipes
            </button>
          </div>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
.import-modal {
  max-height: 60vh;
  overflow-y: auto;
}

.import-instructions {
  margin-bottom: 1rem;
  line-height: 1.6;
}

.import-instructions code {
  background-color: var(--background);
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-size: 0.8125rem;
}

.import-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}

.import-error {
  text-align: center;
  padding: 2rem;
}

.text-danger {
  color: var(--danger);
  margin-bottom: 1rem;
}

.preview-summary {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}

.preview-summary h4 {
  margin-bottom: 0.25rem;
}

.preview-categories {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 300px;
  overflow-y: auto;
}

.preview-category h5 {
  color: var(--primary);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.preview-list {
  list-style: none;
  padding-left: 0.75rem;
}

.preview-list li {
  padding: 0.125rem 0;
}
</style>
