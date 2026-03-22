import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppHeader from '../AppHeader.vue'

function findButtonByText(wrapper, text) {
  return wrapper.findAll('button').find(button => button.text().includes(text))
}

function findMenuButton(wrapper) {
  return wrapper.find('button[aria-label="Open library menu"]')
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

    await findMenuButton(wrapper).trigger('click')
    await findButtonByText(wrapper, 'Sign In').trigger('click')
    await findMenuButton(wrapper).trigger('click')
    await findButtonByText(wrapper, 'Import').trigger('click')
    await findMenuButton(wrapper).trigger('click')
    await findButtonByText(wrapper, 'Export Backup').trigger('click')
    await findMenuButton(wrapper).trigger('click')
    await findButtonByText(wrapper, 'Backfill Ingredients').trigger('click')
    await findButtonByText(wrapper, 'Add Recipe').trigger('click')

    expect(wrapper.emitted('auth-action')).toHaveLength(1)
    expect(wrapper.emitted('import-recipes')).toHaveLength(1)
    expect(wrapper.emitted('export-backup')).toHaveLength(1)
    expect(wrapper.emitted('backfill-ingredients')).toHaveLength(1)
    expect(wrapper.emitted('add-recipe')).toHaveLength(1)
    expect(wrapper.find('.btn-primary-row').exists()).toBe(true)

    await findMenuButton(wrapper).trigger('click')
    expect(wrapper.find('.header-group-editor').exists()).toBe(true)
  })

  it('disables the backfill button when backfilling', async () => {
    const wrapper = mount(AppHeader, {
      props: {
        isBackfilling: true,
        canEdit: true
      }
    })

    await findMenuButton(wrapper).trigger('click')

    const backfillButton = findButtonByText(wrapper, 'Backfilling...')
    expect(backfillButton.attributes('disabled')).toBeDefined()
  })

  it('emits reset-filters when the title is clicked', async () => {
    const wrapper = mount(AppHeader)

    await findButtonByText(wrapper, 'Recipes, notes, and ingredient status').trigger('click')

    expect(wrapper.emitted('reset-filters')).toHaveLength(1)
  })
})
