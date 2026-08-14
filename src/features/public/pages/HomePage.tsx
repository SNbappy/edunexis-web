import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { publicService } from "../services/publicService"
import {
  ArrowRight,
  ClipboardCheck,
  ClipboardList,
  BookOpen,
  BarChart3,
  Bell,
  Shield,
  GraduationCap,
  Users,
  Search,
  Check,
  Paperclip,
  MessageSquare,
  FolderOpen,
  FileText,
  Calendar,
  ChevronRight,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

function useStats() {
  return useQuery({
    queryKey: ["public-stats"],
    queryFn: async () => {
      const res = await publicService.getStats()
      return res.data
    },
    staleTime: 60_000,
  })
}

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * Every animation on this page is gated on this. Visitors who ask their OS for
 * reduced motion get the same content, statically.
 *
 * Backed by one shared listener rather than one per component — the page has
 * ~25 animated elements and 25 duplicate matchMedia subscriptions is waste.
 */
const reducedStore = {
  value: false,
  subs: new Set<() => void>(),
  init: false,
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(reducedStore.value)
  useEffect(() => {
    if (!reducedStore.init) {
      reducedStore.init = true
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
      reducedStore.value = mq.matches
      mq.addEventListener("change", e => {
        reducedStore.value = e.matches
        reducedStore.subs.forEach(fn => fn())
      })
    }
    const sync = () => setReduced(reducedStore.value)
    sync()
    reducedStore.subs.add(sync)
    return () => { reducedStore.subs.delete(sync) }
  }, [])
  return reduced
}

/* ── Scroll motion primitives ──────────────────────────────────────
   The "animated as you scroll" feel comes from these, not from
   continuous loops. Each reveal plays once when its element enters the
   viewport and then stops for good, so the cost is a handful of frames
   per element instead of permanent CPU. Only transform and opacity are
   touched, so it all stays on the GPU.
   ────────────────────────────────────────────────────────────────── */

const REVEAL_VIEWPORT = { once: true, margin: "-70px" } as const

/** Standard entrance: rises and fades in when scrolled to. */
function Reveal({
  children,
  delay = 0,
  y = 30,
  className,
}: {
  children: React.ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  const reduced = usePrefersReducedMotion()
  if (reduced) return <div className={className}>{children}</div>
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={REVEAL_VIEWPORT}
      transition={{ duration: 0.65, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Heading whose lines wipe up from behind one another, one after the next —
 * the same treatment as the hero, applied to every section headline so the
 * page reads as one system rather than a hero plus a list of blocks.
 */
function RevealLines({
  lines,
  className,
  accentFrom,
  accentClass = "bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-700 bg-clip-text text-transparent",
}: {
  lines: string[]
  className?: string
  /** index from which lines take the accent treatment */
  accentFrom?: number
  accentClass?: string
}) {
  const reduced = usePrefersReducedMotion()
  return (
    <h2 className={className}>
      {lines.map((line, i) => {
        const accent = accentFrom !== undefined && i >= accentFrom
        if (reduced) {
          return (
            <span key={line} className={"block " + (accent ? accentClass : "")}>
              {line}
            </span>
          )
        }
        /* The trigger MUST sit on the unclipped wrapper, not on the sliding
           span. A span translated 110% down is fully outside its
           overflow-hidden parent, so IntersectionObserver reports it as never
           visible and whileInView never fires — the line stays hidden for
           good. Parent observes, child animates via variants. */
        return (
          <motion.span
            key={line}
            className="block overflow-hidden pb-[0.06em]"
            initial="hidden"
            whileInView="show"
            viewport={REVEAL_VIEWPORT}
          >
            <motion.span
              variants={{ hidden: { y: "110%" }, show: { y: "0%" } }}
              transition={{ duration: 0.7, delay: i * 0.11, ease: EASE }}
              className={"block " + (accent ? accentClass : "")}
            >
              {line}
            </motion.span>
          </motion.span>
        )
      })}
    </h2>
  )
}

/** True at the `lg` breakpoint and up, where the pinned scroll layout applies. */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)")
    setIsDesktop(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])
  return isDesktop
}

/** Fires once when the element first scrolls into view. */
function useInViewOnce<T extends HTMLElement>(ref: React.RefObject<T>, threshold = 0.35) {
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    const io = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && setSeen(true)),
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, seen, threshold])
  return seen
}

export default function HomePage() {
  return (
    <div className="bg-white text-stone-900">
      <Hero />
      <TryItSection />
      <WhyPanel />
      <FeatureRows />
      <HowItStarts />
      <ForWhomPanel />
      <FinalCta />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   HERO
   ══════════════════════════════════════════════════════════════════ */

function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
  const mockupY = useTransform(scrollYProgress, [0, 1], [0, 90])
  const mockupOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.2])

  return (
    <section ref={ref} className="relative -mt-20 overflow-hidden pt-20">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 h-[600px] w-[600px] rounded-full bg-teal-100/60 blur-3xl" />
        <div className="absolute -top-20 right-0 h-[500px] w-[500px] rounded-full bg-blue-100/50 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-cyan-100/40 blur-3xl" />
      </div>

      <HeroDriftChips />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:px-8 lg:py-16">
        {/* Left: copy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="flex flex-col justify-center"
        >
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-teal-200 bg-white px-3 py-1.5 text-[11.5px] font-semibold text-teal-700 shadow-sm">
            Built at JUST CSE — not Silicon Valley
          </div>

          {/* lines rise in one after another, each masked by its own row */}
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-stone-900 sm:text-5xl md:text-6xl lg:text-[68px]">
            {[
              { text: "Software that", accent: false },
              { text: "finally understands", accent: false },
              { text: "how class runs.", accent: true },
            ].map((line, i) => (
              <span key={line.text} className="block overflow-hidden pb-[0.06em]">
                <motion.span
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.75, delay: 0.15 + i * 0.13, ease: EASE }}
                  className={
                    "block " +
                    (line.accent
                      ? "bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-700 bg-clip-text text-transparent"
                      : "")
                  }
                >
                  {line.text}
                </motion.span>
              </span>
            ))}
          </h1>

          <p className="mt-6 max-w-xl text-[15.5px] leading-relaxed text-stone-600 sm:text-base">
            EduNexis was built at Jashore University of Science and Technology
            by someone who sat through the same classes you teach — roll called
            aloud, marks split across three spreadsheets, submissions emailed
            in at midnight. Google Classroom wasn't built for that. This was.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 rounded-xl bg-teal-900 px-6 py-3.5 text-[14px] font-bold text-white shadow-[0_8px_24px_-8px_rgba(0,0,0,0.4)] transition-all hover:bg-teal-800 hover:shadow-[0_12px_32px_-8px_rgba(19,78,74,0.55)]"
            >
              Get started for free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/faculty"
              className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-6 py-3.5 text-[14px] font-bold text-stone-900 transition-colors hover:bg-stone-50"
            >
              Browse faculty
            </Link>
          </div>

          <div className="mt-10 flex items-center gap-3 text-[12.5px] text-stone-500">
            <div className="flex -space-x-2">
              {["MK", "SB", "NN"].map(initials => (
                <div
                  key={initials}
                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-teal-500 to-cyan-600 text-[9px] font-bold text-white"
                >
                  {initials}
                </div>
              ))}
            </div>
            <span>Live with real faculty and students at JUST · CSE</span>
          </div>
        </motion.div>

        {/* Right: parallaxed product mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
          style={{ y: mockupY, opacity: mockupOpacity }}
          className="relative flex items-center justify-center"
        >
          <HeroFilm />
        </motion.div>
      </div>
    </section>
  )
}

/**
 * Small product chips drifting in the hero's empty margins — the idea borrowed
 * from phitron.io's floating tech cards, but carrying real product moments
 * instead of decoration. Desktop only: on mobile there is no spare margin, and
 * they'd land on top of the copy.
 */
/* Right margin only. The left half is the headline and body copy — chips
   placed there landed on top of the type. Two well-placed beats the four
   that collide. */
const DRIFT_CHIPS = [
  { label: "New submission", Icon: Paperclip, tone: "text-violet-600", pos: "right-[2%] top-[14%]", dur: 9, delay: 0.6 },
  { label: "Marks published", Icon: BarChart3, tone: "text-amber-600", pos: "right-[5%] bottom-[10%]", dur: 7.5, delay: 1.8 },
]

function HeroDriftChips() {
  const reduced = usePrefersReducedMotion()
  const isDesktop = useIsDesktop()
  if (!isDesktop) return null

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
      {DRIFT_CHIPS.map((c, i) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 16 }}
          animate={
            reduced
              ? { opacity: 0.9, y: 0 }
              : { opacity: 0.9, y: [0, -14, 0] }
          }
          transition={
            reduced
              ? { duration: 0.5 }
              : {
                  opacity: { duration: 0.7, delay: 0.8 + i * 0.15 },
                  y: { duration: c.dur, repeat: Infinity, ease: "easeInOut", delay: c.delay },
                }
          }
          className={
            "absolute inline-flex items-center gap-2 rounded-xl border border-stone-200/80 bg-white/85 px-3 py-2 shadow-lg backdrop-blur-sm " +
            c.pos
          }
        >
          <c.Icon className={"h-3.5 w-3.5 " + c.tone} strokeWidth={2.5} />
          <span className="text-[11px] font-semibold text-stone-700">{c.label}</span>
        </motion.div>
      ))}
    </div>
  )
}

/* ── Hero film ─────────────────────────────────────────────────────
   A self-playing loop of the product actually being used: the roster
   scrolls itself, students get marked, a tab opens on its own, marks
   compute, a submission lands. No interaction required — a hero that
   demands a click is a hero most visitors never engage with.

   Performance rules this obeys, because it runs continuously:
     · only `transform` and `opacity` are animated (GPU-composited);
       nothing here animates width/height/top/left/box-shadow
     · the whole loop is suspended while the hero is off-screen
     · the blurred glow behind the frame is static — animating a
       large blur is the fastest way to drop frames on a phone
     · reduced-motion gets a still frame of the first screen
   ────────────────────────────────────────────────────────────────── */

type FilmScreen = "attendance" | "gradebook" | "assignment"

interface Beat {
  screen: FilmScreen
  ms: number
  /** roster auto-scroll offset, px */
  scroll?: number
  /** roster ids flipped to absent by this beat */
  flipped?: string[]
  /** submission card has landed */
  landed?: boolean
  /** submission has been graded */
  graded?: boolean
}

const FILM: Beat[] = [
  { screen: "attendance", ms: 1500, scroll: 0 },
  { screen: "attendance", ms: 2600, scroll: 150 },
  { screen: "attendance", ms: 1500, scroll: 150, flipped: ["200112"] },
  { screen: "attendance", ms: 1900, scroll: 150, flipped: ["200112", "200121"] },
  { screen: "gradebook", ms: 3400 },
  { screen: "assignment", ms: 1700 },
  { screen: "assignment", ms: 1600, landed: true },
  { screen: "assignment", ms: 2200, landed: true, graded: true },
]

const FILM_TABS: { key: FilmScreen; label: string }[] = [
  { key: "attendance", label: "Attendance" },
  { key: "gradebook", label: "Marks" },
  { key: "assignment", label: "Submissions" },
]

function useFilm(active: boolean) {
  const [beat, setBeat] = useState(0)
  useEffect(() => {
    if (!active) return
    const id = window.setTimeout(
      () => setBeat(b => (b + 1) % FILM.length),
      FILM[beat].ms,
    )
    return () => clearTimeout(id)
  }, [beat, active])
  /* Freeze on the current beat rather than snapping back to the first — going
     off-screen and returning should resume, not jump. Reduced-motion never
     advances past beat 0, so it gets a clean still frame. */
  return FILM[beat]
}

