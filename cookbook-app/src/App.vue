<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useCategories } from './composables/useCategories'
import { useRecipes } from './composables/useRecipes'
import { useSearch } from './composables/useSearch'
import { useAuth } from './composables/useAuth'
import { isFirebaseConfigured } from './lib/firebase'

import AppHeader from './components/AppHeader.vue'
import RecipeSearch from './components/RecipeSearch.vue'
import CategoryFilter from './components/CategoryFilter.vue'
import RecipeList from './components/RecipeList.vue'
import RecipeForm from './components/RecipeForm.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import ImportModal from './components/ImportModal.vue'

// Composables
const {
  categories,
  loading: categoriesLoading,
  fetchCategories,
  getOrCreateCategory
} = useCategories()

const {
  recipes,
  loading: recipesLoading,
  fetchRecipes,
  addRecipe,
  updateRecipe,
  deleteRecipe,
  importRecipes,
  extractIngredientsForRecipe,
  backfillIngredients,
  saveIngredientsForRecipe
} = useRecipes()

const {
  searchQuery,
  selectedCategoryIds,
  recipesByCategory,
  filteredCount,
  totalRecipes
} = useSearch(recipes, categories)
const {
  user,
  isEditor,
  loading: authLoading,
  initAuth,
  signIn,
  signOut
} = useAuth()

// UI State
const showRecipeForm = ref(false)
const editingRecipe = ref(null)
const showDeleteConfirm = ref(false)
const deletingRecipe = ref(null)
const showImportModal = ref(false)
const isBackfilling = ref(false)
const selectedStatus = ref('all')
const isSavingRecipe = ref(false)
const theme = ref('light')
const isDarkMode = computed(() => theme.value === 'dark')
const canEdit = computed(() => isEditor.value)
let stopAuthSubscription = () => {}

function applyTheme(value) {
  theme.value = value
  document.documentElement.setAttribute('data-theme', value)
  localStorage.setItem('theme', value)
}

function toggleTheme() {
  applyTheme(isDarkMode.value ? 'light' : 'dark')
}

function getIngredientsStatus(recipe) {
  if (recipe.ingredients_status) return recipe.ingredients_status
  if (Array.isArray(recipe.ingredients) && recipe.ingredients.length) return 'success'
  if (!recipe.url) return 'failed'
  return 'pending'
}

const filteredRecipesByCategory = computed(() => {
  if (selectedStatus.value === 'all') return recipesByCategory.value

  return recipesByCategory.value
    .map(group => ({
      ...group,
      recipes: group.recipes.filter(recipe => getIngredientsStatus(recipe) === selectedStatus.value)
    }))
    .filter(group => group.recipes.length > 0)
})

// Handlers
function handleAddRecipe() {
  if (!canEdit.value) return
  editingRecipe.value = null
  showRecipeForm.value = true
}

function handleEditRecipe(recipe) {
  if (!canEdit.value) return
  editingRecipe.value = recipe
  showRecipeForm.value = true
}

function handleDeleteClick(recipe) {
  if (!canEdit.value) return
  deletingRecipe.value = recipe
  showDeleteConfirm.value = true
}

async function handleSaveRecipe(recipeData) {
  if (!canEdit.value) return
  isSavingRecipe.value = true
  try {
    let savedRecipe = null
    if (recipeData.id) {
      savedRecipe = await updateRecipe(recipeData.id, recipeData)
    } else {
      savedRecipe = await addRecipe(recipeData)
    }

    if (savedRecipe?.url) {
      await extractIngredientsForRecipe(savedRecipe)
    }
    showRecipeForm.value = false
    editingRecipe.value = null
  } finally {
    isSavingRecipe.value = false
  }
}

async function handleConfirmDelete() {
  if (!canEdit.value) return
  if (deletingRecipe.value) {
    await deleteRecipe(deletingRecipe.value.id)
  }
  showDeleteConfirm.value = false
  deletingRecipe.value = null
}

