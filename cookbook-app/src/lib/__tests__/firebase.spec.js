import { describe, it, expect, vi, afterEach } from 'vitest'

async function loadFirebaseModule({ env, initializeAppImpl }) {
  vi.resetModules()
  vi.unstubAllEnvs()
  for (const [key, value] of Object.entries(env)) {
    vi.stubEnv(key, value)
  }

  vi.doMock('firebase/app', () => ({
    initializeApp: initializeAppImpl
  }))
  vi.doMock('firebase/auth', () => ({
    getAuth: vi.fn(() => ({ auth: true })),
    GoogleAuthProvider: vi.fn(),
    signInWithPopup: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChanged: vi.fn()
  }))
  vi.doMock('firebase/firestore', () => ({
    getFirestore: vi.fn(() => ({ db: true }))
  }))

  return await import('../firebase.js')
}

describe('firebase config', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('does not initialize when env config is missing', async () => {
    const initializeApp = vi.fn(() => ({ app: true }))
    const module = await loadFirebaseModule({
      env: {
        VITE_FIREBASE_API_KEY: '',
        VITE_FIREBASE_AUTH_DOMAIN: '',
        VITE_FIREBASE_PROJECT_ID: '',
        VITE_FIREBASE_APP_ID: ''
      },
      initializeAppImpl: initializeApp
    })

    expect(module.isFirebaseConfigured).toBe(false)
    expect(initializeApp).not.toHaveBeenCalled()
  })

  it('initializes when required env config is present', async () => {
    const initializeApp = vi.fn(() => ({ app: true }))
    const module = await loadFirebaseModule({
      env: {
        VITE_FIREBASE_API_KEY: 'api-key',
        VITE_FIREBASE_AUTH_DOMAIN: 'project.firebaseapp.com',
        VITE_FIREBASE_PROJECT_ID: 'project-id',
        VITE_FIREBASE_APP_ID: 'app-id'
      },
      initializeAppImpl: initializeApp
    })

    expect(module.isFirebaseConfigured).toBe(true)
    expect(initializeApp).toHaveBeenCalledTimes(1)
  })
})
