import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'
import type { UserProfileDto } from '@/types/auth.types'

export interface UpdateProfileRequest {
    fullName: string
    department: string
    designation?: string
    studentId?: string
    bio?: string
    phoneNumber?: string
    linkedInUrl?: string
}

export const profileService = {
    getProfile: () =>
        api.get<ApiResponse<UserProfileDto>>('/profile').then((r) => r.data),

    updateProfile: (data: UpdateProfileRequest) =>
        api.put<ApiResponse<UserProfileDto>>('/profile', data).then((r) => r.data),

    uploadPhoto: (file: File) => {
        const form = new FormData()
        form.append('file', file)
        return api
            .post<ApiResponse<{ photoUrl: string }>>('/profile/photo', form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            .then((r) => r.data)
    },
}
