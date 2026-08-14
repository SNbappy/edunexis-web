import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ClipboardCheck, BarChart3, Bell, Check, ArrowLeft } from "lucide-react"
import BrandMark from "@/components/ui/BrandMark"

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * Shared frame for every auth screen.
 *
 * Before this, each of the five auth pages carried its own copy of the layout,
 * and the brand panel used a teal→amber gradient that turned olive at the
 * corner — a palette that appears nowhere in the product. This puts them all
 * on the same "teal ink" surface the homepage uses for its dark moments, with
 * the same grid texture, brand glows and lockup proportions.
 */

/** Matches the navbar lockup: ~1.6 mark-to-cap ratio, gap sized to the mark. */
export function BrandLockup({ dark = false }: { dark?: boolean }) {
  return (
    <Link to="/" className="flex w-fit items-center gap-2.5">
      <BrandMark className="h-7 w-7" />
      <span
        className={
          "font-display text-[19px] font-extrabold tracking-tight " +
          (dark ? "text-white" : "text-stone-900")
        }
      >
        EduNexis
      </span>
    </Link>
  )
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)
    const on = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [])
  return reduced
}

/**
 * A small self-playing panel so the brand side isn't a static poster. Same
 * approach as the homepage films — scripted beats, transform/opacity only,
 * suspended off-screen, frozen on the first frame for reduced motion.
 */
const BEATS = [
  { label: "Attendance", Icon: ClipboardCheck },
  { label: "Marks", Icon: BarChart3 },
  { label: "Announcement", Icon: Bell },
]

