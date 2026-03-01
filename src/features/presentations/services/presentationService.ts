import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'
import type {
    PresentationDto, PresentationResultDto,
    CreatePresentationRequest, SavePresentationMarksRequest,
} from '@/types/presentation.types'

export const presentationService = {
    getAll: (courseId: string) =>
        api.get<ApiResponse<PresentationDto[]>>(`/courses/${courseId}/presentations`).then((r) => r.data),

    create: (data: CreatePresentationRequest) =>
        api.post<ApiResponse<PresentationDto>>(`/courses/${data.courseId}/presentations`, data).then((r) => r.data),

    update: (courseId: string, id: string, data: Partial<CreatePresentationRequest>) =>
        api.put<ApiResponse<PresentationDto>>(`/courses/${courseId}/presentations/${id}`, data).then((r) => r.data),

    delete: (courseId: string, id: string) =>
        api.delete<ApiResponse>(`/courses/${courseId}/presentations/${id}`).then((r) => r.data),

    updateStatus: (courseId: string, id: string, status: string) =>
        api.patch<ApiResponse<PresentationDto>>(`/courses/${courseId}/presentations/${id}/status`, { status }).then((r) => r.data),

    getResults: (courseId: string, id: string) =>
        api.get<ApiResponse<PresentationResultDto[]>>(`/courses/${courseId}/presentations/${id}/results`).then((r) => r.data),

    saveMarks: (courseId: string, id: string, data: SavePresentationMarksRequest) =>
        api.post<ApiResponse<PresentationResultDto[]>>(`/courses/${courseId}/presentations/${id}/marks`, data).then((r) => r.data),
}
