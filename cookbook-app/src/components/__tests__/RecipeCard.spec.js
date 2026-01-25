import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RecipeCard from '../RecipeCard.vue'

describe('RecipeCard', () => {
  const baseRecipe = {
    id: 1,
    name: 'Test Recipe',
    url: 'https://www.example.com/test',
    notes: 'Tasty.',
    ingredients: [],
    ingredients_status: 'pending',
    ingredients_error: null
  }

  it('renders the recipe link and domain', () => {
    const wrapper = mount(RecipeCard, {
      props: {
        recipe: baseRecipe
      }
    })

    expect(wrapper.find('.recipe-link').exists()).toBe(true)
    expect(wrapper.find('.recipe-domain').text()).toContain('example.com')
  })

  it('shows ingredients and emits saved items', async () => {
    const recipe = {
      ...baseRecipe,
      ingredients: ['Salt', 'Pepper'],
      ingredients_status: 'success'
    }
    const wrapper = mount(RecipeCard, {
      props: {
        recipe
      }
    })

    await wrapper.find('.ingredients-toggle').trigger('click')
    expect(wrapper.findAll('.ingredients-list li')).toHaveLength(2)

    await wrapper.find('.ingredients-edit-btn').trigger('click')
    await wrapper.find('textarea').setValue('  Flour \n\n Sugar ')
    await wrapper.find('.ingredients-editor .btn').trigger('click')

    expect(wrapper.emitted('save-ingredients')[0][0].ingredients).toEqual(['Flour', 'Sugar'])
  })

  it('disables ingredient import when pending', () => {
    const wrapper = mount(RecipeCard, {
      props: {
        recipe: baseRecipe
      }
    })

    const importButton = wrapper.find('button[aria-label="Import ingredients"]')
    expect(importButton.attributes('disabled')).toBeDefined()
  })

  it('handles missing data states', async () => {
    const wrapper = mount(RecipeCard, {
      props: {
        recipe: {
          id: 2,
          name: 'No URL',
          url: '',
          notes: '',
          ingredients: [],
          ingredients_status: null,
          ingredients_error: 'Missing URL',
          ingredients_updated_at: 'not-a-date'
        }
      }
    })

    expect(wrapper.find('.no-link').exists()).toBe(true)
    expect(wrapper.find('.status-pill').text()).toBe('Failed')
    expect(wrapper.find('.text-muted.text-xs').text()).toContain('Missing URL')

    await wrapper.find('.ingredients-toggle').trigger('click')
    expect(wrapper.find('.ingredients-panel').text()).toContain('No ingredients yet.')
  })
})
