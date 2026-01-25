import { describe, it, expect, vi, afterEach } from 'vitest'

describe('loadSeedData', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('caches seed data between calls', async () => {
    vi.resetModules()
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ recipes: [] })
    })
    vi.stubGlobal('fetch', fetchMock)

    const { loadSeedData } = await import('../demoSeed.js')
    await loadSeedData()
    await loadSeedData()

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('returns null for failed responses', async () => {
    vi.resetModules()
    const fetchMock = vi.fn().mockResolvedValue({ ok: false })
    vi.stubGlobal('fetch', fetchMock)

    const { loadSeedData } = await import('../demoSeed.js')
    const result = await loadSeedData()

    expect(result).toBe(null)
  })
})
