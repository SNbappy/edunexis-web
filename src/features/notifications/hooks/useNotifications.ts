import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationService } from '../services/notificationService'

export function useNotifications() {
    const qc = useQueryClient()
    const key = ['notifications']

    const query = useQuery({
        queryKey: key,
        queryFn: async () => {
            const res = await notificationService.getAll()
            if (!res.success) throw new Error(res.message)
            return res.data ?? []
        },
        refetchInterval: 30_000,
        staleTime: 15_000,
    })

    const markReadMutation = useMutation({
        mutationFn: (id: string) => notificationService.markRead(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: key }),
    })

    const markAllReadMutation = useMutation({
        mutationFn: () => notificationService.markAllRead(),
        onSuccess: () => qc.invalidateQueries({ queryKey: key }),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => notificationService.delete(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: key }),
    })

    const notifications = query.data ?? []
    const unreadCount = notifications.filter((n) => !n.isRead).length

    return {
        notifications,
        unreadCount,
        isLoading: query.isLoading,
        markRead: markReadMutation.mutate,
        markAllRead: markAllReadMutation.mutate,
        deleteNotification: deleteMutation.mutate,
    }
}
