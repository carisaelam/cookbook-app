<script setup>
import { ref, onMounted, computed } from 'vue'
import { useCategories } from './composables/useCategories'
import { useRecipes } from './composables/useRecipes'
import { useSearch } from './composables/useSearch'

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
  selectedCategoryId,
  recipesByCategory,
  filteredCount,
  totalRecipes
} = useSearch(recipes, categories)

// UI State
const showRecipeForm = ref(false)
const editingRecipe = ref(null)
const showDeleteConfirm = ref(false)
const deletingRecipe = ref(null)
const showImportModal = ref(false)
const isBackfilling = ref(false)
const selectedStatus = ref('all')

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
  editingRecipe.value = null
  showRecipeForm.value = true
}

function handleEditRecipe(recipe) {
  editingRecipe.value = recipe
  showRecipeForm.value = true
}

function handleDeleteClick(recipe) {
  deletingRecipe.value = recipe
  showDeleteConfirm.value = true
}

async function handleSaveRecipe(recipeData) {
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
}

async function handleConfirmDelete() {
  if (deletingRecipe.value) {
    await deleteRecipe(deletingRecipe.value.id)
  }
  showDeleteConfirm.value = false
  deletingRecipe.value = null
}

async function handleImport(parseResult) {
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
  if (!recipe?.url) return
  await extractIngredientsForRecipe(recipe)
}

async function handleSaveIngredients(payload) {
  if (!payload?.recipe) return
  await saveIngredientsForRecipe(payload.recipe, payload.ingredients)
}

async function handleBackfillIngredients() {
  isBackfilling.value = true
  await backfillIngredients()
  isBackfilling.value = false
}

// Initialize
onMounted(async () => {
  await Promise.all([fetchCategories(), fetchRecipes()])
})
</script>

<template>
  <div class="app">
    <AppHeader
      @add-recipe="handleAddRecipe"
      @import-recipes="showImportModal = true"
      @backfill-ingredients="handleBackfillIngredients"
      :is-backfilling="isBackfilling"
    />

    <main class="main-content">
      <div class="container">
        <!-- Filters -->
        <div class="filters-section">
          <RecipeSearch v-model="searchQuery" />

          <div class="filter-info text-muted text-sm">
            <span v-if="searchQuery || selectedCategoryId">
              Showing {{ filteredCount }} of {{ totalRecipes }} recipes
            </span>
            <span v-else>
              {{ totalRecipes }} recipes
            </span>
          </div>

          <div class="status-filter">
            <label for="status-filter" class="text-muted text-sm">Status</label>
            <select id="status-filter" v-model="selectedStatus" class="input select">
              <option value="all">All</option>
              <option value="success">Ready</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        <CategoryFilter
          v-if="categories.length > 0"
          :categories="categories"
          :selected-category-id="selectedCategoryId"
          @select="selectedCategoryId = $event"
        />

        <!-- Recipe List -->
        <RecipeList
          :recipes-by-category="filteredRecipesByCategory"
          :loading="recipesLoading || categoriesLoading"
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
  padding-bottom: 2rem;
}

.filters-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin: 1.5rem 0 1rem;
  flex-wrap: wrap;
}

.filter-info {
  white-space: nowrap;
}

.status-filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-filter .input {
  min-width: 160px;
}

@media (max-width: 640px) {
  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-info {
    text-align: center;
  }

  .status-filter {
    width: 100%;
  }
}
</style>
