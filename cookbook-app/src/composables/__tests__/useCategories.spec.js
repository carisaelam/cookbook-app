import { describe, it, expect, vi } from 'vitest'

async function setupUseCategories({ seedData }) {
  vi.resetModules()
  vi.doMock('../../lib/firebase', () => ({
    isFirebaseConfigured: false,
    db: null
  }))
  vi.doMock('../../lib/demoSeed', () => ({
    loadSeedData: vi.fn().mockResolvedValue(seedData)
  }))
  vi.doMock('../../lib/demoData', () => ({
    demoCategories: [{ id: 1, name: 'Demo', sort_order: 0 }],
    getNextCategoryId: vi.fn().mockReturnValue(42)
  }))

  const { useCategories } = await import('../useCategories.js')
  return useCategories()
}

describe('useCategories', () => {
  it('loads seed categories and manages local updates', async () => {
    const categoriesState = await setupUseCategories({
      seedData: {
        categories: [{ id: 10, name: 'Seed', sort_order: 1 }]
      }
    })

    await categoriesState.fetchCategories()
    expect(categoriesState.categories.value).toEqual([{ id: 10, name: 'Seed', sort_order: 1 }])

    const added = await categoriesState.addCategory('New', 2)
    expect(added.id).toBe(42)

    const updated = await categoriesState.updateCategory(10, 'Updated')
    expect(updated.name).toBe('Updated')

    const removed = await categoriesState.deleteCategory(10)
    expect(removed).toBe(true)
    expect(categoriesState.categories.value.some(cat => cat.id === 10)).toBe(false)
  })

  it('returns an existing category when requested', async () => {
    const categoriesState = await setupUseCategories({
      seedData: {
        categories: [{ id: 10, name: 'Seed', sort_order: 1 }]
      }
    })

    await categoriesState.fetchCategories()
    const existing = await categoriesState.getOrCreateCategory('Seed')
    expect(existing.id).toBe(10)
  })
})