async function handleImport(parseResult) {
  if (!canEdit.value) return
  // Create categories that don't exist
  const categoryMap = {}
  for (const catName of parseResult.categories) {
    const category = await getOrCreateCategory(catName)
    if (category) {
      categoryMap[catName] = category.id
    }
  }

  // Import recipes with category IDs
  const recipesToImport = parseResult.recipes.map(r => ({
    ...r,
    category_id: categoryMap[r.category] || null
  }))

  await importRecipes(recipesToImport, async (catName) => categoryMap[catName])

  showImportModal.value = false

  // Refresh data
  await fetchCategories()
  await fetchRecipes()
}

async function handleImportIngredients(recipe) {
  if (!canEdit.value) return
  if (!recipe?.url) return
  await extractIngredientsForRecipe(recipe)
}

async function handleSaveIngredients(payload) {
  if (!canEdit.value) return
  if (!payload?.recipe) return
  await saveIngredientsForRecipe(payload.recipe, payload.ingredients)
}

async function handleBackfillIngredients() {
  if (!canEdit.value) return
  isBackfilling.value = true
  await backfillIngredients()
  isBackfilling.value = false
}

async function handleAuthAction() {
  if (!isFirebaseConfigured) return
  if (user.value) {
    await signOut()
    return
  }
  await signIn()
}

