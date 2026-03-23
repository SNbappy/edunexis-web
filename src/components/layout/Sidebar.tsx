import { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, BookOpen, Bell, User, LogOut,
  ChevronLeft, ChevronRight, GraduationCap, Settings,
  HelpCircle, Zap, Sparkles
} from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { ROUTES } from "@/config/constants"
import Avatar from "@/components/ui/Avatar"
import { isTeacher } from "@/utils/roleGuard"
import { useNotifications } from "@/features/notifications/hooks/useNotifications"

const NAV_MAIN = [
  { label: "Dashboard",     icon: LayoutDashboard, to: ROUTES.DASHBOARD,     exact: true,  color: "#818cf8", glow: "rgba(129,140,248,0.35)", active: "linear-gradient(135deg,#3730a3,#4f46e5)" },
  { label: "Courses",       icon: BookOpen,        to: ROUTES.COURSES,       exact: false, color: "#34d399", glow: "rgba(52,211,153,0.35)",  active: "linear-gradient(135deg,#065f46,#059669)" },
  { label: "Notifications", icon: Bell,            to: "/notifications",     exact: false, color: "#fbbf24", glow: "rgba(251,191,36,0.35)",  active: "linear-gradient(135deg,#92400e,#d97706)", badge: true },
  { label: "Profile",       icon: User,            to: ROUTES.PROFILE,       exact: false, color: "#f472b6", glow: "rgba(244,114,182,0.35)", active: "linear-gradient(135deg,#9d174d,#ec4899)" },
]
const NAV_BOTTOM = [
  { label: "Settings",      icon: Settings,        to: "/settings",          exact: false, color: "#94a3b8", glow: "rgba(148,163,184,0.2)",  active: "linear-gradient(135deg,#334155,#475569)" },
  { label: "Help & Support",icon: HelpCircle,      to: "/help",              exact: false, color: "#34d399", glow: "rgba(52,211,153,0.2)",   active: "linear-gradient(135deg,#065f46,#059669)" },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, clearAuth } = useAuthStore()
  const unreadCount = useNotifications()
  const navigate = useNavigate()
  const teacher = isTeacher(user?.role ?? "Student")
  const W = collapsed ? 72 : 240

  return (
    <motion.aside
      animate={{ width: W }}
      transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative flex flex-col h-full overflow-hidden shrink-0"
      style={{
        background: "linear-gradient(180deg,#070e21 0%,#060c1d 50%,#050b1a 100%)",
        borderRight: "1px solid rgba(99,102,241,0.12)",
        boxShadow: "4px 0 32px rgba(0,0,0,0.5)",
        minWidth: W, maxWidth: W,
      }}>

      {/* Ambient top glow */}
      <div className="absolute top-0 left-0 right-0 h-40 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 100% 60% at 50% 0%,rgba(79,70,229,0.12) 0%,transparent 70%)" }} />

      {/* -- Brand -- */}
      <div className="flex items-center gap-3 px-4 py-5 shrink-0"
        style={{ borderBottom: "1px solid rgba(99,102,241,0.1)" }}>
        <motion.div whileHover={{ scale: 1.08, rotate: -4 }} whileTap={{ scale: 0.95 }}
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg,#4f46e5,#06b6d4)", boxShadow: "0 4px 20px rgba(79,70,229,0.5)" }}>
          <GraduationCap className="w-5 h-5 text-white" strokeWidth={2.5} />
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <span className="text-[17px] font-extrabold tracking-tight block"
                style={{ background: "linear-gradient(135deg,#818cf8,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                EduNexis
              </span>
              <span className="text-[10px] font-semibold tracking-widest uppercase block" style={{ color: "rgba(129,140,248,0.5)", marginTop: -2 }}>
                Learning Platform
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* -- Role pill -- */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="px-4 pt-3 pb-1">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
              style={{
                background: teacher ? "rgba(79,70,229,0.12)" : "rgba(236,72,153,0.1)",
                border: teacher ? "1px solid rgba(99,102,241,0.2)" : "1px solid rgba(244,114,182,0.2)",
              }}>
              <Zap className="w-3 h-3 shrink-0" style={{ color: teacher ? "#818cf8" : "#f472b6" }} strokeWidth={2.5} />
              <span className="text-[11px] font-bold" style={{ color: teacher ? "#818cf8" : "#f472b6" }}>
                {teacher ? "Teacher Dashboard" : "Student Dashboard"}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* -- Main nav -- */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-3 pt-3 pb-2">
        <AnimatePresence>
          {!collapsed && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-[10px] font-bold tracking-widest uppercase px-2 mb-2"
              style={{ color: "rgba(99,102,241,0.4)" }}>
              Navigation
            </motion.p>
          )}
        </AnimatePresence>

        <nav className="space-y-1">
          {NAV_MAIN.map(item => (
            <NavLink key={item.to} to={item.to} end={item.exact}>
              {({ isActive }) => (
                <motion.div
                  whileHover={{ scale: 1.02, x: collapsed ? 0 : 3 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all duration-150 cursor-pointer overflow-hidden"
                  style={{
                    background: isActive ? item.active : "transparent",
                    boxShadow: isActive ? `0 4px 20px ${item.glow}` : "none",
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.08)" }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent" }}>

                  {isActive && (
                    <motion.div layoutId="navActiveBar"
                      className="absolute left-0 top-2 bottom-2 w-1 rounded-full"
                      style={{ background: "rgba(255,255,255,0.5)" }} />
                  )}

                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-150"
                    style={{
                      background: isActive ? "rgba(255,255,255,0.15)" : `${item.color}18`,
                      border: isActive ? "1px solid rgba(255,255,255,0.2)" : `1px solid ${item.color}30`,
                    }}>
                    <item.icon className="w-4 h-4" style={{ color: isActive ? "#fff" : item.color }} strokeWidth={2.5} />
                  </div>

                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }} transition={{ duration: 0.15 }}
                        className="text-[13.5px] font-semibold flex-1 truncate"
                        style={{ color: isActive ? "#fff" : "rgba(148,163,184,0.8)" }}>
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {item.badge && unreadCount > 0 && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="absolute right-2 top-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg,#ef4444,#ec4899)" }}>
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </motion.span>
                  )}
                </motion.div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Divider */}
        <div className="my-4 mx-2 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(99,102,241,0.15),transparent)" }} />

        <AnimatePresence>
          {!collapsed && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-[10px] font-bold tracking-widest uppercase px-2 mb-2"
              style={{ color: "rgba(99,102,241,0.4)" }}>
              General
            </motion.p>
          )}
        </AnimatePresence>

        <nav className="space-y-1">
          {NAV_BOTTOM.map(item => (
            <NavLink key={item.to} to={item.to} end={item.exact}>
              {({ isActive }) => (
                <motion.div
                  whileHover={{ scale: 1.02, x: collapsed ? 0 : 3 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all duration-150 cursor-pointer"
                  style={{
                    background: isActive ? item.active : "transparent",
                    boxShadow: isActive ? `0 4px 20px ${item.glow}` : "none",
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.08)" }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent" }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: isActive ? "rgba(255,255,255,0.15)" : `${item.color}15`, border: `1px solid ${item.color}25` }}>
                    <item.icon className="w-4 h-4" style={{ color: isActive ? "#fff" : item.color }} strokeWidth={2.5} />
                  </div>
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }} transition={{ duration: 0.15 }}
                        className="text-[13.5px] font-semibold truncate"
                        style={{ color: isActive ? "#fff" : "rgba(148,163,184,0.6)" }}>
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* -- User card -- */}
      <div className="shrink-0 mx-3 mb-3 rounded-2xl p-3 flex items-center gap-3 transition-all duration-200 cursor-pointer"
        style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.12)" }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(99,102,241,0.25)"; (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.12)" }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(99,102,241,0.12)"; (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.07)" }}>
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-xl overflow-hidden" style={{ border: "2px solid rgba(99,102,241,0.3)" }}>
            <Avatar src={user?.profile?.profilePhotoUrl} name={user?.profile?.fullName} size="sm" className="w-full h-full" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
            style={{ background: "#10b981", borderColor: "#060c1d" }} />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }} transition={{ duration: 0.15 }} className="flex-1 min-w-0">
              <p className="text-[13px] font-bold truncate" style={{ color: "#e2e8f0" }}>{user?.profile?.fullName ?? "User"}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: teacher ? "#818cf8" : "#f472b6" }} />
                <span className="text-[11px] font-semibold" style={{ color: teacher ? "#818cf8" : "#f472b6" }}>{user?.role}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {!collapsed && (
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={async () => { clearAuth(); navigate("/login") }}
              whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
              title="Logout">
              <LogOut className="w-3.5 h-3.5" style={{ color: "#ef4444" }} strokeWidth={2.5} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse toggle */}
      <motion.button onClick={() => setCollapsed(c => !c)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
        className="absolute -right-3.5 top-[72px] w-7 h-7 rounded-full flex items-center justify-center z-20"
        style={{ background: "#0a1428", border: "1.5px solid rgba(99,102,241,0.25)", boxShadow: "0 2px 12px rgba(0,0,0,0.4)" }}>
        {collapsed
          ? <ChevronRight className="w-3.5 h-3.5" style={{ color: "#818cf8" }} strokeWidth={2.5} />
          : <ChevronLeft  className="w-3.5 h-3.5" style={{ color: "#818cf8" }} strokeWidth={2.5} />}
      </motion.button>
    </motion.aside>
  )
}


