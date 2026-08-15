import { useState, useRef, useEffect } from "react"
import { Search, Menu, Bell, X, LayoutDashboard, BookOpen, User, Globe, LogOut, Settings } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useAuthStore } from "@/store/authStore"
import { useNotifications } from "@/features/notifications/hooks/useNotifications"
import NotificationsPanel from "@/features/notifications/components/NotificationsPanel"
import Avatar from "@/components/ui/Avatar"
import ThemeToggle from "@/components/ui/ThemeToggle"
import { ROUTES } from "@/config/constants"
import { ICON, ICON_STROKE, FOCUS, MOTION, SURFACE, TEXT } from "@/components/ui/appTokens"
import { cn } from "@/utils/cn"

const SEARCH_LINKS = [
  { label: "Dashboard",     to: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: "Courses",       to: ROUTES.COURSES,   icon: BookOpen        },
  { label: "Notifications", to: "/notifications", icon: Bell            },
  { label: "Profile",       to: ROUTES.PROFILE,   icon: User            },
]

/** Icon buttons in the bar: one size, one shape, one hover. */
const BAR_BUTTON =
  "relative inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors duration-120 hover:bg-muted hover:text-foreground"

interface Props { onMenuClick: () => void }

export default function Topbar({ onMenuClick }: Props) {
  const { user, clearAuth } = useAuthStore()
  const { badgeCount, markBadgeSeen } = useNotifications()
  const navigate = useNavigate()

  const [notifOpen,  setNotifOpen]  = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchVal,  setSearchVal]  = useState("")
  const [scrolled,   setScrolled]   = useState(false)
  const [bellShake,  setBellShake]  = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
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
      if (e.key === "Escape") { setSearchOpen(false); setNotifOpen(false); setProfileMenuOpen(false) }
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
          "sticky top-0 z-30 flex h-14 items-center gap-2 px-3 lg:px-5",
          "bg-background/85 backdrop-blur-md",
          "border-b transition-colors duration-180",
          scrolled ? "border-border" : "border-transparent",
        )}
      >
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className={cn(BAR_BUTTON, FOCUS, "lg:hidden")}
        >
          <Menu className={ICON.md} strokeWidth={ICON_STROKE} />
        </button>

        {/* Search reads as a field, not a button — but it is one, because the
            real search lives in the ⌘K palette below. */}
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className={cn(
            "hidden h-9 max-w-sm flex-1 items-center gap-2.5 rounded-xl px-3 sm:flex",
            "border border-border bg-muted/60 text-muted-foreground",
            "text-left transition-colors duration-120 hover:border-border-strong hover:bg-muted",
            FOCUS,
          )}
        >
          <Search className={cn(ICON.sm, "shrink-0")} strokeWidth={ICON_STROKE} />
          <span className="flex-1 truncate text-[13px]">Search…</span>
          <kbd className="hidden items-center gap-0.5 rounded-md border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] font-semibold md:inline-flex">
            Ctrl K
          </kbd>
        </button>

        <div className="flex-1" />

        <div className="flex items-center gap-0.5">
          <ThemeToggle />

          <motion.button
            onClick={() => setNotifOpen(p => !p)}
            aria-label={`Notifications${badgeCount > 0 ? ` (${badgeCount} new)` : ""}`}
            animate={bellShake ? { rotate: [0, -10, 10, -6, 6, 0] } : {}}
            transition={{ duration: 0.5 }}
            className={cn(BAR_BUTTON, FOCUS, notifOpen && "bg-muted text-foreground")}
          >
            <Bell className={ICON.md} strokeWidth={ICON_STROKE} />
            {badgeCount > 0 && (
              <span className="absolute right-1.5 top-1.5 inline-flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold leading-none text-white ring-2 ring-background">
                {badgeCount > 9 ? "9+" : badgeCount}
              </span>
            )}
          </motion.button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileMenuOpen(p => !p)}
              aria-label="Account menu"
              aria-expanded={profileMenuOpen}
              className={cn(
                "ml-1 flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-120 hover:bg-muted",
                FOCUS,
                profileMenuOpen && "bg-muted",
              )}
            >
              <Avatar
                src={user?.profile?.profilePhotoUrl ?? undefined}
                name={user?.profile?.fullName ?? user?.email ?? "U"}
                size="sm"
              />
            </button>

            <AnimatePresence>
              {profileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setProfileMenuOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: MOTION.base, ease: MOTION.ease }}
                    className={cn(SURFACE.raised, "absolute right-0 top-11 z-50 w-60 overflow-hidden")}
                  >
                    <div className="border-b border-border px-3.5 py-3">
                      <p className="truncate text-[13px] font-semibold text-foreground">
                        {user?.profile?.fullName ?? "User"}
                      </p>
                      <p className={cn(TEXT.muted, "truncate")}>{user?.email}</p>
                    </div>

                    <div className="p-1.5">
                      {[
                        { to: ROUTES.PROFILE,  icon: User,     label: "View profile"   },
                        { to: "/",             icon: Globe,    label: "Public homepage" },
                        { to: ROUTES.SETTINGS, icon: Settings, label: "Settings"        },
                      ].map(item => (
                        <Link
                          key={item.label}
                          to={item.to}
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-foreground transition-colors duration-120 hover:bg-muted"
                        >
                          <item.icon className={cn(ICON.sm, "text-muted-foreground")} strokeWidth={ICON_STROKE} />
                          {item.label}
                        </Link>
                      ))}
                    </div>

                    <div className="border-t border-border p-1.5">
                      <button
                        type="button"
                        onClick={() => { setProfileMenuOpen(false); window.location.replace("/"); clearAuth() }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-destructive transition-colors duration-120 hover:bg-destructive-soft"
                      >
                        <LogOut className={ICON.sm} strokeWidth={ICON_STROKE} />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <NotificationsPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: MOTION.fast }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/25 px-4 pt-[14vh] backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0,   scale: 1    }}
              exit={{    opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: MOTION.overlay, ease: MOTION.ease }}
              onClick={e => e.stopPropagation()}
              className={cn(SURFACE.overlay, "w-full max-w-xl overflow-hidden")}
            >
              <div className="flex items-center gap-2.5 border-b border-border px-4 py-3.5">
                <Search className={cn(ICON.sm, "shrink-0 text-muted-foreground")} strokeWidth={ICON_STROKE} />
                <input
                  ref={searchRef}
                  value={searchVal}
                  onChange={e => setSearchVal(e.target.value)}
                  placeholder="Search pages, courses, notifications…"
                  className="flex-1 bg-transparent text-[13.5px] font-medium text-foreground outline-none placeholder:text-muted-foreground"
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors duration-120 hover:bg-subtle hover:text-foreground"
                  aria-label="Close"
                >
                  <X className="h-3 w-3" strokeWidth={ICON_STROKE} />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto p-1.5">
                {filtered.length === 0 ? (
                  <p className={cn(TEXT.muted, "py-10 text-center")}>No results for “{searchVal}”</p>
                ) : (
                  filtered.map(item => (
                    <button
                      key={item.to}
                      onClick={() => { navigate(item.to); setSearchOpen(false); setSearchVal("") }}
                      className="flex h-10 w-full items-center gap-3 rounded-xl px-2.5 text-left text-foreground transition-colors duration-120 hover:bg-muted"
                    >
                      <item.icon className={cn(ICON.sm, "text-muted-foreground")} strokeWidth={ICON_STROKE} />
                      <span className="text-[13.5px] font-medium">{item.label}</span>
                    </button>
                  ))
                )}
              </div>

              <div className={cn(TEXT.muted, "flex h-10 items-center gap-2 border-t border-border px-4 text-[11px]")}>
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold">ESC</kbd>
                <span>to close</span>
                <span className="mx-1 text-border">•</span>
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold">Enter</kbd>
                <span>to select</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
