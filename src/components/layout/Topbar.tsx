import { useState, useRef, useEffect } from "react"
import { Search, Menu, Bell, X, LayoutDashboard, BookOpen, User } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useAuthStore } from "@/store/authStore"
import { useNotifications } from "@/features/notifications/hooks/useNotifications"
import NotificationsPanel from "@/features/notifications/components/NotificationsPanel"
import Avatar from "@/components/ui/Avatar"
import ThemeToggle from "@/components/ui/ThemeToggle"
import { ROUTES } from "@/config/constants"
import { cn } from "@/utils/cn"

const SEARCH_LINKS = [
  { label: "Dashboard",     to: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: "Courses",       to: ROUTES.COURSES,   icon: BookOpen        },
  { label: "Notifications", to: "/notifications", icon: Bell            },
  { label: "Profile",       to: ROUTES.PROFILE,   icon: User            },
]

interface Props { onMenuClick: () => void }

export default function Topbar({ onMenuClick }: Props) {
  const { user } = useAuthStore()
  const { badgeCount, markBadgeSeen } = useNotifications()
  const navigate = useNavigate()

  const [notifOpen,  setNotifOpen]  = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchVal,  setSearchVal]  = useState("")
  const [scrolled,   setScrolled]   = useState(false)
  const [bellShake,  setBellShake]  = useState(false)
  const prevBadge  = useRef(0)
  const searchRef  = useRef<HTMLInputElement>(null)

  // Shake bell when badge count rises
  useEffect(() => {
    if (badgeCount > prevBadge.current && prevBadge.current > 0) {
      setBellShake(true)
      const t = setTimeout(() => setBellShake(false), 600)
      return () => clearTimeout(t)
    }
    prevBadge.current = badgeCount
  }, [badgeCount])

  // Mark badge seen when user opens the bell
  useEffect(() => {
    if (notifOpen) markBadgeSeen()
  }, [notifOpen, markBadgeSeen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
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
    const onScroll = () => setScrolled(main.scrollTop > 6)
    main.addEventListener("scroll", onScroll, { passive: true })
    return () => main.removeEventListener("scroll", onScroll)
  }, [])

  const filtered = SEARCH_LINKS.filter(l =>
    !searchVal || l.label.toLowerCase().includes(searchVal.toLowerCase()),
  )

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-30 flex items-center h-16 px-4 lg:px-6 gap-3",
          "bg-background/80 backdrop-blur-md",
          "border-b transition-all duration-180",
          scrolled ? "border-border shadow-sm" : "border-transparent",
        )}
      >
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="lg:hidden h-10 w-10 inline-flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted focus-ring transition-colors"
        >
          <Menu className="h-[18px] w-[18px]" />
        </button>

        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className={cn(
            "group hidden sm:flex items-center gap-3 h-10 px-4 rounded-xl flex-1 max-w-md",
            "bg-muted/70 hover:bg-muted border border-border hover:border-border-strong",
            "text-muted-foreground hover:text-foreground",
            "transition-colors focus-ring text-left",
          )}
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="text-sm flex-1 truncate">Search pages, courses, people…</span>
          <kbd className="hidden md:inline-flex items-center gap-1 h-6 px-1.5 rounded-md border border-border bg-background font-mono text-[10px] font-semibold text-muted-foreground">
            <span>Ctrl</span>
            <span>K</span>
          </kbd>
        </button>

        <div className="flex-1" />

        <div className="flex items-center gap-1.5">
          <ThemeToggle />

          <motion.button
            onClick={() => setNotifOpen(p => !p)}
            aria-label={`Notifications${badgeCount > 0 ? ` (${badgeCount} new)` : ""}`}
            animate={bellShake ? { rotate: [0, -10, 10, -6, 6, 0] } : {}}
            transition={{ duration: 0.5 }}
            className={cn(
              "relative h-10 w-10 inline-flex items-center justify-center rounded-xl",
              "text-muted-foreground hover:text-foreground hover:bg-muted",
              "focus-ring transition-colors",
              notifOpen && "bg-muted text-foreground",
            )}
          >
            <Bell className="h-[18px] w-[18px]" strokeWidth={2} />
            {badgeCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-[16px] px-1 rounded-full bg-destructive text-white text-[10px] font-bold leading-none inline-flex items-center justify-center ring-2 ring-background">
                {badgeCount > 9 ? "9+" : badgeCount}
              </span>
            )}
          </motion.button>

          <Link
            to={ROUTES.PROFILE}
            aria-label="Profile"
            className="h-10 w-10 inline-flex items-center justify-center rounded-xl hover:bg-muted focus-ring transition-colors"
          >
            <Avatar
              src={user?.profile?.profilePhotoUrl ?? undefined}
              name={user?.profile?.fullName ?? user?.email ?? "U"}
              size="sm"
            />
          </Link>
        </div>
      </header>

      <NotificationsPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-[14vh] px-4 bg-foreground/30 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0,   scale: 1    }}
              exit={{    opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-xl rounded-2xl overflow-hidden bg-card border border-border shadow-xl"
            >
              <div className="flex items-center gap-3 px-4 h-14 border-b border-border">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  ref={searchRef}
                  value={searchVal}
                  onChange={e => setSearchVal(e.target.value)}
                  placeholder="Search pages, courses, notifications…"
                  className="flex-1 bg-transparent outline-none text-sm font-medium text-foreground placeholder:text-muted-foreground"
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="h-6 w-6 rounded-md inline-flex items-center justify-center bg-muted hover:bg-subtle text-muted-foreground transition-colors"
                  aria-label="Close"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>

              <div className="p-2 max-h-80 overflow-y-auto">
                {filtered.length === 0 ? (
                  <p className="text-center py-10 text-sm text-muted-foreground">No results for "{searchVal}"</p>
                ) : (
                  filtered.map(item => (
                    <button
                      key={item.to}
                      onClick={() => { navigate(item.to); setSearchOpen(false); setSearchVal("") }}
                      className="w-full flex items-center gap-3 px-3 h-11 rounded-xl text-left text-foreground hover:bg-muted transition-colors"
                    >
                      <div className="h-8 w-8 rounded-lg inline-flex items-center justify-center bg-primary/10 text-primary">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  ))
                )}
              </div>

              <div className="px-4 h-10 flex items-center gap-2 border-t border-border text-[11px] text-muted-foreground">
                <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted font-mono text-[10px] font-semibold">ESC</kbd>
                <span>to close</span>
                <span className="mx-1 text-border">•</span>
                <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted font-mono text-[10px] font-semibold">Enter</kbd>
                <span>to select</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
