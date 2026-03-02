import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, BellOff, Check, Loader2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import NotificationItem from './NotificationItem'
import { useNotifications } from '../hooks/useNotifications'

interface Props {
    isOpen: boolean
    onClose: () => void
}

export default function NotificationsPanel({ isOpen, onClose }: Props) {
    const { notifications, unreadCount, isLoading, markRead, markAllRead, deleteNotification } = useNotifications()

    // Auto mark all as read after 2s of viewing
    useEffect(() => {
        if (!isOpen || unreadCount === 0) return
        const timer = setTimeout(() => markAllRead(), 2000)
        return () => clearTimeout(timer)
    }, [isOpen])

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={onClose} />

                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 top-full mt-2 w-96 max-h-[80vh] glass-card rounded-2xl shadow-2xl border border-border z-50 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
                            <div className="flex items-center gap-2">
                                <Bell className="w-4 h-4 text-foreground" />
                                <h3 className="font-semibold text-foreground text-sm">Notifications</h3>
                                {unreadCount > 0 && (
                                    <span className="px-1.5 py-0.5 text-xs rounded-full bg-primary text-white font-bold">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    leftIcon={<Check className="w-3.5 h-3.5" />}
                                    onClick={() => markAllRead()}
                                >
                                    Mark all read
                                </Button>
                            )}
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                                        <BellOff className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">All caught up!</p>
                                </div>
                            ) : (
                                <AnimatePresence>
                                    {notifications.map((n) => (
                                        <NotificationItem
                                            key={n.id}
                                            notification={n}
                                            onMarkRead={markRead}
                                            onDelete={deleteNotification}
                                        />
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
