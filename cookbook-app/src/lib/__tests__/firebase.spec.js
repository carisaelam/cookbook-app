import { describe, it, expect, vi, afterEach } from 'vitest'

async function loadFirebaseModule(env) {
  vi.resetModules()
  vi.unstubAllEnvs()
  for (const [key, value] of Object.entries(env)) {
    vi.stubEnv(key, value)
  }

  return await import('../firebase.js')
}

describe('firebase', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('does not configure firebase in dev mode', async () => {
    const module = await loadFirebaseModule({
      DEV: true,
      VITE_FIREBASE_API_KEY: 'api-key',
      VITE_FIREBASE_AUTH_DOMAIN: 'example.firebaseapp.com',
      VITE_FIREBASE_PROJECT_ID: 'example',
      VITE_FIREBASE_APP_ID: 'app-id'
    })

    expect(module.isFirebaseConfigured).toBe(false)
  })

  it('configures firebase outside dev mode when required values are present', async () => {
    const module = await loadFirebaseModule({
      DEV: false,
      VITE_FIREBASE_API_KEY: 'api-key',
      VITE_FIREBASE_AUTH_DOMAIN: 'example.firebaseapp.com',
      VITE_FIREBASE_PROJECT_ID: 'example',
      VITE_FIREBASE_APP_ID: 'app-id'
    })

    expect(module.isFirebaseConfigured).toBe(true)
    expect(module.firebase).toBeTruthy()
  })
})
