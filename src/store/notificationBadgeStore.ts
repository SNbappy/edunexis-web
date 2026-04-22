import { create } from "zustand"
import { persist } from "zustand/middleware"

/**
 * Tracks when the user last acknowledged seeing the notification badge.
 * This is distinct from `isRead` on individual notifications — it only
 * controls whether the red badge on the bell/sidebar is visible.
 *
 * When the user opens the bell panel or visits the notifications page,
 * call markBadgeSeen(). The badge count will reset to 0 until a new
 * notification arrives (i.e., one with createdAt > badgeSeenAt).
 *
 * Individual notification `isRead` status is managed separately and only
 * changes when the user explicitly clicks a card or marks it read.
 */
interface NotificationBadgeState {
  badgeSeenAt:    number
  markBadgeSeen:  () => void
}

export const useNotificationBadge = create<NotificationBadgeState>()(
  persist(
    (set) => ({
      badgeSeenAt:   0,
      markBadgeSeen: () => set({ badgeSeenAt: Date.now() }),
    }),
    { name: "edunexis-notification-badge" },
  ),
)
