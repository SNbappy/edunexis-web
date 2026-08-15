import { useState } from "react"
import { NavLink, Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboard, BookOpen, Bell, User, LogOut, Settings,
  PanelLeftClose, PanelLeft, Shield,
} from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { ROUTES } from "@/config/constants"
import Avatar from "@/components/ui/Avatar"
import BrandMark from "@/components/ui/BrandMark"
import { isTeacher, isAdmin } from "@/utils/roleGuard"
import { useNotifications } from "@/features/notifications/hooks/useNotifications"
import { ICON, ICON_STROKE, FOCUS, MOTION, TEXT } from "@/components/ui/appTokens"
import { cn } from "@/utils/cn"

const NAV_PRIMARY = [
  { label: "Dashboard", icon: LayoutDashboard, to: ROUTES.DASHBOARD, exact: true },
  { label: "Courses",   icon: BookOpen,        to: ROUTES.COURSES,   exact: false },
]
const NAV_PERSONAL = [
  { label: "Notifications", icon: Bell,     to: "/notifications", exact: false, badge: true },
  { label: "Profile",       icon: User,     to: ROUTES.PROFILE,   exact: false },
  { label: "Settings",      icon: Settings, to: ROUTES.SETTINGS,  exact: false },
]

/**
 * Sidebar.
 *
 * Rebuilt on the shared app tokens. Previously it mixed several icon sizes and
 * stroke weights and leaned on a tinted "pill" for the active row; now every
 * icon is one size at one weight, and the active state is carried by a single
 * rail plus a weight change — quieter, and it reads instantly.
 */
