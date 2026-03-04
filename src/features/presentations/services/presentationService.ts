import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'
import type {
    PresentationDto,
    PresentationResultDto,
    CreatePresentationRequest,
    SavePresentationMarksRequest,
    GradePresentationRequest,
    UpdatePresentationStatusRequest,
} from '@/types/presentation.types'

const course = (courseId: string) => `/courses/${courseId}`
const pres   = (presentationId: string) => `/presentations/${presentationId}`

export const presentationService = {
    getAll: (courseId: string) =>
        api.get<ApiResponse<PresentationDto[]>>(`${course(courseId)}/presentations`).then(r => r.data),

    create: (courseId: string, data: CreatePresentationRequest) =>
        api.post<ApiResponse<PresentationDto>>(`${course(courseId)}/presentations`, data).then(r => r.data),

    getResults: (presentationId: string) =>
        api.get<ApiResponse<PresentationResultDto[]>>(`${pres(presentationId)}/results`).then(r => r.data),

    saveMarks: (presentationId: string, data: SavePresentationMarksRequest) =>
        api.post<ApiResponse>(`${pres(presentationId)}/marks`, data).then(r => r.data),

    updateStatus: (presentationId: string, data: UpdatePresentationStatusRequest) =>
        api.patch<ApiResponse>(`${pres(presentationId)}/status`, data).then(r => r.data),

    delete: (presentationId: string) =>
        api.delete<ApiResponse>(`${pres(presentationId)}`).then(r => r.data),

    grade: (presentationId: string, data: GradePresentationRequest) =>
        api.post<ApiResponse>(`${pres(presentationId)}/grade`, data).then(r => r.data),
}
