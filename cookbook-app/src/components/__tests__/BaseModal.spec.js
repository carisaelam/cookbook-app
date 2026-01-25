import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseModal from '../BaseModal.vue'

describe('BaseModal', () => {
  const global = {
    stubs: {
      Teleport: true,
      Transition: false
    }
  }

  it('emits close on backdrop and button click', async () => {
    const wrapper = mount(BaseModal, {
      props: {
        isOpen: true,
        title: 'Modal'
      },
      global
    })

    await wrapper.find('.modal-backdrop').trigger('click')
    await wrapper.find('.close-btn').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(2)
  })

  it('emits close on escape', async () => {
    const wrapper = mount(BaseModal, {
      props: {
        isOpen: true,
        title: 'Modal'
      },
      global
    })

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
