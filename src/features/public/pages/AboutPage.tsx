import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import {
  ArrowRight,
  ClipboardCheck,
  BarChart3,
  Paperclip,
  FolderOpen,
  Bell,
  Check,
  FileText,
} from "lucide-react"
import { Reveal, RevealLines, InkGrid, REVEAL_VIEWPORT, EASE, usePrefersReducedMotion } from "@/components/ui/motion"
import { CTA_PRIMARY, CTA_SECONDARY } from "@/components/ui/ctaStyles"

/**
 * About.
 *
 * Rewritten to show the product rather than describe it. The previous version
 * was a tall centred splash followed by icon cards — the same "tell, don't
 * show" weakness the homepage feature grid was removed for.
 *
 * The hero is asymmetric and compact, the origin story carries real interface
 * fragments at each beat, and capabilities are a single panel that plays
 * itself rather than six boxes of text.
 */
export default function AboutPage() {
  return (
    <div className="bg-white text-stone-900">
      <AboutHero />
      <OriginStory />
      <InsidePanel />
      <Principles />
      <AboutCta />
    </div>
  )
}

/* ══ Hero ═════════════════════════════════════════════════════════ */

function AboutHero() {
  const reduced = usePrefersReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 30%"] })
  const rotateX = useTransform(scrollYProgress, [0, 1], [reduced ? 0 : 16, 0])

  return (
    <section className="relative -mt-20 overflow-hidden pt-20">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 h-[560px] w-[560px] rounded-full bg-teal-100/60 blur-3xl" />
        <div className="absolute -top-20 right-0 h-[460px] w-[460px] rounded-full bg-blue-100/50 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:px-8 lg:py-16">
        <div>
          <Reveal y={18}>
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-3 py-1.5 text-[11.5px] font-semibold text-teal-700 shadow-sm">
              Built at JUST CSE
            </span>
          </Reveal>

          <RevealLines
            className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-stone-900 sm:text-5xl lg:text-[56px]"
            lines={["We didn't set out", "to build an LMS."]}
            accentFrom={1}
          />

          <Reveal delay={0.15}>
            <p className="mt-6 max-w-xl text-[15.5px] leading-relaxed text-stone-600">
              We set out to stop losing marks. One semester of attendance on
              paper, submissions in an inbox and three versions of the same
              spreadsheet was enough. Everything here exists because something
              specific went wrong first.
            </p>
          </Reveal>

          <Reveal delay={0.25}>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/register"
                className={"group inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-[14px] font-bold text-white " + CTA_PRIMARY}
              >
                Get started for free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/faculty"
                className={"inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-[14px] font-bold text-stone-900 " + CTA_SECONDARY}
              >
                See who uses it
              </Link>
            </div>
          </Reveal>
        </div>

        {/* the product, straight away */}
        <div ref={ref} className="[perspective:1600px]">
          <motion.div
            style={{ rotateX, transformOrigin: "50% 100%" }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
            className="relative"
          >
            <div aria-hidden className="absolute -inset-6 rounded-[36px] bg-gradient-to-br from-teal-300/35 via-cyan-200/25 to-blue-300/25 blur-3xl" />
            <SemesterPanel />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/** A course, mid-semester — the thing the whole project is for. */
function SemesterPanel() {
  const reduced = usePrefersReducedMotion()
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (reduced) return
    const id = window.setInterval(() => setTick(t => t + 1), 2400)
    return () => clearInterval(id)
  }, [reduced])

  const weeks = 14
  const done = reduced ? 9 : 6 + (tick % 4)

  return (
    <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_30px_70px_-24px_rgba(15,23,42,0.3)]">
      <div className="flex items-center gap-1.5 border-b border-stone-100 bg-stone-50 px-4 py-2.5">
        <div className="h-2.5 w-2.5 rounded-full bg-rose-300" />
        <div className="h-2.5 w-2.5 rounded-full bg-amber-300" />
        <div className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
        <span className="ml-3 text-[10px] font-medium text-stone-400">edunexis.app/cse327</span>
      </div>

      <div className="p-5">
        <div className="flex items-baseline justify-between">
          <div>
            <h3 className="font-display text-[16px] font-bold text-stone-900">CSE327 · Database Systems</h3>
            <p className="mt-0.5 text-[11.5px] text-stone-500">Spring 2026 · 47 students</p>
          </div>
          <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-bold text-teal-700">Week {done}</span>
        </div>

        {/* semester progress */}
        <div className="mt-4 flex gap-1">
          {Array.from({ length: weeks }).map((_, i) => (
            <motion.div
              key={i}
              animate={{ opacity: i < done ? 1 : 0.18 }}
              transition={{ duration: 0.4, delay: i * 0.02, ease: EASE }}
              className="h-1.5 flex-1 rounded-full bg-teal-500"
            />
          ))}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { v: "43/47", l: "present today", tone: "text-teal-700" },
            { v: "24", l: "submissions in", tone: "text-blue-700" },
            { v: "9", l: "assignments set", tone: "text-amber-700" },
          ].map(s => (
            <div key={s.l} className="rounded-xl border border-stone-100 bg-stone-50/70 p-3">
              <p className={"font-display text-[18px] font-extrabold tabular-nums " + s.tone}>{s.v}</p>
              <p className="mt-0.5 text-[10.5px] text-stone-500">{s.l}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-1.5 border-t border-stone-100 pt-3.5">
          {[
            { Icon: ClipboardCheck, t: "Attendance taken", m: "Lab 3 · 9:04 AM" },
            { Icon: Paperclip, t: "Assignment 4 collected", m: "24 of 47 submitted" },
            { Icon: Bell, t: "Lab moved to Thursday", m: "47 notified" },
          ].map((r, i) => (
            <motion.div
              key={r.t}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={REVEAL_VIEWPORT}
              transition={{ duration: 0.45, delay: 0.5 + i * 0.12, ease: EASE }}
              className="flex items-center gap-2.5"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                <r.Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
              </span>
              <span className="min-w-0 flex-1 truncate text-[11.5px] font-semibold text-stone-800">{r.t}</span>
              <span className="shrink-0 text-[10.5px] text-stone-400">{r.m}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ══ Origin story ═════════════════════════════════════════════════ */

const STORY = [
  {
    when: "Before",
    title: "Three spreadsheets and no answer",
    body:
      "Attendance on paper, class tests in one file, finals in another. At the end of term nobody could say which copy was authoritative — and a missing mark had no trail at all.",
    screen: "sheet" as const,
  },
  {
    when: "First build",
    title: "One register that saved itself",
    body:
      "The first thing built was attendance, because it was the thing failing most often. One tap per student, saved the moment it's taken, visible to the student the same day.",
    screen: "register" as const,
  },
  {
    when: "Now",
    title: "The whole course in one place",
    body:
      "Materials, assignments, marks and announcements moved in one at a time, each because a teacher at JUST asked for it. Nothing here was designed in the abstract.",
    screen: "course" as const,
  },
]

function OriginStory() {
  return (
    <section className="relative overflow-hidden bg-teal-950 py-16 sm:py-20 lg:py-24">
      <InkGrid />
      <div aria-hidden className="absolute -top-40 left-1/4 h-[420px] w-[420px] rounded-full bg-teal-500/15 blur-3xl" />
      <div aria-hidden className="absolute -bottom-40 right-1/4 h-[380px] w-[380px] rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <Reveal>
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-teal-300">How it got here</p>
          </Reveal>
          <RevealLines
            as="h2"
            className="mt-3 font-display text-3xl font-extrabold leading-[1.12] tracking-tight text-white sm:text-4xl"
            lines={["Every feature started", "as something going wrong."]}
            accentFrom={1}
            accentClass="bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent"
          />
        </div>

        <div className="mt-14 space-y-14 lg:space-y-20">
          {STORY.map((s, i) => (
            <StoryRow key={s.when} step={s} index={i} reverse={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  )
}

function StoryRow({
  step,
  index,
  reverse,
}: {
  step: (typeof STORY)[number]
  index: number
  reverse: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] })
  const spin = reduced ? 0 : reverse ? -13 : 13
  const rotateY = useTransform(scrollYProgress, [0, 1], [spin * 1.6, spin * 0.9])

  return (
    <div className={"grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-14 " + (reverse ? "lg:[&>*:first-child]:order-2" : "")}>
      <div ref={ref} className="[perspective:1400px]">
        <motion.div
          style={{ rotateY, transformStyle: "preserve-3d" }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={REVEAL_VIEWPORT}
          transition={{ duration: 0.6, ease: EASE }}
          className="relative"
        >
          <div aria-hidden className="absolute -inset-5 rounded-[30px] bg-teal-400/15 blur-3xl" />
          <div className="relative overflow-hidden rounded-2xl border border-white/12 bg-white shadow-[0_28px_60px_-24px_rgba(0,0,0,0.6)]">
            <StoryScreen kind={step.screen} />
          </div>
        </motion.div>
      </div>

      <div>
        <Reveal y={20}>
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/25 bg-teal-400/10 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-teal-300">
            {String(index + 1).padStart(2, "0")} · {step.when}
          </span>
        </Reveal>
        <Reveal y={20} delay={0.08}>
          <h3 className="mt-4 font-display text-[22px] font-extrabold leading-tight text-white sm:text-[26px]">
            {step.title}
          </h3>
        </Reveal>
        <Reveal y={20} delay={0.16}>
          <p className="mt-3 max-w-lg text-[14.5px] leading-relaxed text-teal-100/70">{step.body}</p>
        </Reveal>
      </div>
    </div>
  )
}

function StoryScreen({ kind }: { kind: "sheet" | "register" | "course" }) {
  if (kind === "sheet") {
    return (
      <div className="p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">marks_final_v4.xlsx</p>
        <div className="mt-2.5 overflow-hidden rounded-lg border border-stone-200">
          {["Mostafa Kamal", "Md. Sabbir Hossain Bappy", "Nasif Shahrier Nafi", "Tasnim Rahman Oishi"].map((n, i) => (
            <div key={n} className="flex items-center justify-between border-b border-stone-100 px-3 py-2 last:border-0 even:bg-stone-50/60">
              <span className="truncate text-[11.5px] text-stone-700">{n}</span>
              <span className={"text-[11px] tabular-nums " + (i === 2 ? "text-rose-500" : "text-stone-500")}>
                {i === 2 ? "—" : ["93.1", "78.0", "", "86.9"][i]}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-2.5 flex items-center gap-1.5 text-[10.5px] font-semibold text-rose-600">
          One mark blank. No record of who removed it.
        </p>
      </div>
    )
  }

  if (kind === "register") {
    return (
      <div className="p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">CSE327 · Lab 3</p>
        <div className="mt-2.5 space-y-1.5">
          {["Mostafa Kamal", "Md. Sabbir Hossain Bappy", "Nasif Shahrier Nafi", "Tasnim Rahman Oishi"].map((n, i) => (
            <div key={n} className="flex items-center justify-between rounded-lg border border-stone-100 px-3 py-2">
              <span className="truncate text-[11.5px] font-medium text-stone-700">{n}</span>
              <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={REVEAL_VIEWPORT}
                transition={{ duration: 0.35, delay: 0.25 + i * 0.14, ease: EASE }}
                className="rounded-full bg-teal-600 px-2 py-0.5 text-[9.5px] font-bold text-white"
              >
                Present
              </motion.span>
            </div>
          ))}
        </div>
        <p className="mt-2.5 flex items-center gap-1.5 text-[10.5px] font-semibold text-teal-700">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
          Saved · students can see it today
        </p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">CSE327 · one workspace</p>
      <div className="mt-2.5 space-y-1.5">
        {[
          { Icon: FolderOpen, t: "Materials", m: "24 files" },
          { Icon: Paperclip, t: "Assignments", m: "9 set · 24 in" },
          { Icon: ClipboardCheck, t: "Attendance", m: "43 of 47 today" },
          { Icon: BarChart3, t: "Marks", m: "published" },
        ].map((r, i) => (
          <motion.div
            key={r.t}
            initial={{ opacity: 0, x: -14 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={REVEAL_VIEWPORT}
            transition={{ duration: 0.45, delay: 0.2 + i * 0.1, ease: EASE }}
            className="flex items-center gap-2.5 rounded-lg bg-stone-50/70 px-3 py-2"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-teal-50 text-teal-700">
              <r.Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
            </span>
            <span className="flex-1 truncate text-[11.5px] font-bold text-stone-800">{r.t}</span>
            <span className="shrink-0 text-[10.5px] text-stone-500">{r.m}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* ══ What's inside ════════════════════════════════════════════════ */

const INSIDE = [
  { Icon: ClipboardCheck, t: "Attendance", d: "One tap per student, saved as you go, visible to them the same day.", stat: "43 of 47 marked in under a minute" },
  { Icon: BarChart3, t: "Marks", d: "Set the weighting once; every total and letter grade follows from it.", stat: "One formula across 47 students" },
  { Icon: Paperclip, t: "Assignments", d: "Collected, timestamped, late-flagged, graded with feedback attached.", stat: "24 submissions, nothing in an inbox" },
  { Icon: FolderOpen, t: "Materials", d: "Slides and references in folders on the course page, not in a chat log.", stat: "24 files, still there next semester" },
  { Icon: Bell, t: "Announcements", d: "Posted once and delivered to everyone enrolled, with read counts.", stat: "47 notified instantly" },
  { Icon: FileText, t: "Student records", d: "Verified sign-ins and teachers who see only their own courses.", stat: "Marks treated as records" },
]

function InsidePanel() {
  const reduced = usePrefersReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
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
    const id = window.setInterval(() => setActive(a => (a + 1) % INSIDE.length), 2600)
    return () => clearInterval(id)
  }, [reduced, onScreen])

  const current = INSIDE[active]

  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <Reveal>
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-teal-700">What's inside</p>
          </Reveal>
          <RevealLines
            as="h2"
            className="mt-3 font-display text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl"
            lines={["Six things, and", "nothing spare."]}
          />
        </div>

        <div ref={ref} className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.1fr] lg:gap-10">
          {/* the list drives the panel */}
          <div className="space-y-1.5">
            {INSIDE.map((item, i) => {
              const on = active === i
              return (
                <button
                  key={item.t}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className={
                    "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-300 " +
                    (on
                      ? "border-teal-300 bg-teal-50/60 shadow-[0_10px_28px_-16px_rgba(13,148,136,0.6)]"
                      : "border-transparent hover:border-stone-200 hover:bg-stone-50")
                  }
                >
                  <span
                    className={
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-300 " +
                      (on ? "bg-teal-600 text-white" : "bg-stone-100 text-stone-500")
                    }
                  >
                    <item.Icon className="h-4 w-4" strokeWidth={2.25} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-[14.5px] font-bold text-stone-900">{item.t}</span>
                  </span>
                  {on && !reduced && (
                    <motion.span
                      layoutId="inside-marker"
                      className="h-6 w-1 rounded-full bg-teal-600"
                      transition={{ type: "spring", stiffness: 320, damping: 30 }}
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* the panel */}
          <div className="relative min-h-[260px] overflow-hidden rounded-2xl border border-stone-200 bg-gradient-to-br from-stone-50 to-white p-7">
            <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-teal-100/60 blur-3xl" />
            <AnimatePresence initial={false}>
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="absolute inset-0 flex flex-col justify-center p-7"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 text-white shadow-[0_10px_24px_-10px_rgba(13,148,136,0.9)]">
                  <current.Icon className="h-5 w-5" strokeWidth={2.25} />
                </span>
                <h3 className="mt-5 font-display text-[22px] font-extrabold text-stone-900">{current.t}</h3>
                <p className="mt-2.5 max-w-md text-[14.5px] leading-relaxed text-stone-600">{current.d}</p>
                <p className="mt-5 inline-flex w-fit items-center gap-2 rounded-lg border border-teal-200 bg-white px-3 py-1.5 text-[12px] font-bold text-teal-700">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  {current.stat}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ══ Principles ═══════════════════════════════════════════════════ */

const PRINCIPLES = [
  { t: "Light enough for the wifi you have", d: "The whole site weighs less than one photo. It opens on shared campus wifi and on mobile data, because that is what people are actually on." },
  { t: "Free for departments", d: "No licence fee and no procurement process. A teacher can sign up and run a course the same week, without a budget line." },
  { t: "Maintained where it is used", d: "Built and run at JUST CSE. Features arrive because a teacher in the same building asked for them." },
]

function Principles() {
  return (
    <section className="relative overflow-hidden bg-stone-50 py-16 sm:py-20">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[360px] w-[820px] -translate-x-1/2 rounded-full bg-teal-100/40 blur-3xl" />
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {PRINCIPLES.map((p, i) => (
            <motion.div
              key={p.t}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={REVEAL_VIEWPORT}
              transition={{ duration: 0.55, delay: i * 0.1, ease: EASE }}
            >
              <span className="font-display text-[13px] font-bold text-teal-700">0{i + 1}</span>
              <h3 className="mt-2 font-display text-[16.5px] font-bold text-stone-900">{p.t}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-stone-600">{p.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ══ CTA ══════════════════════════════════════════════════════════ */

function AboutCta() {
  return (
    <section className="relative overflow-hidden bg-teal-950 py-16 sm:py-20">
      <InkGrid />
      <div aria-hidden className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-teal-500/20 blur-3xl" />

      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <RevealLines
          as="h2"
          className="font-display text-3xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-4xl"
          lines={["Run your next semester", "on EduNexis."]}
          accentFrom={1}
          accentClass="bg-gradient-to-r from-teal-300 via-cyan-300 to-teal-200 bg-clip-text text-transparent"
        />
        <Reveal delay={0.15}>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-teal-100/70">
            Sign up with your university email and take your first attendance
            this week. Free for departments.
          </p>
        </Reveal>
        <Reveal delay={0.25}>
          <Link
            to="/register"
            className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-white to-stone-100 px-8 py-4 text-[14.5px] font-bold text-teal-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_34px_-10px_rgba(45,212,191,0.45)] transition-all hover:shadow-[inset_0_1px_0_rgba(255,255,255,1),0_16px_42px_-10px_rgba(45,212,191,0.65)] active:translate-y-px"
          >
            Create your account
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
