import { describe, it, expect, vi } from 'vitest'

describe('demoData', () => {
  it('increments category and recipe ids', async () => {
    vi.resetModules()
    const module = await import('../demoData.js')

    const firstCategory = module.getNextCategoryId()
    const secondCategory = module.getNextCategoryId()
    const firstRecipe = module.getNextRecipeId()
    const secondRecipe = module.getNextRecipeId()

    expect(secondCategory).toBe(firstCategory + 1)
    expect(secondRecipe).toBe(firstRecipe + 1)
    expect(module.demoCategories.length).toBeGreaterThan(0)
    expect(module.demoRecipes.length).toBeGreaterThan(0)
  })
})
