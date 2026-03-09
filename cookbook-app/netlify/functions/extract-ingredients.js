import * as cheerio from 'cheerio'

function json(body, statusCode = 200) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'content-type'
    },
    body: JSON.stringify(body)
  }
}

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
      if (ingredients.length > 0) return ingredients
    } catch {
      // Ignore malformed JSON-LD and continue.
    }
  }

  const fallback = []
  const selectors = [
    '[class*="ingredient"] li',
    '[id*="ingredient"] li',
    'li[class*="ingredient"]',
    'p[class*="ingredient"]'
  ]

  for (const selector of selectors) {
    $(selector).each((_, el) => {
      const line = $(el).text().trim()
      if (line) fallback.push(line)
    })

    if (fallback.length >= 3) break
  }

  return normalizeIngredientLines(fallback)
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return json({ ok: true }, 200)
  }

  if (event.httpMethod !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405)
  }

  let payload = {}
  try {
    payload = event.body ? JSON.parse(event.body) : {}
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400)
  }

  const url = String(payload.url || '').trim()
  if (!url) {
    return json({ error: 'URL is required.' }, 400)
  }

  let parsedUrl
  try {
    parsedUrl = new URL(url)
  } catch {
    return json({ error: 'Invalid URL.' }, 400)
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return json({ error: 'URL must be http or https.' }, 400)
  }

  try {
    const response = await fetch(parsedUrl.toString(), {
      redirect: 'follow',
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; CookbookBot/1.0; +https://github.com/carisaelam/cookbook-app)'
      }
    })

    if (!response.ok) {
      return json({ error: `Failed to fetch recipe page (${response.status}).`, ingredients: [] }, 502)
    }

    const html = await response.text()
    const ingredients = extractIngredientsFromHtml(html)

    if (!ingredients.length) {
      return json({ ingredients: [], error: 'No ingredients found from this recipe URL.' }, 200)
    }

    return json({ ingredients, error: null }, 200)
  } catch (e) {
    return json({ ingredients: [], error: e?.message || 'Extraction failed.' }, 500)
  }
}
