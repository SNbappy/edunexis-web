import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard, BookOpen, Bell, User, LogOut,
    GraduationCap, ChevronLeft, ChevronRight, Settings,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { ROUTES } from '@/config/constants'
import { authService } from '@/features/auth/services/authService'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import { cn } from '@/utils/cn'
import toast from 'react-hot-toast'
import type { UserRole } from '@/types/auth.types'

const navItems = [
    { to: ROUTES.DASHBOARD, icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', roles: ['Teacher', 'Student', 'Admin', 'SuperAdmin'] },
    { to: ROUTES.COURSES, icon: <BookOpen className="w-5 h-5" />, label: 'Courses', roles: ['Teacher', 'Student', 'Admin', 'SuperAdmin'] },
    { to: '/notifications', icon: <Bell className="w-5 h-5" />, label: 'Notifications', roles: ['Teacher', 'Student'] },
    { to: ROUTES.PROFILE, icon: <User className="w-5 h-5" />, label: 'Profile', roles: ['Teacher', 'Student', 'Admin', 'SuperAdmin'] },
]

interface SidebarProps {
    onClose?: () => void
}

export default function Sidebar({ onClose }: SidebarProps) {
    const { user, clearAuth } = useAuthStore()
    const { sidebarCollapsed, toggleSidebarCollapse } = useUIStore()
    const navigate = useNavigate()

    const handleLogout = async () => {
        try { await authService.logout() } catch { /* ignore */ }
        clearAuth()
        toast.success('Logged out successfully')
        navigate(ROUTES.LOGIN)
    }

    const filtered = navItems.filter((item) =>
        item.roles.includes(user?.role ?? '')
    )

    const roleBadgeMap: Record<UserRole, React.ComponentProps<typeof Badge>['variant']> = {
        SuperAdmin: 'admin', Admin: 'admin', Teacher: 'teacher', Student: 'student',
    }

    return (
        <div className={cn(
            'h-full flex flex-col bg-[rgb(var(--sidebar-bg))] border-r border-border transition-all duration-300',
            sidebarCollapsed ? 'w-16' : 'w-64'
        )}>
            {/* Logo */}
            <div className={cn('flex items-center h-16 px-4 border-b border-border gap-3', sidebarCollapsed && 'justify-center')}>
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                    <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <AnimatePresence>
                    {!sidebarCollapsed && (
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="font-bold text-lg gradient-text"
                        >
                            EduNexis
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            {/* Nav */}
            <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto no-scrollbar">
                {filtered.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={onClose}
                        title={sidebarCollapsed ? item.label : undefined}
                        className={({ isActive }) => cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                            isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                <span className={cn('shrink-0', isActive && 'text-primary')}>{item.icon}</span>
                                <AnimatePresence>
                                    {!sidebarCollapsed && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary"
                                    />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* User section */}
            <div className="p-2 border-t border-border space-y-1">
                {/* Collapse toggle — desktop only */}
                <button
                    onClick={toggleSidebarCollapse}
                    className="hidden lg:flex w-full items-center justify-center gap-2 px-3 py-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all text-sm"
                >
                    {sidebarCollapsed
                        ? <ChevronRight className="w-4 h-4" />
                        : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>}
                </button>

                {/* User info */}
                <div className={cn('flex items-center gap-3 px-3 py-2 rounded-xl', sidebarCollapsed && 'justify-center')}>
                    <Avatar src={user?.profile?.profilePhotoUrl} name={user?.profile?.fullName} size="sm" className="shrink-0" />
                    <AnimatePresence>
                        {!sidebarCollapsed && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{user?.profile?.fullName ?? 'User'}</p>
                                <Badge variant={roleBadgeMap[user?.role ?? 'Student']}>{user?.role}</Badge>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    title={sidebarCollapsed ? 'Logout' : undefined}
                    className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all',
                        sidebarCollapsed && 'justify-center'
                    )}
                >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <AnimatePresence>
                        {!sidebarCollapsed && (
                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                Logout
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>
        </div>
    )
}
