import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'
import type { CTEventDto, CreateCTEventRequest, GradeCTRequest } from '@/types/ct.types'

export const ctService = {
    create: (courseId: string, data: CreateCTEventRequest) =>
        api.post<ApiResponse<CTEventDto>>(`/ct/courses/${courseId}/events`, data).then((r) => r.data),

    uploadCopies: (ctEventId: string, formData: FormData) =>
        api.post<ApiResponse>(`/ct/events/${ctEventId}/upload-copies`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }).then((r) => r.data),

    grade: (ctEventId: string, data: GradeCTRequest) =>
        api.post<ApiResponse>(`/ct/events/${ctEventId}/grade`, data).then((r) => r.data),
}
