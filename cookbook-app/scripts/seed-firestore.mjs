import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { initializeApp, applicationDefault } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const seedPath = path.resolve(rootDir, 'public/seed.json')
const envLocalPath = path.resolve(rootDir, '.env.local')
const firebaseRcPath = path.resolve(rootDir, '.firebaserc')

function chunk(items, size) {
  const chunks = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

function normalizeCategory(category) {
  return {
    id: String(category.id),
    name: category.name || 'Untitled',
    sort_order: Number.isFinite(category.sort_order) ? category.sort_order : 0,
    created_at: category.created_at || new Date().toISOString(),
    updated_at: category.updated_at || new Date().toISOString()
  }
}

function normalizeRecipe(recipe) {
  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : []
  const hasUrl = Boolean(recipe.url)
  const status = recipe.ingredients_status || (ingredients.length ? 'success' : (hasUrl ? 'pending' : 'failed'))

  return {
    id: String(recipe.id),
    name: recipe.name || 'Untitled',
    url: recipe.url || '',
    category_id: recipe.category_id != null ? String(recipe.category_id) : null,
    notes: recipe.notes || '',
    created_at: recipe.created_at || new Date().toISOString(),
    updated_at: recipe.updated_at || new Date().toISOString(),
    ingredients,
    ingredients_status: status,
    ingredients_error: recipe.ingredients_error ?? (hasUrl ? null : 'Missing URL'),
    ingredients_updated_at: recipe.ingredients_updated_at || null
  }
}

async function loadSeedData() {
  const raw = await fs.readFile(seedPath, 'utf8')
  const parsed = JSON.parse(raw)

  if (!Array.isArray(parsed.categories) || !Array.isArray(parsed.recipes)) {
    throw new Error('Expected public/seed.json to include categories[] and recipes[].')
  }

  return {
    categories: parsed.categories.map(normalizeCategory),
    recipes: parsed.recipes.map(normalizeRecipe)
  }
}

async function readProjectIdFromEnvLocal() {
  try {
    const raw = await fs.readFile(envLocalPath, 'utf8')
    const lines = raw.split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const [key, ...rest] = trimmed.split('=')
      if (key === 'VITE_FIREBASE_PROJECT_ID') {
        return rest.join('=').trim().replace(/^['"]|['"]$/g, '')
      }
    }
  } catch {
    return null
  }
  return null
}

async function readProjectIdFromFirebaserc() {
  try {
    const raw = await fs.readFile(firebaseRcPath, 'utf8')
    const parsed = JSON.parse(raw)
    return parsed?.projects?.default || null
  } catch {
    return null
  }
}

async function writeCollectionInBatches(db, collectionName, docs) {
  const docsByBatch = chunk(docs, 400)

  for (const batchDocs of docsByBatch) {
    const batch = db.batch()

    for (const docData of batchDocs) {
      const docRef = db.collection(collectionName).doc(docData.id)
      const { id, ...data } = docData
      batch.set(docRef, data, { merge: true })
    }

    await batch.commit()
  }
}

async function main() {
  const projectId = process.env.FIREBASE_PROJECT_ID
    || process.env.VITE_FIREBASE_PROJECT_ID
    || await readProjectIdFromEnvLocal()
    || await readProjectIdFromFirebaserc()
  if (!projectId) {
    throw new Error('Missing FIREBASE_PROJECT_ID (or VITE_FIREBASE_PROJECT_ID).')
  }

  initializeApp({
    credential: applicationDefault(),
    projectId
  })

  const db = getFirestore()
  const { categories, recipes } = await loadSeedData()

  await writeCollectionInBatches(db, 'categories', categories)
  await writeCollectionInBatches(db, 'recipes', recipes)

  console.log(`Seed complete: ${categories.length} categories, ${recipes.length} recipes.`)
}

main().catch(error => {
  console.error('Seed failed:', error.message)
  process.exitCode = 1
})
