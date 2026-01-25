import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('vue', () => {
  const mount = vi.fn()
  const createApp = vi.fn(() => ({ mount }))
  return { createApp }
})

vi.mock('../App.vue', () => ({
  default: { name: 'App' }
}))

describe('main', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('mounts the app', async () => {
    const { createApp } = await import('vue')

    await import('../main.js')

    expect(createApp).toHaveBeenCalledTimes(1)
    const appInstance = createApp.mock.results[0].value
    expect(appInstance.mount).toHaveBeenCalledWith('#app')
  })
})
