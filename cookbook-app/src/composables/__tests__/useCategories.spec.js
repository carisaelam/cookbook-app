import { describe, it, expect, vi } from 'vitest'

async function setupUseCategories({ isConfigured, seedData, firebaseMock }) {
  vi.resetModules()
  vi.doMock('../../lib/firebase', () => ({
    isFirebaseConfigured: isConfigured,
    firebase: firebaseMock
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
  it('loads seed categories and manages local updates in demo mode', async () => {
    const categoriesState = await setupUseCategories({
      isConfigured: false,
      seedData: { categories: [{ id: 10, name: 'Seed', sort_order: 1 }] },
      firebaseMock: null
    })

    await categoriesState.fetchCategories()
    expect(categoriesState.categories.value).toEqual([{ id: 10, name: 'Seed', sort_order: 1 }])

    const added = await categoriesState.addCategory('New', 2)
    expect(added.id).toBe(42)

    const updated = await categoriesState.updateCategory(10, 'Updated')
    expect(updated.name).toBe('Updated')

    const removed = await categoriesState.deleteCategory(10)
    expect(removed).toBe(true)
  })

  it('calls Firebase when configured', async () => {
    const firebaseMock = {
      fetchCategories: vi.fn().mockResolvedValue([{ id: '1', name: 'Remote', sort_order: 0 }]),
      addCategory: vi.fn().mockResolvedValue({ id: '2', name: 'Inserted', sort_order: 0 }),
      updateCategory: vi.fn().mockResolvedValue({ id: '1', name: 'Updated', sort_order: 0 }),
      deleteCategory: vi.fn().mockResolvedValue(undefined)
    }

    const categoriesState = await setupUseCategories({ isConfigured: true, seedData: null, firebaseMock })

    await categoriesState.fetchCategories()
    expect(categoriesState.categories.value).toHaveLength(1)
    expect((await categoriesState.addCategory('Inserted', 0)).name).toBe('Inserted')
    expect((await categoriesState.updateCategory('1', 'Updated')).name).toBe('Updated')
    expect(await categoriesState.deleteCategory('1')).toBe(true)
  })

  it('handles Firebase errors gracefully', async () => {
    const categoriesState = await setupUseCategories({
      isConfigured: true,
      seedData: null,
      firebaseMock: {
        fetchCategories: vi.fn().mockRejectedValue(new Error('fetch failed')),
        addCategory: vi.fn().mockRejectedValue(new Error('insert failed')),
        updateCategory: vi.fn().mockRejectedValue(new Error('update failed')),
        deleteCategory: vi.fn().mockRejectedValue(new Error('delete failed'))
      }
    })

    await categoriesState.fetchCategories()
    expect(categoriesState.error.value).toBe('fetch failed')

    expect(await categoriesState.addCategory('Bad', 0)).toBe(null)
    expect(await categoriesState.updateCategory('1', 'Bad')).toBe(null)
    expect(await categoriesState.deleteCategory('1')).toBe(false)
  })
})
