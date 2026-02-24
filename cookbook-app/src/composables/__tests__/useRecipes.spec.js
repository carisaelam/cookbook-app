import { describe, it, expect, vi } from 'vitest'

async function setupUseRecipes({ isConfigured, seedData, firebaseMock }) {
  vi.resetModules()
  vi.doMock('../../lib/firebase', () => ({
    isFirebaseConfigured: isConfigured,
    firebase: firebaseMock
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
      firebaseMock: null
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

    const results = await recipesState.importRecipes(
      [{ name: 'Imported', url: '', notes: '', category: 'Salads' }],
      async () => 1
    )
    expect(results.success).toBe(1)
  })

  it('uses Firebase when configured', async () => {
    const firebaseMock = {
      fetchRecipes: vi.fn().mockResolvedValue([
        { id: '1', name: 'Remote', url: 'https://example.com', category_id: null, notes: '' }
      ]),
      addRecipe: vi.fn().mockResolvedValue({ id: '2', name: 'Inserted', url: '', category_id: null, notes: '' }),
      updateRecipe: vi.fn().mockResolvedValue({
        id: '1',
        name: 'Remote',
        url: 'https://example.com',
        category_id: null,
        notes: '',
        ingredients: ['Salt'],
        ingredients_status: 'success',
        ingredients_error: null
      }),
      deleteRecipe: vi.fn().mockResolvedValue(undefined),
      invokeExtractIngredients: vi.fn().mockResolvedValue({ ingredients: ['Salt'] })
    }

    const recipesState = await setupUseRecipes({ isConfigured: true, seedData: null, firebaseMock })

    await recipesState.fetchRecipes()
    expect(recipesState.recipes.value).toHaveLength(1)

    const added = await recipesState.addRecipe({ name: 'Inserted', url: '', category_id: null, notes: '' })
    expect(added.name).toBe('Inserted')

    const extracted = await recipesState.extractIngredientsForRecipe(recipesState.recipes.value[0])
    expect(extracted.ingredients_status).toBe('success')
  })

  it('handles Firebase errors gracefully', async () => {
    const firebaseMock = {
      fetchRecipes: vi.fn().mockRejectedValue(new Error('fetch failed')),
      addRecipe: vi.fn().mockRejectedValue(new Error('insert failed')),
      updateRecipe: vi.fn().mockRejectedValue(new Error('update failed')),
      deleteRecipe: vi.fn().mockRejectedValue(new Error('delete failed')),
      invokeExtractIngredients: vi.fn().mockRejectedValue(new Error('invoke failed'))
    }

    const recipesState = await setupUseRecipes({ isConfigured: true, seedData: null, firebaseMock })

    await recipesState.fetchRecipes()
    expect(recipesState.error.value).toBe('fetch failed')

    expect(await recipesState.addRecipe({ name: 'Bad', url: '', category_id: null, notes: '' })).toBe(null)
    expect(await recipesState.updateRecipe('1', { name: 'Bad', url: '', category_id: null, notes: '' })).toBe(null)
    expect(await recipesState.deleteRecipe('1')).toBe(false)

    recipesState.recipes.value = [{ id: '1', name: 'Remote', url: 'https://example.com', ingredients: [] }]
    const failedExtract = await recipesState.extractIngredientsForRecipe(recipesState.recipes.value[0])
    expect(failedExtract.ingredients_status).toBe('failed')
  })
})
