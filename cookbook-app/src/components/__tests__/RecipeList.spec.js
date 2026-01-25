import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RecipeList from '../RecipeList.vue'

describe('RecipeList', () => {
  it('shows loading and empty states', () => {
    const loadingWrapper = mount(RecipeList, {
      props: {
        recipesByCategory: [],
        loading: true
      }
    })

    expect(loadingWrapper.find('.loading-state').exists()).toBe(true)

    const emptyWrapper = mount(RecipeList, {
      props: {
        recipesByCategory: [],
        loading: false
      }
    })

    expect(emptyWrapper.find('.empty-state').exists()).toBe(true)
  })

  it('renders recipe cards and re-emits actions', async () => {
    const groups = [
      {
        category: { id: 1, name: 'Salads' },
        recipes: [{ id: 10, name: 'Test Recipe' }]
      }
    ]

    const wrapper = mount(RecipeList, {
      props: {
        recipesByCategory: groups,
        loading: false
      },
      global: {
        stubs: {
          RecipeCard: {
            props: ['recipe'],
            template: '<button class="recipe-card-stub" @click="$emit(\'edit\', recipe)"></button>'
          }
        }
      }
    })

    await wrapper.find('.recipe-card-stub').trigger('click')
    expect(wrapper.emitted('edit')[0]).toEqual([groups[0].recipes[0]])
  })
})
