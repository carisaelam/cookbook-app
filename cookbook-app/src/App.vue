<script setup>
import { ref, onMounted } from 'vue'
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
  importRecipes
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
  if (recipeData.id) {
    await updateRecipe(recipeData.id, recipeData)
  } else {
    await addRecipe(recipeData)
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
        </div>

        <CategoryFilter
          v-if="categories.length > 0"
          :categories="categories"
          :selected-category-id="selectedCategoryId"
          @select="selectedCategoryId = $event"
        />

        <!-- Recipe List -->
        <RecipeList
          :recipes-by-category="recipesByCategory"
          :loading="recipesLoading || categoriesLoading"
          @edit="handleEditRecipe"
          @delete="handleDeleteClick"
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

@media (max-width: 640px) {
  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-info {
    text-align: center;
  }
}
</style>
