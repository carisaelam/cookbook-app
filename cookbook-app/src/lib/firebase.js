const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY
const firebaseProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID
const firebaseAppId = import.meta.env.VITE_FIREBASE_APP_ID

const isLocalDev = import.meta.env.DEV

export const isFirebaseConfigured = !isLocalDev
  && !!(firebaseApiKey && firebaseProjectId && firebaseAppId)

const baseUrl = isFirebaseConfigured
  ? `https://firestore.googleapis.com/v1/projects/${firebaseProjectId}/databases/(default)/documents`
  : null

function endpoint(path = '') {
  return `${baseUrl}${path}?key=${firebaseApiKey}`
}

function toFirestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null }
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(item => toFirestoreValue(item)) } }
  }
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value }
  }
  if (typeof value === 'boolean') return { booleanValue: value }
  if (typeof value === 'object') {
    const fields = Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toFirestoreValue(v)]))
    return { mapValue: { fields } }
  }
  return { stringValue: String(value) }
}

function fromFirestoreValue(value) {
  if ('stringValue' in value) return value.stringValue
  if ('integerValue' in value) return Number(value.integerValue)
  if ('doubleValue' in value) return Number(value.doubleValue)
  if ('booleanValue' in value) return value.booleanValue
  if ('nullValue' in value) return null
  if ('arrayValue' in value) {
    return (value.arrayValue.values || []).map(item => fromFirestoreValue(item))
  }
  if ('mapValue' in value) {
    const fields = value.mapValue.fields || {}
    return Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, fromFirestoreValue(v)]))
  }
  return null
}

function decodeDoc(document) {
  const id = document.name.split('/').pop()
  const fields = document.fields || {}
  const data = Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, fromFirestoreValue(v)]))
  return { id, ...data }
}

function encodeFields(data) {
  return {
    fields: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, toFirestoreValue(v)]))
  }
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options)
  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    const message = payload?.error?.message || `Firebase request failed (${response.status})`
    throw new Error(message)
  }
  return payload
}

async function listCollection(collectionName) {
  const payload = await requestJson(endpoint(`/${collectionName}`))
  return (payload.documents || []).map(decodeDoc)
}

export const firebase = {
  async fetchCategories() {
    const categories = await listCollection('categories')
    return categories.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
  },

  async addCategory({ name, sort_order }) {
    const now = new Date().toISOString()
    const payload = await requestJson(endpoint('/categories'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(encodeFields({ name, sort_order, created_at: now }))
    })
    return decodeDoc(payload)
  },

  async updateCategory(id, { name }) {
    const payload = await requestJson(endpoint(`/categories/${id}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(encodeFields({ name }))
    })
    return decodeDoc(payload)
  },

  async deleteCategory(id) {
    await requestJson(endpoint(`/categories/${id}`), { method: 'DELETE' })
  },

  async fetchRecipes() {
    const categories = await firebase.fetchCategories()
    const categoriesById = new Map(categories.map(cat => [cat.id, cat]))
    const recipes = await listCollection('recipes')
    return recipes
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      .map(recipe => ({
        ...recipe,
        categories: recipe.category_id ? (categoriesById.get(recipe.category_id) || null) : null
      }))
  },

  async addRecipe(recipe) {
    const now = new Date().toISOString()
    const payload = await requestJson(endpoint('/recipes'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(encodeFields({
        ...recipe,
        ingredients: recipe.ingredients || [],
        ingredients_status: recipe.ingredients_status || 'pending',
        ingredients_error: recipe.ingredients_error || null,
        created_at: now,
        updated_at: now
      }))
    })

    const saved = decodeDoc(payload)
    const categories = await firebase.fetchCategories()
    const category = categories.find(cat => cat.id === saved.category_id) || null
    return { ...saved, categories: category }
  },

  async updateRecipe(id, updates) {
    const payload = await requestJson(endpoint(`/recipes/${id}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(encodeFields({ ...updates, updated_at: new Date().toISOString() }))
    })

    const updated = decodeDoc(payload)
    const categories = await firebase.fetchCategories()
    const category = categories.find(cat => cat.id === updated.category_id) || null
    return { ...updated, categories: category }
  },

  async deleteRecipe(id) {
    await requestJson(endpoint(`/recipes/${id}`), { method: 'DELETE' })
  },

  async invokeExtractIngredients(url) {
    const functionUrl = import.meta.env.VITE_FIREBASE_EXTRACT_INGREDIENTS_URL
    if (!functionUrl) {
      throw new Error('Ingredient extraction function URL is not configured.')
    }

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    })

    if (!response.ok) {
      throw new Error(`Ingredient extraction failed: ${response.status}`)
    }

    return await response.json()
  }
}
