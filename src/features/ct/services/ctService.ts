import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'
import type {
    CTEventDto,
    CTMarksResultDto,
    CreateCTEventRequest,
    UpdateCTEventRequest,
    GradeCTRequest,
} from '@/types/ct.types'

const base = (courseId: string) => '/ct/courses/' + courseId + '/events'
const evt  = (ctEventId: string) => '/ct/events/' + ctEventId

export const ctService = {
    getAll: (courseId: string) =>
        api.get<ApiResponse<CTEventDto[]>>(base(courseId)).then(r => r.data),

    create: (courseId: string, data: CreateCTEventRequest) =>
        api.post<ApiResponse<CTEventDto>>(base(courseId), data).then(r => r.data),

    update: (ctEventId: string, data: UpdateCTEventRequest) =>
        api.put<ApiResponse<CTEventDto>>(evt(ctEventId), data).then(r => r.data),

    delete: (ctEventId: string) =>
        api.delete<ApiResponse>(evt(ctEventId)).then(r => r.data),

    getMarks: (ctEventId: string) =>
        api.get<ApiResponse<CTMarksResultDto>>(evt(ctEventId) + '/marks').then(r => r.data),

    uploadKhata: (ctEventId: string, formData: FormData) =>
        api.postForm<ApiResponse>(evt(ctEventId) + '/upload-khata', formData).then(r => r.data),

    grade: (ctEventId: string, data: GradeCTRequest) =>
        api.post<ApiResponse>(evt(ctEventId) + '/grade', data).then(r => r.data),

    publish: (ctEventId: string) =>
        api.post<ApiResponse>(evt(ctEventId) + '/publish').then(r => r.data),

    unpublish: (ctEventId: string) =>
        api.post<ApiResponse>(evt(ctEventId) + '/unpublish').then(r => r.data),
}








