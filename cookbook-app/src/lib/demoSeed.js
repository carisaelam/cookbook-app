let cachedSeed = null
let seedPromise = null

export async function loadSeedData() {
  if (cachedSeed) return cachedSeed
  if (seedPromise) return seedPromise

  seedPromise = fetch('/seed.json', { cache: 'no-store' })
    .then(response => {
      if (!response.ok) return null
      return response.json()
    })
    .then(data => {
      cachedSeed = data
      return cachedSeed
    })
    .catch(() => null)

  return seedPromise
}
