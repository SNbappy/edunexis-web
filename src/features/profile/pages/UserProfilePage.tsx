import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import ProfilePage from './ProfilePage'

export default function UserProfilePage() {
    const { userId } = useParams<{ userId: string }>()
    const { user } = useAuthStore()
    const navigate = useNavigate()

    useEffect(() => {
        if (userId === user?.id) navigate('/profile', { replace: true })
    }, [userId, user?.id, navigate])

    if (userId === user?.id) return null

    return <ProfilePage userId={userId} isOwnProfile={false} />
}
