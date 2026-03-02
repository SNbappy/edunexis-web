import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'
import type { PresentationDto, CreatePresentationRequest, GradePresentationRequest } from '@/types/presentation.types'

export const presentationService = {
    create: (courseId: string, data: CreatePresentationRequest) =>
        api.post<ApiResponse<PresentationDto>>(`/courses/${courseId}/presentations`, data).then((r) => r.data),

    grade: (presentationId: string, data: GradePresentationRequest) =>
        api.post<ApiResponse>(`/presentations/${presentationId}/grade`, data).then((r) => r.data),
}
