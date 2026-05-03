import { Link } from "react-router-dom"
import { GraduationCap } from "lucide-react"

export default function PublicFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white">
                <GraduationCap className="h-3.5 w-3.5" strokeWidth={2.5} />
              </div>
              <span className="font-display text-[14px] font-bold text-foreground">
                EduNexis
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-[13px] text-muted-foreground">
              A modern learning management system designed for South Asian universities.
            </p>
          </div>

          <div>
            <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-foreground">
              Product
            </p>
            <ul className="space-y-2">
              <li><Link to="/faculty" className="text-[13px] text-muted-foreground transition-colors hover:text-foreground">Faculty</Link></li>
              <li><Link to="/about" className="text-[13px] text-muted-foreground transition-colors hover:text-foreground">About</Link></li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-foreground">
              Account
            </p>
            <ul className="space-y-2">
              <li><Link to="/login" className="text-[13px] text-muted-foreground transition-colors hover:text-foreground">Sign in</Link></li>
              <li><Link to="/register" className="text-[13px] text-muted-foreground transition-colors hover:text-foreground">Sign up</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <p className="text-[12px] text-muted-foreground">
            © {new Date().getFullYear()} EduNexis. Built at JUST CSE.
          </p>
        </div>
      </div>
    </footer>
  )
}