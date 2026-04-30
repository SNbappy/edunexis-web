import { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  LayoutDashboard, BookOpen, Bell, User, LogOut, Settings,
  ChevronLeft, ChevronRight,
} from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { ROUTES } from "@/config/constants"
import Avatar from "@/components/ui/Avatar"
import { isTeacher } from "@/utils/roleGuard"
import { useNotifications } from "@/features/notifications/hooks/useNotifications"
import { cn } from "@/utils/cn"

const NAV_PRIMARY = [
  { label: "Dashboard", icon: LayoutDashboard, to: ROUTES.DASHBOARD, exact: true },
  { label: "Courses",   icon: BookOpen,        to: ROUTES.COURSES,   exact: false },
]
const NAV_PERSONAL = [
  { label: "Notifications", icon: Bell, to: "/notifications", exact: false, badge: true },
  { label: "Profile",       icon: User,     to: ROUTES.PROFILE,  exact: false },
  { label: "Settings",      icon: Settings, to: ROUTES.SETTINGS, exact: false },
]

function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <path d="M8 12L16 8L24 12L16 16L8 12Z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
      <path d="M11 14V18C11 19.5 13.2 21 16 21C18.8 21 21 19.5 21 18V14" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <circle cx="24" cy="12" r="1.2" fill="white" />
    </svg>
  )
}

function NavItem({
  label, icon: Icon, to, exact, collapsed, badge,
}: {
  label: string; icon: any; to: string; exact?: boolean; collapsed: boolean; badge?: number
}) {
  return (
    <NavLink to={to} end={exact} className="block">
      {({ isActive }) => (
        <div
          className={cn(
            "group relative flex items-center gap-3 h-10 rounded-xl transition-colors",
            collapsed ? "justify-center px-0" : "px-3",
            isActive
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted",
          )}
          title={collapsed ? label : undefined}
        >
          {isActive && !collapsed && (
            <motion.span
              layoutId="sidebar-active-indicator"
              className="absolute left-0 inset-y-2 w-[3px] rounded-r-full bg-primary"
              aria-hidden
            />
          )}

          <div className="relative shrink-0 flex items-center justify-center">
            <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.25 : 1.9} />
            {badge !== undefined && badge > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] px-1 rounded-full bg-destructive text-white text-[9px] font-bold leading-none inline-flex items-center justify-center ring-2 ring-background">
                {badge > 9 ? "9+" : badge}
              </span>
            )}
          </div>

          {!collapsed && (
            <span className="text-sm font-medium truncate">{label}</span>
          )}
        </div>
      )}
    </NavLink>
  )
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, clearAuth } = useAuthStore()
  const { badgeCount } = useNotifications()
  const navigate = useNavigate()
  const teacher = isTeacher(user?.role ?? "Student")

  const W = collapsed ? 68 : 260

  return (
    <motion.aside
      animate={{ width: W }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col h-full shrink-0 bg-card border-r border-border"
      style={{ minWidth: W, maxWidth: W }}
    >
      <div
        className={cn(
          "h-16 flex items-center border-b border-border",
          collapsed ? "justify-center px-0" : "px-5 gap-3",
        )}
      >
        <BrandMark className="h-8 w-8 text-primary shrink-0" />
        {!collapsed && (
          <span className="font-display font-bold text-[17px] tracking-tight text-foreground">
            EduNexis
          </span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-5">
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 pb-1.5 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground/70">
              Learn
            </p>
          )}
          {NAV_PRIMARY.map(item => (
            <NavItem key={item.label} {...item} collapsed={collapsed} />
          ))}
        </div>

        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 pb-1.5 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground/70">
              You
            </p>
          )}
          {NAV_PERSONAL.map(item => (
            <NavItem
              key={item.label}
              {...item}
              collapsed={collapsed}
              badge={item.badge ? badgeCount : undefined}
            />
          ))}
        </div>
      </nav>

      <div className="shrink-0 p-3 border-t border-border space-y-1">
        <div
          onClick={() => navigate(ROUTES.PROFILE)}
          className={cn(
            "flex items-center gap-3 rounded-xl cursor-pointer transition-colors hover:bg-muted",
            collapsed ? "justify-center p-2" : "p-2",
          )}
          title={collapsed ? user?.profile?.fullName ?? user?.email : undefined}
        >
          <Avatar
            src={user?.profile?.profilePhotoUrl ?? undefined}
            name={user?.profile?.fullName ?? user?.email ?? "U"}
            size="sm"
            className="shrink-0"
          />
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate leading-tight">
                  {user?.profile?.fullName ?? "User"}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {teacher ? "Teacher" : "Student"}
                </p>
              </div>
              <button
                onClick={e => { e.stopPropagation(); clearAuth(); navigate(ROUTES.LOGIN) }}
                className="h-7 w-7 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive-soft transition-colors shrink-0"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => setCollapsed(p => !p)}
          className="w-full h-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed
            ? <ChevronRight className="h-3.5 w-3.5" />
            : <ChevronLeft  className="h-3.5 w-3.5" />
          }
        </button>
      </div>
    </motion.aside>
  )
}
