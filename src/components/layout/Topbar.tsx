import { useState, useRef, useEffect } from "react"
import { Search, Menu, Bell, X, LayoutDashboard, BookOpen, User } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useAuthStore } from "@/store/authStore"
import { useThemeStore } from "@/store/themeStore"
import { useNotifications } from "@/features/notifications/hooks/useNotifications"
import NotificationsPanel from "@/features/notifications/components/NotificationsPanel"
import Avatar from "@/components/ui/Avatar"
import ThemeToggle from "@/components/ui/ThemeToggle"
import { ROUTES } from "@/config/constants"

const SEARCH_LINKS = [
  { label: "Dashboard",     to: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: "Courses",       to: ROUTES.COURSES,   icon: BookOpen        },
  { label: "Notifications", to: "/notifications", icon: Bell            },
  { label: "Profile",       to: ROUTES.PROFILE,   icon: User            },
]

interface Props { onMenuClick: () => void }

export default function Topbar({ onMenuClick }: Props) {
  const { user } = useAuthStore()
  const { dark } = useThemeStore()
  const { unreadCount } = useNotifications()
  const navigate = useNavigate()
  const [notifOpen,  setNotifOpen]  = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchVal,  setSearchVal]  = useState("")
  const [scrolled,   setScrolled]   = useState(false)
  const [bellShake,  setBellShake]  = useState(false)
  const prevUnread = useRef(0)
  const searchRef  = useRef<HTMLInputElement>(null)

  const unread = typeof unreadCount === "number" ? unreadCount : (unreadCount as any)?.unreadCount ?? 0

  useEffect(() => {
    if (unread > prevUnread.current) {
      setBellShake(true)
      setTimeout(() => setBellShake(false), 600)
    }
    prevUnread.current = unread
  }, [unread])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen(p => !p)
      }
      if (e.key === "Escape") { setSearchOpen(false); setNotifOpen(false) }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 80)
  }, [searchOpen])

  useEffect(() => {
    const main = document.querySelector("main")
    if (!main) return
    const onScroll = () => setScrolled(main.scrollTop > 10)
    main.addEventListener("scroll", onScroll, { passive: true })
    return () => main.removeEventListener("scroll", onScroll)
  }, [])

  const filtered = SEARCH_LINKS.filter(l =>
    !searchVal || l.label.toLowerCase().includes(searchVal.toLowerCase())
  )

  const bg = dark ? 'rgba(13,20,38,0.85)' : 'rgba(255,255,255,0.85)'
  const border = dark ? "rgb(38,38,58)"    : "rgb(228,228,238)"
  const shadow = scrolled
    ? dark  ? "0 1px 16px rgba(0,0,0,0.4)"
            : "0 1px 16px rgba(0,0,0,0.07)"
    : "none"

  return (
    <>
      <header
        className="sticky top-0 z-30 flex items-center h-14 px-4 lg:px-6 gap-3 transition-all duration-200"
        style={{ background: bg, borderBottom: `1px solid ${border}`, boxShadow: shadow }}
      >
        {/* Mobile menu */}
        <button onClick={onMenuClick}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
          style={{ color: dark ? "#9ca3af" : "#6b7280" }}
          onMouseEnter={e => (e.currentTarget.style.background = dark ? "rgba(255,255,255,0.07)" : "#f3f4f6")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <Menu style={{ width: 18, height: 18 }} />
        </button>

        {/* Search bar */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          onClick={() => setSearchOpen(true)}
          className="hidden sm:flex items-center gap-2.5 h-9 px-3.5 rounded-xl transition-colors flex-1 max-w-xs text-left"
          style={{
            background: dark ? "rgba(255,255,255,0.05)" : "#f9fafb",
            border:     `1px solid ${dark ? "rgba(255,255,255,0.08)" : "#e5e7eb"}`,
            color:      dark ? "#6b7280" : "#9ca3af",
          }}
        >
          <Search style={{ width: 14, height: 14 }} />
          <span className="text-[13px] font-medium flex-1">Search anything...</span>
          <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md hidden md:block"
            style={{ background: dark ? "rgba(255,255,255,0.08)" : "#f3f4f6", color: dark ? "#6b7280" : "#9ca3af" }}>
            ?K
          </span>
        </motion.button>

        <div className="flex-1" />

        {/* Right actions */}
        <div className="flex items-center gap-2">

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}
            animate={bellShake ? { rotate: [0, -12, 12, -8, 8, 0] } : {}}
            transition={{ duration: 0.5 }}
            onClick={() => setNotifOpen(p => !p)}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors focus-ring"
            style={{
              background: dark ? "rgba(255,255,255,0.05)" : "#f9fafb",
              border:     `1px solid ${dark ? "rgba(255,255,255,0.08)" : "#e5e7eb"}`,
              color:      dark ? "#9ca3af" : "#6b7280",
            }}
          >
            <Bell style={{ width: 16, height: 16 }} strokeWidth={2} />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white font-bold"
                style={{ background: "#ef4444", fontSize: 9 }}>
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </motion.button>

          {/* User avatar */}
          <Link to={ROUTES.PROFILE}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl cursor-pointer transition-colors"
              style={{
                background: dark ? "rgba(255,255,255,0.04)" : "#f9fafb",
                border:     `1px solid ${dark ? "rgba(255,255,255,0.07)" : "#e5e7eb"}`,
              }}
            >
              <Avatar
                src={user?.profile?.profilePhotoUrl ?? undefined}
                name={user?.profile?.fullName ?? user?.email ?? "U"}
                size="xs"
              />
              <div className="hidden md:block">
                <p className="text-[12px] font-semibold leading-none"
                  style={{ color: dark ? "#e5e7eb" : "#111827" }}>
                  {user?.profile?.fullName?.split(" ")[0] ?? "User"}
                </p>
                <p className="text-[10px] mt-0.5"
                  style={{ color: dark ? "#6b7280" : "#9ca3af" }}>
                  {user?.role}
                </p>
              </div>
            </motion.div>
          </Link>
        </div>
      </header>

      {/* Notifications panel */}
      <NotificationsPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />

      {/* Search modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4"
            style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0,   scale: 1    }}
              exit={{    opacity: 0, y: -16,  scale: 0.97 }}
              transition={{ duration: 0.18 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl overflow-hidden"
              style={{
                background: dark ? "rgb(20,20,30)" : "white",
                border:     `1px solid ${dark ? "rgb(38,38,58)" : "#e5e7eb"}`,
                boxShadow:  "0 24px 64px rgba(0,0,0,0.25)",
              }}
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3.5"
                style={{ borderBottom: `1px solid ${dark ? "rgb(38,38,58)" : "#f3f4f6"}` }}>
                <Search style={{ width: 16, height: 16, color: dark ? "#6b7280" : "#9ca3af", flexShrink: 0 }} />
                <input
                  ref={searchRef}
                  value={searchVal}
                  onChange={e => setSearchVal(e.target.value)}
                  placeholder="Search pages, courses, notifications..."
                  className="flex-1 outline-none bg-transparent text-[14px] font-medium"
                  style={{ color: dark ? "#e5e7eb" : "#111827" }}
                />
                <button onClick={() => setSearchOpen(false)}
                  className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors"
                  style={{ background: dark ? "rgba(255,255,255,0.07)" : "#f3f4f6", color: dark ? "#9ca3af" : "#6b7280" }}>
                  <X style={{ width: 12, height: 12 }} />
                </button>
              </div>

              {/* Results */}
              <div className="p-2">
                {filtered.length === 0 ? (
                  <p className="text-center py-8 text-[13px]"
                    style={{ color: dark ? "#6b7280" : "#9ca3af" }}>
                    No results found
                  </p>
                ) : (
                  filtered.map(item => (
                    <button key={item.to}
                      onClick={() => { navigate(item.to); setSearchOpen(false); setSearchVal("") }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left"
                      style={{ color: dark ? "#d1d5db" : "#374151" }}
                      onMouseEnter={e => (e.currentTarget.style.background = dark ? "rgba(255,255,255,0.06)" : "#f9fafb")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: dark ? "rgba(99,102,241,0.15)" : "#eef2ff" }}>
                        <item.icon style={{ width: 15, height: 15, color: "#6366f1" }} />
                      </div>
                      <span className="text-[13.5px] font-medium">{item.label}</span>
                    </button>
                  ))
                )}
              </div>

              {/* Footer hint */}
              <div className="px-4 py-2.5 flex items-center gap-3"
                style={{ borderTop: `1px solid ${dark ? "rgb(38,38,58)" : "#f3f4f6"}` }}>
                <span className="text-[11px]" style={{ color: dark ? "#4b5563" : "#d1d5db" }}>
                  Press <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono"
                    style={{ background: dark ? "rgba(255,255,255,0.08)" : "#f3f4f6", color: dark ? "#9ca3af" : "#6b7280" }}>
                    ESC
                  </kbd> to close
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}


