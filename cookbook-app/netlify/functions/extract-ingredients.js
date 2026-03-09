import * as cheerio from 'cheerio'

function createRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

function logInfo(message, meta = {}) {
  console.log(JSON.stringify({ level: 'info', message, ...meta }))
}

function logError(message, meta = {}) {
  console.error(JSON.stringify({ level: 'error', message, ...meta }))
}

function json(body, statusCode = 200, requestId = null) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'content-type'
    },
    body: JSON.stringify({
      ...body,
      request_id: requestId || body.request_id || null
    })
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
  const requestId = createRequestId()

  if (event.httpMethod === 'OPTIONS') {
    return json({ ok: true }, 200, requestId)
  }

  if (event.httpMethod !== 'POST') {
    logError('Extractor received unsupported method', { requestId, method: event.httpMethod })
    return json({ error: 'Method not allowed.' }, 405, requestId)
  }

  let payload = {}
  try {
    payload = event.body ? JSON.parse(event.body) : {}
  } catch {
    logError('Extractor received invalid JSON body', { requestId })
    return json({ error: 'Invalid JSON body.' }, 400, requestId)
  }

  const url = String(payload.url || '').trim()
  if (!url) {
    logError('Extractor request missing URL', { requestId })
    return json({ error: 'URL is required.' }, 400, requestId)
  }

  let parsedUrl
  try {
    parsedUrl = new URL(url)
  } catch {
    logError('Extractor request has invalid URL', { requestId, url })
    return json({ error: 'Invalid URL.' }, 400, requestId)
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    logError('Extractor request has invalid URL protocol', {
      requestId,
      protocol: parsedUrl.protocol,
      url: parsedUrl.toString()
    })
    return json({ error: 'URL must be http or https.' }, 400, requestId)
  }

  try {
    logInfo('Extractor fetch started', { requestId, url: parsedUrl.toString() })

    const response = await fetch(parsedUrl.toString(), {
      redirect: 'follow',
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; CookbookBot/1.0; +https://github.com/carisaelam/cookbook-app)'
      }
    })

    if (!response.ok) {
      logError('Extractor failed to fetch source URL', {
        requestId,
        url: parsedUrl.toString(),
        status: response.status
      })
      return json({ error: `Failed to fetch recipe page (${response.status}).`, ingredients: [] }, 502, requestId)
    }

    const html = await response.text()
    const ingredients = extractIngredientsFromHtml(html)

    if (!ingredients.length) {
      logInfo('Extractor completed with no ingredients', { requestId, url: parsedUrl.toString() })
      return json({ ingredients: [], error: 'No ingredients found from this recipe URL.' }, 200, requestId)
    }

    logInfo('Extractor completed successfully', {
      requestId,
      url: parsedUrl.toString(),
      ingredientCount: ingredients.length
    })
    return json({ ingredients, error: null }, 200, requestId)
  } catch (e) {
    logError('Extractor crashed while processing URL', {
      requestId,
      url: parsedUrl.toString(),
      error: e?.message || 'Unknown error'
    })
    return json({ ingredients: [], error: e?.message || 'Extraction failed.' }, 500, requestId)
  }
}
