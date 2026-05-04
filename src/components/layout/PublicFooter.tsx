import { Link } from "react-router-dom"
import { GraduationCap } from "lucide-react"

export default function PublicFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2">
            <Link to="/" className="group flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-md transition-transform group-hover:scale-105">
                <GraduationCap className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <span className="font-display text-[18px] font-extrabold tracking-tight text-white">
                EduNexis
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-slate-400">
              A modern learning management system designed for South Asian universities.
            </p>
          </div>

          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Product
            </p>
            <ul className="space-y-2.5">
              <li><Link to="/faculty" className="text-[13px] font-medium text-slate-300 transition-colors hover:text-white">Faculty</Link></li>
              <li><Link to="/about" className="text-[13px] font-medium text-slate-300 transition-colors hover:text-white">About</Link></li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Account
            </p>
            <ul className="space-y-2.5">
              <li><Link to="/login" className="text-[13px] font-medium text-slate-300 transition-colors hover:text-white">Sign in</Link></li>
              <li><Link to="/register" className="text-[13px] font-medium text-slate-300 transition-colors hover:text-white">Get started</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-white/10 pt-6 sm:flex-row sm:items-center">
          <p className="text-[12px] text-slate-500">
            &copy; {new Date().getFullYear()} EduNexis. All rights reserved.
          </p>
          <p className="text-[12px] font-semibold text-slate-500">
            Built at JUST CSE
          </p>
        </div>
      </div>
    </footer>
  )
}