import { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import {
  LayoutDashboard, BookOpen, Bell, User, LogOut,
  ChevronLeft, ChevronRight, GraduationCap,
  Settings, HelpCircle,
} from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { useThemeStore } from "@/store/themeStore"
import { ROUTES } from "@/config/constants"
import Avatar from "@/components/ui/Avatar"
import { isTeacher } from "@/utils/roleGuard"
import { useNotifications } from "@/features/notifications/hooks/useNotifications"

const NAV = [
  { label: "Dashboard",     icon: LayoutDashboard, to: ROUTES.DASHBOARD, exact: true,  color: "#818cf8", lightColor: "#6366f1", lightBg: "#eef2ff", darkBg: "rgba(99,102,241,0.18)"  },
  { label: "Courses",       icon: BookOpen,        to: ROUTES.COURSES,   exact: false, color: "#34d3f5", lightColor: "#0891b2", lightBg: "#ecfeff", darkBg: "rgba(6,182,212,0.18)"   },
  { label: "Notifications", icon: Bell,            to: "/notifications", exact: false, color: "#fbbf24", lightColor: "#d97706", lightBg: "#fffbeb", darkBg: "rgba(251,191,36,0.15)",  badge: true },
  { label: "Profile",       icon: User,            to: ROUTES.PROFILE,   exact: false, color: "#f472b6", lightColor: "#db2777", lightBg: "#fdf2f8", darkBg: "rgba(244,114,182,0.15)" },
]
const NAV_BOTTOM = [
  { label: "Settings", icon: Settings,   to: "/settings" },
  { label: "Help",     icon: HelpCircle, to: "/help"     },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, clearAuth } = useAuthStore()
  const { dark } = useThemeStore()
  const unreadCount = useNotifications()
  const navigate = useNavigate()
  const teacher = isTeacher(user?.role ?? "Student")
  const W = collapsed ? 64 : 232

  const unread = typeof unreadCount === "number"
    ? unreadCount
    : (unreadCount as any)?.unreadCount ?? 0

  // Navy dark theme colors
  const bg = dark ? 'rgba(13,20,38,0.9)' : 'rgba(255,255,255,0.92)'
  const border     = dark ? "rgba(99,102,241,0.15)" : "#e5e7eb"
  const divider    = dark ? "rgba(99,102,241,0.1)"  : "#f3f4f6"
  const textMain   = dark ? "#e2e8f8"               : "#111827"
  const textMuted  = dark ? "#6b7fb8"               : "#9ca3af"
  const labelColor = dark ? "rgba(99,102,241,0.45)" : "#d1d5db"
  const hoverBg    = dark ? "rgba(99,102,241,0.08)" : "#f9fafb"

  return (
    <motion.aside
      animate={{ width: W }}
      transition={{ duration: 0.22, ease: [0.25,0.46,0.45,0.94] }}
      className="relative flex flex-col h-full overflow-hidden shrink-0"
      style={{ background: bg, borderRight: `1px solid ${border}`, minWidth: W, maxWidth: W }}
    >
      {/* Subtle top glow in dark mode */}
      {dark && (
        <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 100% 60% at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 70%)" }} />
      )}

      {/* Brand */}
      <div className="flex items-center gap-3 px-4 h-14 shrink-0 relative"
        style={{ borderBottom: `1px solid ${divider}` }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg,#6366f1,#06b6d4)", boxShadow: "0 2px 10px rgba(99,102,241,0.4)" }}>
          <GraduationCap className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }} transition={{ duration: 0.15 }}>
              <p className="text-[15px] font-bold tracking-tight leading-none" style={{ color: textMain }}>
                EduNexis
              </p>
              <p className="text-[10px] font-semibold mt-0.5" style={{ color: textMuted, letterSpacing: "0.1em" }}>
                LEARNING PLATFORM
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Role badge */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} className="px-3 pt-3">
            <div className="px-3 py-1.5 rounded-lg flex items-center gap-2" style={{
              background: teacher
                ? (dark ? "rgba(99,102,241,0.15)" : "#eef2ff")
                : (dark ? "rgba(244,114,182,0.12)" : "#fdf2f8"),
              border: teacher
                ? (dark ? "1px solid rgba(99,102,241,0.3)" : "1px solid #c7d2fe")
                : (dark ? "1px solid rgba(244,114,182,0.25)" : "1px solid #fbcfe8"),
            }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: teacher ? "#818cf8" : "#f472b6" }} />
              <span className="text-[11px] font-semibold"
                style={{ color: teacher ? (dark ? "#a5b4fc" : "#4f46e5") : (dark ? "#f9a8d4" : "#be185d") }}>
                {teacher ? "Teacher Dashboard" : "Student Dashboard"}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav label */}
      <AnimatePresence>
        {!collapsed && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="px-4 pt-5 pb-1.5 text-[10px] font-bold tracking-widest uppercase"
            style={{ color: labelColor }}>
            Navigation
          </motion.p>
        )}
      </AnimatePresence>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-1 space-y-0.5">
        {NAV.map(item => (
          <NavLink key={item.label} to={item.to} end={item.exact}>
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: collapsed ? 0 : 2 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer relative"
                style={{ background: isActive ? (dark ? item.darkBg : item.lightBg) : "transparent" }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = hoverBg }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent" }}
              >
                {isActive && (
                  <motion.div layoutId="nav-pill"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full"
                    style={{ background: dark ? item.color : item.lightColor }} />
                )}
                <div className="relative shrink-0">
                  <item.icon
                    style={{ width: 18, height: 18, color: isActive ? (dark ? item.color : item.lightColor) : textMuted }}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {item.badge && unread > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ background: "#ef4444", fontSize: 9 }}>
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </div>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-[13.5px] font-medium whitespace-nowrap"
                      style={{ color: isActive ? (dark ? item.color : item.lightColor) : (dark ? "#94a3cc" : "#6b7280") }}>
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </NavLink>
        ))}

        <div className="mx-2 my-2" style={{ borderTop: `1px solid ${divider}` }} />

        {NAV_BOTTOM.map(item => (
          <NavLink key={item.label} to={item.to}>
            {({ isActive }) => (
              <motion.div whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer"
                style={{ color: isActive ? "#818cf8" : textMuted }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = hoverBg}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                <item.icon style={{ width: 17, height: 17 }} strokeWidth={2} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-[13px] font-medium whitespace-nowrap">
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="shrink-0 p-3" style={{ borderTop: `1px solid ${divider}` }}>
        <motion.div
          className="flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer transition-colors"
          style={{ color: textMain }}
          onClick={() => navigate(ROUTES.PROFILE)}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = hoverBg}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
        >
          <Avatar
            src={user?.profile?.profilePhotoUrl ?? undefined}
            name={user?.profile?.fullName ?? user?.email ?? "U"}
            size="sm" className="shrink-0"
          />
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold truncate leading-none" style={{ color: textMain }}>
                  {user?.profile?.fullName ?? "User"}
                </p>
                <p className="text-[11px] mt-0.5 truncate" style={{ color: textMuted }}>
                  {user?.email}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {!collapsed && (
              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={e => { e.stopPropagation(); clearAuth(); navigate(ROUTES.LOGIN) }}
                className="p-1.5 rounded-lg shrink-0 transition-all"
                style={{ color: textMuted }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.color = "#ef4444"
                  ;(e.currentTarget as HTMLElement).style.background = dark ? "rgba(239,68,68,0.12)" : "#fef2f2"
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.color = textMuted
                  ;(e.currentTarget as HTMLElement).style.background = "transparent"
                }}
                title="Logout"
              >
                <LogOut style={{ width: 14, height: 14 }} />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setCollapsed(p => !p)}
          className="w-full flex items-center justify-center mt-1 py-1.5 rounded-xl transition-colors"
          style={{ color: textMuted }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = hoverBg}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
        >
          {collapsed
            ? <ChevronRight style={{ width: 14, height: 14 }} />
            : <ChevronLeft  style={{ width: 14, height: 14 }} />
          }
        </motion.button>
      </div>
    </motion.aside>
  )
}

