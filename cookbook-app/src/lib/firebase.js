import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { getFunctions, httpsCallable } from 'firebase/functions'
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
export const functions = app ? getFunctions(app, 'us-east1') : null
export const googleProvider = auth ? new GoogleAuthProvider() : null

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
  if (!functions) {
    return {
      ingredients: [],
      error: 'Firebase Functions is not configured.'
    }
  }

  const callable = httpsCallable(functions, 'extractIngredients')
  const result = await callable({ url })
  return result.data || { ingredients: [], error: 'No extraction result.' }
}
