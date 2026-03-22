import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CategoryFilter from '../CategoryFilter.vue'

describe('CategoryFilter', () => {
  const categories = [
    { id: 2, name: 'Soups' },
    { id: 1, name: 'Salads' }
  ]

  it('marks active filters and emits multi-select actions', async () => {
    const wrapper = mount(CategoryFilter, {
      props: {
        categories,
        selectedCategoryIds: [2]
      }
    })

    const buttons = wrapper.findAll('button')
    expect(wrapper.text()).toContain('Choose any combination.')
    expect(buttons[0].classes()).not.toContain('active')
    expect(buttons[1].classes()).toContain('active')
    expect(buttons[0].text()).toBe('Salads')
    expect(buttons[1].text()).toBe('Soups')

    await buttons[0].trigger('click')
    expect(wrapper.emitted('toggle')[0]).toEqual([1])
  })
})
