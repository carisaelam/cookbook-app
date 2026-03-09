import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

function isPlaceholder(value) {
  return !value || String(value).includes('your-')
}

export const isFirebaseConfigured = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.appId
].every(value => !isPlaceholder(value))

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null

export const auth = app ? getAuth(app) : null
export const db = app ? getFirestore(app) : null
export const googleProvider = auth ? new GoogleAuthProvider() : null
const extractEndpoint = import.meta.env.VITE_EXTRACT_INGREDIENTS_ENDPOINT
  || '/.netlify/functions/extract-ingredients'

export async function signInWithGoogle() {
  if (!auth || !googleProvider) return null
  const result = await signInWithPopup(auth, googleProvider)
  return result.user
}

export async function signOutUser() {
  if (!auth) return
  await signOut(auth)
}

export function subscribeToAuthState(callback) {
  if (!auth) {
    callback(null)
    return () => {}
  }

  return onAuthStateChanged(auth, callback)
}

export async function extractIngredientsFromUrl(url) {
  if (!url) {
    return {
      ingredients: [],
      error: 'Missing URL.'
    }
  }

  try {
    const response = await fetch(extractEndpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({ url })
    })

    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      if (payload?.request_id) {
        console.warn(`Extractor request failed (request_id=${payload.request_id})`)
      }
      return {
        ingredients: [],
        error: payload?.error || `Extractor request failed (${response.status}).`,
        request_id: payload?.request_id || null
      }
    }

    return {
      ingredients: Array.isArray(payload?.ingredients) ? payload.ingredients : [],
      error: payload?.error || null,
      request_id: payload?.request_id || null
    }
  } catch (e) {
    return {
      ingredients: [],
      error: e?.message || 'Extractor request failed.',
      request_id: null
    }
  }
}
