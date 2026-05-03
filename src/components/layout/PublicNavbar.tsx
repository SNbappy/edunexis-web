import { Link, NavLink } from "react-router-dom"
import { GraduationCap } from "lucide-react"
import { cn } from "@/utils/cn"

const navLinks = [
  { to: "/faculty", label: "Faculty" },
  { to: "/about", label: "About" },
]

export default function PublicNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white">
            <GraduationCap className="h-4 w-4" strokeWidth={2.5} />
          </div>
          <span className="font-display text-[15px] font-bold text-foreground">
            EduNexis
          </span>
        </Link>

        {/* Center nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => cn(
                "rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors",
                isActive
                  ? "text-teal-600 dark:text-teal-400"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right side: auth CTAs */}
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="rounded-lg px-3 py-2 text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-teal-600 px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-teal-700 shadow-[0_4px_14px_-4px_rgba(20,184,166,0.6)]"
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  )
}