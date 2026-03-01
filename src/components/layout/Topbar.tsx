import { Bell, Search, Menu } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'
import ThemeToggle from '@/components/ui/ThemeToggle'
import Avatar from '@/components/ui/Avatar'
import { ROUTES } from '@/config/constants'

interface TopbarProps {
    onMenuClick: () => void
}

export default function Topbar({ onMenuClick }: TopbarProps) {
    const { user } = useAuthStore()
    const { unreadCount } = useNotificationStore()

    return (
        <header className="h-16 bg-[rgb(var(--topbar-bg))] border-b border-border flex items-center gap-4 px-4 lg:px-6">
            {/* Mobile menu button */}
            <button
                onClick={onMenuClick}
                className="lg:hidden p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Search */}
            <div className="flex-1 max-w-sm hidden sm:flex items-center gap-2 h-9 rounded-xl border border-border bg-muted px-3 text-muted-foreground hover:border-primary/40 transition-colors cursor-text">
                <Search className="w-4 h-4 shrink-0" />
                <span className="text-sm">Search courses, assignments...</span>
            </div>

            <div className="ml-auto flex items-center gap-2">
                {/* Theme toggle */}
                <ThemeToggle compact />

                {/* Notifications */}
                <Link
                    to="/notifications"
                    className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-white text-xs flex items-center justify-center font-bold">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Link>

                {/* Profile */}
                <Link to={ROUTES.PROFILE} className="flex items-center gap-2 pl-2">
                    <Avatar src={user?.profile?.profilePhotoUrl} name={user?.profile?.fullName} size="sm" />
                    <div className="hidden md:block text-left">
                        <p className="text-sm font-medium text-foreground leading-tight">{user?.profile?.fullName ?? 'User'}</p>
                        <p className="text-xs text-muted-foreground">{user?.role}</p>
                    </div>
                </Link>
            </div>
        </header>
    )
}
