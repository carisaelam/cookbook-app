import { describe, it, expect } from 'vitest'
import { parseRecipes, parseGoogleDocFormat } from '../importParser.js'

describe('importParser', () => {
  it('parses mixed recipe formats', () => {
    const text = `
      ## Salads
      Kale Salad - https://example.com/kale
      **Soups**
      Tomato Soup https://example.com/soup
      BREAD
      [No Link](https://example.com/link)
      https://example.com/skip
    `

    const result = parseRecipes(text)

    expect(result.categories).toContain('Salads')
    expect(result.categories).toContain('Soups')
    expect(result.categories).toContain('Bread')
    expect(result.recipes.length).toBeGreaterThan(0)
  })

  it('parses the Google Doc format', () => {
    const text = `
      **Salads**
      [Green Salad](https://example.com/green)
      Tomato Salad
    `

    const result = parseGoogleDocFormat(text)
    expect(result.categories).toContain('Salads')
    expect(result.recipes.some(r => r.name === 'Green Salad')).toBe(true)
    expect(result.recipes.some(r => r.name === 'Tomato Salad')).toBe(true)
  })
})
