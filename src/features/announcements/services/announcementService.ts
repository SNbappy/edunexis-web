import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'
import type { AnnouncementDto, CreateAnnouncementRequest } from '@/types/announcement.types'

export const announcementService = {
    getAll: (courseId: string) =>
        api.get<ApiResponse<AnnouncementDto[]>>(`/courses/${courseId}/announcements`).then((r) => r.data),

    create: (data: CreateAnnouncementRequest) =>
        api.post<ApiResponse<AnnouncementDto>>(`/courses/${data.courseId}/announcements`, data).then((r) => r.data),

    update: (courseId: string, announcementId: string, data: Partial<CreateAnnouncementRequest>) =>
        api.put<ApiResponse<AnnouncementDto>>(`/courses/${courseId}/announcements/${announcementId}`, data).then((r) => r.data),

    delete: (courseId: string, announcementId: string) =>
        api.delete<ApiResponse>(`/courses/${courseId}/announcements/${announcementId}`).then((r) => r.data),

    pin: (courseId: string, announcementId: string) =>
        api.patch<ApiResponse>(`/courses/${courseId}/announcements/${announcementId}/pin`).then((r) => r.data),
}