function NavItem({
  label, icon: Icon, to, exact, collapsed, badge, onItemClick, railId,
}: {
  label: string
  icon: LucideIcon
  to: string
  exact?: boolean
  collapsed: boolean
  badge?: number
  onItemClick?: () => void
  /** Scopes the sliding active rail to one sidebar instance — the desktop rail
   *  and the mobile drawer are both mounted, and a shared layoutId would make
   *  Framer animate the indicator between the two. */
  railId: string
}) {
  return (
    <NavLink to={to} end={exact} onClick={onItemClick} className={cn("block rounded-lg", FOCUS)}>
      {({ isActive }) => (
        <div
          className={cn(
            "group relative flex h-9 items-center gap-2.5 rounded-xl transition-colors duration-120",
            collapsed ? "justify-center px-0" : "pl-3 pr-2.5",
            isActive
              ? "bg-primary/10 text-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
          title={collapsed ? label : undefined}
        >
          {isActive && (
            <motion.span
              layoutId={railId}
              className="absolute inset-y-1.5 left-0 w-[3px] rounded-r-full bg-primary"
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              aria-hidden
            />
          )}

          <span className="relative flex shrink-0 items-center justify-center">
            <Icon
              className={cn(ICON.sm, isActive && "text-primary")}
              strokeWidth={ICON_STROKE}
            />
            {badge !== undefined && badge > 0 && (
              <span className="absolute -right-1.5 -top-1.5 inline-flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold leading-none text-white ring-2 ring-card">
                {badge > 9 ? "9+" : badge}
              </span>
            )}
          </span>

          {!collapsed && (
            <span className={cn("truncate text-[13.5px]", isActive ? "font-semibold" : "font-medium")}>
              {label}
            </span>
          )}
        </div>
      )}
    </NavLink>
  )
}

function GroupLabel({ children, collapsed }: { children: React.ReactNode; collapsed: boolean }) {
  if (collapsed) return <div aria-hidden className="mx-auto my-2 h-px w-6 bg-border" />
  return <p className={cn(TEXT.eyebrow, "px-3 pb-1.5")}>{children}</p>
}

export default function Sidebar({ onItemClick }: { onItemClick?: () => void } = {}) {
  // `onItemClick` is only passed by MobileSidebar, so it doubles as "am I the
  // drawer?" — the drawer is never collapsible and needs its own rail id.
  const drawer = Boolean(onItemClick)
  const railId = drawer ? "sidebar-rail-drawer" : "sidebar-rail"

  const [collapsed, setCollapsed] = useState(false)
  const { user, clearAuth } = useAuthStore()
  const { badgeCount } = useNotifications()
  const navigate = useNavigate()
  const teacher = isTeacher(user?.role ?? "Student")
  const admin = isAdmin(user?.role ?? "Student")

  const W = collapsed ? 64 : 244

  return (
    <motion.aside
      animate={{ width: W }}
      transition={{ duration: MOTION.base, ease: MOTION.ease }}
      className="relative flex h-full shrink-0 flex-col border-r border-border bg-card"
      style={{ minWidth: W, maxWidth: W }}
    >
      {/* brand — same lockup proportions as the public navbar */}
      <Link
        to="/dashboard"
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-border transition-colors hover:bg-muted/60",
          collapsed ? "justify-center px-0" : "gap-2.5 px-4",
          FOCUS,
        )}
      >
        <BrandMark className="h-6 w-6 shrink-0 text-primary" />
        {!collapsed && (
          <span className="font-display text-[16px] font-extrabold tracking-tight text-foreground">
            EduNexis
          </span>
        )}
      </Link>

      <nav className="flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-2.5 py-4">
        <div className="space-y-0.5">
          <GroupLabel collapsed={collapsed}>Learn</GroupLabel>
          {NAV_PRIMARY.map(item => (
            <NavItem key={item.label} {...item} collapsed={collapsed} onItemClick={onItemClick} railId={railId} />
          ))}
        </div>

        <div className="space-y-0.5">
          <GroupLabel collapsed={collapsed}>You</GroupLabel>
          {NAV_PERSONAL.map(item => (
            <NavItem
              key={item.label}
              {...item}
              collapsed={collapsed}
              badge={item.badge ? badgeCount : undefined}
              onItemClick={onItemClick}
              railId={railId}
            />
          ))}
        </div>

        {admin && (
          <div className="space-y-0.5">
            <GroupLabel collapsed={collapsed}>Admin</GroupLabel>
            <NavItem
              label="Admin"
              icon={Shield}
              to="/admin"
              exact={false}
              collapsed={collapsed}
              onItemClick={onItemClick}
              railId={railId}
            />
          </div>
        )}
      </nav>

      <div className="shrink-0 border-t border-border p-2.5">
        <div
          onClick={() => navigate(ROUTES.PROFILE)}
          className={cn(
            "flex cursor-pointer items-center gap-2.5 rounded-xl p-1.5 transition-colors duration-120 hover:bg-muted",
            collapsed && "justify-center",
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
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-semibold leading-tight text-foreground">
                  {user?.profile?.fullName ?? "User"}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {teacher ? "Teacher" : "Student"}
                </p>
              </div>
              <button
                onClick={e => { e.stopPropagation(); window.location.replace("/"); clearAuth() }}
                className={cn(
                  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-120 hover:bg-destructive-soft hover:text-destructive",
                  FOCUS,
                )}
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className={ICON.xs} strokeWidth={ICON_STROKE} />
              </button>
            </>
          )}
        </div>

        {!drawer && (
        <button
          onClick={() => setCollapsed(p => !p)}
          className={cn(
            "mt-1 inline-flex h-8 w-full items-center justify-center gap-2 rounded-lg text-muted-foreground transition-colors duration-120 hover:bg-muted hover:text-foreground",
            FOCUS,
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed
            ? <PanelLeft className={ICON.sm} strokeWidth={ICON_STROKE} />
            : <>
                <PanelLeftClose className={ICON.sm} strokeWidth={ICON_STROKE} />
                <span className="text-[12px] font-medium">Collapse</span>
              </>
          }
        </button>
        )}
      </div>
    </motion.aside>
  )
}
