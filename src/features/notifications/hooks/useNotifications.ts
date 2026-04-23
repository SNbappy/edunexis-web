import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { notificationService } from "../services/notificationService"
import { useNotificationBadge } from "@/store/notificationBadgeStore"

export function useNotifications() {
  const qc  = useQueryClient()
  const key = ["notifications"]

  // Subscribe directly — any update triggers re-render
  const badgeSeenAt    = useNotificationBadge((s) => s.badgeSeenAt)
  const markBadgeSeen  = useNotificationBadge((s) => s.markBadgeSeen)

  const query = useQuery({
    queryKey: key,
    queryFn: async () => {
      const res = await notificationService.getAll()
      if (!res.success) throw new Error(res.message)
      return res.data ?? []
    },
    refetchInterval: 5_000,
    refetchOnWindowFocus: true,
    staleTime: 2_000,
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

  // Total unread — drives the CARD styling inside panels/pages
  const unreadCount = notifications.filter((n: any) => !n.isRead).length

  // Badge count — drives the RED DOT on bell/sidebar. Resets to 0 when
  // user opens the bell. Reappears when new notifications arrive.
  const badgeCount = notifications.filter((n: any) => {
    if (n.isRead) return false
    const createdMs = serverDateToMs(n.createdAt)
    return createdMs > badgeSeenAt
  }).length

  return {
    notifications,
    unreadCount,    // for card styling + page header
    badgeCount,     // for bell/sidebar red dot
    markBadgeSeen,  // call when user opens bell or notif page
    isLoading: query.isLoading,
    markRead:           markReadMutation.mutate,
    markAllRead:        markAllReadMutation.mutate,
    deleteNotification: deleteMutation.mutate,
  }
}


