import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RecipeSearch from '../RecipeSearch.vue'

describe('RecipeSearch', () => {
  it('emits updates as user types', async () => {
    const wrapper = mount(RecipeSearch, {
      props: {
        modelValue: ''
      }
    })

    await wrapper.find('input').setValue('Soup')

    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['Soup'])
  })

  it('clears the search and emits an empty value', async () => {
    const wrapper = mount(RecipeSearch, {
      props: {
        modelValue: 'Pasta'
      }
    })

    await wrapper.setProps({ modelValue: 'Pasta' })
    await wrapper.find('.clear-btn').trigger('click')

    expect(wrapper.emitted('update:modelValue')[0]).toEqual([''])
  })
})