function handleExportBackup() {
  const backup = {
    exported_at: new Date().toISOString(),
    recipes: recipes.value || [],
    categories: categories.value || []
  }

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `cookbook-backup-${backup.exported_at.slice(0, 10)}.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function handleResetFilters() {
  searchQuery.value = ''
  selectedCategoryIds.value = []
  selectedStatus.value = 'all'
}

function handleToggleCategory(categoryId) {
  if (selectedCategoryIds.value.includes(categoryId)) {
    selectedCategoryIds.value = selectedCategoryIds.value.filter(id => id !== categoryId)
    return
  }

  selectedCategoryIds.value = [...selectedCategoryIds.value, categoryId]
}

// Initialize
onMounted(async () => {
  stopAuthSubscription = initAuth()

  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'light' || savedTheme === 'dark') {
    applyTheme(savedTheme)
  } else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    applyTheme('dark')
  } else {
    applyTheme('light')
  }

  await Promise.all([fetchCategories(), fetchRecipes()])
})

onUnmounted(() => {
  stopAuthSubscription()
})
</script>

<template>
  <div class="app">
    <AppHeader
      @reset-filters="handleResetFilters"
      @add-recipe="handleAddRecipe"
      @import-recipes="showImportModal = true"
      @backfill-ingredients="handleBackfillIngredients"
      @export-backup="handleExportBackup"
      @toggle-theme="toggleTheme"
      @auth-action="handleAuthAction"
      :can-edit="canEdit"
      :is-firebase-configured="isFirebaseConfigured"
      :is-auth-loading="authLoading"
      :user-email="user?.email || ''"
      :is-backfilling="isBackfilling"
      :theme="theme"
    />

    <main class="main-content">
      <div class="container">
        <section class="controls-panel fade-in" aria-label="Recipe controls">
          <div class="controls-main">
            <RecipeSearch v-model="searchQuery" />
          </div>

          <div class="controls-footer">
            <CategoryFilter
              v-if="categories.length > 0"
              :categories="categories"
              :selected-category-ids="selectedCategoryIds"
              @select="selectedCategoryIds = $event"
              @toggle="handleToggleCategory"
            />

            <div class="status-filter">
              <label for="status-filter" class="filter-label">Ingredient status</label>
              <select id="status-filter" v-model="selectedStatus" class="input select">
                <option value="all">All recipes</option>
                <option value="success">Ready</option>
                <option value="pending">Pending</option>
                <option value="failed">Manual needed</option>
              </select>
            </div>

            <div class="controls-meta">
              <p class="filter-info text-muted text-sm">
                <span v-if="searchQuery || selectedCategoryIds.length || selectedStatus !== 'all'">
                  Showing {{ filteredCount }} of {{ totalRecipes }} recipes
                </span>
                <span v-else>
                  Browse all {{ totalRecipes }} recipes
                </span>
              </p>
              <button
                class="btn btn-secondary btn-reset"
                type="button"
                :disabled="!searchQuery && selectedCategoryIds.length === 0 && selectedStatus === 'all'"
                @click="handleResetFilters"
              >
                Reset filters
              </button>
            </div>
          </div>
        </section>

        <div class="utility-rail">
          <p class="utility-copy text-sm text-muted">
            Need help planning a menu or adapting a recipe?
          </p>
          <a
            class="chefbot-button"
            href="https://app.scroll.ai/webchat/FgFJ7S5n0P"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span class="chefbot-icon" aria-hidden="true">🍳</span>
            <span>Open Chefbot</span>
          </a>
        </div>

        <RecipeList
          :recipes-by-category="filteredRecipesByCategory"
          :loading="recipesLoading || categoriesLoading"
          :can-edit="canEdit"
          @edit="handleEditRecipe"
          @delete="handleDeleteClick"
          @import-ingredients="handleImportIngredients"
          @save-ingredients="handleSaveIngredients"
        />
      </div>
    </main>

    <!-- Modals -->
    <RecipeForm
      :is-open="showRecipeForm"
      :recipe="editingRecipe"
      :categories="categories"
      :is-saving="isSavingRecipe"
      :can-edit="canEdit"
      @save="handleSaveRecipe"
      @close="showRecipeForm = false"
    />

    <ConfirmDialog
      :is-open="showDeleteConfirm"
      title="Delete Recipe"
      :message="`Are you sure you want to delete '${deletingRecipe?.name}'? This cannot be undone.`"
      confirm-text="Delete"
      :is-destructive="true"
      @confirm="handleConfirmDelete"
      @cancel="showDeleteConfirm = false"
    />

    <ImportModal
      :is-open="showImportModal"
      @import="handleImport"
      @close="showImportModal = false"
    />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 1rem 0 3rem;
}

.controls-panel {
  display: grid;
  gap: 0.9rem;
  padding: 1rem;
  border-radius: 1.25rem;
  background: linear-gradient(180deg, var(--surface-soft), var(--surface));
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  backdrop-filter: blur(12px);
}

.controls-main {
  display: grid;
  gap: 0.9rem;
}

.controls-footer {
  display: grid;
  gap: 0.9rem;
}

.controls-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.filter-info {
  min-width: 0;
}

.status-filter {
  display: grid;
  gap: 0.4rem;
}

.filter-label {
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.btn-reset {
  min-height: 44px;
}

.utility-rail {
  margin-top: 1rem;
  margin-bottom: 0.2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.9rem;
  flex-wrap: wrap;
}

.chefbot-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 46px;
  padding: 0.75rem 1.15rem;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 600;
  color: var(--text);
  background: var(--surface-strong);
  border: 1px solid var(--border);
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  box-shadow: var(--shadow);
}

.chefbot-button:hover {
  transform: translateY(-1px);
  border-color: rgba(181, 126, 66, 0.45);
  box-shadow: var(--shadow-lg);
}

.chefbot-button:active {
  transform: translateY(0);
}

.chefbot-button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.chefbot-icon {
  font-size: 1.1rem;
  line-height: 1;
}

@media (min-width: 768px) {
  .controls-main {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 640px) {
  .main-content {
    padding-top: 0.75rem;
  }

  .controls-panel {
    padding: 0.85rem;
    border-radius: 1rem;
  }

  .controls-meta {
    align-items: stretch;
  }

  .btn-reset,
  .chefbot-button {
    width: 100%;
  }
}
</style>
