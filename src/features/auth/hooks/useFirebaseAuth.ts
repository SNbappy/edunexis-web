import { useState } from 'react'
import { signInWithPopup, signOut } from 'firebase/auth'
import { firebaseAuth, googleProvider } from '@/config/firebase'
import { authService } from '../services/authService'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export function useFirebaseAuth() {
    const [loading, setLoading] = useState(false)
    const { setAuth } = useAuthStore()

    const signInWithGoogle = async () => {
        setLoading(true)
        try {
            const result = await signInWithPopup(firebaseAuth, googleProvider)
            const { user: firebaseUser } = result
            const email = firebaseUser.email ?? ''
            const fullName = firebaseUser.displayName ?? ''

            // Check domain validity
            const isValidDomain =
                email.endsWith('@just.edu.bd') || email.endsWith('@student.just.edu.bd')

            if (!isValidDomain) {
                await signOut(firebaseAuth)
                toast.error('Only @just.edu.bd or @student.just.edu.bd emails are allowed.')
                return
            }

            // Sync with backend
            const response = await authService.sync({ email, fullName })
            if (!response.success) {
                toast.error(response.message || 'Account not found. Please register first.')
                await signOut(firebaseAuth)
                return
            }

            // For Firebase login, we need to get a proper JWT from backend
            // Use login flow after sync
            toast.success('Signed in with Google successfully!')
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Google sign-in failed.'
            if (!msg.includes('popup-closed')) toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    return { signInWithGoogle, loading }
}
