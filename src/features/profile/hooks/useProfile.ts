import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profileService, type UpdateProfileRequest } from '../services/profileService'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export function useProfile() {
    const { setUser, user } = useAuthStore()
    const qc = useQueryClient()

    const query = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const res = await profileService.getProfile()
            return res.data
        },
        enabled: !!user,
    })

    const updateMutation = useMutation({
        mutationFn: (data: UpdateProfileRequest) => profileService.updateProfile(data),
        onSuccess: (res) => {
            if (res.success && user) {
                setUser({ ...user, profile: res.data, isProfileComplete: (res.data.profileCompletionPercent ?? 0) >= 60 })
                qc.invalidateQueries({ queryKey: ['profile'] })
                toast.success('Profile updated successfully!')
            } else {
                toast.error(res.message)
            }
        },
        onError: () => toast.error('Failed to update profile.'),
    })

    const photoMutation = useMutation({
        mutationFn: (file: File) => profileService.uploadPhoto(file),
        onSuccess: (res) => {
            if (res.success) {
                qc.invalidateQueries({ queryKey: ['profile'] })
                toast.success('Photo updated!')
            }
        },
        onError: () => toast.error('Failed to upload photo.'),
    })

    return {
        profile: query.data,
        isLoading: query.isLoading,
        updateProfile: updateMutation.mutate,
        isUpdating: updateMutation.isPending,
        uploadPhoto: photoMutation.mutate,
        isUploading: photoMutation.isPending,
    }
}
