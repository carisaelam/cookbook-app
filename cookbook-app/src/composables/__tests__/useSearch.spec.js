import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useSearch } from '../useSearch.js'

describe('useSearch', () => {
  const recipes = ref([
    { id: 1, name: 'Kale Salad', notes: 'Fresh', category_id: 1 },
    { id: 2, name: 'Tomato Soup', notes: '', category_id: 2 },
    { id: 3, name: 'Bread', notes: 'No oven', category_id: null }
  ])
  const categories = ref([
    { id: 1, name: 'Salads', sort_order: 2 },
    { id: 2, name: 'Soups', sort_order: 1 }
  ])

  it('filters by category and search term', () => {
    const {
      searchQuery,
      selectedCategoryId,
      filteredRecipes,
      filteredCount
    } = useSearch(recipes, categories)

    selectedCategoryId.value = 1
    expect(filteredRecipes.value).toHaveLength(1)

    searchQuery.value = 'kale'
    expect(filteredCount.value).toBe(1)

    searchQuery.value = 'soup'
    expect(filteredCount.value).toBe(0)
  })

  it('groups recipes by category with uncategorized last', () => {
    const { recipesByCategory } = useSearch(recipes, categories)

    const groupNames = recipesByCategory.value.map(group => group.category.name)
    expect(groupNames).toEqual(['Soups', 'Salads', 'Uncategorized'])
  })

  it('clears filters', () => {
    const { searchQuery, selectedCategoryId, clearFilters } = useSearch(recipes, categories)

    searchQuery.value = 'salad'
    selectedCategoryId.value = 2
    clearFilters()

    expect(searchQuery.value).toBe('')
    expect(selectedCategoryId.value).toBe(null)
  })
})
