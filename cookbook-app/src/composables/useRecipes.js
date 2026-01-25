import { ref } from 'vue'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { demoRecipes, demoCategories, getNextRecipeId } from '../lib/demoData'
import { loadSeedData } from '../lib/demoSeed'

export function useRecipes() {
  const recipes = ref([])
  const loading = ref(false)
  const error = ref(null)

  function normalizeRecipe(recipe) {
    const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : []
    const status = recipe.ingredients_status
      || (ingredients.length ? 'success' : (recipe.url ? 'pending' : 'failed'))
    const ingredientsError = recipe.ingredients_error ?? (recipe.url ? null : 'Missing URL')

    return {
      ...recipe,
      ingredients,
      ingredients_status: status,
      ingredients_error: ingredientsError
    }
  }

  function updateLocalRecipe(id, updates) {
    const index = recipes.value.findIndex(r => r.id === id)
    if (index === -1) return null

    recipes.value[index] = normalizeRecipe({
      ...recipes.value[index],
      ...updates
    })
    return recipes.value[index]
  }

  async function fetchRecipes() {
    loading.value = true
    error.value = null

    // Demo mode: use local data
    if (!isSupabaseConfigured) {
      const seed = await loadSeedData()
      if (seed && Array.isArray(seed.recipes)) {
        recipes.value = seed.recipes.map(normalizeRecipe)
      } else {
        recipes.value = demoRecipes.map(normalizeRecipe)
      }
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
      recipes.value = (data || []).map(normalizeRecipe)
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
      const newRecipe = normalizeRecipe({
        id: getNextRecipeId(),
        name: recipe.name,
        url: recipe.url || '',
        category_id: recipe.category_id,
        notes: recipe.notes || '',
        categories: category ? { id: category.id, name: category.name } : null
      })
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
      const normalized = normalizeRecipe(data)
      recipes.value.push(normalized)
      return normalized
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
      const category = demoCategories.find(c => c.id === updates.category_id)
      return updateLocalRecipe(id, {
        name: updates.name,
        url: updates.url || '',
        category_id: updates.category_id,
        notes: updates.notes || '',
        categories: category ? { id: category.id, name: category.name } : null
      })
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
      return updateLocalRecipe(id, data)
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
          const newRecipe = normalizeRecipe({
            id: getNextRecipeId(),
            name: recipe.name,
            url: recipe.url || '',
            category_id: categoryId,
            notes: recipe.notes || '',
            categories: category ? { id: category.id, name: category.name } : null
          })
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

  async function extractIngredientsForRecipe(recipe) {
    if (!recipe?.url) {
      return updateLocalRecipe(recipe?.id, {
        ingredients_status: 'failed',
        ingredients_error: 'Missing URL',
        ingredients_updated_at: new Date().toISOString()
      })
    }

    updateLocalRecipe(recipe.id, {
      ingredients_status: 'pending',
      ingredients_error: null
    })

    if (!isSupabaseConfigured) {
      return updateLocalRecipe(recipe.id, {
        ingredients_status: 'failed',
        ingredients_error: 'Supabase not configured.',
        ingredients_updated_at: new Date().toISOString()
      })
    }

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('extract-ingredients', {
        body: { url: recipe.url }
      })

      if (invokeError) {
        throw invokeError
      }

      const ingredients = Array.isArray(data?.ingredients) ? data.ingredients : []
      const status = ingredients.length ? 'success' : 'failed'
      const ingredientsError = status === 'success' ? null : (data?.error || 'No ingredients found.')

      const { data: updated, error: updateError } = await supabase
        .from('recipes')
        .update({
          ingredients,
          ingredients_status: status,
          ingredients_error: ingredientsError,
          ingredients_updated_at: new Date().toISOString()
        })
        .eq('id', recipe.id)
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .single()

      if (updateError) throw updateError

      return updateLocalRecipe(recipe.id, updated)
    } catch (e) {
      const message = e?.message || 'Ingredient extraction failed.'
      return updateLocalRecipe(recipe.id, {
        ingredients_status: 'failed',
        ingredients_error: message,
        ingredients_updated_at: new Date().toISOString()
      })
    }
  }

  async function saveIngredientsForRecipe(recipe, ingredients) {
    const normalized = Array.isArray(ingredients)
      ? ingredients.map(item => String(item).trim()).filter(Boolean)
      : []

    if (!isSupabaseConfigured) {
      return updateLocalRecipe(recipe.id, {
        ingredients: normalized,
        ingredients_status: normalized.length ? 'success' : 'failed',
        ingredients_error: normalized.length ? null : 'No ingredients provided.',
        ingredients_updated_at: new Date().toISOString()
      })
    }

    try {
      updateLocalRecipe(recipe.id, {
        ingredients: normalized,
        ingredients_status: normalized.length ? 'success' : 'failed',
        ingredients_error: normalized.length ? null : 'No ingredients provided.',
        ingredients_updated_at: new Date().toISOString()
      })

      const { data: updated, error: updateError } = await supabase
        .from('recipes')
        .update({
          ingredients: normalized,
          ingredients_status: normalized.length ? 'success' : 'failed',
          ingredients_error: normalized.length ? null : 'No ingredients provided.',
          ingredients_updated_at: new Date().toISOString()
        })
        .eq('id', recipe.id)
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .single()

      if (updateError) throw updateError
      return updateLocalRecipe(recipe.id, updated)
    } catch (e) {
      const message = e?.message || 'Failed to save ingredients.'
      return updateLocalRecipe(recipe.id, {
        ingredients_status: 'failed',
        ingredients_error: message
      })
    }
  }

  async function backfillIngredients() {
    const targets = recipes.value.filter(recipe => recipe.url && recipe.ingredients_status !== 'success')
    for (const recipe of targets) {
      await extractIngredientsForRecipe(recipe)
    }
  }

  return {
    recipes,
    loading,
    error,
    fetchRecipes,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    importRecipes,
    extractIngredientsForRecipe,
    backfillIngredients,
    saveIngredientsForRecipe
  }
}
