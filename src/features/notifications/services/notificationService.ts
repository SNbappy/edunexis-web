import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'
import type { NotificationDto } from '@/types/notification.types'

export const notificationService = {
    getAll: () =>
        api.get<ApiResponse<NotificationDto[]>>('/Notifications').then((r) => r.data),

    markRead: (id: string) =>
        api.patch<ApiResponse>(`/Notifications/${id}/read`).then((r) => r.data),

    markAllRead: () =>
        api.patch<ApiResponse>('/Notifications/read-all').then((r) => r.data),

    delete: (id: string) =>
        api.delete<ApiResponse>(`/Notifications/${id}`).then((r) => r.data),
}