function HeroFilm() {
  const rootRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const [onScreen, setOnScreen] = useState(true)

  /* Suspends the loop whenever the hero leaves the viewport — a hero still
     animating while someone reads the footer is battery spend for nothing. */
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => setOnScreen(e.isIntersecting),
      { threshold: 0.05 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const beat = useFilm(!reduced && onScreen)

  return (
    /* Committed perspective. Flattens on mobile where the crop would bite. */
    <div ref={rootRef} className="relative w-full max-w-md [perspective:1600px] [perspective-origin:70%_50%]">
      <div aria-hidden className="absolute -inset-8 rounded-[32px] bg-gradient-to-br from-teal-400/30 via-cyan-300/20 to-blue-400/20 blur-3xl" />

      <div className="relative rounded-2xl border border-stone-200 bg-white shadow-[0_30px_80px_-20px_rgba(15,23,42,0.35)] [transform:none] [transform-style:preserve-3d] lg:[transform:rotateY(-14deg)_rotateX(6deg)] lg:shadow-[-24px_40px_90px_-24px_rgba(15,23,42,0.42)]">
        {/* window chrome */}
        <div className="flex items-center gap-1.5 rounded-t-2xl border-b border-stone-100 bg-stone-50 px-4 py-2.5">
          <div className="h-2.5 w-2.5 rounded-full bg-rose-300" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-300" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
          <span className="ml-3 truncate rounded-md bg-white px-2.5 py-0.5 text-[10px] font-medium text-stone-400">
            edunexis.app/cse327
          </span>
        </div>

        {/* in-app tab bar — the tab moves on its own as the film advances */}
        <div className="flex gap-4 border-b border-stone-100 px-4">
          {FILM_TABS.map(t => {
            const on = beat.screen === t.key
            return (
              <div key={t.key} className="relative py-2">
                <span className={"text-[10.5px] font-semibold transition-colors " + (on ? "text-stone-900" : "text-stone-400")}>
                  {t.label}
                </span>
                {on && (
                  <motion.div
                    layoutId="hero-film-tab"
                    className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-teal-600"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Screens cross-fade in place. `mode="wait"` held the outgoing screen
            until its exit finished before mounting the next, leaving ~300ms
            where the frame rendered nothing — a visible blank flicker. */}
        <div className="relative h-[268px] overflow-hidden">
          <AnimatePresence initial={false}>
            <motion.div
              key={beat.screen}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.32, ease: EASE }}
              className="absolute inset-0 p-4"
            >
              {beat.screen === "attendance" && <FilmAttendance beat={beat} />}
              {beat.screen === "gradebook" && <FilmGradebook />}
              {beat.screen === "assignment" && <FilmAssignment beat={beat} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Floating chip lives off the frame's top-right — the only edge with no
          content behind it. Bottom-left covered the last roster row; top-left
          covered the URL pill. */}
      <motion.div
        animate={reduced ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute -top-5 right-2 z-10 rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 shadow-xl lg:-right-8"
      >
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-teal-600" strokeWidth={2.5} />
          <span className="text-[11px] font-bold tabular-nums text-stone-800">
            {CLASS_SIZE - (beat.flipped?.length ?? 0) - CLASS_ABSENT} / {CLASS_SIZE} present
          </span>
        </div>
      </motion.div>
    </div>
  )
}

function FilmAttendance({ beat }: { beat: Beat }) {
  const rows = ROSTER.slice(0, 9)
  return (
    <div className="relative h-full">
      <div className="flex items-center justify-between pb-2">
        <span className="font-display text-[12px] font-bold text-stone-900">Today · CSE327 Lab</span>
        <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[9px] font-bold text-teal-700">Live</span>
      </div>

      <div className="relative h-[204px] overflow-hidden">
        {/* the roster scrolls itself — transform only, so it stays on the GPU */}
        <motion.div
          animate={{ y: -(beat.scroll ?? 0) }}
          transition={{ duration: 2.4, ease: "easeInOut" }}
        >
          {rows.map((r, i) => {
            const absent = beat.flipped?.includes(r.id) || !r.present
            return (
              <div key={r.id} className="flex items-center gap-2.5 border-b border-stone-50 py-1.5">
                <Avatar student={r} index={i} size="h-6 w-6" />
                <span className="flex-1 truncate text-[11px] font-medium text-stone-700">{r.name}</span>
                <motion.span
                  animate={{ scale: [1, 1.12, 1] }}
                  key={String(absent)}
                  transition={{ duration: 0.34, ease: EASE }}
                  className={
                    "rounded-full px-2 py-0.5 text-[9px] font-bold " +
                    (absent ? "bg-rose-50 text-rose-600" : "bg-teal-50 text-teal-700")
                  }
                >
                  {absent ? "Absent" : "Present"}
                </motion.span>
              </div>
            )
          })}
        </motion.div>
        <ListFade />
      </div>
    </div>
  )
}

function FilmGradebook() {
  const rows = ROSTER.slice(0, 6)
  const cols = [
    { k: "att" as const, label: "Att" },
    { k: "ct" as const, label: "CT" },
    { k: "mid" as const, label: "Mid" },
    { k: "fin" as const, label: "Final" },
  ]
  return (
    <div className="h-full">
      <div className="flex items-center justify-between pb-2">
        <span className="font-display text-[12px] font-bold text-stone-900">Final marks</span>
        <motion.span
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.4, duration: 0.4, ease: EASE }}
          className="rounded-full bg-teal-600 px-2 py-0.5 text-[9px] font-bold text-white"
        >
          Published
        </motion.span>
      </div>

      <div className="flex gap-1 border-b border-stone-100 pb-1 text-[8.5px] font-bold uppercase tracking-wider text-stone-400">
        <span className="flex-1">Student</span>
        {cols.map(c => <span key={c.k} className="w-8 text-right">{c.label}</span>)}
        <span className="w-9 text-right">Total</span>
      </div>

      {rows.map((r, i) => (
        <div key={r.id} className="flex items-center gap-1 border-b border-stone-50 py-1.5">
          <span className="flex-1 truncate text-[10.5px] font-medium text-stone-700">{r.name}</span>
          {cols.map((c, ci) => (
            /* columns fill in left-to-right, like marks being entered */
            <motion.span
              key={c.k}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + ci * 0.28 + i * 0.05, duration: 0.3 }}
              className="w-8 text-right text-[10px] tabular-nums text-stone-600"
            >
              {r[c.k].toFixed(1)}
            </motion.span>
          ))}
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5 + i * 0.07, duration: 0.35, ease: EASE }}
            className="w-9 text-right font-display text-[11px] font-bold tabular-nums text-teal-700"
          >
            {total(r).toFixed(1)}
          </motion.span>
        </div>
      ))}
    </div>
  )
}

