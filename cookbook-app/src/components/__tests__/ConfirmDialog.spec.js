import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfirmDialog from '../ConfirmDialog.vue'

describe('ConfirmDialog', () => {
  const modalStub = {
    template: '<div><slot></slot></div>'
  }

  it('emits confirm and cancel', async () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        isOpen: true,
        message: 'Are you sure?'
      },
      global: {
        stubs: {
          BaseModal: modalStub
        }
      }
    })

    const buttons = wrapper.findAll('button')
    await buttons[0].trigger('click')
    await buttons[1].trigger('click')

    expect(wrapper.emitted('cancel')).toHaveLength(1)
    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })
})
