import { ref } from 'vue'
import { firebase, isFirebaseConfigured } from '../lib/firebase'
import { demoCategories, getNextCategoryId } from '../lib/demoData'
import { loadSeedData } from '../lib/demoSeed'

export function useCategories() {
  const categories = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchCategories() {
    loading.value = true
    error.value = null

    // Demo mode: use local data
    if (!isFirebaseConfigured) {
      const seed = await loadSeedData()
      if (seed && Array.isArray(seed.categories)) {
        categories.value = seed.categories
      } else {
        categories.value = [...demoCategories]
      }
      loading.value = false
      return
    }

    try {
      categories.value = await firebase.fetchCategories()
    } catch (e) {
      error.value = e.message
      console.error('Error fetching categories:', e)
    } finally {
      loading.value = false
    }
  }

  async function addCategory(name, sortOrder = 0) {
    error.value = null

    // Demo mode
    if (!isFirebaseConfigured) {
      const newCategory = {
        id: getNextCategoryId(),
        name,
        sort_order: sortOrder
      }
      categories.value.push(newCategory)
      return newCategory
    }

    try {
      const data = await firebase.addCategory({ name, sort_order: sortOrder })
      categories.value.push(data)
      return data
    } catch (e) {
      error.value = e.message
      console.error('Error adding category:', e)
      return null
    }
  }

  async function updateCategory(id, name) {
    error.value = null

    // Demo mode
    if (!isFirebaseConfigured) {
      const index = categories.value.findIndex(c => c.id === id)
      if (index !== -1) {
        categories.value[index] = { ...categories.value[index], name }
        return categories.value[index]
      }
      return null
    }

    try {
      const data = await firebase.updateCategory(id, { name })

      const index = categories.value.findIndex(c => c.id === id)
      if (index !== -1) {
        categories.value[index] = data
      }
      return data
    } catch (e) {
      error.value = e.message
      console.error('Error updating category:', e)
      return null
    }
  }

  async function deleteCategory(id) {
    error.value = null

    // Demo mode
    if (!isFirebaseConfigured) {
      categories.value = categories.value.filter(c => c.id !== id)
      return true
    }

    try {
      await firebase.deleteCategory(id)

      categories.value = categories.value.filter(c => c.id !== id)
      return true
    } catch (e) {
      error.value = e.message
      console.error('Error deleting category:', e)
      return false
    }
  }

  async function getOrCreateCategory(name) {
    // Check if category already exists
    const existing = categories.value.find(
      c => c.name.toLowerCase() === name.toLowerCase()
    )
    if (existing) return existing

    // Create new category
    return await addCategory(name, categories.value.length)
  }

  return {
    categories,
    loading,
    error,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    getOrCreateCategory
  }
}
