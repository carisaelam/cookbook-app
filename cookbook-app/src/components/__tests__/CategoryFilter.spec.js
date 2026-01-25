import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CategoryFilter from '../CategoryFilter.vue'

describe('CategoryFilter', () => {
  const categories = [
    { id: 1, name: 'Salads' },
    { id: 2, name: 'Soups' }
  ]

  it('marks the active filter and emits selections', async () => {
    const wrapper = mount(CategoryFilter, {
      props: {
        categories,
        selectedCategoryId: 2
      }
    })

    const buttons = wrapper.findAll('button')
    expect(buttons[0].classes()).not.toContain('active')
    expect(buttons[2].classes()).toContain('active')

    await buttons[1].trigger('click')
    expect(wrapper.emitted('select')[0]).toEqual([1])

    await buttons[0].trigger('click')
    expect(wrapper.emitted('select')[1]).toEqual([null])
  })
})
