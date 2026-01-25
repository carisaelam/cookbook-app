import { describe, it, expect, vi } from 'vitest'

async function setupUseCategories({ isConfigured, seedData, supabaseMock }) {
  vi.resetModules()
  vi.doMock('../../lib/supabase', () => ({
    isSupabaseConfigured: isConfigured,
    supabase: supabaseMock
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
      seedData: {
        categories: [{ id: 10, name: 'Seed', sort_order: 1 }]
      },
      supabaseMock: null
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

  it('calls Supabase when configured', async () => {
    const supabaseMock = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          order: vi.fn().mockResolvedValue({
            data: [{ id: 1, name: 'Remote', sort_order: 0 }],
            error: null
          })
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { id: 2, name: 'Inserted', sort_order: 0 },
              error: null
            })
          }))
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: { id: 1, name: 'Updated', sort_order: 0 },
                error: null
              })
            }))
          }))
        })),
        delete: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({ error: null })
        }))
      }))
    }

    const categoriesState = await setupUseCategories({
      isConfigured: true,
      seedData: null,
      supabaseMock
    })

    await categoriesState.fetchCategories()
    expect(categoriesState.categories.value).toHaveLength(1)

    const added = await categoriesState.addCategory('Inserted', 0)
    expect(added.name).toBe('Inserted')

    const updated = await categoriesState.updateCategory(1, 'Updated')
    expect(updated.name).toBe('Updated')

    const removed = await categoriesState.deleteCategory(1)
    expect(removed).toBe(true)
  })

  it('handles Supabase errors gracefully', async () => {
    const supabaseMock = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: new Error('fetch failed')
          })
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: new Error('insert failed')
            })
          }))
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: new Error('update failed')
              })
            }))
          }))
        })),
        delete: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({ error: new Error('delete failed') })
        }))
      }))
    }

    const categoriesState = await setupUseCategories({
      isConfigured: true,
      seedData: null,
      supabaseMock
    })

    await categoriesState.fetchCategories()
    expect(categoriesState.error.value).toBe('fetch failed')

    const added = await categoriesState.addCategory('Bad', 0)
    expect(added).toBe(null)

    const updated = await categoriesState.updateCategory(1, 'Bad')
    expect(updated).toBe(null)

    const removed = await categoriesState.deleteCategory(1)
    expect(removed).toBe(false)
  })

  it('returns an existing category when requested', async () => {
    const categoriesState = await setupUseCategories({
      isConfigured: false,
      seedData: {
        categories: [{ id: 10, name: 'Seed', sort_order: 1 }]
      },
      supabaseMock: null
    })

    await categoriesState.fetchCategories()
    const existing = await categoriesState.getOrCreateCategory('Seed')
    expect(existing.id).toBe(10)
  })
})
