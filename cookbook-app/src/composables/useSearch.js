import { ref, computed } from 'vue'

export function useSearch(recipes, categories) {
  const searchQuery = ref('')
  const selectedCategoryId = ref(null)

  const filteredRecipes = computed(() => {
    let result = recipes.value

    // Filter by category
    if (selectedCategoryId.value) {
      result = result.filter(r => r.category_id === selectedCategoryId.value)
    }

    // Filter by search query
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase().trim()
      result = result.filter(r =>
        r.name.toLowerCase().includes(query) ||
        (r.notes && r.notes.toLowerCase().includes(query))
      )
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
    selectedCategoryId.value = null
  }

  return {
    searchQuery,
    selectedCategoryId,
    filteredRecipes,
    recipesByCategory,
    totalRecipes,
    filteredCount,
    clearFilters
  }
}
