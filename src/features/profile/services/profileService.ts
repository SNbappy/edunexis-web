import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'
import type { UserProfileDto, PublicProfileDto, UserEducationDto } from '@/types/auth.types'

export interface UpdateProfileRequest {
    fullName: string
    department: string
    designation?: string
    studentId?: string
    bio?: string
    phoneNumber?: string
    linkedInUrl?: string
    facebookUrl?: string
    twitterUrl?: string
    gitHubUrl?: string
    websiteUrl?: string
}

export interface EducationRequest {
    institution: string
    degree: string
    fieldOfStudy: string
    startYear: number
    endYear?: number | null
    description?: string | null
}

const uploadFile = (endpoint: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<ApiResponse<string>>(endpoint, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
}

export const profileService = {
    getProfile: () =>
        api.get<ApiResponse<UserProfileDto>>('/profile').then((r) => r.data),

    getPublicProfile: (userId: string) =>
        api.get<ApiResponse<PublicProfileDto>>(`/profile/${userId}`).then((r) => r.data),

    updateProfile: (data: UpdateProfileRequest) =>
        api.put<ApiResponse<UserProfileDto>>('/profile', data).then((r) => r.data),

    uploadPhoto: (file: File) => uploadFile('/profile/photo', file),
    removePhoto: () => api.delete<ApiResponse<boolean>>('/profile/photo').then((r) => r.data),

    uploadCover: (file: File) => uploadFile('/profile/cover', file),
    removeCover: () => api.delete<ApiResponse<boolean>>('/profile/cover').then((r) => r.data),

    addEducation: (data: EducationRequest) =>
        api.post<ApiResponse<UserEducationDto>>('/profile/education', data).then((r) => r.data),

    updateEducation: (id: string, data: EducationRequest) =>
        api.put<ApiResponse<UserEducationDto>>(`/profile/education/${id}`, data).then((r) => r.data),

    deleteEducation: (id: string) =>
        api.delete<ApiResponse<boolean>>(`/profile/education/${id}`).then((r) => r.data),
}
