import { ref } from 'vue'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { demoRecipes, demoCategories, getNextRecipeId } from '../lib/demoData'

export function useRecipes() {
  const recipes = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchRecipes() {
    loading.value = true
    error.value = null

    // Demo mode: use local data
    if (!isSupabaseConfigured) {
      recipes.value = [...demoRecipes]
      loading.value = false
      return
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('recipes')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .order('name', { ascending: true })

      if (fetchError) throw fetchError
      recipes.value = data || []
    } catch (e) {
      error.value = e.message
      console.error('Error fetching recipes:', e)
    } finally {
      loading.value = false
    }
  }

  async function addRecipe(recipe) {
    error.value = null

    // Demo mode
    if (!isSupabaseConfigured) {
      const category = demoCategories.find(c => c.id === recipe.category_id)
      const newRecipe = {
        id: getNextRecipeId(),
        name: recipe.name,
        url: recipe.url || '',
        category_id: recipe.category_id,
        notes: recipe.notes || '',
        categories: category ? { id: category.id, name: category.name } : null
      }
      recipes.value.push(newRecipe)
      return newRecipe
    }

    try {
      const { data, error: insertError } = await supabase
        .from('recipes')
        .insert([{
          name: recipe.name,
          url: recipe.url || '',
          category_id: recipe.category_id,
          notes: recipe.notes || ''
        }])
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .single()

      if (insertError) throw insertError
      recipes.value.push(data)
      return data
    } catch (e) {
      error.value = e.message
      console.error('Error adding recipe:', e)
      return null
    }
  }

  async function updateRecipe(id, updates) {
    error.value = null

    // Demo mode
    if (!isSupabaseConfigured) {
      const index = recipes.value.findIndex(r => r.id === id)
      if (index !== -1) {
        const category = demoCategories.find(c => c.id === updates.category_id)
        recipes.value[index] = {
          ...recipes.value[index],
          name: updates.name,
          url: updates.url || '',
          category_id: updates.category_id,
          notes: updates.notes || '',
          categories: category ? { id: category.id, name: category.name } : null
        }
        return recipes.value[index]
      }
      return null
    }

    try {
      const { data, error: updateError } = await supabase
        .from('recipes')
        .update({
          name: updates.name,
          url: updates.url || '',
          category_id: updates.category_id,
          notes: updates.notes || ''
        })
        .eq('id', id)
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .single()

      if (updateError) throw updateError

      const index = recipes.value.findIndex(r => r.id === id)
      if (index !== -1) {
        recipes.value[index] = data
      }
      return data
    } catch (e) {
      error.value = e.message
      console.error('Error updating recipe:', e)
      return null
    }
  }

  async function deleteRecipe(id) {
    error.value = null

    // Demo mode
    if (!isSupabaseConfigured) {
      recipes.value = recipes.value.filter(r => r.id !== id)
      return true
    }

    try {
      const { error: deleteError } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      recipes.value = recipes.value.filter(r => r.id !== id)
      return true
    } catch (e) {
      error.value = e.message
      console.error('Error deleting recipe:', e)
      return false
    }
  }

  async function importRecipes(recipesArray, getCategoryId) {
    error.value = null
    const results = { success: 0, failed: 0 }

    for (const recipe of recipesArray) {
      try {
        const categoryId = await getCategoryId(recipe.category)

        // Demo mode
        if (!isSupabaseConfigured) {
          const category = demoCategories.find(c => c.id === categoryId)
          const newRecipe = {
            id: getNextRecipeId(),
            name: recipe.name,
            url: recipe.url || '',
            category_id: categoryId,
            notes: recipe.notes || '',
            categories: category ? { id: category.id, name: category.name } : null
          }
          recipes.value.push(newRecipe)
          results.success++
          continue
        }

        const { error: insertError } = await supabase
          .from('recipes')
          .insert([{
            name: recipe.name,
            url: recipe.url || '',
            category_id: categoryId,
            notes: recipe.notes || ''
          }])

        if (insertError) {
          results.failed++
          console.error('Error importing recipe:', recipe.name, insertError)
        } else {
          results.success++
        }
      } catch (e) {
        results.failed++
        console.error('Error importing recipe:', recipe.name, e)
      }
    }

    // Refresh recipes list after import
    if (isSupabaseConfigured) {
      await fetchRecipes()
    }

    return results
  }

  return {
    recipes,
    loading,
    error,
    fetchRecipes,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    importRecipes
  }
}
