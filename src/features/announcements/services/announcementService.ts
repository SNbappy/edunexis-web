import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'
import type { AnnouncementDto, CreateAnnouncementRequest } from '@/types/announcement.types'

export const announcementService = {
    getAll: (courseId: string) =>
        api.get<ApiResponse<AnnouncementDto[]>>(
            `/Announcements/courses/${courseId}/announcements`
        ).then((r) => r.data),

    create: (data: CreateAnnouncementRequest) => {
        const form = new FormData()
        form.append('content', data.content)
        if (data.attachment) form.append('attachment', data.attachment)
        return api.post<ApiResponse<AnnouncementDto>>(
            `/Announcements/courses/${data.courseId}/announcements`,
            form,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        ).then((r) => r.data)
    },

    delete: (courseId: string, announcementId: string) =>
        api.delete<ApiResponse>(
            `/Announcements/courses/${courseId}/announcements/${announcementId}`
        ).then((r) => r.data),

    togglePin: (courseId: string, announcementId: string) =>
        api.patch<ApiResponse>(
            `/Announcements/courses/${courseId}/announcements/${announcementId}/pin`
        ).then((r) => r.data),
}
