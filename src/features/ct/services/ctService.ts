import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'
import type {
    CTEventDto, CTResultDto,
    CreateCTEventRequest, SaveCTMarksRequest,
} from '@/types/ct.types'

export const ctService = {
    getAll: (courseId: string) =>
        api.get<ApiResponse<CTEventDto[]>>(`/courses/${courseId}/ct-events`).then((r) => r.data),

    getById: (courseId: string, ctId: string) =>
        api.get<ApiResponse<CTEventDto>>(`/courses/${courseId}/ct-events/${ctId}`).then((r) => r.data),

    create: (data: CreateCTEventRequest) =>
        api.post<ApiResponse<CTEventDto>>(`/courses/${data.courseId}/ct-events`, data).then((r) => r.data),

    update: (courseId: string, ctId: string, data: Partial<CreateCTEventRequest>) =>
        api.put<ApiResponse<CTEventDto>>(`/courses/${courseId}/ct-events/${ctId}`, data).then((r) => r.data),

    delete: (courseId: string, ctId: string) =>
        api.delete<ApiResponse>(`/courses/${courseId}/ct-events/${ctId}`).then((r) => r.data),

    updateStatus: (courseId: string, ctId: string, status: string) =>
        api.patch<ApiResponse<CTEventDto>>(`/courses/${courseId}/ct-events/${ctId}/status`, { status }).then((r) => r.data),

    getResults: (courseId: string, ctId: string) =>
        api.get<ApiResponse<CTResultDto[]>>(`/courses/${courseId}/ct-events/${ctId}/results`).then((r) => r.data),

    saveMarks: (courseId: string, ctId: string, data: SaveCTMarksRequest) =>
        api.post<ApiResponse<CTResultDto[]>>(`/courses/${courseId}/ct-events/${ctId}/marks`, data).then((r) => r.data),
}
