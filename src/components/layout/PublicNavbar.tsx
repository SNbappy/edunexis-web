import { useEffect, useState } from "react"
import { Link, NavLink, useLocation } from "react-router-dom"
import { GraduationCap, ArrowRight } from "lucide-react"
import { cn } from "@/utils/cn"

const navLinks = [
  { to: "/faculty", label: "Faculty" },
  { to: "/about", label: "About" },
]

export default function PublicNavbar() {
  const { pathname } = useLocation()
  const isHome = pathname === "/"
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (!isHome) { setScrolled(true); return }
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [isHome])

  const headerClass = scrolled
    ? "border-b border-stone-200/70 bg-white/85 backdrop-blur-md shadow-sm"
    : "border-b border-transparent bg-transparent"

  return (
    <header className={cn("sticky top-0 z-40 transition-all duration-300", headerClass)}>
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo — bigger, bolder */}
        <Link to="/" className="group flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 text-white shadow-md transition-transform group-hover:scale-105">
            <GraduationCap className="h-6 w-6" strokeWidth={2.75} />
          </div>
          <span className="font-display text-[22px] font-extrabold tracking-tight text-stone-900">
            EduNexis
          </span>
        </Link>

        {/* Right: Nav links + auth CTAs */}
        <div className="flex items-center gap-2 sm:gap-4">
          <nav className="hidden items-center gap-2 md:flex">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => cn(
                  "rounded-lg px-3 py-2 font-display text-[15px] font-bold transition-colors",
                  isActive
                    ? "text-teal-700"
                    : "text-stone-700 hover:text-stone-900"
                )}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <Link
            to="/login"
            className="rounded-lg px-3 py-2 font-display text-[15px] font-bold text-stone-700 transition-colors hover:text-stone-900"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="group inline-flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-3 font-display text-[14.5px] font-bold text-white shadow-[0_8px_20px_-8px_rgba(0,0,0,0.4)] transition-all hover:bg-stone-800 hover:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.5)]"
          >
            Get started
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </header>
  )
}