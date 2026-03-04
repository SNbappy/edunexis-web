import { useNotifications } from '../hooks/useNotifications'
import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import { formatDistanceToNow } from 'date-fns'

export default function NotificationsPage() {
    const { notifications, unreadCount, isLoading, markAllRead, markRead, deleteNotification } = useNotifications()

    return (
        <div className="max-w-2xl mx-auto space-y-4 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Notifications</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <Button size="sm" variant="secondary"
                        leftIcon={<CheckCheck className="w-4 h-4" />}
                        onClick={() => markAllRead()}>
                        Mark all read
                    </Button>
                )}
            </div>

            {isLoading ? (
                <div className="space-y-2">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-16 rounded-2xl bg-muted animate-pulse" />
                    ))}
                </div>
            ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Bell className="w-10 h-10 text-muted-foreground mb-3 opacity-40" />
                    <p className="text-muted-foreground text-sm">No notifications yet</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {notifications.map(n => (
                        <div key={n.id}
                            className={`flex items-start gap-3 p-4 rounded-2xl border transition-all
                                ${n.isRead
                                    ? 'bg-card border-border opacity-70'
                                    : 'bg-primary/5 border-primary/20'}`}>
                            {!n.isRead && (
                                <span className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />
                            )}
                            <div className="flex-1 min-w-0" onClick={() => !n.isRead && markRead(n.id)}>
                                <p className="text-sm font-medium text-foreground">{n.title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                </p>
                            </div>
                            <button onClick={() => deleteNotification(n.id)}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0">
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
