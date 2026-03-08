import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import * as cheerio from 'cheerio'

initializeApp()
const db = getFirestore()

function collectJsonLdIngredients(payload) {
  if (!payload) return []

  const items = Array.isArray(payload) ? payload : [payload]
  const results = []

  for (const item of items) {
    if (!item || typeof item !== 'object') continue

    if (Array.isArray(item.recipeIngredient)) {
      results.push(...item.recipeIngredient)
    }

    if (item['@graph']) {
      results.push(...collectJsonLdIngredients(item['@graph']))
    }

    if (item.mainEntity) {
      results.push(...collectJsonLdIngredients(item.mainEntity))
    }
  }

  return results
}

function normalizeIngredientLines(lines) {
  return lines
    .map(line => String(line).replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .filter(line => line.length >= 2)
    .filter(line => !/^ingredients?$/i.test(line))
    .filter((line, index, arr) => arr.indexOf(line) === index)
}

function extractIngredientsFromHtml(html) {
  const $ = cheerio.load(html)

  const jsonLdCandidates = []
  $('script[type="application/ld+json"]').each((_, node) => {
    const text = $(node).text().trim()
    if (text) jsonLdCandidates.push(text)
  })

  for (const candidate of jsonLdCandidates) {
    try {
      const parsed = JSON.parse(candidate)
      const ingredients = normalizeIngredientLines(collectJsonLdIngredients(parsed))
      if (ingredients.length > 0) {
        return ingredients
      }
    } catch {
      // Ignore malformed JSON-LD and continue.
    }
  }

  const fallback = []
  const sections = [
    '[class*="ingredient"] li',
    '[id*="ingredient"] li',
    'li[class*="ingredient"]',
    'p[class*="ingredient"]'
  ]

  for (const selector of sections) {
    $(selector).each((_, el) => {
      const line = $(el).text().trim()
      if (line) fallback.push(line)
    })
    if (fallback.length >= 3) break
  }

  return normalizeIngredientLines(fallback)
}

async function ensureEditor(uid) {
  if (!uid) return false
  const doc = await db.collection('editors').doc(uid).get()
  return doc.exists
}

export const extractIngredients = onCall({ region: 'us-east1', timeoutSeconds: 30 }, async request => {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Sign-in required.')
  }

  const isEditor = await ensureEditor(request.auth.uid)
  if (!isEditor) {
    throw new HttpsError('permission-denied', 'Editor access required.')
  }

  const url = String(request.data?.url || '').trim()
  if (!url) {
    throw new HttpsError('invalid-argument', 'URL is required.')
  }

  let parsed
  try {
    parsed = new URL(url)
  } catch {
    throw new HttpsError('invalid-argument', 'Invalid URL.')
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new HttpsError('invalid-argument', 'URL must be http or https.')
  }

  const response = await fetch(parsed.toString(), {
    redirect: 'follow',
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; CookbookBot/1.0; +https://github.com/carisaelam/cookbook-app)'
    }
  })

  if (!response.ok) {
    throw new HttpsError('not-found', `Failed to fetch recipe page (${response.status}).`)
  }

  const html = await response.text()
  const ingredients = extractIngredientsFromHtml(html)

  if (!ingredients.length) {
    return {
      ingredients: [],
      error: 'No ingredients found from this recipe URL.'
    }
  }

  return {
    ingredients,
    error: null
  }
})
