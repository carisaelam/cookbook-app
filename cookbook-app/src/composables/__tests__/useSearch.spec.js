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
      selectedCategoryIds,
      filteredRecipes,
      filteredCount
    } = useSearch(recipes, categories)

    selectedCategoryIds.value = [1]
    expect(filteredRecipes.value).toHaveLength(1)

    searchQuery.value = 'kale'
    expect(filteredCount.value).toBe(1)

    searchQuery.value = 'soup'
    expect(filteredCount.value).toBe(0)
  })

  it('matches punctuation and spacing variations', () => {
    const fuzzyRecipes = ref([
      { id: 1, name: 'Chick-fil-A Sandwich', notes: '', category_id: 1 },
      { id: 2, name: 'Chicken Salad', notes: 'chick fil a style', category_id: 1 },
      { id: 3, name: 'Pasta', notes: '', category_id: 1 }
    ])

    const { searchQuery, filteredRecipes } = useSearch(fuzzyRecipes, categories)

    searchQuery.value = 'chick fil a'

    expect(filteredRecipes.value.map(recipe => recipe.id)).toEqual([1, 2])
  })

  it('groups recipes by category with uncategorized last', () => {
    const { recipesByCategory } = useSearch(recipes, categories)

    const groupNames = recipesByCategory.value.map(group => group.category.name)
    expect(groupNames).toEqual(['Soups', 'Salads', 'Uncategorized'])
  })

  it('supports multiple selected categories', () => {
    const { selectedCategoryIds, filteredRecipes } = useSearch(recipes, categories)

    selectedCategoryIds.value = [1, 2]

    expect(filteredRecipes.value.map(recipe => recipe.id)).toEqual([1, 2])
  })

  it('clears filters', () => {
    const { searchQuery, selectedCategoryIds, clearFilters } = useSearch(recipes, categories)

    searchQuery.value = 'salad'
    selectedCategoryIds.value = [2]
    clearFilters()

    expect(searchQuery.value).toBe('')
    expect(selectedCategoryIds.value).toEqual([])
  })
})
