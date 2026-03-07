import { ref } from 'vue'
import { doc, getDoc } from 'firebase/firestore'
import {
  db,
  isFirebaseConfigured,
  signInWithGoogle,
  signOutUser,
  subscribeToAuthState
} from '../lib/firebase'

export function useAuth() {
  const user = ref(null)
  const isEditor = ref(false)
  const loading = ref(true)

  async function refreshEditor(userValue) {
    if (!isFirebaseConfigured || !db || !userValue?.uid) {
      isEditor.value = false
      return
    }

    try {
      const editorDoc = await getDoc(doc(db, 'editors', userValue.uid))
      isEditor.value = editorDoc.exists()
    } catch (e) {
      console.error('Error checking editor access:', e)
      isEditor.value = false
    }
  }

  function initAuth() {
    if (!isFirebaseConfigured) {
      loading.value = false
      user.value = null
      isEditor.value = true
      return () => {}
    }

    return subscribeToAuthState(async nextUser => {
      user.value = nextUser
      await refreshEditor(nextUser)
      loading.value = false
    })
  }

  async function signIn() {
    if (!isFirebaseConfigured) return null

    loading.value = true
    try {
      const signedInUser = await signInWithGoogle()
      await refreshEditor(signedInUser)
      user.value = signedInUser
      return signedInUser
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
    if (!isFirebaseConfigured) return

    loading.value = true
    try {
      await signOutUser()
      user.value = null
      isEditor.value = false
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    isEditor,
    loading,
    initAuth,
    signIn,
    signOut
  }
}
