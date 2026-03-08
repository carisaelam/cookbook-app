import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppHeader from '../AppHeader.vue'

function findButtonByText(wrapper, text) {
  return wrapper.findAll('button').find(button => button.text().includes(text))
}

describe('AppHeader', () => {
  it('shows read-only banner when firebase is configured and user cannot edit', () => {
    const wrapper = mount(AppHeader, {
      props: {
        isFirebaseConfigured: true,
        canEdit: false
      }
    })

    expect(wrapper.find('.demo-banner').exists()).toBe(true)
  })

  it('emits actions when editor buttons are clicked', async () => {
    const wrapper = mount(AppHeader, {
      props: {
        isBackfilling: false,
        canEdit: true,
        isFirebaseConfigured: true
      }
    })

    await findButtonByText(wrapper, 'Sign In').trigger('click')
    await findButtonByText(wrapper, 'Import').trigger('click')
    await findButtonByText(wrapper, 'Export Backup').trigger('click')
    await findButtonByText(wrapper, 'Backfill Ingredients').trigger('click')
    await findButtonByText(wrapper, 'Add Recipe').trigger('click')

    expect(wrapper.emitted('auth-action')).toHaveLength(1)
    expect(wrapper.emitted('import-recipes')).toHaveLength(1)
    expect(wrapper.emitted('export-backup')).toHaveLength(1)
    expect(wrapper.emitted('backfill-ingredients')).toHaveLength(1)
    expect(wrapper.emitted('add-recipe')).toHaveLength(1)
  })

  it('disables the backfill button when backfilling', () => {
    const wrapper = mount(AppHeader, {
      props: {
        isBackfilling: true,
        canEdit: true
      }
    })

    const backfillButton = findButtonByText(wrapper, 'Backfilling...')
    expect(backfillButton.attributes('disabled')).toBeDefined()
  })

  it('emits reset-filters when the title is clicked', async () => {
    const wrapper = mount(AppHeader)

    await findButtonByText(wrapper, 'C & J Cookbook').trigger('click')

    expect(wrapper.emitted('reset-filters')).toHaveLength(1)
  })
})
