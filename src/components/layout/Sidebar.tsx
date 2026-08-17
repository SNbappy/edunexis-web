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
import { ICON, ICON_STROKE, FOCUS, MOTION, INK } from "@/components/ui/appTokens"
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
              ? "text-white"
              : "text-teal-100/60 hover:bg-white/[0.07] hover:text-white",
          )}
          title={collapsed ? label : undefined}
        >
          {/* The active state is a filled pill that slides between items,
              rather than a static tint plus a separate rail. One moving
              object is easier to follow than two appearing ones. */}
          {isActive && (
            <motion.span
              layoutId={railId}
              className="absolute inset-0 rounded-xl border border-white/10 bg-white/[0.13] shadow-[inset_0_1px_0_rgb(255_255_255/0.12)]"
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              aria-hidden
            />
          )}

          <span className="relative flex shrink-0 items-center justify-center">
            <Icon
              className={cn(ICON.sm, isActive && "text-teal-300")}
              strokeWidth={ICON_STROKE}
            />
            {badge !== undefined && badge > 0 && (
              <span className="absolute -right-1.5 -top-1.5 inline-flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold leading-none text-white ring-2 ring-teal-950">
                {badge > 9 ? "9+" : badge}
              </span>
            )}
          </span>

          {!collapsed && (
            <span className={cn("relative truncate text-[13.5px]", isActive ? "font-semibold" : "font-medium")}>
              {label}
            </span>
          )}
        </div>
      )}
    </NavLink>
  )
}

function GroupLabel({ children, collapsed }: { children: React.ReactNode; collapsed: boolean }) {
  if (collapsed) return <div aria-hidden className="mx-auto my-2 h-px w-6 bg-white/10" />
  return (
    <p className="px-3 pb-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-teal-300/50">
      {children}
    </p>
  )
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

  /* isTeacher() returns true for admins too (they inherit teaching rights), so
     a plain teacher/student ternary labelled a SuperAdmin as "Teacher". Admin
     is checked first because it is the more specific role. */
  const roleLabel =
    user?.role === "SuperAdmin" ? "Administrator"
      : teacher ? "Teacher"
        : "Student"

  const W = collapsed ? 64 : 244

  return (
    /* Ink rail.
       The sidebar was plain white with grey labels, which read as pale
       next to the brand surfaces it sits beside and gave the app no
       constant identity. Making it the same teal ink frames every screen
       and lets the light content area read as the lit working surface. */
    <motion.aside
      animate={{ width: W }}
      transition={{ duration: MOTION.base, ease: MOTION.ease }}
      className={cn(
        "relative flex h-full shrink-0 flex-col overflow-hidden",
        INK.chrome,
        INK.chromeEdge,
      )}
      style={{ minWidth: W, maxWidth: W }}
    >
      {/* Same 48px grid as the heroes, at half strength so it reads as
          texture rather than pattern at this width. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <Link
        to="/dashboard"
        className={cn(
          "relative flex h-14 shrink-0 items-center border-b border-white/10 transition-colors duration-120 hover:bg-white/[0.06]",
          collapsed ? "justify-center px-0" : "gap-2.5 px-4",
          FOCUS,
        )}
      >
        <BrandMark className="h-6 w-6 shrink-0 text-teal-300" />
        {!collapsed && (
          <span className="font-display text-[16px] font-extrabold tracking-tight text-white">
            EduNexis
          </span>
        )}
      </Link>

      <nav className="relative flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-2.5 py-4">
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

      <div className="relative shrink-0 border-t border-white/10 p-2.5">
        <div
          onClick={() => navigate(ROUTES.PROFILE)}
          className={cn(
            "flex cursor-pointer items-center gap-2.5 rounded-xl p-1.5 transition-colors duration-120 hover:bg-white/[0.07]",
            collapsed && "justify-center",
          )}
          title={collapsed ? user?.profile?.fullName ?? user?.email : undefined}
        >
          <Avatar
            src={user?.profile?.profilePhotoUrl ?? undefined}
            name={user?.profile?.fullName ?? user?.email ?? "U"}
            size="sm"
            className="shrink-0 ring-1 ring-white/20"
          />
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-semibold leading-tight text-white">
                  {user?.profile?.fullName ?? "User"}
                </p>
                <p className="truncate text-[11px] text-teal-100/60">
                  {roleLabel}
                </p>
              </div>
              <button
                onClick={e => { e.stopPropagation(); window.location.replace("/"); clearAuth() }}
                className={cn(
                  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-teal-100/60 transition-colors duration-120 hover:bg-rose-500/20 hover:text-rose-300",
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
            "mt-1 inline-flex h-8 w-full items-center justify-center gap-2 rounded-lg text-teal-100/60 transition-colors duration-120 hover:bg-white/[0.07] hover:text-white",
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
