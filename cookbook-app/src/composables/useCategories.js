import { ref } from 'vue'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { demoCategories, getNextCategoryId } from '../lib/demoData'

export function useCategories() {
  const categories = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchCategories() {
    loading.value = true
    error.value = null

    // Demo mode: use local data
    if (!isSupabaseConfigured) {
      categories.value = [...demoCategories]
      loading.value = false
      return
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })

      if (fetchError) throw fetchError
      categories.value = data || []
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
    if (!isSupabaseConfigured) {
      const newCategory = {
        id: getNextCategoryId(),
        name,
        sort_order: sortOrder
      }
      categories.value.push(newCategory)
      return newCategory
    }

    try {
      const { data, error: insertError } = await supabase
        .from('categories')
        .insert([{ name, sort_order: sortOrder }])
        .select()
        .single()

      if (insertError) throw insertError
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
    if (!isSupabaseConfigured) {
      const index = categories.value.findIndex(c => c.id === id)
      if (index !== -1) {
        categories.value[index] = { ...categories.value[index], name }
        return categories.value[index]
      }
      return null
    }

    try {
      const { data, error: updateError } = await supabase
        .from('categories')
        .update({ name })
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

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
    if (!isSupabaseConfigured) {
      categories.value = categories.value.filter(c => c.id !== id)
      return true
    }

    try {
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

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
