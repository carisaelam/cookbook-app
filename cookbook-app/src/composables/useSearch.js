import { ref, computed } from 'vue'

function normalizeSearchText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function matchesSearch(query, recipe) {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) return true

  const searchableFields = [
    recipe.name,
    recipe.notes
  ]

  return searchableFields.some(field => normalizeSearchText(field).includes(normalizedQuery))
}

export function useSearch(recipes, categories) {
  const searchQuery = ref('')
  const selectedCategoryIds = ref([])

  const filteredRecipes = computed(() => {
    let result = recipes.value

    // Filter by category
    if (selectedCategoryIds.value.length) {
      result = result.filter(r => selectedCategoryIds.value.includes(r.category_id))
    }

    // Filter by search query
    if (searchQuery.value.trim()) {
      result = result.filter(r => matchesSearch(searchQuery.value, r))
    }

    return result
  })

  const recipesByCategory = computed(() => {
    const grouped = {}

    // Initialize with all categories
    for (const category of categories.value) {
      grouped[category.id] = {
        category,
        recipes: []
      }
    }

    // Add "Uncategorized" for recipes without a category
    grouped['uncategorized'] = {
      category: { id: null, name: 'Uncategorized' },
      recipes: []
    }

    // Group filtered recipes
    for (const recipe of filteredRecipes.value) {
      const categoryId = recipe.category_id || 'uncategorized'
      if (grouped[categoryId]) {
        grouped[categoryId].recipes.push(recipe)
      } else {
        grouped['uncategorized'].recipes.push(recipe)
      }
    }

    // Convert to array and filter out empty categories
    return Object.values(grouped)
      .filter(group => group.recipes.length > 0)
      .sort((a, b) => {
        // Sort by category sort_order, put uncategorized last
        if (a.category.id === null) return 1
        if (b.category.id === null) return -1
        return (a.category.sort_order || 0) - (b.category.sort_order || 0)
      })
  })

  const totalRecipes = computed(() => recipes.value.length)
  const filteredCount = computed(() => filteredRecipes.value.length)

  function clearFilters() {
    searchQuery.value = ''
    selectedCategoryIds.value = []
  }

  return {
    searchQuery,
    selectedCategoryIds,
    filteredRecipes,
    recipesByCategory,
    totalRecipes,
    filteredCount,
    clearFilters
  }
}