function AuthFilm() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const [onScreen, setOnScreen] = useState(false)
  const [beat, setBeat] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.2 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (reduced || !onScreen) return
    const id = window.setTimeout(() => setBeat(b => (b + 1) % BEATS.length), 2800)
    return () => clearTimeout(id)
  }, [beat, reduced, onScreen])

  const rows = [
    { n: "Mostafa Kamal", i: "MK", tint: "from-teal-500 to-cyan-600" },
    { n: "Md. Sabbir Hossain Bappy", i: "SH", tint: "from-blue-500 to-indigo-600" },
    { n: "Nasif Shahrier Nafi", i: "NS", tint: "from-amber-500 to-orange-600" },
  ]

  return (
    <div ref={ref} className="relative w-full max-w-sm">
      <div aria-hidden className="absolute -inset-4 rounded-[28px] bg-teal-400/20 blur-3xl" />

      <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white shadow-[0_24px_60px_-18px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50 px-4 py-2.5">
          <span className="font-display text-[12px] font-bold text-stone-900">CSE327 · Today</span>
          <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[9px] font-bold text-teal-700">Live</span>
        </div>

        {/* step rail */}
        <div className="flex gap-1 px-4 pt-3">
          {BEATS.map((b, i) => (
            <div key={b.label} className="flex-1">
              <div className="h-0.5 overflow-hidden rounded-full bg-stone-100">
                <motion.div
                  className="h-full rounded-full bg-teal-500"
                  animate={{ scaleX: i <= beat ? 1 : 0 }}
                  style={{ originX: 0 }}
                  transition={{ duration: 0.45, ease: EASE }}
                />
              </div>
              <p className={"mt-1.5 truncate text-[8.5px] font-semibold " + (i === beat ? "text-stone-800" : "text-stone-400")}>
                {b.label}
              </p>
            </div>
          ))}
        </div>

        <div className="relative h-[164px] overflow-hidden">
          <AnimatePresence initial={false}>
            <motion.div
              key={beat}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.32, ease: EASE }}
              className="absolute inset-0 p-4"
            >
              {beat === 0 && (
                <div className="space-y-1.5">
                  {rows.map((r, i) => (
                    <div key={r.n} className="flex items-center gap-2.5 border-b border-stone-50 py-1.5">
                      <span className={"flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[8.5px] font-bold text-white " + r.tint}>
                        {r.i}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-stone-700">{r.n}</span>
                      <motion.span
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 + i * 0.22, duration: 0.3, ease: EASE }}
                        className="rounded-full bg-teal-50 px-2 py-0.5 text-[9px] font-bold text-teal-700"
                      >
                        Present
                      </motion.span>
                    </div>
                  ))}
                  <p className="pt-1 text-[10px] font-semibold text-teal-700">43 of 47 present</p>
                </div>
              )}

              {beat === 1 && (
                <div className="space-y-1.5">
                  {[
                    { n: "Nasif Shahrier Nafi", m: "94.8" },
                    { n: "Mostafa Kamal", m: "93.1" },
                    { n: "Md. Sabbir Hossain Bappy", m: "78.0" },
                  ].map((r, i) => (
                    <motion.div
                      key={r.n}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.16, duration: 0.35 }}
                      className="flex items-center justify-between border-b border-stone-50 py-1.5"
                    >
                      <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-stone-700">{r.n}</span>
                      <span className="font-display text-[12px] font-bold tabular-nums text-teal-700">{r.m}</span>
                    </motion.div>
                  ))}
                  <p className="pt-1 text-[10px] font-semibold text-teal-700">Final marks published</p>
                </div>
              )}

              {beat === 2 && (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <motion.span
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-600"
                  >
                    <Check className="h-5 w-5 text-white" strokeWidth={3} />
                  </motion.span>
                  <p className="mt-3 font-display text-[13px] font-bold text-stone-900">Lab 4 moved to Thursday</p>
                  <p className="mt-0.5 text-[11px] text-stone-500">47 students notified instantly</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

interface AuthShellProps {
  /** Right-column heading. */
  title: string
  /** Supporting line under the heading. */
  subtitle?: React.ReactNode
  /** The form. */
  children: React.ReactNode
  /** Links and small print below the form. */
  footer?: React.ReactNode
  /** Shown above the heading — e.g. a back link on secondary screens. */
  back?: { to: string; label: string }
  /** Brand-panel headline, two lines; the second takes the gradient. */
  panelLines?: [string, string]
  /** Brand-panel supporting copy. */
  panelBody?: string
}

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
  back,
  panelLines = ["Your department,", "unified."],
  panelBody = "Attendance, assignments, grades, materials and announcements — all in one fast place, built at JUST for the way courses actually run.",
}: AuthShellProps) {
  return (
    <div className="flex min-h-screen w-full bg-white text-stone-900">
      {/* LEFT — brand panel on the shared teal-ink surface */}
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-teal-950 p-12 text-white lg:flex xl:w-[54%] xl:p-16">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div aria-hidden className="absolute -top-40 left-1/4 h-[420px] w-[420px] rounded-full bg-teal-500/15 blur-3xl" />
        <div aria-hidden className="absolute -bottom-40 -right-20 h-[380px] w-[380px] rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative">
          <BrandLockup dark />
        </div>

        <div className="relative space-y-9">
          <div className="max-w-md space-y-5">
            <h1 className="font-display text-4xl font-extrabold leading-[1.06] tracking-tight xl:text-5xl">
              {panelLines.map((line, i) => (
                <span key={line} className="block overflow-hidden pb-[0.06em]">
                  <motion.span
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 0.75, delay: 0.1 + i * 0.12, ease: EASE }}
                    className={i === 1 ? "block bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent" : "block"}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35, ease: EASE }}
              className="max-w-sm text-[15px] leading-relaxed text-teal-100/70"
            >
              {panelBody}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: EASE }}
          >
            <AuthFilm />
          </motion.div>
        </div>

        <div className="relative flex items-center gap-2 text-[11.5px] text-teal-100/45">
          <Check className="h-3.5 w-3.5 text-teal-400" strokeWidth={3} />
          <span>Jashore University of Science and Technology · CSE Department</span>
        </div>
      </aside>

      {/* RIGHT — the form */}
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden p-6 lg:p-10">
        <div aria-hidden className="pointer-events-none absolute -top-32 right-0 h-[420px] w-[420px] rounded-full bg-teal-100/50 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-20 h-[360px] w-[360px] rounded-full bg-cyan-100/40 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="relative w-full max-w-[400px]"
        >
          <div className="mb-8 lg:hidden">
            <BrandLockup />
          </div>

          {back && (
            <Link
              to={back.to}
              className="mb-5 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-stone-500 transition-colors hover:text-teal-700"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {back.label}
            </Link>
          )}

          <div className="rounded-2xl border border-stone-200 bg-white p-7 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.22)] sm:p-8">
            <h2 className="font-display text-[27px] font-extrabold leading-tight tracking-tight text-stone-900">
              {title}
            </h2>
            {subtitle && <p className="mt-2 text-[14px] leading-relaxed text-stone-600">{subtitle}</p>}

            <div className="mt-7">{children}</div>
          </div>

          {footer && <div className="mt-6">{footer}</div>}
        </motion.div>
      </div>
    </div>
  )
}
