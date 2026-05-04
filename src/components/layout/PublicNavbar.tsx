import { useEffect, useState } from "react"
import { Link, NavLink, useLocation } from "react-router-dom"
import { GraduationCap, ArrowRight, Menu, X } from "lucide-react"
import { cn } from "@/utils/cn"

const navLinks = [
  { to: "/faculty", label: "Faculty" },
  { to: "/about", label: "About" },
]

export default function PublicNavbar() {
  const { pathname } = useLocation()
  const isHome = pathname === "/"
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!isHome) { setScrolled(true); return }
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [isHome])

  // Close menu when route changes
  useEffect(() => { setMobileOpen(false) }, [pathname])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden"
      return () => { document.body.style.overflow = "" }
    }
  }, [mobileOpen])

  const headerClass = scrolled || mobileOpen
    ? "border-b border-stone-200/70 bg-white/95 backdrop-blur-md shadow-sm"
    : "border-b border-transparent bg-transparent"

  return (
    <>
      <header className={cn("sticky top-0 z-40 transition-all duration-300", headerClass)}>
        <div
          className={cn(
            "mx-auto flex max-w-7xl items-center justify-between px-4 transition-all duration-300 sm:px-6 lg:px-8",
            scrolled ? "h-14" : "h-20"
          )}
        >
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-2.5 sm:gap-3">
            <div
              className={cn(
                "flex items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 text-white shadow-md transition-all duration-300 group-hover:scale-105",
                scrolled ? "h-8 w-8" : "h-10 w-10 sm:h-11 sm:w-11"
              )}
            >
              <GraduationCap
                className={cn("transition-all duration-300", scrolled ? "h-4 w-4" : "h-5 w-5 sm:h-6 sm:w-6")}
                strokeWidth={2.75}
              />
            </div>
            <span
              className={cn(
                "font-display font-extrabold tracking-tight text-stone-900 transition-all duration-300",
                scrolled ? "text-[16px]" : "text-[18px] sm:text-[22px]"
              )}
            >
              EduNexis
            </span>
          </Link>

          {/* Desktop nav + CTAs */}
          <div className="hidden items-center gap-3 md:flex">
            <nav className="flex items-center gap-1">
              {navLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => cn(
                    "rounded-lg px-3 py-2 font-display font-bold transition-all",
                    scrolled ? "text-[13.5px]" : "text-[15px]",
                    isActive ? "text-teal-700" : "text-stone-700 hover:text-stone-900"
                  )}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <Link
              to="/login"
              className={cn(
                "rounded-lg px-3 py-2 font-display font-bold text-stone-700 transition-all hover:text-stone-900",
                scrolled ? "text-[13.5px]" : "text-[15px]"
              )}
            >
              Sign in
            </Link>

            <Link
              to="/register"
              className={cn(
                "group inline-flex items-center gap-1.5 rounded-xl bg-stone-900 font-display font-bold text-white transition-all hover:bg-stone-800 hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.4)]",
                scrolled ? "px-3.5 py-2 text-[13px]" : "px-5 py-3 text-[14.5px]"
              )}
            >
              Get started
              <ArrowRight className={cn("transition-all", scrolled ? "h-3 w-3" : "h-4 w-4")} />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(v => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-300 bg-white text-stone-900 transition-colors hover:bg-stone-50 md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile menu — full-screen overlay below the navbar */}
      {mobileOpen ? (
        <div className="fixed inset-x-0 top-14 bottom-0 z-30 overflow-y-auto bg-white md:hidden">
          <div className="flex flex-col px-6 py-8">
            <nav className="flex flex-col">
              {navLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => cn(
                    "border-b border-stone-100 py-4 font-display text-[18px] font-bold transition-colors",
                    isActive ? "text-teal-700" : "text-stone-900"
                  )}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="mt-8 flex flex-col gap-3">
              <Link
                to="/login"
                className="rounded-xl border border-stone-300 bg-white px-5 py-3.5 text-center font-display text-[15px] font-bold text-stone-900 transition-colors hover:bg-stone-50"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-5 py-3.5 font-display text-[15px] font-bold text-white transition-colors hover:bg-stone-800"
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <p className="mt-12 text-center text-[12px] font-semibold uppercase tracking-wider text-stone-400">
              Built at JUST CSE
            </p>
          </div>
        </div>
      ) : null}
    </>
  )
}