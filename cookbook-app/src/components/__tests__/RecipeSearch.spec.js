import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import RecipeSearch from '../RecipeSearch.vue'

describe('RecipeSearch', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('emits updates after debounce', async () => {
    vi.useFakeTimers()
    const wrapper = mount(RecipeSearch, {
      props: {
        modelValue: ''
      }
    })

    await wrapper.find('input').setValue('Soup')
    vi.advanceTimersByTime(300)

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
