import { Link } from "react-router-dom"
import BrandMark from "@/components/ui/BrandMark"

/**
 * Footer sits on the shared "teal ink" surface (teal-950) used by every dark
 * moment on the site. Deliberately not a neutral near-black: on a white/teal
 * page a neutral dark reads as a hole punched in the design, while a deep
 * teal reads as the brand colour turned dark.
 */
export default function PublicFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-teal-400/15 bg-teal-950">
      {/* The same 48px line grid the CTA above uses. The two share one teal-ink
          surface, so ending the texture at the border made the seam read as a
          cut rather than a continuation. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* soft brand glow, same treatment as the dark sections above */}
      <div aria-hidden className="pointer-events-none absolute -top-32 left-1/4 h-72 w-72 rounded-full bg-teal-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2">
            <Link to="/" className="group flex w-fit items-center gap-1.5">
              <BrandMark className="h-8 w-8" />
              <span className="font-display text-[18px] font-extrabold tracking-tight text-white">
                EduNexis
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-teal-100/60">
              A learning management system built at Jashore University of Science
              and Technology, for the way universities here actually run.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-teal-400/5 px-3 py-1.5 text-[11px] font-semibold text-teal-300">
              Free for departments
            </span>
          </div>

          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-teal-400/70">
              Product
            </p>
            <ul className="space-y-2.5">
              <li><Link to="/faculty" className="text-[13px] font-medium text-teal-100/75 transition-colors hover:text-white">Faculty</Link></li>
              <li><Link to="/about" className="text-[13px] font-medium text-teal-100/75 transition-colors hover:text-white">About</Link></li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-teal-400/70">
              Account
            </p>
            <ul className="space-y-2.5">
              <li><Link to="/login" className="text-[13px] font-medium text-teal-100/75 transition-colors hover:text-white">Sign in</Link></li>
              <li><Link to="/register" className="text-[13px] font-medium text-teal-100/75 transition-colors hover:text-white">Get started</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-teal-400/15 pt-6 sm:flex-row sm:items-center">
          <p className="text-[12px] text-teal-100/45">
            &copy; {new Date().getFullYear()} EduNexis. All rights reserved.
          </p>
          <p className="text-[12px] text-teal-100/45">
            Developed by <a href="https://www.linkedin.com/in/snbappy/" target="_blank" rel="noopener noreferrer" className="font-semibold text-teal-100/75 transition-colors hover:text-white">Md. Sabbir Hossain Bappy</a> at <a href="https://nowsin.me/" target="_blank" rel="noopener noreferrer" className="font-semibold text-teal-100/75 transition-colors hover:text-white">CyberSecurity Lab</a>
          </p>
        </div>
      </div>
    </footer>
  )
}
