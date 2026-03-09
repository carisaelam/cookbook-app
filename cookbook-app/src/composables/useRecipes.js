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
import { db, isFirebaseConfigured, extractIngredientsFromUrl } from '../lib/firebase'
import { demoRecipes, demoCategories, getNextRecipeId } from '../lib/demoData'
import { loadSeedData } from '../lib/demoSeed'

const MANUAL_INGREDIENTS_MESSAGE = 'Auto-extract unavailable for this site. Add ingredients manually.'

function toIsoString(value) {
  if (!value) return null
  if (typeof value === 'string') return value
  if (value?.toDate) return value.toDate().toISOString()
  return null
}

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
      ingredients_error: ingredientsError,
      ingredients_updated_at: toIsoString(recipe.ingredients_updated_at) || recipe.ingredients_updated_at || null
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

    if (!isFirebaseConfigured || !db) {
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
      const categorySnapshot = await getDocs(collection(db, 'categories'))
      const categoryById = {}
      for (const categoryDoc of categorySnapshot.docs) {
        categoryById[categoryDoc.id] = categoryDoc.data()
      }

      const snapshot = await getDocs(query(collection(db, 'recipes'), orderBy('name', 'asc')))
      recipes.value = snapshot.docs.map(recipeDoc => {
        const data = recipeDoc.data()
        const categoryId = data.category_id || null
        const category = categoryId && categoryById[categoryId]
          ? { id: categoryId, name: categoryById[categoryId].name }
          : null

        return normalizeRecipe({
          id: recipeDoc.id,
          ...data,
          categories: category
        })
      })
    } catch (e) {
      error.value = e.message
      console.error('Error fetching recipes:', e)
    } finally {
      loading.value = false
    }
  }

  async function addRecipe(recipe) {
    error.value = null

    if (!isFirebaseConfigured || !db) {
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
      const payload = {
        name: recipe.name,
        url: recipe.url || '',
        category_id: recipe.category_id || null,
        notes: recipe.notes || '',
        ingredients: [],
        ingredients_status: recipe.url ? 'pending' : 'failed',
        ingredients_error: recipe.url ? null : 'Missing URL',
        ingredients_updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const docRef = await addDoc(collection(db, 'recipes'), payload)
      const created = normalizeRecipe({ id: docRef.id, ...payload })
      recipes.value.push(created)
      recipes.value = [...recipes.value].sort((a, b) => a.name.localeCompare(b.name))
      return created
    } catch (e) {
      error.value = e.message
      console.error('Error adding recipe:', e)
      return null
    }
  }

  async function updateRecipe(id, updates) {
    error.value = null

    if (!isFirebaseConfigured || !db) {
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
      const payload = {
        name: updates.name,
        url: updates.url || '',
        category_id: updates.category_id || null,
        notes: updates.notes || '',
        updated_at: new Date().toISOString()
      }
      await updateDoc(doc(db, 'recipes', String(id)), payload)
      return updateLocalRecipe(id, payload)
    } catch (e) {
      error.value = e.message
      console.error('Error updating recipe:', e)
      return null
    }
  }

  async function deleteRecipe(id) {
    error.value = null

    if (!isFirebaseConfigured || !db) {
      recipes.value = recipes.value.filter(r => r.id !== id)
      return true
    }

    try {
      await deleteDoc(doc(db, 'recipes', String(id)))
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
        const created = await addRecipe({
          name: recipe.name,
          url: recipe.url || '',
          category_id: categoryId,
          notes: recipe.notes || ''
        })

        if (created) {
          results.success++
        } else {
          results.failed++
        }
      } catch (e) {
        results.failed++
        console.error('Error importing recipe:', recipe.name, e)
      }
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

    if (!isFirebaseConfigured || !db) {
      return updateLocalRecipe(recipe.id, {
        ingredients_status: 'failed',
        ingredients_error: MANUAL_INGREDIENTS_MESSAGE,
        ingredients_updated_at: new Date().toISOString()
      })
    }

    try {
      updateLocalRecipe(recipe.id, {
        ingredients_status: 'pending',
        ingredients_error: null
      })

      const extraction = await extractIngredientsFromUrl(recipe.url)
      const extracted = Array.isArray(extraction?.ingredients) ? extraction.ingredients : []
      const normalized = extracted
        .map(item => String(item).trim())
        .filter(Boolean)
      const hasExisting = Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0
      const hasExtracted = normalized.length > 0
      const requestId = extraction?.request_id || null

      if (!hasExtracted) {
        console.warn('Ingredient extraction returned no ingredients', {
          recipeId: recipe.id,
          recipeUrl: recipe.url,
          requestId,
          reason: extraction?.error || 'No ingredients found'
        })
      }

      const updates = {
        ingredients: hasExtracted ? normalized : (hasExisting ? recipe.ingredients : []),
        ingredients_status: hasExtracted ? 'success' : (hasExisting ? 'success' : 'failed'),
        ingredients_error: hasExtracted ? null : (hasExisting ? null : MANUAL_INGREDIENTS_MESSAGE),
        ingredients_updated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      await updateDoc(doc(db, 'recipes', String(recipe.id)), updates)
      return updateLocalRecipe(recipe.id, updates)
    } catch (e) {
      const message = e?.message || 'Ingredient extraction failed.'
      return updateLocalRecipe(recipe.id, {
        ingredients_status: Array.isArray(recipe.ingredients) && recipe.ingredients.length ? 'success' : 'failed',
        ingredients_error: Array.isArray(recipe.ingredients) && recipe.ingredients.length ? null : MANUAL_INGREDIENTS_MESSAGE,
        ingredients_updated_at: new Date().toISOString()
      })
    }
  }

  async function saveIngredientsForRecipe(recipe, ingredients) {
    const normalized = Array.isArray(ingredients)
      ? ingredients.map(item => String(item).trim()).filter(Boolean)
      : []

    const updates = {
      ingredients: normalized,
      ingredients_status: normalized.length ? 'success' : 'failed',
      ingredients_error: normalized.length ? null : 'No ingredients provided.',
      ingredients_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    if (!isFirebaseConfigured || !db) {
      return updateLocalRecipe(recipe.id, updates)
    }

    try {
      updateLocalRecipe(recipe.id, updates)
      await updateDoc(doc(db, 'recipes', String(recipe.id)), updates)
      return updateLocalRecipe(recipe.id, updates)
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