function FilmAssignment({ beat }: { beat: Beat }) {
  return (
    <div className="h-full">
      <div className="flex items-center justify-between pb-2">
        <span className="font-display text-[12px] font-bold text-stone-900">Assignment 4 — ER Diagram</span>
        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700">Due in 2d</span>
      </div>

      {/* a new submission arrives while you watch */}
      <AnimatePresence>
        {beat.landed && (
          <motion.div
            initial={{ opacity: 0, y: -14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="mb-2 flex items-center gap-2.5 rounded-lg border border-teal-200 bg-teal-50/60 px-3 py-2"
          >
            <Avatar student={ROSTER[7]} index={7} size="h-6 w-6" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10.5px] font-semibold text-stone-800">{ROSTER[7].name}</p>
              <p className="text-[9px] text-stone-500">just submitted · 200124_erd.pdf</p>
            </div>
            {beat.graded ? (
              <motion.span
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="font-display text-[11px] font-bold text-teal-700"
              >
                16/20
              </motion.span>
            ) : (
              <span className="rounded-full bg-teal-600 px-2 py-0.5 text-[8.5px] font-bold text-white">New</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {SUBMISSIONS.slice(0, 5).map((s, i) => (
        <div key={s.student.id} className="flex items-center gap-2.5 border-b border-stone-50 py-1.5">
          <Avatar student={s.student} index={i} size="h-6 w-6" />
          <span className="flex-1 truncate text-[10.5px] font-medium text-stone-700">{s.student.name}</span>
          <span className="w-11 text-right font-display text-[10.5px] font-bold tabular-nums text-stone-900">
            {s.mark !== null ? `${s.mark}/20` : "—"}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   PRODUCT SHOWCASE — the big impressive moment

   One shared roster drives every mockup below, so the same students
   appear across attendance, gradebook, and submissions. That
   consistency is what makes the screens read as one real class
   rather than four unrelated demos.
   ══════════════════════════════════════════════════════════════════ */

/** Marks are out of: Att 10 · CT 15 · Assign 10 · Presentation 5 · Mid 20 · Final 40 */
const ROSTER = [
  { id: "200108", name: "Mostafa Kamal",           present: true,  attPct: 96, att: 9.6,  ct: 14.0, asg: 9.5, pres: 4.5, mid: 18.5, fin: 37.0 },
  { id: "200109", name: "Md. Sabbir Hossain Bappy", present: true,  attPct: 90, att: 9.0,  ct: 12.0, asg: 8.0, pres: 4.0, mid: 15.0, fin: 30.0 },
  { id: "200147", name: "Nasif Shahrier Nafi",      present: true,  attPct: 98, att: 9.8,  ct: 14.5, asg: 9.5, pres: 5.0, mid: 18.0, fin: 38.0 },
  { id: "200112", name: "Tasnim Rahman Oishi",      present: true,  attPct: 94, att: 9.4,  ct: 13.0, asg: 9.0, pres: 4.5, mid: 17.0, fin: 34.0 },
  { id: "200115", name: "Rifat Anjum Meem",         present: true,  attPct: 90, att: 9.0,  ct: 12.5, asg: 8.0, pres: 4.0, mid: 15.5, fin: 31.0 },
  { id: "200118", name: "Abdullah Al Mamun",        present: false, attPct: 78, att: 7.8,  ct: 10.5, asg: 7.0, pres: 3.5, mid: 13.0, fin: 26.5 },
  { id: "200121", name: "Sumaiya Akter Jui",        present: true,  attPct: 97, att: 9.7,  ct: 13.5, asg: 9.5, pres: 5.0, mid: 17.5, fin: 35.5 },
  { id: "200124", name: "Tanvir Ahmed Rifat",       present: true,  attPct: 86, att: 8.6,  ct: 11.5, asg: 8.0, pres: 4.0, mid: 14.5, fin: 29.5 },
  { id: "200127", name: "Farhana Yeasmin Mim",      present: true,  attPct: 92, att: 9.2,  ct: 12.0, asg: 8.5, pres: 4.5, mid: 16.0, fin: 32.0 },
  { id: "200130", name: "Mahmudul Hasan Siam",      present: false, attPct: 82, att: 8.2,  ct: 10.0, asg: 6.5, pres: 3.5, mid: 12.5, fin: 25.0 },
  { id: "200133", name: "Ishrat Jahan Nishi",       present: true,  attPct: 99, att: 9.9,  ct: 14.5, asg: 9.5, pres: 5.0, mid: 18.5, fin: 37.5 },
  { id: "200136", name: "Sadia Islam Ritu",         present: true,  attPct: 90, att: 9.0,  ct: 12.0, asg: 8.0, pres: 4.0, mid: 15.0, fin: 30.5 },
  { id: "200139", name: "Rakibul Islam Rakib",      present: false, attPct: 74, att: 7.4,  ct: 9.5,  asg: 6.0, pres: 3.0, mid: 11.5, fin: 23.5 },
  { id: "200142", name: "Jannatul Ferdous Tisha",   present: true,  attPct: 95, att: 9.5,  ct: 13.0, asg: 9.0, pres: 4.5, mid: 16.5, fin: 33.5 },
  { id: "200145", name: "Shakil Ahmed Joy",         present: true,  attPct: 88, att: 8.8,  ct: 11.5, asg: 7.5, pres: 4.0, mid: 14.0, fin: 28.0 },
  { id: "200150", name: "Nusrat Jahan Prova",       present: true,  attPct: 92, att: 9.2,  ct: 12.5, asg: 8.5, pres: 4.5, mid: 15.5, fin: 31.5 },
  { id: "200153", name: "Arifur Rahman Arif",       present: true,  attPct: 80, att: 8.0,  ct: 10.5, asg: 7.0, pres: 3.5, mid: 13.5, fin: 27.0 },
  { id: "200156", name: "Mehedi Hasan Antor",       present: true,  attPct: 93, att: 9.3,  ct: 13.0, asg: 8.5, pres: 4.5, mid: 16.0, fin: 32.5 },
]

/** The visible rows are a window into a full section — these are the real totals. */
const CLASS_SIZE = 47
const CLASS_ABSENT = 4

type Student = (typeof ROSTER)[number]

const total = (s: Student) => s.att + s.ct + s.asg + s.pres + s.mid + s.fin

const initials = (name: string) =>
  name
    .replace(/^Md\.?\s+/i, "")
    .split(" ")
    .map(w => w[0])
    .slice(0, 2)
    .join("")

/* Deterministic per-student avatar tint. Real rosters aren't monochrome —
   varying the tint is what stops the list looking like placeholder data. */
const AVATAR_TINTS = [
  "from-teal-500 to-cyan-600",
  "from-blue-500 to-indigo-600",
  "from-amber-500 to-orange-600",
  "from-violet-500 to-purple-600",
  "from-rose-500 to-pink-600",
  "from-emerald-500 to-teal-600",
]

function Avatar({ student, index, size = "h-7 w-7" }: { student: Student; index: number; size?: string }) {
  return (
    <div
      className={
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[9px] font-bold text-white " +
        size + " " + AVATAR_TINTS[index % AVATAR_TINTS.length]
      }
    >
      {initials(student.name)}
    </div>
  )
}

/** Bottom fade implying the list continues past the frame. */
function ListFade() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white via-white/85 to-transparent"
    />
  )
}

/* Stagger caps out so row 18 doesn't arrive a second and a half late. */
const rowDelay = (i: number) => Math.min(i, 12) * 0.035

/* ══════════════════════════════════════════════════════════════════
   TRY IT — the section directly under the hero

   The hero already plays attendance, marks and submissions. Showing
   the same four screens again immediately below it made this section
   read as a weaker repeat of the thing above. So it does the one job
   the hero can't: it hands over control. The hero is watch; this is do.
   ══════════════════════════════════════════════════════════════════ */

function TryItSection() {
  const frameRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll({ target: frameRef, offset: ["start end", "start 35%"] })
  const rotateX = useTransform(scrollYProgress, [0, 1], [reduced ? 0 : 22, 0])
  const frameScale = useTransform(scrollYProgress, [0, 1], [reduced ? 1 : 0.9, 1])

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-teal-50/40 to-white py-16 sm:py-20 lg:py-24">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/3 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-teal-100/40 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-3 py-1.5 text-[11.5px] font-bold text-teal-700 shadow-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal-500" />
              </span>
              Live on this page
            </span>
          </Reveal>

          <RevealLines
            className="mt-4 font-display text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl md:text-5xl"
            lines={["This isn't a screenshot.", "Take the attendance."]}
            accentFrom={1}
          />

          <Reveal delay={0.15}>
            <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-stone-600">
              Tap any student below and watch the register change, exactly as it
              would on a Sunday morning in Lab 3. No sign-up, no demo request —
              the real thing, running right here.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.2} y={40}>
          <div ref={frameRef} className="relative mx-auto mt-12 max-w-3xl [perspective:2000px]">
            <div aria-hidden className="absolute -inset-6 rounded-[40px] bg-gradient-to-br from-teal-300/40 via-cyan-200/30 to-blue-300/30 blur-3xl sm:-inset-10" />

            <motion.div
              style={{ rotateX, scale: frameScale, transformOrigin: "50% 100%" }}
              className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_40px_100px_-20px_rgba(15,23,42,0.28)]"
            >
              <div className="flex items-center gap-2 border-b border-stone-100 bg-stone-50 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-300" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                </div>
                <span className="mx-auto rounded-md bg-white px-3 py-1 text-[11px] font-medium text-stone-400 sm:mx-0 sm:ml-4">
                  edunexis.app/cse327/attendance
                </span>
              </div>

              <div className="bg-white p-4 sm:p-6">
                <AttendanceMockup />
              </div>
            </motion.div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* The one genuinely interactive moment on the page. Visitors can toggle
   students and watch the counts move — that turns the mockup from something
   you look at into something you try, which is the part no screenshot and no
   competitor's marketing page can do. */
function AttendanceMockup() {
  const [absent, setAbsent] = useState<Set<string>>(
    () => new Set(ROSTER.filter(s => !s.present).map(s => s.id)),
  )
  const [touched, setTouched] = useState(false)

  /* A toggle isn't a task. Letting someone finish the job — mark the roll,
     press save, see it confirmed — is what makes this feel like using the
     product rather than poking a widget. */
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle")

  /* Ghost-cursor demo: nobody guesses a marketing mockup is clickable, so it
     shows them once. A simulated pointer taps two rows, the states flip, then
     it steps aside and hands over. Cancelled the moment a real click lands. */
  const rootRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const inView = useInViewOnce(rootRef)
  const [ghost, setGhost] = useState<{ x: number; y: number; tapping: boolean } | null>(null)
  const [demoDone, setDemoDone] = useState(false)
  /* Drives the replay. demoDone must NOT gate the effect: setting it would
     trigger cleanup, which clears the pending replay timer and deadlocks the
     loop after a single pass. A separate counter re-runs the effect instead. */
  const [cycle, setCycle] = useState(0)

  const toggle = (id: string) => {
    setTouched(true)
    setSaveState("idle")
    setAbsent(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const markAllPresent = () => {
    setTouched(true)
    setSaveState("idle")
    setAbsent(new Set())
  }

  const save = () => {
    setSaveState("saving")
    window.setTimeout(() => setSaveState("saved"), 900)
  }

  useEffect(() => {
    if (!inView || reduced || touched || demoDone) return
    let cancelled = false
    const timers: number[] = []
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms))

    const rowCenter = (id: string) => {
      const root = rootRef.current
      const row = root?.querySelector<HTMLElement>(`[data-row="${id}"]`)
      if (!root || !row) return null
      const r = row.getBoundingClientRect()
      const b = root.getBoundingClientRect()
      return { x: r.right - b.left - 52, y: r.top - b.top + r.height / 2 }
    }

    /* Two taps: mark an absent student present, then a present one absent —
       so the counter visibly moves in both directions. */
    const first = ROSTER[5]   // Abdullah — starts absent
    const second = ROSTER[3]  // Tasnim — starts present

    at(700, () => {
      if (cancelled) return
      const p = rowCenter(first.id)
      if (p) setGhost({ ...p, tapping: false })
    })
    at(1500, () => { if (!cancelled) setGhost(g => (g ? { ...g, tapping: true } : g)) })
    at(1700, () => {
      if (cancelled) return
      setAbsent(prev => { const n = new Set(prev); n.delete(first.id); return n })
      setGhost(g => (g ? { ...g, tapping: false } : g))
    })
    at(2400, () => {
      if (cancelled) return
      const p = rowCenter(second.id)
      if (p) setGhost({ ...p, tapping: false })
    })
    at(3100, () => { if (!cancelled) setGhost(g => (g ? { ...g, tapping: true } : g)) })
    at(3300, () => {
      if (cancelled) return
      setAbsent(prev => { const n = new Set(prev); n.add(second.id); return n })
      setGhost(g => (g ? { ...g, tapping: false } : g))
    })
    at(4200, () => { if (!cancelled) setGhost(null) })
    at(4500, () => { if (!cancelled) setDemoDone(true) })
    /* Replay rather than stop: a demo that runs once and freezes leaves the
       section looking inert to anyone arriving a few seconds late. Keeps
       inviting until a real click takes over. */
    at(7600, () => {
      if (cancelled) return
      setAbsent(new Set(ROSTER.filter(s => !s.present).map(s => s.id)))
      setDemoDone(false)
      setCycle(c => c + 1)
    })

    return () => { cancelled = true; timers.forEach(clearTimeout) }
  }, [inView, reduced, touched, cycle])

  /* Offscreen students keep their original state; only the visible window is
     interactive, so the totals stay consistent with "1–18 of 47". */
  const hiddenAbsent = CLASS_ABSENT - ROSTER.filter(s => !s.present).length
  const absentTotal = absent.size + hiddenAbsent
  const presentTotal = CLASS_SIZE - absentTotal

  const showTryBadge = !touched && (demoDone || reduced)

  return (
    <div ref={rootRef} className="relative">
      {/* simulated pointer — purely decorative, never intercepts real input */}
      <AnimatePresence>
        {ghost && (
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, left: ghost.x, top: ghost.y, scale: ghost.tapping ? 0.82 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 20, opacity: { duration: 0.25 } }}
            className="pointer-events-none absolute z-20"
          >
            <div className="relative">
              {ghost.tapping && (
                <motion.span
                  initial={{ scale: 0.4, opacity: 0.6 }}
                  animate={{ scale: 2.4, opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="absolute -left-3 -top-3 h-8 w-8 rounded-full bg-teal-400"
                />
              )}
              <svg viewBox="0 0 24 24" className="h-5 w-5 drop-shadow-md" fill="white" stroke="#0f766e" strokeWidth="1.5">
                <path d="M5 3l14 8-6.5 1.5L9 19z" strokeLinejoin="round" />
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-[15px] font-bold text-stone-900">CSE327 · Database Systems</h3>
          <p className="text-[12px] text-stone-500">Sunday, 11 Aug 2026 · Lab session · Section A</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 sm:flex">
            <Search className="h-3.5 w-3.5 text-stone-400" />
            <span className="text-[12px] text-stone-400">Search student…</span>
          </div>
          <button
            onClick={markAllPresent}
            className="rounded-lg bg-teal-900 px-3 py-1.5 text-[11.5px] font-bold text-white transition-colors hover:bg-teal-700"
          >
            Mark all present
          </button>
        </div>
      </div>

      {/* The cue sits ABOVE the register, not under it. Most visitors scroll
          before they read, so an invitation placed below the list is one most
          people never reach. */}
      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-teal-200 bg-teal-50/70 px-3.5 py-2.5">
        <span className="inline-flex items-center gap-2 text-[12px] font-bold text-teal-800">
          <motion.span
            animate={touched ? { scale: 1 } : { scale: [1, 1.55, 1], opacity: [1, 0.45, 1] }}
            transition={{ duration: 1.5, repeat: touched ? 0 : Infinity, ease: "easeInOut" }}
            className="h-2 w-2 rounded-full bg-teal-500"
          />
          {touched ? "Keep going — this is the real register." : "Tap any student to mark them present or absent"}
        </span>
        <span className="hidden text-[11px] font-semibold text-teal-700/70 sm:inline">Nothing is saved to a server</span>
      </div>

      {/* column header — small thing, but tables without one look fake */}
      <div className="mt-3 flex items-center gap-3 rounded-t-xl border border-b-0 border-stone-100 bg-stone-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-stone-500">
        <span className="w-7" />
        <span className="flex-1">Student</span>
        <span className="hidden w-20 text-right sm:block">Attendance</span>
        <span className="w-[74px] text-right">Today</span>
      </div>

      <div className="relative">
        <div className="max-h-[300px] overflow-hidden rounded-b-xl border border-stone-100 sm:max-h-[352px]">
          {ROSTER.map((s, i) => {
            const isPresent = !absent.has(s.id)
            return (
              <motion.button
                key={s.id}
                type="button"
                data-row={s.id}
                onClick={() => toggle(s.id)}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: rowDelay(i) }}
                aria-pressed={isPresent}
                aria-label={`${s.name} — ${isPresent ? "present" : "absent"}, tap to toggle`}
                className="flex w-full items-center gap-3 border-b border-stone-50 px-3 py-1.5 text-left transition-colors even:bg-stone-50/40 hover:bg-teal-50/50"
              >
                <Avatar student={s} index={i} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-semibold text-stone-800">{s.name}</p>
                  <p className="text-[10.5px] text-stone-400">ID {s.id}</p>
                </div>

                {/* running attendance % to date — the number teachers actually care about */}
                <div className="hidden w-20 items-center justify-end gap-1.5 sm:flex">
                  <div className="h-1 w-9 overflow-hidden rounded-full bg-stone-200">
                    <div
                      className={"h-full rounded-full " + (s.attPct >= 80 ? "bg-teal-500" : "bg-amber-500")}
                      style={{ width: `${s.attPct}%` }}
                    />
                  </div>
                  <span className="text-[10.5px] font-semibold tabular-nums text-stone-500">{s.attPct}%</span>
                </div>

                <span
                  className={
                    "inline-flex w-[74px] shrink-0 items-center justify-center gap-1.5 rounded-full px-2 py-1 text-[10.5px] font-bold transition-colors " +
                    (isPresent ? "bg-teal-50 text-teal-700" : "bg-rose-50 text-rose-600")
                  }
                >
                  <motion.span
                    key={String(isPresent)}
                    initial={{ scale: 0.4 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className={"h-1.5 w-1.5 rounded-full " + (isPresent ? "bg-teal-500" : "bg-rose-500")}
                  />
                  {isPresent ? "Present" : "Absent"}
                </span>
              </motion.button>
            )
          })}
        </div>
        <ListFade />
      </div>

      {/* Finish the job: save the register and get it confirmed. */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-3">
        <span className="text-[12px] font-semibold tabular-nums text-stone-600">
          <span className="text-teal-700">{presentTotal} present</span>
          <span className="text-stone-300"> · </span>
          <span className={absentTotal ? "text-rose-600" : "text-stone-400"}>{absentTotal} absent</span>
          <span className="ml-1 font-normal text-stone-400">of {CLASS_SIZE}</span>
        </span>

        <AnimatePresence initial={false} mode="popLayout">
          {saveState === "saved" ? (
            <motion.span
              key="saved"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-50 px-3.5 py-2 text-[12px] font-bold text-teal-700"
            >
              <Check className="h-4 w-4" strokeWidth={3} />
              Saved · {CLASS_SIZE} students notified
            </motion.span>
          ) : (
            <motion.button
              key="save"
              onClick={save}
              disabled={saveState === "saving"}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-900 px-4 py-2 text-[12px] font-bold text-white shadow-[0_8px_20px_-8px_rgba(19,78,74,0.9)] transition-colors hover:bg-teal-800 disabled:opacity-70"
            >
              {saveState === "saving" ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white"
                  />
                  Saving…
                </>
              ) : (
                <>
                  Save attendance
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* Grade columns mirror how courses here are actually weighted — attendance,
   class tests, assignment, presentation, mid, final. A four-column gradebook
   is the tell that a screenshot is fake. */
const GRADE_COLS = [
  { key: "att", label: "Att", max: 10 },
  { key: "ct", label: "CT", max: 15 },
  { key: "asg", label: "Assign", max: 10 },
  { key: "pres", label: "Pres", max: 5 },
  { key: "mid", label: "Mid", max: 20 },
  { key: "fin", label: "Final", max: 40 },
] as const

function letterGrade(t: number) {
  if (t >= 80) return { g: "A+", c: "bg-teal-50 text-teal-700" }
  if (t >= 75) return { g: "A", c: "bg-teal-50 text-teal-700" }
  if (t >= 70) return { g: "A-", c: "bg-emerald-50 text-emerald-700" }
  if (t >= 65) return { g: "B+", c: "bg-blue-50 text-blue-700" }
  if (t >= 60) return { g: "B", c: "bg-blue-50 text-blue-700" }
  return { g: "C", c: "bg-amber-50 text-amber-700" }
}

function GradebookMockup() {
  const avg = ROSTER.reduce((sum, s) => sum + total(s), 0) / ROSTER.length

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-[15px] font-bold text-stone-900">CSE327 · Final Gradebook</h3>
          <p className="text-[12px] text-stone-500">Spring 2026 · {CLASS_SIZE} students</p>
        </div>
        <div className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-stone-50 px-3 py-1.5 font-mono text-[10.5px] font-medium text-stone-600">
          Total = Att + CT + Assign + Pres + Mid + Final
        </div>
      </div>

      <div className="relative mt-4">
        <div className="max-h-[336px] overflow-auto rounded-xl border border-stone-100 sm:max-h-[492px]">
          <table className="w-full min-w-[620px] text-left text-[11.5px]">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-stone-100 bg-stone-50 text-[9.5px] font-bold uppercase tracking-wider text-stone-500">
                <th className="px-3 py-2.5">Student</th>
                {GRADE_COLS.map(c => (
                  <th key={c.key} className="px-2 py-2.5 text-right">
                    {c.label} <span className="font-medium text-stone-400">/{c.max}</span>
                  </th>
                ))}
                <th className="px-3 py-2.5 text-right">Total</th>
                <th className="px-3 py-2.5 text-right">Grade</th>
              </tr>
            </thead>
            <tbody>
              {ROSTER.map((s, i) => {
                const t = total(s)
                const lg = letterGrade(t)
                return (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.35, delay: rowDelay(i) }}
                    className="border-b border-stone-50 even:bg-stone-50/40"
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Avatar student={s} index={i} size="h-6 w-6" />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-stone-800">{s.name}</p>
                          <p className="text-[10px] text-stone-400">{s.id}</p>
                        </div>
                      </div>
                    </td>
                    {GRADE_COLS.map(c => (
                      <td key={c.key} className="px-2 py-2 text-right tabular-nums text-stone-600">
                        {s[c.key].toFixed(1)}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-right font-display font-bold tabular-nums text-stone-900">
                      {t.toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className={"rounded-md px-1.5 py-0.5 text-[10px] font-bold " + lg.c}>{lg.g}</span>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <ListFade />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11.5px]">
        <span className="inline-flex items-center gap-1.5 text-stone-500">
          <Check className="h-3.5 w-3.5 text-teal-600" />
          Formula applied to all {CLASS_SIZE} students · publishes on save
        </span>
        <span className="font-semibold text-stone-500">
          Class average <span className="font-display text-teal-700">{avg.toFixed(1)}</span>
        </span>
      </div>
    </div>
  )
}

function CourseMockup() {
  const materials = [
    { name: "Lecture 08 — Normalization (3NF, BCNF).pdf", meta: "2.4 MB · Uploaded 3 days ago", Icon: FileText },
    { name: "Lecture 07 — Functional Dependency.pdf", meta: "1.8 MB · Uploaded 1 week ago", Icon: FileText },
    { name: "ER Diagram — worked examples.pdf", meta: "1.1 MB · Uploaded 1 week ago", Icon: FileText },
    { name: "Lab manual — SQL joins & subqueries", meta: "Folder · 6 files", Icon: FolderOpen },
    { name: "Reference — Silberschatz Ch. 7", meta: "4.7 MB · Uploaded 2 weeks ago", Icon: FileText },
    { name: "Slides — Transaction basics", meta: "3.2 MB · Uploaded 2 weeks ago", Icon: FileText },
    { name: "Past questions — Mid 2025", meta: "Folder · 4 files", Icon: FolderOpen },
  ]

  return (
    <div>
      <div className="rounded-xl bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-700 p-5 text-white">
        <p className="text-[10px] font-bold uppercase tracking-wider text-teal-100">CSE327 · Section A</p>
        <h3 className="mt-1 font-display text-[18px] font-bold">Database Systems</h3>
        <p className="mt-1 text-[12px] text-teal-50">Dr. Farhana Islam · Spring 2026 · {CLASS_SIZE} students</p>

        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-white/20 pt-3">
          {[
            { v: "24", l: "Materials" },
            { v: "9", l: "Assignments" },
            { v: "91%", l: "Avg attendance" },
          ].map(s => (
            <div key={s.l}>
              <p className="font-display text-[16px] font-bold">{s.v}</p>
              <p className="text-[10px] text-teal-100">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex gap-5 overflow-x-auto border-b border-stone-100 text-[12.5px] font-semibold text-stone-400">
        {["Materials", "Assignments", "Attendance", "Marks", "Students"].map((t, i) => (
          <span
            key={t}
            className={"shrink-0 border-b-2 pb-2.5 " + (i === 0 ? "border-teal-600 text-stone-900" : "border-transparent")}
          >
            {t}
          </span>
        ))}
      </div>

      <div className="relative mt-3">
        <div className="max-h-[300px] space-y-2 overflow-hidden sm:max-h-[430px]">
          {materials.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: rowDelay(i) }}
              className="flex items-center gap-3 rounded-lg border border-stone-100 px-3.5 py-2.5"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <m.Icon className="h-4 w-4" strokeWidth={2.25} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-semibold text-stone-800">{m.name}</p>
                <p className="text-[11px] text-stone-400">{m.meta}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-stone-300" />
            </motion.div>
          ))}
        </div>
        <ListFade />
      </div>
    </div>
  )
}

/* Submission state derived from the shared roster so the same students,
   in the same order, carry across from the attendance and gradebook views. */
const SUBMISSIONS = ROSTER.map((s, i) => {
  const late = i === 5 || i === 12
  const missing = i === 9 || i === 16
  const graded = !missing && i % 3 !== 2
  return {
    student: s,
    status: missing ? "Missing" : graded ? "Graded" : "Submitted",
    late,
    mark: missing ? null : graded ? Math.round(s.asg * 2) : null,
    at: missing ? "—" : late ? "11 Aug, 11:58 PM" : `${8 + (i % 3)} Aug, ${1 + (i % 9)}:${(i * 7) % 60 < 10 ? "0" : ""}${(i * 7) % 60} PM`,
  }
})

const STATUS_STYLES: Record<string, string> = {
  Graded: "bg-teal-50 text-teal-700",
  Submitted: "bg-blue-50 text-blue-700",
  Missing: "bg-rose-50 text-rose-600",
}

function AssignmentMockup() {
  const gradedCount = SUBMISSIONS.filter(s => s.status === "Graded").length

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-display text-[15px] font-bold text-stone-900">Assignment 4 — ER Diagram</h3>
          <p className="mt-1 max-w-sm text-[12px] leading-relaxed text-stone-500">
            Design an ER diagram for a library management system. Include cardinality, weak entities, and keys.
          </p>
        </div>
        <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-700">
          <Calendar className="h-3.5 w-3.5" />
          Due in 2 days · 20 marks
        </div>
      </div>

      {/* progress toward "everything graded" — the thing a teacher checks first */}
      <div className="mt-4 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(gradedCount / SUBMISSIONS.length) * 100}%` }}
            transition={{ duration: 0.9, ease: EASE }}
            className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500"
          />
        </div>
        <span className="shrink-0 text-[11px] font-semibold text-stone-500">
          {gradedCount} of {CLASS_SIZE} graded
        </span>
      </div>

      <div className="relative mt-3">
        <div className="max-h-[336px] overflow-hidden rounded-xl border border-stone-100 sm:max-h-[492px]">
          {SUBMISSIONS.map((sub, i) => (
            <motion.div
              key={sub.student.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: rowDelay(i) }}
              className="flex items-center gap-3 border-b border-stone-50 px-3 py-1.5 even:bg-stone-50/40"
            >
              <Avatar student={sub.student} index={i} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-semibold text-stone-800">{sub.student.name}</p>
                <div className="mt-0.5 flex items-center gap-1 text-[10.5px] text-stone-400">
                  {sub.status === "Missing" ? (
                    <span>No submission</span>
                  ) : (
                    <>
                      <Paperclip className="h-2.5 w-2.5 shrink-0" />
                      <span className="truncate">{sub.student.id}_erd.pdf</span>
                      <span className="hidden sm:inline">· {sub.at}</span>
                      {sub.late && <span className="font-semibold text-amber-600">· Late</span>}
                    </>
                  )}
                </div>
              </div>
              <span
                className={"hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold sm:inline " + STATUS_STYLES[sub.status]}
              >
                {sub.status}
              </span>
              <span className="w-11 shrink-0 text-right font-display text-[12.5px] font-bold tabular-nums text-stone-900">
                {sub.mark !== null ? `${sub.mark}/20` : "—"}
              </span>
            </motion.div>
          ))}
        </div>
        <ListFade />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-stone-500">
        <span className="inline-flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5" />
          Inline feedback on every graded submission
        </span>
        <span className="text-stone-400">
          Showing 1–{SUBMISSIONS.length} of {CLASS_SIZE}
        </span>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   WHY EDUNEXIS

   Previously this was an essay — a headline, a paragraph and three
   text points — on a page where every other section shows something.
   It was the only section with nothing to look at, and a reader with
   no CS background had to work to get the argument.

   Now it argues visually: the scattered tools on the left against one
   workspace on the right. The clutter is the point, so it is built as
   overlapping, tilted, desaturated cards that settle as you scroll.

   The pinned scroll-through was also dropped. It cost roughly three
   viewports to deliver three short points, on a page whose own claim
   is that it is light and quick.

   Note: the surrounding cards are deliberately generic — "Group
   chat", "Shared drive" — rather than imitations of real products'
   interfaces. The copy can name Google Classroom; the UI shouldn't
   counterfeit it.
   ══════════════════════════════════════════════════════════════════ */

const WHY_POINTS = [
  {
    title: "Built with faculty, not for a demo",
    desc: "Class tests, presentation marks, lab attendance — every feature traces back to a real teacher at JUST asking for it.",
  },
  {
    title: "One workspace, not five tabs",
    desc: "Materials, assignments, grades and announcements live together. No more Drive links pasted into chat pasted into email.",
  },
  {
    title: "Built for the connection you actually have",
    desc: "The whole site is lighter than a single photo, so it opens fast on campus wifi and on mobile data. Free for departments.",
  },
]

/** The scattered tools a course currently runs on. */
const SCATTER = [
  { Icon: MessageSquare, label: "Group chat",          line: "“sir, slide ta din please”",  x: 0,   y: 4,   w: 158, rot: "-3deg",   drift: -7, dur: 6.5 },
  { Icon: FolderOpen,    label: "Shared drive",        line: "Lecture slides (3 versions)", x: 172, y: 30,  w: 162, rot: "2.4deg",  drift: 6,  dur: 7.6 },
  { Icon: BarChart3,     label: "marks_final_v4.xlsx", line: "Last edited by… someone",     x: 14,  y: 96,  w: 168, rot: "1.6deg",  drift: -5, dur: 8.2 },
  { Icon: Paperclip,     label: "Inbox",               line: "27 attachments",              x: 196, y: 122, w: 136, rot: "-2.2deg", drift: 7,  dur: 6.9 },
  { Icon: FileText,      label: "Attendance sheet",    line: "Photo of a paper register",   x: 0,   y: 178, w: 172, rot: "-1.6deg", drift: -6, dur: 7.8 },
  { Icon: Bell,          label: "Notice board",        line: "Posted. Nobody saw it.",      x: 182, y: 200, w: 152, rot: "2.8deg",  drift: 5,  dur: 7.2 },
]

function WhyPanel() {
  return (
    /* Shared "teal ink" surface (teal-950), used by every dark moment on the
       site. A neutral near-black reads as a hole punched in a white/teal page;
       a deep teal reads as the brand colour turned dark. */
    <section className="relative overflow-hidden bg-teal-950 py-14 sm:py-16 lg:py-20">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div aria-hidden className="absolute -top-40 left-1/4 h-[420px] w-[420px] rounded-full bg-teal-500/15 blur-3xl" />
      <div aria-hidden className="absolute -bottom-40 right-1/4 h-[380px] w-[380px] rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-teal-300">
              Why EduNexis
            </p>
          </Reveal>
          <RevealLines
            className="mt-4 font-display text-3xl font-extrabold leading-[1.12] tracking-tight text-white sm:text-4xl md:text-5xl"
            lines={["Google Classroom was built for a", "browser tab. Not for a 3-hour lab", "and a 60-name roll call."]}
            accentFrom={2}
            accentClass="bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent"
          />
        </div>

        {/* the argument, made visually */}
        <div className="mt-12 grid grid-cols-1 items-center gap-10 lg:grid-cols-[0.78fr_auto_1.35fr] lg:gap-10">
          <ScatterColumn />

          <Reveal delay={0.25}>
            <div className="flex flex-col items-center gap-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-400/70">
                becomes
              </span>
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-teal-400/30 bg-teal-400/10">
                <ArrowRight className="h-5 w-5 rotate-90 text-teal-300 lg:rotate-0" />
              </div>
            </div>
          </Reveal>

          <OneWorkspaceColumn />
        </div>

        {/* the three points, compact — no longer a pinned scroll-through */}
        <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-7 border-t border-teal-400/15 pt-10 md:grid-cols-3">
          {WHY_POINTS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={REVEAL_VIEWPORT}
              transition={{ duration: 0.55, delay: i * 0.12, ease: EASE }}
            >
              <span className="font-display text-[13px] font-bold text-teal-300">0{i + 1}</span>
              <h3 className="mt-2 font-display text-[16px] font-bold text-white">{p.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-teal-100/70">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * Left side: the tools a course currently leaks across.
 *
 * Scattered, not stacked. A single left-aligned column read as a tidy list —
 * which is the opposite of the point — and left the right half of the space
 * empty. These sit in two loose staggered runs with varied vertical offsets,
 * each narrow enough to feel like a fragment rather than a row.
 *
 * They arrive one after another and then stay: an earlier version cycled them
 * in and out and nobody could finish reading one. The only continuing motion
 * is a slow independent float per card.
 *
 * Deliberately a different motion language from the hero: the hero is a
 * scripted walkthrough with a cursor; this is idle drift.
 */
function ScatterColumn() {
  const reduced = usePrefersReducedMotion()

  return (
    <div>
      <Reveal>
        <p className="mb-5 text-center text-[12px] font-bold uppercase tracking-[0.16em] text-teal-100/45 lg:text-left">
          How a course runs now
        </p>
      </Reveal>

      <div className="relative mx-auto h-[330px] w-full max-w-[340px]">
        {SCATTER.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, scale: 0.92, y: 14 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={REVEAL_VIEWPORT}
            transition={{ duration: 0.55, delay: i * 0.12, ease: EASE }}
            className="absolute"
            style={{ left: card.x, top: card.y, width: card.w }}
          >
            <motion.div
              animate={reduced ? undefined : { y: [0, card.drift, 0] }}
              transition={{ duration: card.dur, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
              className="rounded-xl border border-white/10 bg-white/[0.07] px-2.5 py-2 backdrop-blur-sm"
              style={{ rotate: card.rot }}
            >
              <div className="flex items-center gap-1.5">
                <card.Icon className="h-3 w-3 shrink-0 text-teal-100/50" strokeWidth={2} />
                <span className="truncate text-[10.5px] font-semibold text-teal-100/75">{card.label}</span>
              </div>
              <p className="mt-0.5 truncate text-[9.5px] text-teal-100/40">{card.line}</p>
            </motion.div>
          </motion.div>
        ))}

        {/* the cost of the mess, stated plainly */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={REVEAL_VIEWPORT}
          transition={{ duration: 0.5, delay: 0.8, ease: EASE }}
          className="absolute bottom-0 left-1/2 w-[262px] -translate-x-1/2 rounded-lg border border-rose-400/40 bg-rose-500/[0.18] px-3 py-2.5 text-center backdrop-blur-sm"
        >
          <p className="text-[11.5px] font-semibold text-rose-100">
            One mark goes missing and nobody can prove where.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

/**
 * Right side: the same course, consolidated.
 *
 * The previous version cycled the tab strip while the body never changed, so
 * "Materials" and "Attendance" both showed a list of marks — the label and the
 * content disagreed.
 *
 * Replaced with a different idea altogether, and one the hero doesn't use:
 * nothing switches screens here. Each scattered tool on the other side of the
 * arrow *lands* in this window as a proper row, one after another, until the
 * whole course has been absorbed into one place. Consolidation, not navigation.
 */
const ABSORBED = [
  { Icon: FolderOpen, label: "Materials", detail: "24 files, in folders", from: "Shared drive" },
  { Icon: Paperclip, label: "Assignment 4", detail: "24 of 47 submitted", from: "Inbox" },
  { Icon: ClipboardCheck, label: "Attendance", detail: "43 of 47 present today", from: "Paper register" },
  { Icon: BarChart3, label: "Final marks", detail: "Formula applied · published", from: "marks_v4.xlsx" },
  { Icon: Bell, label: "Announcement", detail: "Lab 4 moved · 47 notified", from: "Notice board" },
]

function OneWorkspaceColumn() {
  /* One extra step at the end so the finished state holds before it replays. */
  const { ref, i } = useLoopIndex(ABSORBED.length + 3, 900)
  const landed = Math.min(i, ABSORBED.length)

  return (
    <div ref={ref}>
      <Reveal delay={0.15}>
        <p className="mb-5 text-center text-[12px] font-bold uppercase tracking-[0.16em] text-teal-300 lg:text-left">
          How it runs on EduNexis
        </p>
      </Reveal>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={REVEAL_VIEWPORT}
        transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
        className="relative mx-auto w-full max-w-xl"
      >
        <div aria-hidden className="absolute -inset-4 rounded-[28px] bg-teal-400/20 blur-3xl" />

        <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white shadow-[0_30px_70px_-20px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-1.5 border-b border-stone-100 bg-stone-50 px-3.5 py-2.5">
            <div className="h-2 w-2 rounded-full bg-rose-300" />
            <div className="h-2 w-2 rounded-full bg-amber-300" />
            <div className="h-2 w-2 rounded-full bg-emerald-300" />
            <span className="ml-2 text-[9.5px] font-medium text-stone-400">edunexis.app/cse327</span>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between">
              <span className="font-display text-[14px] font-bold text-stone-900">CSE327 · Database Systems</span>
              <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[9.5px] font-bold text-teal-700">47 students</span>
            </div>

            <div className="mt-3 h-[272px] space-y-1.5">
              {ABSORBED.map((row, idx) => {
                const here = idx < landed
                return (
                  <motion.div
                    key={row.label}
                    initial={false}
                    animate={{
                      opacity: here ? 1 : 0,
                      x: here ? 0 : -34,
                      scale: here ? 1 : 0.96,
                    }}
                    transition={{ duration: 0.45, ease: EASE }}
                    className="flex items-center gap-2.5 rounded-lg border border-stone-100 bg-stone-50/70 px-2.5 py-2"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-teal-50">
                      <row.Icon className="h-3.5 w-3.5 text-teal-700" strokeWidth={2.25} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11.5px] font-bold text-stone-800">{row.label}</p>
                      <p className="truncate text-[10px] text-stone-500">{row.detail}</p>
                    </div>
                    {/* names the thing it replaced, tying it to the left column */}
                    <span className="hidden shrink-0 text-[9px] font-medium text-stone-400 sm:inline">
                      was {row.from}
                    </span>
                    <Check className="h-3.5 w-3.5 shrink-0 text-teal-600" strokeWidth={3} />
                  </motion.div>
                )
              })}
            </div>

            <motion.div
              initial={false}
              animate={{ opacity: landed >= ABSORBED.length ? 1 : 0.25 }}
              transition={{ duration: 0.45 }}
              className="mt-3 flex items-center gap-1.5 border-t border-stone-100 pt-2.5 text-[10.5px] font-semibold text-teal-700"
            >
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
              Everything for this course, in one place
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/* ── Feature panels ────────────────────────────────────────────────
   Purpose-built animated screens for the three feature rows.

   These replace the static mockups that were dropped into a fixed
   box with their own inner scrollbars — a scrollbar inside a
   marketing card reads as a screenshot that didn't fit. Each panel
   is sized to its frame and *plays* its feature instead: the formula
   being set, submissions landing, a file uploading.

   All three loop on one index, suspend off-screen, and animate only
   transform/opacity.
   ────────────────────────────────────────────────────────────────── */

function useLoopIndex(count: number, ms: number) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const [onScreen, setOnScreen] = useState(false)
  const [i, setI] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (reduced || !onScreen) return
    const id = window.setTimeout(() => setI(n => (n + 1) % count), ms)
    return () => clearTimeout(id)
  }, [i, count, ms, reduced, onScreen])

  return { ref, i: reduced ? count - 1 : i }
}

/** Marks — the formula is set, then every total computes from it. */
function PanelMarks() {
  const { ref, i } = useLoopIndex(7, 1000)
  const cols = [
    { k: "att" as const, label: "Att", max: 10 },
    { k: "ct" as const, label: "CT", max: 15 },
    { k: "asg" as const, label: "Asgn", max: 10 },
    { k: "mid" as const, label: "Mid", max: 20 },
    { k: "fin" as const, label: "Final", max: 40 },
  ]
  /* Columns light up one at a time, then every total resolves at once — the
     point being that you define the parts and the answer falls out. */
  const setCount = Math.min(i, cols.length)
  const computing = i >= cols.length
  const rows = ROSTER.slice(0, 6)

  return (
    <div ref={ref} className="flex h-[286px] flex-col">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">CSE327 · Final marks</p>
        <motion.span
          initial={false}
          animate={{ opacity: computing ? 1 : 0, scale: computing ? 1 : 0.85 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="rounded-full bg-teal-600 px-2 py-0.5 text-[9px] font-bold text-white"
        >
          Published
        </motion.span>
      </div>

      {/* the formula being assembled, component by component */}
      <div className="mt-2 flex flex-wrap items-center gap-1">
        {cols.map((c, idx) => (
          <motion.span
            key={c.k}
            initial={false}
            animate={{
              opacity: idx < setCount ? 1 : 0.28,
              scale: idx === setCount - 1 ? [1, 1.14, 1] : 1,
            }}
            transition={{ duration: 0.34, ease: EASE }}
            className={
              "rounded-md px-1.5 py-0.5 text-[9.5px] font-bold transition-colors " +
              (idx < setCount ? "bg-teal-600 text-white" : "bg-stone-100 text-stone-400")
            }
          >
            {c.label} /{c.max}
          </motion.span>
        ))}
      </div>

      {/* full table so the frame is actually filled edge to edge */}
      <table className="mt-3 w-full table-fixed text-left">
        <thead>
          <tr className="text-[8.5px] font-bold uppercase tracking-wider text-stone-400">
            <th className="pb-1.5">Student</th>
            {cols.map((c, idx) => (
              <th key={c.k} className="w-[36px] pb-1.5 text-right">
                <motion.span initial={false} animate={{ opacity: idx < setCount ? 1 : 0.3 }} className="block">
                  {c.label}
                </motion.span>
              </th>
            ))}
            <th className="w-[42px] pb-1.5 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s, r) => (
            <tr key={s.id} className="border-t border-stone-100">
              <td className="py-[5px]">
                <div className="flex items-center gap-1.5">
                  <Avatar student={s} index={r} size="h-5 w-5" />
                  <span className="truncate text-[10.5px] font-medium text-stone-700">{s.name}</span>
                </div>
              </td>
              {cols.map((c, idx) => (
                <td key={c.k} className="py-[5px] text-right">
                  <motion.span
                    initial={false}
                    animate={{ opacity: idx < setCount ? 1 : 0, y: idx < setCount ? 0 : 4 }}
                    transition={{ duration: 0.3, delay: idx < setCount ? r * 0.03 : 0 }}
                    className="block text-[10px] tabular-nums text-stone-600"
                  >
                    {s[c.k].toFixed(1)}
                  </motion.span>
                </td>
              ))}
              <td className="py-[5px] text-right">
                <motion.span
                  initial={false}
                  animate={{ opacity: computing ? 1 : 0, y: computing ? 0 : 5 }}
                  transition={{ duration: 0.38, delay: computing ? r * 0.07 : 0, ease: EASE }}
                  className="block font-display text-[11px] font-bold tabular-nums text-teal-700"
                >
                  {total(s).toFixed(1)}
                </motion.span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <motion.div
        initial={false}
        animate={{ opacity: computing ? 1 : 0.3 }}
        transition={{ delay: computing ? 0.5 : 0, duration: 0.4 }}
        className="mt-auto flex items-center gap-1.5 border-t border-stone-100 pt-2 text-[10px] font-semibold text-teal-700"
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
        Same formula applied to all 47 students
      </motion.div>
    </div>
  )
}

/** Assignments — submissions land one after another and get graded. */
function PanelSubmissions() {
  const { ref, i } = useLoopIndex(6, 1250)
  const arrived = Math.min(i + 1, 4)
  const graded = i >= 4

  return (
    <div ref={ref} className="h-[286px]">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Assignment 4 · ER Diagram</p>
        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9.5px] font-bold text-amber-700">Due in 2d</span>
      </div>

      <div className="mt-3 space-y-2">
        <AnimatePresence initial={false}>
          {ROSTER.slice(0, 4).slice(0, arrived).map((s, idx) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: -14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="flex items-center gap-2.5 rounded-lg border border-stone-100 bg-white px-3 py-2"
            >
              <Avatar student={s} index={idx} size="h-6 w-6" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11.5px] font-semibold text-stone-800">{s.name}</p>
                <p className="flex items-center gap-1 text-[10px] text-stone-400">
                  <Paperclip className="h-2.5 w-2.5" />
                  {s.id}_erd.pdf
                </p>
              </div>
              {graded ? (
                <motion.span
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, delay: idx * 0.1 }}
                  className="font-display text-[12px] font-bold text-teal-700"
                >
                  {16 + idx}/20
                </motion.span>
              ) : (
                <span className="rounded-full bg-teal-600 px-2 py-0.5 text-[9px] font-bold text-white">New</span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <motion.div
        initial={false}
        animate={{ opacity: graded ? 1 : 0.35 }}
        className="mt-3 flex items-center gap-1.5 border-t border-stone-100 pt-2.5 text-[11px] font-semibold text-stone-500"
      >
        <MessageSquare className="h-3.5 w-3.5 text-teal-600" />
        Feedback stays attached to each file
      </motion.div>
    </div>
  )
}

/** Materials — a file uploads and joins the course folder. */
function PanelMaterials() {
  const { ref, i } = useLoopIndex(5, 1200)
  const uploading = i === 1 || i === 2
  const done = i >= 3

  const existing = [
    { name: "Lecture 07 — Functional Dependency.pdf", meta: "1.8 MB" },
    { name: "Lab manual — SQL joins", meta: "Folder · 6 files" },
    { name: "Past questions — Mid 2025", meta: "Folder · 4 files" },
  ]

  return (
    <div ref={ref} className="h-[286px]">
      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">CSE327 · Materials</p>

      {/* the upload dropzone doing its work */}
      <div
        className={
          "mt-2.5 rounded-xl border-2 border-dashed px-3 py-3 text-center transition-colors duration-500 " +
          (i === 0 ? "border-stone-200" : "border-teal-300 bg-teal-50/40")
        }
      >
        {i === 0 ? (
          <>
            <FileText className="mx-auto h-5 w-5 text-stone-400" />
            <p className="mt-1 text-[11px] font-semibold text-stone-500">Drop lecture slides here</p>
          </>
        ) : (
          <>
            <p className="truncate text-[11px] font-semibold text-stone-800">
              Lecture 08 — Normalization.pdf
            </p>
            <div className="mx-auto mt-2 h-1.5 w-40 overflow-hidden rounded-full bg-stone-200">
              <motion.div
                className="h-full rounded-full bg-teal-500"
                initial={false}
                animate={{ width: done ? "100%" : uploading ? "62%" : "12%" }}
                transition={{ duration: 0.7, ease: EASE }}
              />
            </div>
            <p className="mt-1 text-[10px] text-stone-500">
              {done ? "Uploaded · visible to 47 students" : "Uploading…"}
            </p>
          </>
        )}
      </div>

      <div className="mt-3 space-y-1.5">
        <AnimatePresence initial={false}>
          {done && (
            <motion.div
              key="new"
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="flex items-center gap-2.5 rounded-lg border border-teal-200 bg-teal-50/50 px-3 py-2"
            >
              <FileText className="h-4 w-4 shrink-0 text-teal-600" />
              <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-stone-800">
                Lecture 08 — Normalization.pdf
              </span>
              <span className="shrink-0 text-[9.5px] font-bold text-teal-700">New</span>
            </motion.div>
          )}
        </AnimatePresence>

        {existing.map(m => (
          <div key={m.name} className="flex items-center gap-2.5 rounded-lg border border-stone-100 px-3 py-2">
            <FolderOpen className="h-4 w-4 shrink-0 text-amber-500" />
            <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-stone-700">{m.name}</span>
            <span className="shrink-0 text-[9.5px] text-stone-400">{m.meta}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   FEATURE ROWS

   Replaces the six flat icon cards. Each row pairs outcome-led copy
   with a real product screen — and each of the three remaining
   mockups appears exactly once on the page, so nothing repeats what
   the hero or the Try It section already showed.
   ══════════════════════════════════════════════════════════════════ */

interface FeatureRow {
  eyebrow: string
  title: string[]
  body: string
  points: string[]
  render: () => React.ReactNode
}

const FEATURE_ROWS: FeatureRow[] = [
  {
    eyebrow: "Marks",
    title: ["Set your formula once.", "Never add it up again."],
    body:
      "Attendance, class tests, assignment, presentation, mid, final — enter the raw numbers and EduNexis works out every total and letter grade for the whole section. Publish once and every student sees their own marks immediately.",
    points: ["No spreadsheet formulas to copy down", "Totals recalculate as you type", "Students see only their own row"],
    render: () => <PanelMarks />,
  },
  {
    eyebrow: "Assignments",
    title: ["Submissions arrive here,", "not in your inbox."],
    body:
      "Post the task once with reference files attached. Students upload before the deadline, late ones are flagged automatically, and you grade with written feedback attached to each file — all in one place.",
    points: ["Late submissions flagged on their own", "Feedback stays attached to the work", "See at a glance who hasn't submitted"],
    render: () => <PanelSubmissions />,
  },
  {
    eyebrow: "Course materials",
    title: ["Every slide and handout,", "where students look first."],
    body:
      "Lecture slides, lab manuals, reference chapters and past questions live on the course page in folders. No Drive links pasted into a group chat, no “sir, can you send it again” the night before an exam.",
    points: ["Organised in folders, not a chat log", "Works on a phone on campus wifi", "Nothing gets lost between semesters"],
    render: () => <PanelMaterials />,
  },
]

function FeatureRows() {
  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-teal-700">
              Built for the classroom
            </p>
          </Reveal>
          <RevealLines
            className="mt-3 font-display text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl md:text-5xl"
            lines={["Everything you need", "to run a course."]}
          />
        </div>

        <div className="mt-16 flex flex-col gap-20 lg:gap-28">
          {FEATURE_ROWS.map((row, i) => (
            <FeatureRowBlock key={row.eyebrow} row={row} reverse={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureRowBlock({ row, reverse }: { row: FeatureRow; reverse: boolean }) {
  /* Same scroll-linked turn as the persona panels, mirrored to the side the
     screen sits on, so the whole lower page shares one depth language. */
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const isDesktop = useIsDesktop()
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] })
  const spin = reduced || !isDesktop ? 0 : reverse ? -15 : 15
  /* Settles to a held angle rather than flat: alternating row to row so the
     column reads as three panels turned toward you, like the hero frame. */
  const rotateY = useTransform(scrollYProgress, [0, 1], [spin * 1.7, spin])
  const lift = useTransform(scrollYProgress, [0, 1], [40, 0])

  return (
    /* Screen column is given the wider share: the gradebook table needs ~660px
       before its Total and Grade columns — the payoff of the whole row — get
       pushed out of view. */
    <div className={"grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14 " + (reverse ? "lg:[&>*:first-child]:order-2" : "")}>
      <div ref={ref} className="[perspective:1300px]" style={{ perspectiveOrigin: reverse ? "25% 50%" : "75% 50%" }}>
        <motion.div
          style={{ rotateY, y: lift, transformStyle: "preserve-3d" }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={REVEAL_VIEWPORT}
          transition={{ duration: 0.6, ease: EASE }}
          className="relative"
        >
          <div aria-hidden className="absolute -inset-5 rounded-[32px] bg-gradient-to-br from-teal-200/35 via-cyan-100/25 to-blue-200/25 blur-3xl" />
          <div className={"relative overflow-hidden rounded-2xl border border-stone-200 bg-white " + (reverse ? "shadow-[26px_40px_90px_-26px_rgba(15,23,42,0.42)]" : "shadow-[-26px_40px_90px_-26px_rgba(15,23,42,0.42)]")}>
            <div className="flex items-center gap-1.5 border-b border-stone-100 bg-stone-50 px-4 py-2.5">
              <div className="h-2.5 w-2.5 rounded-full bg-rose-300" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-300" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
            </div>
            <div className="p-4 sm:p-5">{row.render()}</div>
          </div>
        </motion.div>
      </div>

      <div>
        <Reveal>
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-teal-700">{row.eyebrow}</p>
        </Reveal>
        <RevealLines
          className="mt-3 font-display text-2xl font-extrabold leading-[1.15] tracking-tight text-stone-900 sm:text-3xl md:text-4xl"
          lines={row.title}
        />
        <Reveal delay={0.12}>
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-stone-600">{row.body}</p>
        </Reveal>
        <ul className="mt-6 space-y-3">
          {row.points.map((p, i) => (
            <motion.li
              key={p}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={REVEAL_VIEWPORT}
              transition={{ duration: 0.5, delay: 0.25 + i * 0.1, ease: EASE }}
              className="flex items-start gap-3 text-[14px] text-stone-700"
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" strokeWidth={2.5} />
              {p}
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   HOW IT STARTS

   Answers the question the page otherwise leaves open: can I actually
   sign up, and what happens after I click.

   Rebuilt because it was the last "tell, don't show" section on the
   page — three icons and three paragraphs, the same weakness the old
   feature-card grid was removed for. Each step now carries a real
   fragment of the interface, and the three light up in turn so the
   sequence reads as a flow rather than a list.
   ══════════════════════════════════════════════════════════════════ */

function HowItStarts() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const [onScreen, setOnScreen] = useState(false)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (reduced || !onScreen) return
    const id = window.setInterval(() => setActive(a => (a + 1) % 3), 2600)
    return () => clearInterval(id)
  }, [reduced, onScreen])

  const steps = [
    {
      title: "Create your course",
      body: "Name it, set the semester, choose how marks are weighted.",
      panel: <StartPanelCourse active={active === 0} />,
    },
    {
      title: "Share the join code",
      body: "Students request with the code. You approve in a tap.",
      panel: <StartPanelCode active={active === 1} />,
    },
    {
      title: "Take your first attendance",
      body: "Open the register on your phone and tap through the roll.",
      panel: <StartPanelRoll active={active === 2} />,
    },
  ]

  return (
    <section className="relative overflow-hidden bg-stone-50 py-16 sm:py-20 lg:py-24">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-teal-100/40 blur-3xl" />

      <div ref={ref} className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-teal-700">
              Getting started
            </p>
          </Reveal>
          <RevealLines
            className="mt-3 font-display text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl md:text-5xl"
            lines={["You could be taking", "attendance this week."]}
            accentFrom={1}
          />
          <Reveal delay={0.12}>
            <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-stone-600">
              Sign up with your university email —{" "}
              <span className="font-semibold text-stone-800">@just.edu.bd</span> for teachers,{" "}
              <span className="font-semibold text-stone-800">@student.just.edu.bd</span> for
              students. No department setup first, and nothing to install.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {steps.map((s, i) => {
            const on = reduced || active === i
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={REVEAL_VIEWPORT}
                transition={{ duration: 0.6, delay: i * 0.12, ease: EASE }}
                className={
                  "relative overflow-hidden rounded-2xl border bg-white p-5 transition-all duration-500 " +
                  (on
                    ? "border-teal-300 shadow-[0_22px_50px_-20px_rgba(13,148,136,0.55)]"
                    : "border-stone-200 shadow-sm")
                }
              >
                {/* progress bar showing which step is currently playing */}
                {!reduced && (
                  <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-stone-100">
                    <motion.span
                      className="block h-full bg-teal-500"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: on ? 1 : 0 }}
                      style={{ originX: 0 }}
                      transition={{ duration: on ? 2.4 : 0.3, ease: "linear" }}
                    />
                  </span>
                )}

                <div className="flex items-center gap-2.5">
                  <span
                    className={
                      "flex h-7 w-7 items-center justify-center rounded-full font-display text-[11px] font-bold transition-colors duration-500 " +
                      (on ? "bg-teal-600 text-white" : "bg-stone-100 text-stone-500")
                    }
                  >
                    {i + 1}
                  </span>
                  <h3 className="font-display text-[15.5px] font-bold text-stone-900">{s.title}</h3>
                </div>

                <p className="mt-2 text-[13px] leading-relaxed text-stone-600">{s.body}</p>

                <div className="mt-4 rounded-xl border border-stone-100 bg-stone-50/70 p-3">{s.panel}</div>
              </motion.div>
            )
          })}
        </div>

        <Reveal delay={0.2}>
          <div className="mt-12 flex flex-col items-center gap-3 text-center">
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 rounded-xl bg-teal-900 px-7 py-3.5 text-[14.5px] font-bold text-white shadow-[0_10px_28px_-10px_rgba(19,78,74,0.8)] transition-all hover:bg-teal-800"
            >
              Create your first course
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <p className="text-[12.5px] text-stone-500">
              Students: ask your teacher for the course code, then request to join.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/** Step 1 — the new-course form filling itself in. */
function StartPanelCourse({ active }: { active: boolean }) {
  const fields = [
    { label: "Course code", value: "CSE327" },
    { label: "Semester", value: "Spring 2026" },
  ]
  return (
    <div className="space-y-2">
      {fields.map((f, i) => (
        <div key={f.label} className="flex items-center justify-between rounded-lg border border-stone-200 bg-white px-2.5 py-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">{f.label}</span>
          <motion.span
            initial={false}
            animate={{ opacity: active ? 1 : 0.35 }}
            transition={{ duration: 0.4, delay: active ? 0.2 + i * 0.25 : 0 }}
            className="text-[11.5px] font-bold text-stone-800"
          >
            {f.value}
          </motion.span>
        </div>
      ))}
      <div className="flex flex-wrap gap-1.5 pt-0.5">
        {["Att 10", "CT 15", "Mid 20", "Final 40"].map((c, i) => (
          <motion.span
            key={c}
            initial={false}
            animate={{ opacity: active ? 1 : 0.3, y: active ? 0 : 3 }}
            transition={{ duration: 0.35, delay: active ? 0.6 + i * 0.09 : 0 }}
            className="rounded-md bg-teal-50 px-1.5 py-0.5 text-[9.5px] font-bold text-teal-700"
          >
            {c}
          </motion.span>
        ))}
      </div>
    </div>
  )
}

/** Step 2 — the join code, and a request arriving to approve. */
function StartPanelCode({ active }: { active: boolean }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between rounded-lg border border-dashed border-teal-300 bg-white px-2.5 py-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Join code</span>
        <span className="font-mono text-[13px] font-bold tracking-widest text-teal-700">K7QP-2M</span>
      </div>
      <motion.div
        initial={false}
        animate={{ opacity: active ? 1 : 0.3, x: active ? 0 : -6 }}
        transition={{ duration: 0.45, delay: active ? 0.5 : 0 }}
        className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-2.5 py-2"
      >
        <Avatar student={ROSTER[3]} index={3} size="h-6 w-6" />
        <span className="min-w-0 flex-1 truncate text-[10.5px] font-medium text-stone-700">
          {ROSTER[3].name} wants to join
        </span>
        <motion.span
          animate={active ? { scale: [1, 1.12, 1] } : {}}
          transition={{ duration: 0.4, delay: 1.1 }}
          className="shrink-0 rounded-md bg-teal-600 px-2 py-0.5 text-[9.5px] font-bold text-white"
        >
          Approve
        </motion.span>
      </motion.div>
    </div>
  )
}

/** Step 3 — the roll being tapped through. */
function StartPanelRoll({ active }: { active: boolean }) {
  return (
    <div className="space-y-1.5">
      {ROSTER.slice(0, 3).map((s, i) => (
        <div key={s.id} className="flex items-center gap-2">
          <Avatar student={s} index={i} size="h-6 w-6" />
          <span className="min-w-0 flex-1 truncate text-[10.5px] font-medium text-stone-700">{s.name}</span>
          <motion.span
            initial={false}
            animate={{
              opacity: active ? 1 : 0.3,
              scale: active ? [1, 1.15, 1] : 1,
            }}
            transition={{ duration: 0.4, delay: active ? 0.3 + i * 0.3 : 0 }}
            className="shrink-0 rounded-full bg-teal-600 px-2 py-0.5 text-[9px] font-bold text-white"
          >
            Present
          </motion.span>
        </div>
      ))}
      <motion.p
        initial={false}
        animate={{ opacity: active ? 1 : 0.3 }}
        transition={{ duration: 0.4, delay: active ? 1.3 : 0 }}
        className="pt-1 text-[10px] font-semibold text-teal-700"
      >
        Saved · 47 students notified
      </motion.p>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   FOR TEACHERS / FOR STUDENTS

   Each side gets its own looping film showing that person's actual
   working day, built the same way as the hero: a scripted beat list,
   transform/opacity only, suspended while off-screen.
   ══════════════════════════════════════════════════════════════════ */

function ForWhomPanel() {
  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-teal-700">
              One platform, two perspectives
            </p>
          </Reveal>
          <RevealLines
            className="mt-3 font-display text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl md:text-5xl"
            lines={["Designed for both sides", "of the classroom."]}
            accentFrom={1}
            accentClass="bg-gradient-to-r from-teal-600 to-blue-700 bg-clip-text text-transparent"
          />
        </div>

        <div className="mt-14 flex flex-col gap-16 lg:gap-24">
          <PersonaRow
            reverse={false}
            kind="teacher"
            title="For teachers"
            tagline="Spend more time teaching, less time on spreadsheets."
            items={[
              { title: "Create a course in under a minute", desc: "Name, semester, mark weighting. Done.", Icon: BookOpen },
              { title: "Take attendance with one tap", desc: "One tap per student, on your phone, in class.", Icon: ClipboardCheck },
              { title: "Grade with inline feedback", desc: "Comments stay attached to the submitted file.", Icon: MessageSquare },
              { title: "Publish marks once", desc: "Every student sees their own result immediately.", Icon: BarChart3 },
            ]}
            cta="Sign up as a teacher"
            accent="text-teal-700"
            ring="hover:border-teal-300 hover:shadow-[0_18px_40px_-18px_rgba(13,148,136,0.45)]"
            tile="bg-teal-50 text-teal-700 group-hover:bg-teal-100"
            wash="from-teal-50/80 to-cyan-50/40"
          />
          <PersonaRow
            reverse
            kind="student"
            title="For students"
            tagline="No more digging through emails for lecture slides."
            items={[
              { title: "Every course in one place", desc: "Deadlines, materials and marks on one screen.", Icon: FolderOpen },
              { title: "Submit without email", desc: "Upload the file, get a receipt, done.", Icon: Paperclip },
              { title: "Track your attendance", desc: "See your own percentage before it costs you marks.", Icon: ClipboardCheck },
              { title: "Know the moment you're graded", desc: "A notification the second your work is marked.", Icon: Bell },
            ]}
            cta="Sign up as a student"
            accent="text-amber-700"
            ring="hover:border-amber-300 hover:shadow-[0_18px_40px_-18px_rgba(217,119,6,0.4)]"
            tile="bg-amber-50 text-amber-700 group-hover:bg-amber-100"
            wash="from-amber-50/80 to-orange-50/40"
          />
        </div>
      </div>
    </section>
  )
}

interface PersonaItem {
  title: string
  desc: string
  Icon: LucideIcon
}

interface PersonaRowProps {
  reverse: boolean
  kind: "student" | "teacher"
  title: string
  tagline: string
  items: PersonaItem[]
  cta: string
  accent: string
  ring: string
  tile: string
  wash: string
}

function PersonaRow(props: PersonaRowProps) {
  /* Scroll-linked depth, mirrored to the side the film sits on. */
  const cardRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const isDesktop = useIsDesktop()
  const { scrollYProgress } = useScroll({ target: cardRef, offset: ["start end", "center center"] })
  const spin = reduced || !isDesktop ? 0 : props.reverse ? -14 : 14
  const rotateY = useTransform(scrollYProgress, [0, 1], [spin, 0])
  const lift = useTransform(scrollYProgress, [0, 1], [40, 0])

  return (
    <div className={"grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16 " + (props.reverse ? "lg:[&>*:first-child]:order-2" : "")}>
      <div ref={cardRef} className="[perspective:1400px]">
        <motion.div
          style={{ rotateY, y: lift, transformStyle: "preserve-3d" }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={REVEAL_VIEWPORT}
          transition={{ duration: 0.6, ease: EASE }}
        >
          {props.kind === "teacher" ? <TeacherFilm /> : <StudentFilm />}
        </motion.div>
      </div>

      <div>
        <RevealLines
          className="font-display text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl"
          lines={[props.title]}
        />
        <Reveal delay={0.1}>
          <p className="mt-3 text-[15px] leading-relaxed text-stone-600">{props.tagline}</p>
        </Reveal>

        {/* hover cards rather than a plain bullet list */}
        <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {props.items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={REVEAL_VIEWPORT}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.09, ease: EASE }}
              whileHover={{ y: -5 }}
              className={
                "group relative cursor-default overflow-hidden rounded-xl border border-stone-200 bg-white p-4 transition-shadow duration-300 " +
                props.ring
              }
            >
              {/* tinted wash that fades up from the base on hover */}
              <span
                aria-hidden
                className={"pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100 " + props.wash}
              />
              {/* light sweeping across the card, once, on hover */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/70 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
              />

              {/* An icon in a tinted tile, not a bare dot: it gives the card
                  both colour and something to scan by at a glance. */}
              <div className="relative flex items-start gap-3">
                <span
                  className={
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110 " +
                    props.tile
                  }
                >
                  <item.Icon className="h-4 w-4" strokeWidth={2.25} />
                </span>
                <div>
                  <p className="text-[13.5px] font-bold leading-snug text-stone-900">{item.title}</p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-stone-500 transition-colors duration-300 group-hover:text-stone-700">
                    {item.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <Reveal delay={0.3}>
          <Link
            to="/register"
            className={"mt-7 inline-flex items-center gap-2 text-[13.5px] font-bold transition-colors hover:opacity-80 " + props.accent}
          >
            {props.cta}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Reveal>
      </div>
    </div>
  )
}

/* ── Persona films ─────────────────────────────────────────────────
   Rebuilt so the cursor operates the interface rather than drifting
   over it.

   The earlier version moved the pointer to one fixed spot per beat
   while the content changed on its own timer — the two were never
   related, so it read as a cursor floating over an animation. Here a
   single fast step counter drives both: the pointer travels to a
   specific control, taps it, and *that* control is what changes. The
   state only ever moves as a result of a tap.
   ────────────────────────────────────────────────────────────────── */

interface FilmStep {
  /** which screen is showing */
  screen: number
  /** pointer position within the film body, as CSS percentages */
  x: string
  y: string
  /** pointer is pressing this step */
  tap?: boolean
  /** pointer hidden (e.g. an incoming notification nobody clicked) */
  hide?: boolean
  /** how many actions have been completed on this screen */
  done?: number
}

function useFilmSteps(steps: FilmStep[], msPerStep = 780) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const [onScreen, setOnScreen] = useState(false)
  const [i, setI] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (reduced || !onScreen) return
    const id = window.setTimeout(() => setI(n => (n + 1) % steps.length), msPerStep)
    return () => clearTimeout(id)
  }, [i, steps.length, msPerStep, reduced, onScreen])

  return { ref, step: steps[reduced ? 0 : i], index: reduced ? 0 : i }
}

/**
 * Simulated pointer. Travels between controls with a spring, and presses with
 * a scale-down plus an expanding ripple — the two cues that read as a click.
 */
function FilmCursor({ x, y, tapping }: { x: string; y: string; tapping?: boolean }) {
  return (
    <motion.div
      aria-hidden
      initial={false}
      animate={{ left: x, top: y, scale: tapping ? 0.78 : 1 }}
      transition={{ type: "spring", stiffness: 90, damping: 16, scale: { duration: 0.14 } }}
      className="pointer-events-none absolute z-30"
    >
      <div className="relative">
        {tapping && (
          <motion.span
            key={x + y}
            initial={{ scale: 0.3, opacity: 0.7 }}
            animate={{ scale: 2.6, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute -left-3.5 -top-3.5 h-9 w-9 rounded-full bg-teal-400"
          />
        )}
        <svg viewBox="0 0 24 24" className="h-5 w-5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]" fill="white" stroke="#0f766e" strokeWidth="1.6">
          <path d="M5 3l14 8-6.5 1.5L9 19z" strokeLinejoin="round" />
        </svg>
      </div>
    </motion.div>
  )
}

/** Wrapper shared by both films. */
function FilmShell({
  innerRef,
  title,
  meta,
  Icon,
  steps,
  activeScreen,
  accent,
  glow,
  children,
}: {
  innerRef: React.RefObject<HTMLDivElement>
  title: string
  meta: string
  Icon: LucideIcon
  steps: string[]
  activeScreen: number
  accent: string
  glow: string
  children: React.ReactNode
}) {
  return (
    <div ref={innerRef} className="relative mx-auto w-full max-w-md">
      <div aria-hidden className={"absolute -inset-5 rounded-[28px] blur-3xl " + glow} />
      <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_24px_70px_-18px_rgba(15,23,42,0.25)]">
        <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50 px-4 py-2.5">
          <span className="font-display text-[12.5px] font-bold text-stone-900">{title}</span>
          <span className="flex items-center gap-1.5 text-[10.5px] font-semibold text-stone-500">
            <Icon className="h-3.5 w-3.5" />
            {meta}
          </span>
        </div>

        <div className="flex gap-1 px-4 pt-3">
          {steps.map((s, i) => (
            <div key={s} className="flex-1">
              <div className="h-0.5 overflow-hidden rounded-full bg-stone-100">
                <motion.div
                  className={"h-full rounded-full " + accent}
                  animate={{ scaleX: i <= activeScreen ? 1 : 0 }}
                  style={{ originX: 0 }}
                  transition={{ duration: 0.45, ease: EASE }}
                />
              </div>
              <p className={"mt-1.5 truncate text-[8.5px] font-semibold transition-colors " + (i === activeScreen ? "text-stone-800" : "text-stone-400")}>
                {s}
              </p>
            </div>
          ))}
        </div>

        <div className="relative h-[228px] overflow-hidden">{children}</div>
      </div>
    </div>
  )
}

/* Teacher: open the register → mark three students → post a notice → publish.
   Every state change below is caused by the tap on the step before it. */
const TEACHER_STEPS: FilmStep[] = [
  { screen: 0, x: "76%", y: "26%" },
  { screen: 0, x: "76%", y: "26%", tap: true },
  { screen: 1, x: "80%", y: "20%", done: 0 },
  { screen: 1, x: "80%", y: "20%", tap: true, done: 1 },
  { screen: 1, x: "80%", y: "38%", done: 1 },
  { screen: 1, x: "80%", y: "38%", tap: true, done: 2 },
  { screen: 1, x: "80%", y: "56%", done: 2 },
  { screen: 1, x: "80%", y: "56%", tap: true, done: 3 },
  { screen: 2, x: "62%", y: "62%", done: 0 },
  { screen: 2, x: "62%", y: "62%", tap: true, done: 1 },
  { screen: 3, x: "50%", y: "70%", done: 0 },
  { screen: 3, x: "50%", y: "70%", tap: true, done: 1 },
  { screen: 3, x: "50%", y: "70%", done: 1 },
]

function TeacherFilm() {
  const { ref, step } = useFilmSteps(TEACHER_STEPS)
  const rows = ROSTER.slice(0, 3)

  return (
    <FilmShell
      innerRef={ref}
      title="Dr. Farhana's day"
      meta="CSE327"
      Icon={BookOpen}
      steps={["Open class", "Roll call", "Announce", "Publish"]}
      activeScreen={step.screen}
      accent="bg-teal-500"
      glow="bg-gradient-to-br from-teal-200/35 via-cyan-100/25 to-blue-200/25"
    >
      <FilmCursor x={step.x} y={step.y} tapping={step.tap} />

      <AnimatePresence initial={false}>
        <motion.div
          key={step.screen}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="absolute inset-0 p-4"
        >
          {step.screen === 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Today · 9:00 AM</p>
              <div className={"flex items-center justify-between rounded-lg border px-3 py-2.5 transition-colors " + (step.tap ? "border-teal-400 bg-teal-50" : "border-stone-100 bg-stone-50/60")}>
                <div>
                  <p className="text-[12px] font-semibold text-stone-800">CSE327 · Lab</p>
                  <p className="text-[10px] text-stone-400">Lab 3 · 47 students</p>
                </div>
                <span className={"rounded-full px-2.5 py-1 text-[9.5px] font-bold transition-colors " + (step.tap ? "bg-teal-600 text-white" : "bg-teal-50 text-teal-700")}>
                  Open register
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-stone-100 px-3 py-2.5 opacity-60">
                <p className="text-[12px] font-semibold text-stone-800">CSE221 · Theory</p>
                <span className="text-[10px] text-stone-400">11:30 AM</span>
              </div>
            </div>
          )}

          {step.screen === 1 && (
            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">Marking the roll</p>
              {rows.map((s, i) => {
                const marked = (step.done ?? 0) > i
                return (
                  <div key={s.id} className="flex items-center gap-2.5 border-b border-stone-50 py-2">
                    <Avatar student={s} index={i} size="h-6 w-6" />
                    <span className="flex-1 truncate text-[11px] font-medium text-stone-700">{s.name}</span>
                    <motion.span
                      animate={marked ? { scale: [1, 1.18, 1] } : {}}
                      transition={{ duration: 0.32, ease: EASE }}
                      className={
                        "rounded-full px-2 py-0.5 text-[9px] font-bold transition-colors " +
                        (marked ? "bg-teal-600 text-white" : "bg-stone-100 text-stone-400")
                      }
                    >
                      {marked ? "Present" : "—"}
                    </motion.span>
                  </div>
                )
              })}
              <p className="pt-2 text-[10px] font-semibold text-teal-700">
                {40 + (step.done ?? 0)} of 47 marked
              </p>
            </div>
          )}

          {step.screen === 2 && (
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">New announcement</p>
              <div className="rounded-lg border border-stone-200 p-2.5">
                <p className="text-[11px] font-semibold text-stone-800">Lab 4 moved to Thursday</p>
                <p className="mt-1 text-[10px] leading-relaxed text-stone-500">
                  Bring your ER diagram drafts. Room changed to Lab 1.
                </p>
              </div>
              <div className="mt-3 flex justify-end">
                <span className={"rounded-lg px-3 py-1.5 text-[10.5px] font-bold transition-colors " + (step.tap || (step.done ?? 0) > 0 ? "bg-teal-600 text-white" : "bg-stone-100 text-stone-500")}>
                  Post to 47 students
                </span>
              </div>
              {(step.done ?? 0) > 0 && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 text-center text-[10.5px] font-semibold text-teal-700"
                >
                  Sent — everyone notified
                </motion.p>
              )}
            </div>
          )}

          {step.screen === 3 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              {(step.done ?? 0) > 0 ? (
                <>
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.45, ease: EASE }}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-600"
                  >
                    <Check className="h-6 w-6 text-white" strokeWidth={3} />
                  </motion.div>
                  <p className="mt-3 font-display text-[14px] font-bold text-stone-900">Final marks published</p>
                  <p className="mt-0.5 text-[11.5px] text-stone-500">All 47 students can see their own result</p>
                </>
              ) : (
                <>
                  <p className="font-display text-[13px] font-bold text-stone-900">Ready to publish</p>
                  <p className="mt-1 text-[11px] text-stone-500">CSE327 · Final marks · 47 students</p>
                  <span className="mt-4 rounded-lg bg-teal-900 px-4 py-2 text-[11px] font-bold text-white">
                    Publish marks
                  </span>
                </>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </FilmShell>
  )
}

/* Student: open the deadline → attach the file → upload → notification lands
   → open the result. */
const STUDENT_STEPS: FilmStep[] = [
  { screen: 0, x: "72%", y: "28%" },
  { screen: 0, x: "72%", y: "28%", tap: true },
  { screen: 1, x: "56%", y: "48%", done: 0 },
  { screen: 1, x: "56%", y: "48%", tap: true, done: 1 },
  { screen: 1, x: "56%", y: "48%", done: 2 },
  { screen: 2, x: "50%", y: "50%", hide: true },
  { screen: 2, x: "50%", y: "50%", hide: true },
  { screen: 3, x: "76%", y: "30%", done: 0 },
  { screen: 3, x: "76%", y: "30%", tap: true, done: 1 },
  { screen: 3, x: "76%", y: "30%", done: 1 },
]

function StudentFilm() {
  const { ref, step } = useFilmSteps(STUDENT_STEPS)

  return (
    <FilmShell
      innerRef={ref}
      title="Tasnim's week"
      meta="5 courses"
      Icon={GraduationCap}
      steps={["Deadline", "Upload", "Graded", "Result"]}
      activeScreen={step.screen}
      accent="bg-amber-500"
      glow="bg-gradient-to-br from-amber-200/35 via-orange-100/25 to-rose-200/20"
    >
      {!step.hide && <FilmCursor x={step.x} y={step.y} tapping={step.tap} />}

      <AnimatePresence initial={false}>
        <motion.div
          key={step.screen}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="absolute inset-0 p-4"
        >
          {step.screen === 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Due soon</p>
              <div className={"rounded-lg border px-3 py-2.5 transition-colors " + (step.tap ? "border-amber-400 bg-amber-50" : "border-stone-100 bg-stone-50/60")}>
                <p className="text-[12px] font-semibold text-stone-800">Assignment 4 — ER Diagram</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[10px] text-stone-400">CSE327</span>
                  <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-bold text-rose-600">Due in 2 days</span>
                </div>
              </div>
              <div className="rounded-lg border border-stone-100 px-3 py-2.5 opacity-60">
                <p className="text-[12px] font-semibold text-stone-800">Lab report 6</p>
                <span className="text-[10px] text-stone-400">Due in 5 days</span>
              </div>
            </div>
          )}

          {step.screen === 1 && (
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">Your submission</p>
              <div className={"rounded-lg border-2 border-dashed px-3 py-4 text-center transition-colors " + ((step.done ?? 0) > 0 ? "border-teal-300 bg-teal-50/50" : "border-stone-200")}>
                {(step.done ?? 0) === 0 ? (
                  <>
                    <Paperclip className="mx-auto h-5 w-5 text-stone-400" />
                    <p className="mt-1.5 text-[11px] font-semibold text-stone-500">Choose a file to upload</p>
                  </>
                ) : (
                  <>
                    <p className="text-[11px] font-semibold text-stone-800">200112_erd.pdf</p>
                    <div className="mx-auto mt-2 h-1.5 w-32 overflow-hidden rounded-full bg-stone-200">
                      <motion.div
                        className="h-full rounded-full bg-teal-500"
                        initial={{ width: "0%" }}
                        animate={{ width: (step.done ?? 0) > 1 ? "100%" : "45%" }}
                        transition={{ duration: 0.6, ease: EASE }}
                      />
                    </div>
                    <p className="mt-1.5 text-[10px] text-stone-500">
                      {(step.done ?? 0) > 1 ? "Uploaded · 2 days early" : "Uploading…"}
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {step.screen === 2 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="flex w-full items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-left"
              >
                <motion.span
                  animate={{ rotate: [0, -14, 14, -8, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1.1 }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100"
                >
                  <Bell className="h-4 w-4 text-amber-600" strokeWidth={2.25} />
                </motion.span>
                <div>
                  <p className="text-[11.5px] font-bold text-stone-800">Your work has been graded</p>
                  <p className="text-[10px] text-stone-500">CSE327 · Assignment 4 · just now</p>
                </div>
              </motion.div>
              <p className="mt-3 text-[10.5px] text-stone-400">No email. No refresh.</p>
            </div>
          )}

          {step.screen === 3 && (
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">Your marks</p>
              <div className={"flex items-center justify-between rounded-lg border px-3 py-2 transition-colors " + (step.tap ? "border-amber-400 bg-amber-50" : "border-stone-100")}>
                <span className="text-[11.5px] font-semibold text-stone-800">Assignment 4</span>
                <span className="font-display text-[12px] font-bold text-stone-900">18/20</span>
              </div>
              {(step.done ?? 0) > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="mt-2 overflow-hidden rounded-lg bg-stone-50 p-2.5"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Feedback</p>
                  <p className="mt-1 text-[10.5px] leading-relaxed text-stone-600">
                    “Cardinality on the Borrows relation is right. Watch the weak entity key.”
                  </p>
                </motion.div>
              )}
              <div className="mt-2 flex items-center justify-between rounded-lg bg-teal-50 px-3 py-2">
                <span className="text-[10.5px] font-semibold text-teal-800">Attendance</span>
                <span className="font-display text-[12px] font-bold text-teal-700">96%</span>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </FilmShell>
  )
}

/* ══════════════════════════════════════════════════════════════════
   FINAL CTA — light, bold, glow (only one dark section on this page)
   ══════════════════════════════════════════════════════════════════ */

function FinalCta() {
  return (
    /* Shares the footer's teal-ink surface so the page closes on one continuous
       dark anchor rather than a light section the footer immediately overpowers. */
    <section className="relative overflow-hidden bg-teal-950 py-20 sm:py-24 lg:py-28">
      <div aria-hidden className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-teal-500/20 blur-3xl" />
      <div aria-hidden className="absolute -bottom-40 right-0 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-3xl" />
      <div
        aria-hidden
        /* Same 48px line grid as the Why section and every auth screen. This
           was a 32px dot field, which made it the only teal-ink surface on the
           site with a different texture. */
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-teal-300">
            Get started today
          </p>
          <RevealLines
            className="mt-4 font-display text-3xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl"
            lines={["Run your next semester", "on EduNexis."]}
            accentFrom={1}
            accentClass="bg-gradient-to-r from-teal-300 via-cyan-300 to-teal-200 bg-clip-text text-transparent"
          />
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-teal-100/70 sm:text-base">
            Create a course, add your students, and take attendance in the same
            sitting. Free for departments — no credit card, no procurement, no setup call.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-[14.5px] font-bold text-teal-950 shadow-[0_12px_40px_-8px_rgba(45,212,191,0.4)] transition-all hover:shadow-[0_16px_50px_-8px_rgba(45,212,191,0.6)]"
            >
              Create your account
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/faculty"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-[14.5px] font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              Browse faculty
            </Link>
          </div>

          {/* positioning folded in here — it no longer needs a section of its own */}
          <div className="mt-12 grid grid-cols-1 gap-6 border-t border-teal-400/15 pt-8 text-left sm:grid-cols-3">
            {[
              { t: "Free for departments", d: "No licence fees, no procurement process." },
              { t: "Built and run at JUST CSE", d: "Maintained by the people who use it." },
              { t: "Live this semester", d: "Real courses, real attendance, right now." },
            ].map((p, i) => (
              <motion.div
                key={p.t}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={REVEAL_VIEWPORT}
                transition={{ duration: 0.5, delay: i * 0.1, ease: EASE }}
              >
                <h3 className="font-display text-[14px] font-bold text-white">{p.t}</h3>
                <p className="mt-1 text-[12.5px] leading-relaxed text-teal-100/60">{p.d}</p>
              </motion.div>
            ))}
          </div>

          <p className="mt-8 text-[12px] font-semibold uppercase tracking-wider text-teal-100/45">
            Built at JUST CSE · Designed for South Asian Universities
          </p>
        </motion.div>
      </div>
    </section>
  )
}
