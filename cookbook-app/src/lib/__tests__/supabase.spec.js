import { describe, it, expect, vi, afterEach } from 'vitest'

async function loadSupabaseModule({ env, createClientImpl }) {
  vi.resetModules()
  vi.unstubAllEnvs()
  for (const [key, value] of Object.entries(env)) {
    vi.stubEnv(key, value)
  }

  vi.doMock('@supabase/supabase-js', () => ({
    createClient: createClientImpl
  }))

  return await import('../supabase.js')
}

describe('supabase', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('does not create a client in dev mode', async () => {
    const createClient = vi.fn()
    const module = await loadSupabaseModule({
      env: {
        DEV: true,
        VITE_SUPABASE_URL: 'https://example.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'key'
      },
      createClientImpl: createClient
    })

    expect(module.isSupabaseConfigured).toBe(false)
    expect(module.supabase).toBe(null)
    expect(createClient).not.toHaveBeenCalled()
  })

  it('creates a client when configured', async () => {
    const createClient = vi.fn(() => ({ mock: true }))
    const module = await loadSupabaseModule({
      env: {
        DEV: false,
        VITE_SUPABASE_URL: 'https://example.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'key'
      },
      createClientImpl: createClient
    })

    expect(module.isSupabaseConfigured).toBe(true)
    expect(module.supabase).toEqual({ mock: true })
    expect(createClient).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'key'
    )
  })
})
