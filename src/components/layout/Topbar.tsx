import { useState, useRef, useEffect } from "react"
import { Search, Menu, Bell, Command, ChevronDown, X, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useAuthStore } from "@/store/authStore"
import { useNotifications } from "@/features/notifications/hooks/useNotifications"
import NotificationsPanel from "@/features/notifications/components/NotificationsPanel"
import Avatar from "@/components/ui/Avatar"
import { ROUTES } from "@/config/constants"

interface TopbarProps { onMenuClick: () => void }

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { user } = useAuthStore()
  const unreadCount = useNotifications()
  const [notifOpen, setNotifOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchVal, setSearchVal] = useState("")
  const [scrolled, setScrolled] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const firstName = user?.profile?.fullName?.split(" ")[0] ?? "there"

  // -- Scroll detection: walks up DOM to find real scrollable container ---------
  useEffect(() => {
    const el = headerRef.current
    if (!el) return

    let parent = el.parentElement
    while (parent && parent !== document.body) {
      const { overflow, overflowY } = window.getComputedStyle(parent)
      if (/auto|scroll/.test(overflow + overflowY)) break
      parent = parent.parentElement
    }
    const scrollTarget = (parent && parent !== document.body) ? parent : window

    const onScroll = () => {
      const top = scrollTarget === window
        ? (scrollTarget as Window).scrollY
        : (scrollTarget as HTMLElement).scrollTop
      setScrolled(top > 10)
    }

    scrollTarget.addEventListener("scroll", onScroll, { passive: true })
    return () => scrollTarget.removeEventListener("scroll", onScroll)
  }, [])

  // -- Cmd+K shortcut ---------------------------------------------------------
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen(true)
        setTimeout(() => searchRef.current?.focus(), 50)
      }
      if (e.key === "Escape") { setSearchOpen(false); setSearchVal("") }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const quickLinks = [
    { label: "Dashboard",     to: ROUTES.DASHBOARD,  color: "#818cf8", emoji: "?" },
    { label: "My Courses",    to: ROUTES.COURSES,    color: "#34d399", emoji: "??" },
    { label: "Notifications", to: "/notifications",  color: "#fbbf24", emoji: "??" },
    { label: "My Profile",    to: ROUTES.PROFILE,    color: "#f472b6", emoji: "??" },
  ]

  const headerStyle = scrolled
    ? {
        background: "rgba(6,10,22,0.75)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(99,102,241,0.12)",
        boxShadow: "0 4px 30px rgba(0,0,0,0.5)",
        transition: "all 0.35s ease",
      }
    : {
        background: "linear-gradient(90deg,rgba(15,20,50,0.96) 0%,rgba(20,18,58,0.94) 50%,rgba(15,20,50,0.96) 100%)",
        backdropFilter: "none",
        WebkitBackdropFilter: "none",
        borderBottom: "1px solid rgba(99,102,241,0.22)",
        boxShadow: "0 2px 32px rgba(79,70,229,0.14), 0 1px 0 rgba(99,102,241,0.15)",
        transition: "all 0.35s ease",
      }

  return (
    <>
      <header
        ref={headerRef}
        className="h-14 flex items-center gap-3 px-4 lg:px-6 shrink-0 relative z-30"
        style={headerStyle}>

        {/* Accent line at very top — only when not scrolled */}
        {!scrolled && (
          <div className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none"
            style={{ background: "linear-gradient(90deg,transparent,rgba(99,102,241,0.7),rgba(139,92,246,0.7),rgba(99,102,241,0.7),transparent)" }} />
        )}

        {/* Mobile menu */}
        <motion.button whileTap={{ scale: 0.9 }} onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl"
          style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
          <Menu style={{ width: 18, height: 18, color: "#818cf8" }} />
        </motion.button>

        {/* Search */}
        <motion.button
          onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 50) }}
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          className="hidden sm:flex items-center gap-2.5 h-9 rounded-xl px-3.5 transition-all"
          style={{
            background: scrolled ? "rgba(99,102,241,0.06)" : "rgba(99,102,241,0.11)",
            border: scrolled ? "1px solid rgba(99,102,241,0.12)" : "1px solid rgba(99,102,241,0.26)",
            width: 220,
          }}>
          <Search style={{ width: 14, height: 14, color: "rgba(129,140,248,0.5)", flexShrink: 0 }} />
          <span className="text-[12.5px] flex-1 text-left select-none" style={{ color: "rgba(129,140,248,0.38)" }}>
            Search anything...
          </span>
          <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md"
            style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.25)" }}>
            <Command style={{ width: 9, height: 9, color: "#818cf8" }} />
            <span className="text-[10px] font-bold" style={{ color: "#818cf8" }}>K</span>
          </div>
        </motion.button>

        {/* Right */}
        <div className="ml-auto flex items-center gap-2">

          {/* Greeting */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{
              background: scrolled ? "rgba(99,102,241,0.07)" : "rgba(99,102,241,0.13)",
              border: scrolled ? "1px solid rgba(99,102,241,0.12)" : "1px solid rgba(99,102,241,0.28)",
              transition: "all 0.35s ease",
            }}>
            <Sparkles style={{ width: 12, height: 12, color: "#fbbf24" }} />
            <span className="text-[12px] font-semibold" style={{ color: "rgba(148,163,184,0.8)" }}>
              Hey, <span style={{ color: "#818cf8" }}>{firstName}</span>
            </span>
          </div>

          <div className="hidden lg:block w-px h-5 mx-1" style={{ background: "rgba(99,102,241,0.15)" }} />

          {/* Bell */}
          <div className="relative">
            <motion.button whileTap={{ scale: 0.92 }} onClick={() => setNotifOpen(o => !o)}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all"
              style={{
                background: notifOpen ? "rgba(99,102,241,0.25)" : scrolled ? "rgba(99,102,241,0.06)" : "rgba(99,102,241,0.12)",
                border: notifOpen ? "1px solid rgba(129,140,248,0.4)" : scrolled ? "1px solid rgba(99,102,241,0.12)" : "1px solid rgba(99,102,241,0.28)",
                boxShadow: notifOpen ? "0 0 16px rgba(99,102,241,0.25)" : "none",
                transition: "all 0.35s ease",
              }}>
              <Bell style={{ width: 16, height: 16, color: notifOpen ? "#818cf8" : "rgba(148,163,184,0.7)" }} strokeWidth={2.5} />
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-0.5 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg,#ef4444,#ec4899)", boxShadow: "0 2px 6px rgba(239,68,68,0.5)" }}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
            <NotificationsPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
          </div>

          <div className="w-px h-5 mx-1" style={{ background: "rgba(99,102,241,0.15)" }} />

          {/* Profile chip */}
          <Link to={ROUTES.PROFILE}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-xl transition-all"
              style={{
                background: scrolled ? "rgba(99,102,241,0.06)" : "rgba(99,102,241,0.12)",
                border: scrolled ? "1px solid rgba(99,102,241,0.12)" : "1px solid rgba(99,102,241,0.28)",
                transition: "all 0.35s ease",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.18)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(129,140,248,0.4)" }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = scrolled ? "rgba(99,102,241,0.06)" : "rgba(99,102,241,0.12)"
                ;(e.currentTarget as HTMLElement).style.borderColor = scrolled ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.28)"
              }}>
              <div className="relative">
                <div className="w-7 h-7 rounded-lg overflow-hidden" style={{ border: "2px solid rgba(99,102,241,0.4)" }}>
                  <Avatar src={user?.profile?.profilePhotoUrl} name={user?.profile?.fullName} size="sm" className="w-full h-full" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                  style={{ background: "#10b981", borderColor: "#060c1d" }} />
              </div>
              <div className="hidden md:block">
                <p className="text-[13px] font-bold leading-tight" style={{ color: "#e2e8f0" }}>
                  {user?.profile?.fullName ?? "User"}
                </p>
                <p className="text-[10.5px] font-semibold leading-tight" style={{ color: "rgba(129,140,248,0.6)" }}>
                  {user?.role}
                </p>
              </div>
              <ChevronDown className="hidden md:block w-3.5 h-3.5 ml-1" style={{ color: "rgba(99,102,241,0.5)" }} strokeWidth={2.5} />
            </motion.div>
          </Link>
        </div>
      </header>

      {/* -- Spotlight Search -- */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setSearchOpen(false); setSearchVal("") }}
              className="fixed inset-0 z-50"
              style={{ background: "rgba(4,8,20,0.75)", backdropFilter: "blur(8px)" }} />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -16 }}
              transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg rounded-2xl overflow-hidden"
              style={{
                background: "linear-gradient(145deg,#0a1428,#070e21)",
                border: "1px solid rgba(99,102,241,0.25)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.7), 0 4px 16px rgba(99,102,241,0.15)",
              }}>
              <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: "1px solid rgba(99,102,241,0.1)" }}>
                <Search style={{ width: 18, height: 18, color: "rgba(129,140,248,0.5)", flexShrink: 0 }} />
                <input ref={searchRef} value={searchVal} onChange={e => setSearchVal(e.target.value)}
                  placeholder="Search courses, assignments, students..."
                  className="flex-1 bg-transparent text-[14px] font-medium outline-none placeholder:text-[rgba(99,102,241,0.3)]"
                  style={{ color: "#e2e8f0" }} />
                {searchVal && (
                  <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => setSearchVal("")}
                    className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(99,102,241,0.15)" }}>
                    <X style={{ width: 11, height: 11, color: "#818cf8" }} />
                  </motion.button>
                )}
                <kbd className="hidden sm:flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold"
                  style={{ background: "rgba(99,102,241,0.1)", color: "rgba(129,140,248,0.5)", border: "1px solid rgba(99,102,241,0.15)" }}>ESC</kbd>
              </div>

              {!searchVal && (
                <div className="px-4 py-4">
                  <p className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: "rgba(99,102,241,0.4)" }}>Quick Links</p>
                  {quickLinks.map(link => (
                    <Link key={link.to} to={link.to} onClick={() => setSearchOpen(false)}>
                      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all mb-0.5"
                        style={{ border: "1px solid transparent" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${link.color}0d`; (e.currentTarget as HTMLElement).style.borderColor = `${link.color}25` }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = "transparent" }}>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ background: `${link.color}12`, border: `1px solid ${link.color}25` }}>
                          <span className="text-[13px]">{link.emoji}</span>
                        </div>
                        <span className="text-[13px] font-semibold" style={{ color: "#cbd5e1" }}>{link.label}</span>
                        <span className="ml-auto text-[11px] font-semibold" style={{ color: link.color }}>Go ?</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3 px-4 py-2.5"
                style={{ borderTop: "1px solid rgba(99,102,241,0.08)", background: "rgba(99,102,241,0.04)" }}>
                <span className="text-[11px]" style={{ color: "rgba(99,102,241,0.4)" }}>
                  Press <kbd className="px-1 py-0.5 rounded text-[10px] font-bold"
                    style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8" }}>ESC</kbd> to close
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

