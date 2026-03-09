import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import RecipeForm from '../RecipeForm.vue'

describe('RecipeForm', () => {
  const categories = [
    { id: 2, name: 'Soups' },
    { id: 1, name: 'Salads' }
  ]

  const baseProps = {
    isOpen: true,
    categories,
    canEdit: true
  }

  const modalStub = {
    template: '<div><slot></slot></div>'
  }

  it('pre-fills fields when editing and emits save', async () => {
    const wrapper = mount(RecipeForm, {
      props: {
        ...baseProps,
        isOpen: false,
        recipe: {
          id: 5,
          name: 'Pasta',
          url: 'https://example.com',
          category_id: 2,
          notes: 'Note'
        }
      },
      global: {
        stubs: {
          BaseModal: modalStub
        }
      }
    })

    await wrapper.setProps({ isOpen: true })
    await nextTick()

    expect(wrapper.find('#name').element.value).toBe('Pasta')
    expect(wrapper.find('#url').element.value).toBe('https://example.com')
    expect(wrapper.find('#notes').element.value).toBe('Note')

    await wrapper.find('#name').setValue('Updated')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('save')[0][0]).toMatchObject({
      id: 5,
      name: 'Updated'
    })
  })

  it('does not emit save when invalid', async () => {
    const wrapper = mount(RecipeForm, {
      props: baseProps,
      global: {
        stubs: {
          BaseModal: modalStub
        }
      }
    })

    await wrapper.find('#name').setValue('')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('save')).toBeUndefined()
  })

  it('emits a new recipe payload when adding', async () => {
    const wrapper = mount(RecipeForm, {
      props: baseProps,
      global: {
        stubs: {
          BaseModal: modalStub
        }
      }
    })

    await wrapper.find('#name').setValue('New Recipe')
    await wrapper.find('#url').setValue('https://example.com')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('save')[0][0]).toMatchObject({
      name: 'New Recipe',
      url: 'https://example.com'
    })
    expect(wrapper.emitted('save')[0][0].id).toBeUndefined()
  })

  it('renders categories alphabetically in the dropdown', () => {
    const wrapper = mount(RecipeForm, {
      props: baseProps,
      global: {
        stubs: {
          BaseModal: modalStub
        }
      }
    })

    const options = wrapper.findAll('#category option')
    expect(options[1].text()).toBe('Salads')
    expect(options[2].text()).toBe('Soups')
  })
})
