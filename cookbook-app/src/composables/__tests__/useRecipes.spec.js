import { describe, it, expect, vi } from 'vitest'

async function setupUseRecipes({ isConfigured, seedData, supabaseMock }) {
  vi.resetModules()
  vi.doMock('../../lib/supabase', () => ({
    isSupabaseConfigured: isConfigured,
    supabase: supabaseMock
  }))
  vi.doMock('../../lib/demoSeed', () => ({
    loadSeedData: vi.fn().mockResolvedValue(seedData)
  }))
  vi.doMock('../../lib/demoData', () => ({
    demoRecipes: [{ id: 2, name: 'Demo', url: '', category_id: null, notes: '' }],
    demoCategories: [{ id: 1, name: 'Salads' }],
    getNextRecipeId: vi.fn().mockReturnValue(100)
  }))

  const { useRecipes } = await import('../useRecipes.js')
  return useRecipes()
}

describe('useRecipes', () => {
  it('handles local demo data flows', async () => {
    const recipesState = await setupUseRecipes({
      isConfigured: false,
      seedData: {
        recipes: [{ id: 1, name: 'Seed', url: '', category_id: null, notes: '' }]
      },
      supabaseMock: null
    })

    await recipesState.fetchRecipes()
    expect(recipesState.recipes.value).toHaveLength(1)

    const added = await recipesState.addRecipe({
      name: 'New',
      url: 'https://example.com',
      category_id: 1,
      notes: ''
    })
    expect(added.id).toBe(100)

    const updated = await recipesState.updateRecipe(added.id, {
      name: 'Updated',
      url: '',
      category_id: null,
      notes: 'Note'
    })
    expect(updated.name).toBe('Updated')

    const missingUpdate = await recipesState.updateRecipe(999, {
      name: 'Missing',
      url: '',
      category_id: null,
      notes: ''
    })
    expect(missingUpdate).toBe(null)

    const results = await recipesState.importRecipes(
      [{ name: 'Imported', url: '', notes: '', category: 'Salads' }],
      async () => 1
    )
    expect(results.success).toBe(1)

    const saved = await recipesState.saveIngredientsForRecipe(added, ['  Salt ', ''])
    expect(saved.ingredients).toEqual(['Salt'])
    expect(saved.ingredients_status).toBe('success')

    recipesState.recipes.value.push({ id: 99, name: 'No URL', url: '', ingredients: [] })
    const missingUrl = await recipesState.extractIngredientsForRecipe({ id: 99, url: '' })
    expect(missingUrl.ingredients_status).toBe('failed')

    recipesState.recipes.value = [
      { id: 3, name: 'Needs', url: 'https://example.com', ingredients_status: 'pending', ingredients: [] }
    ]
    await recipesState.backfillIngredients()
    expect(recipesState.recipes.value[0].ingredients_status).toBe('failed')
  })

  it('uses Supabase when configured', async () => {
    const supabaseMock = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          order: vi.fn().mockResolvedValue({
            data: [{ id: 1, name: 'Remote', url: 'https://example.com', category_id: null, notes: '' }],
            error: null
          })
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { id: 2, name: 'Inserted', url: '', category_id: null, notes: '' },
              error: null
            })
          }))
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 1,
                  name: 'Remote',
                  url: 'https://example.com',
                  category_id: null,
                  notes: '',
                  ingredients: ['Salt'],
                  ingredients_status: 'success',
                  ingredients_error: null
                },
                error: null
              })
            }))
          }))
        }))
      })),
      functions: {
        invoke: vi.fn().mockResolvedValue({
          data: { ingredients: ['Salt'] },
          error: null
        })
      }
    }

    const recipesState = await setupUseRecipes({
      isConfigured: true,
      seedData: null,
      supabaseMock
    })

    await recipesState.fetchRecipes()
    expect(recipesState.recipes.value).toHaveLength(1)

    const added = await recipesState.addRecipe({
      name: 'Inserted',
      url: '',
      category_id: null,
      notes: ''
    })
    expect(added.name).toBe('Inserted')

    const extracted = await recipesState.extractIngredientsForRecipe(recipesState.recipes.value[0])
    expect(extracted.ingredients_status).toBe('success')
  })

  it('handles Supabase errors and fallback paths', async () => {
    const insertError = new Error('insert failed')
    const insertMock = vi.fn(() => ({
      then: (resolve) => resolve({ error: insertError }),
      select: vi.fn(() => ({
        single: vi.fn().mockResolvedValue({
          data: null,
          error: insertError
        })
      }))
    }))

    const supabaseMock = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: new Error('fetch failed')
          })
        })),
        insert: insertMock,
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
      })),
      functions: {
        invoke: vi.fn().mockResolvedValue({
          data: null,
          error: new Error('invoke failed')
        })
      }
    }

    const recipesState = await setupUseRecipes({
      isConfigured: true,
      seedData: null,
      supabaseMock
    })

    await recipesState.fetchRecipes()
    expect(recipesState.error.value).toBe('fetch failed')

    const added = await recipesState.addRecipe({
      name: 'Bad',
      url: '',
      category_id: null,
      notes: ''
    })
    expect(added).toBe(null)

    const updated = await recipesState.updateRecipe(1, {
      name: 'Bad',
      url: '',
      category_id: null,
      notes: ''
    })
    expect(updated).toBe(null)

    const deleted = await recipesState.deleteRecipe(1)
    expect(deleted).toBe(false)

    const results = await recipesState.importRecipes(
      [{ name: 'Imported', url: '', notes: '', category: 'Salads' }],
      async () => 1
    )
    expect(results.failed).toBe(1)

    recipesState.recipes.value = [{ id: 1, name: 'Remote', url: 'https://example.com', ingredients: [] }]
    const failedExtract = await recipesState.extractIngredientsForRecipe(recipesState.recipes.value[0])
    expect(failedExtract.ingredients_status).toBe('failed')

    const failedSave = await recipesState.saveIngredientsForRecipe(recipesState.recipes.value[0], ['Salt'])
    expect(failedSave.ingredients_status).toBe('failed')
  })
})
