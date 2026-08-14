import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ClipboardCheck, BarChart3, Bell, Check, ArrowLeft, Paperclip } from "lucide-react"
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
 * Live activity stream for the brand panel.
 *
 * Deliberately not another tab-cycling card — the homepage already uses that
 * device three times, so repeating it here made the auth screens feel like a
 * fourth copy rather than their own moment. This reads as the product running:
 * events arrive from below, push the stack up, and the oldest fades out at the
 * top. Nothing switches; things happen.
 *
 * Also suits the narrower panel — a vertical stream fits a tall column far
 * better than a wide screenshot did.
 */
const ACTIVITY = [
  { Icon: ClipboardCheck, tint: "bg-teal-500/15 text-teal-300", title: "Attendance saved", meta: "CSE327 · 43 of 47 present" },
  { Icon: Paperclip, tint: "bg-blue-500/15 text-blue-300", title: "Nasif submitted Assignment 4", meta: "200147_erd.pdf · 2 days early" },
  { Icon: BarChart3, tint: "bg-amber-500/15 text-amber-300", title: "Final marks published", meta: "47 students notified" },
  { Icon: Bell, tint: "bg-violet-500/15 text-violet-300", title: "Lab 4 moved to Thursday", meta: "Announcement · seen by 41" },
  { Icon: Check, tint: "bg-emerald-500/15 text-emerald-300", title: "Tasnim joined CSE327", meta: "Join request approved" },
]

const VISIBLE = 3
/** Card height (60px) + column gap (10px) — the distance the ticker travels. */
const ROW_PITCH = 70

function AuthFilm() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const [onScreen, setOnScreen] = useState(false)
  const [head, setHead] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.2 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (reduced || !onScreen) return
    const id = window.setTimeout(() => setHead(h => (h + 1) % ACTIVITY.length), 2400)
    return () => clearTimeout(id)
  }, [head, reduced, onScreen])

  /* Newest first; the list is a moving window over the loop. One extra row is
     rendered below the fold so the column always has something to slide up
     into. */
  const shown = Array.from({ length: VISIBLE + 1 }, (_, i) => {
    const idx = (head - i + ACTIVITY.length * 2) % ACTIVITY.length
    return { ...ACTIVITY[idx], key: `${head}-${i}`, depth: i }
  })

  return (
    <div ref={ref} className="w-full max-w-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          {!reduced && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-70" />
          )}
          <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-400" />
        </span>
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-teal-300">
          Happening now
        </span>
      </div>

      {/*
        A ticker, not an AnimatePresence stack. Both earlier attempts —
        hand-computed offsets, then `mode="popLayout"` — left the exiting card
        in the DOM at its old position while the rest shifted, so two cards
        rendered on top of each other (measured: 60px of overlap).

        Here the whole column remounts each tick and slides up one row. Nothing
        ever exits independently, so overlap is structurally impossible.
      */}
      <div className="relative h-[228px] overflow-hidden">
        <motion.div
          key={head}
          initial={{ y: ROW_PITCH }}
          animate={{ y: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="flex flex-col gap-2.5"
        >
          {shown.map(item => (
            <div
              key={item.key}
              style={{ opacity: item.depth >= VISIBLE - 1 ? 0.45 : 1 }}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur-sm"
            >
              <span className={"flex h-9 w-9 shrink-0 items-center justify-center rounded-lg " + item.tint}>
                <item.Icon className="h-4 w-4" strokeWidth={2.25} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-bold text-white">{item.title}</p>
                <p className="truncate text-[11px] text-teal-100/55">{item.meta}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* the stack fades out as it leaves, rather than being hard-clipped */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-teal-950 to-transparent"
        />
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
      {/* Was 54% of the viewport while its widest content measured 448px —
          31% of the panel was empty horizontal space. Sized to the content it
          actually holds, which also gives the form column more room. */}
      <aside className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-teal-950 p-10 text-white lg:flex xl:w-[44%] xl:p-14">
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
