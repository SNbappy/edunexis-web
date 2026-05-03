import { Link } from "react-router-dom"
import { GraduationCap } from "lucide-react"

export default function PublicFooter() {
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-2">
            <Link to="/" className="group flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 text-white shadow-md transition-transform group-hover:scale-105">
                <GraduationCap className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <span className="font-display text-[18px] font-extrabold tracking-tight text-stone-900">
                EduNexis
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-stone-600">
              A modern learning management system designed for South Asian universities. Built at JUST CSE.
            </p>
          </div>

          <div>
            <p className="mb-3 text-[11.5px] font-bold uppercase tracking-wider text-stone-900">
              Product
            </p>
            <ul className="space-y-2.5">
              <li>
                <Link to="/faculty" className="text-[13.5px] font-medium text-stone-600 transition-colors hover:text-stone-900">
                  Faculty
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-[13.5px] font-medium text-stone-600 transition-colors hover:text-stone-900">
                  About
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-[11.5px] font-bold uppercase tracking-wider text-stone-900">
              Account
            </p>
            <ul className="space-y-2.5">
              <li>
                <Link to="/login" className="text-[13.5px] font-medium text-stone-600 transition-colors hover:text-stone-900">
                  Sign in
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-[13.5px] font-medium text-stone-600 transition-colors hover:text-stone-900">
                  Get started
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-stone-200 pt-7 sm:flex-row sm:items-center">
          <p className="text-[12px] text-stone-500">
            &copy; {new Date().getFullYear()} EduNexis. All rights reserved.
          </p>
          <p className="text-[12px] font-semibold text-stone-500">
            Built at JUST CSE
          </p>
        </div>
      </div>
    </footer>
  )
}