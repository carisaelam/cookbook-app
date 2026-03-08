import { describe, it, expect, vi } from 'vitest'

async function setupUseRecipes({ seedData }) {
  vi.resetModules()
  vi.doMock('../../lib/firebase', () => ({
    isFirebaseConfigured: false,
    db: null
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
      seedData: {
        recipes: [{ id: 1, name: 'Seed', url: '', category_id: null, notes: '' }]
      }
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
})
