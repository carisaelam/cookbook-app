import { ref } from 'vue'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../lib/firebase'
import { demoCategories, getNextCategoryId } from '../lib/demoData'
import { loadSeedData } from '../lib/demoSeed'

export function useCategories() {
  const categories = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchCategories() {
    loading.value = true
    error.value = null

    if (!isFirebaseConfigured || !db) {
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
      const snapshot = await getDocs(query(collection(db, 'categories'), orderBy('sort_order', 'asc')))
      categories.value = snapshot.docs.map(categoryDoc => ({
        id: categoryDoc.id,
        ...categoryDoc.data()
      }))
    } catch (e) {
      error.value = e.message
      console.error('Error fetching categories:', e)
    } finally {
      loading.value = false
    }
  }

  async function addCategory(name, sortOrder = 0) {
    error.value = null

    if (!isFirebaseConfigured || !db) {
      const newCategory = {
        id: getNextCategoryId(),
        name,
        sort_order: sortOrder
      }
      categories.value.push(newCategory)
      return newCategory
    }

    try {
      const docRef = await addDoc(collection(db, 'categories'), {
        name,
        sort_order: sortOrder,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

      const created = { id: docRef.id, name, sort_order: sortOrder }
      categories.value.push(created)
      categories.value = [...categories.value].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      return created
    } catch (e) {
      error.value = e.message
      console.error('Error adding category:', e)
      return null
    }
  }

  async function updateCategory(id, name) {
    error.value = null

    if (!isFirebaseConfigured || !db) {
      const index = categories.value.findIndex(c => c.id === id)
      if (index !== -1) {
        categories.value[index] = { ...categories.value[index], name }
        return categories.value[index]
      }
      return null
    }

    try {
      await updateDoc(doc(db, 'categories', String(id)), {
        name,
        updated_at: new Date().toISOString()
      })

      const index = categories.value.findIndex(c => c.id === id)
      if (index !== -1) {
        categories.value[index] = { ...categories.value[index], name }
      }
      return categories.value[index] || null
    } catch (e) {
      error.value = e.message
      console.error('Error updating category:', e)
      return null
    }
  }

  async function deleteCategory(id) {
    error.value = null

    if (!isFirebaseConfigured || !db) {
      categories.value = categories.value.filter(c => c.id !== id)
      return true
    }

    try {
      await deleteDoc(doc(db, 'categories', String(id)))
      categories.value = categories.value.filter(c => c.id !== id)
      return true
    } catch (e) {
      error.value = e.message
      console.error('Error deleting category:', e)
      return false
    }
  }

  async function getOrCreateCategory(name) {
    const existing = categories.value.find(
      c => c.name.toLowerCase() === name.toLowerCase()
    )
    if (existing) return existing

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
