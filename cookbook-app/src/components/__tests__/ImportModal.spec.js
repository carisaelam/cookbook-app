import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ImportModal from '../ImportModal.vue'

describe('ImportModal', () => {
  const modalStub = {
    template: '<div><slot></slot></div>'
  }

  it('parses content and emits import payload', async () => {
    const wrapper = mount(ImportModal, {
      props: {
        isOpen: true
      },
      global: {
        stubs: {
          BaseModal: modalStub
        }
      }
    })

    const text = `
      ## Salads
      Kale Salad - https://example.com/kale
      Soup
    `

    await wrapper.find('textarea').setValue(text)
    await wrapper.find('button.btn.btn-primary').trigger('click')
    await wrapper.vm.$nextTick()

    const importButton = wrapper
      .findAll('button')
      .find(button => button.text().includes('Import'))
    await importButton.trigger('click')

    expect(wrapper.emitted('import')[0][0].recipes.length).toBeGreaterThan(0)
  })

  it('resets and closes', async () => {
    const wrapper = mount(ImportModal, {
      props: {
        isOpen: true
      },
      global: {
        stubs: {
          BaseModal: modalStub
        }
      }
    })

    await wrapper.find('textarea').setValue('Recipe - https://example.com')
    await wrapper.find('button.btn.btn-secondary').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(wrapper.find('textarea').element.value).toBe('')
  })
})
