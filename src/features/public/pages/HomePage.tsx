import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { publicService } from "../services/publicService"

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
import { ArrowRight, Sparkles, BookOpen, ClipboardCheck, ClipboardList, BarChart3, Bell, Shield, Users, Layers, GraduationCap } from "lucide-react"

/**
 * Force light theme on this page regardless of user's dark-mode toggle.
 * The homepage is a marketing surface — light works for first-impression
 * branding and matches our design reference.
 */
function useForceLight() {
  useEffect(() => {
    const html = document.documentElement
    const had = html.classList.contains("dark")
    html.classList.remove("dark")
    return () => { if (had) html.classList.add("dark") }
  }, [])
}

export default function HomePage() {
  useForceLight()
  return (
    <div className="bg-white text-stone-900">
      <Hero />
      <WhyPanel />
      <FeaturesPanel />
      <ForWhomPanel />
      <StatsStrip />
      <FinalCta />
    </div>
  )
}

/* ── Hero ─────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative -mt-16 overflow-hidden pt-16">
      {/* Soft background blobs — set the visual tone, extend behind transparent navbar */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 h-[600px] w-[600px] rounded-full bg-teal-100/60 blur-3xl" />
        <div className="absolute -top-20 right-0 h-[500px] w-[500px] rounded-full bg-blue-100/50 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-cyan-100/40 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:px-8 lg:py-16">
        {/* Left: copy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col justify-center"
        >
          {/* Eyebrow */}
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-teal-200 bg-white px-3 py-1.5 text-[11.5px] font-semibold text-teal-700 shadow-sm">
            <Sparkles className="h-3 w-3" />
            Built at JUST CSE for South Asian universities
          </div>

          {/* Headline */}
          <h1 className="mt-5 font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-stone-900 sm:text-6xl lg:text-7xl">
            The LMS{" "}
            <span className="block">built for</span>
            <span className="block bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-700 bg-clip-text text-transparent">
              real classrooms.
            </span>
          </h1>

          {/* Sub */}
          <p className="mt-6 max-w-xl text-[15.5px] leading-relaxed text-stone-600 sm:text-base">
            EduNexis brings courses, attendance, assignments, and grading into one focused workspace — designed around how universities actually run, not generic SaaS templates.
          </p>

          {/* CTAs */}
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 rounded-xl bg-stone-900 px-6 py-3.5 text-[14px] font-bold text-white shadow-[0_8px_24px_-8px_rgba(0,0,0,0.4)] transition-all hover:bg-stone-800 hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.5)]"
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

          {/* Trusted by */}
          <div className="mt-12 flex items-center gap-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-stone-500">
              Trusted by
            </span>
            <div className="h-px flex-1 max-w-12 bg-stone-300" />
            <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[11.5px] font-bold text-stone-700 shadow-sm">
              JUST · CSE
            </div>
          </div>
        </motion.div>

        {/* Right: animated SVG composition */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex items-center justify-center"
        >
          <HeroIllustration />
        </motion.div>
      </div>
    </section>
  )
}

/* ── Hero illustration: 3 floating "product" cards in CSS 3D ─────── */

function HeroIllustration() {
  return (
    <div className="relative aspect-square w-full max-w-md" style={{ perspective: "1200px" }}>
      {/* Card 1 — Attendance */}
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-0 top-8 w-64 rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl"
        style={{ transform: "rotateY(-8deg) rotateX(4deg)", transformStyle: "preserve-3d" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100">
            <ClipboardCheck className="h-4 w-4 text-teal-700" strokeWidth={2.5} />
          </div>
          <span className="font-display text-[12.5px] font-bold text-stone-900">Attendance</span>
        </div>
        <div className="mt-4 space-y-2">
          {["Aisha Khan", "Rahim Ali", "Priya Das"].map((n, i) => (
            <div key={n} className="flex items-center justify-between">
              <span className="text-[11.5px] text-stone-700">{n}</span>
              <span className={
                "h-2.5 w-2.5 rounded-full " +
                (i === 1 ? "bg-rose-400" : "bg-teal-500")
              } />
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-2.5 text-[10px] font-semibold uppercase tracking-wider">
          <span className="text-stone-500">Today</span>
          <span className="text-teal-700">28 / 30</span>
        </div>
      </motion.div>

      {/* Card 2 — Marks (foreground, biggest) */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute right-0 top-1/2 w-64 -translate-y-1/2 rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl"
        style={{ transform: "rotateY(8deg) rotateX(-2deg)", transformStyle: "preserve-3d" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
            <BarChart3 className="h-4 w-4 text-blue-700" strokeWidth={2.5} />
          </div>
          <span className="font-display text-[12.5px] font-bold text-stone-900">Final Marks</span>
        </div>
        <div className="mt-4 flex items-end justify-between gap-1.5 h-20">
          {[40, 65, 50, 80, 70, 90, 55].map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ duration: 1, delay: 0.8 + i * 0.08, ease: "easeOut" }}
              className="w-full rounded-t-md bg-gradient-to-t from-teal-500 to-cyan-400"
            />
          ))}
        </div>
        <div className="mt-3 flex items-baseline justify-between border-t border-stone-100 pt-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">Class avg</span>
          <span className="font-display text-[18px] font-bold text-stone-900">78<span className="text-stone-400">%</span></span>
        </div>
      </motion.div>

      {/* Card 3 — Assignment (back, smallest) */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-4 left-12 w-56 rounded-2xl border border-stone-200 bg-white p-5 shadow-xl"
        style={{ transform: "rotateY(-4deg) rotateX(6deg)", transformStyle: "preserve-3d" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
            <BookOpen className="h-4 w-4 text-amber-700" strokeWidth={2.5} />
          </div>
          <span className="font-display text-[12.5px] font-bold text-stone-900">Assignment 4</span>
        </div>
        <p className="mt-3 text-[11.5px] leading-relaxed text-stone-600">
          DBMS · ER diagram for library system
        </p>
        <div className="mt-3 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider">
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">Due in 2d</span>
          <span className="text-stone-500">22 sub.</span>
        </div>
      </motion.div>

      {/* Floating dots / sparkles for depth */}
      <motion.div
        animate={{ y: [0, -20, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-12 top-12 h-3 w-3 rounded-full bg-teal-400"
      />
      <motion.div
        animate={{ y: [0, -16, 0], opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute left-8 top-1/2 h-2 w-2 rounded-full bg-blue-400"
      />
      <motion.div
        animate={{ y: [0, -12, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        className="absolute bottom-20 right-4 h-2.5 w-2.5 rounded-full bg-cyan-400"
      />
    </div>
  )
}

/* ── Why EduNexis — dark panel ──────────────────────────────── */

function WhyPanel() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-20 sm:py-24 lg:py-28">
      {/* Decorative grid background */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Soft accent glow */}
      <div aria-hidden className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-teal-500/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-teal-300">
            Why EduNexis
          </p>
          <h2 className="mt-3 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Generic tools dont fit
            <br />
            <span className="bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">
              real classrooms.
            </span>
          </h2>
          <p className="mt-6 text-[15px] leading-relaxed text-slate-300 sm:text-base">
            Most universities use Google Classroom or no LMS at all. The result is fragmented workflows, lost submissions, and grading scattered across spreadsheets. EduNexis was built around the way universities here actually work.
          </p>
        </div>

        {/* 3 differentiator cards */}
        <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3">
          {WHY_POINTS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm transition-all hover:border-teal-400/40 hover:bg-white/[0.07]"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-[0_8px_24px_-8px_rgba(20,184,166,0.6)]">
                <p.Icon className="h-5 w-5" strokeWidth={2.25} />
              </div>
              <h3 className="font-display text-[16px] font-bold text-white">
                {p.title}
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-slate-300">
                {p.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const WHY_POINTS = [
  {
    Icon: Users,
    title: "Built with faculty",
    desc: "Class tests, presentations, attendance — features come from how teachers here actually teach, not generic SaaS templates.",
  },
  {
    Icon: Layers,
    title: "Everything in one place",
    desc: "Stop juggling Drive, Sheets, email, and Classroom. Materials, assignments, grades, and announcements live together.",
  },
  {
    Icon: Sparkles,
    title: "Designed for the local context",
    desc: "Bilingual-friendly. Built for unstable connectivity. Free for departments. Modern engineering throughout.",
  },
]

/* ── Features grid — 6 cards with subtle 3D hover ────────────── */

function FeaturesPanel() {
  return (
    <section className="relative bg-white py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-teal-700">
            Built for the classroom
          </p>
          <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-stone-900 sm:text-5xl">
            Everything you need
            <br />
            to run a course.
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-stone-600 sm:text-base">
            From the first day of class to publishing final marks, EduNexis covers the full teaching workflow.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-teal-300 hover:shadow-[0_20px_48px_-16px_rgba(0,0,0,0.12)]"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Color accent bar at top */}
              <div className={"absolute inset-x-0 top-0 h-1 bg-gradient-to-r " + f.gradient + " opacity-0 transition-opacity duration-300 group-hover:opacity-100"} />

              <div className={"mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br " + f.gradient + " text-white shadow-md"}>
                <f.Icon className="h-5 w-5" strokeWidth={2.25} />
              </div>
              <h3 className="font-display text-[16px] font-bold text-stone-900">
                {f.title}
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-stone-600">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const FEATURES = [
  {
    Icon: ClipboardCheck,
    title: "Attendance",
    desc: "Take attendance in seconds. Students see their record live. No paper, no spreadsheets.",
    gradient: "from-teal-500 to-emerald-500",
  },
  {
    Icon: ClipboardList,
    title: "Assignments",
    desc: "Post assignments with reference files. Collect submissions, grade, give inline feedback.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    Icon: BookOpen,
    title: "Materials",
    desc: "Organize lecture slides, PDFs, and links in folders. Students download what they need.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    Icon: BarChart3,
    title: "Marks & gradebook",
    desc: "Build your grading formula once. Final marks publish to students automatically.",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    Icon: Bell,
    title: "Real-time updates",
    desc: "New announcements, submissions, and approvals show up across devices in seconds.",
    gradient: "from-rose-500 to-pink-500",
  },
  {
    Icon: Shield,
    title: "Secure by default",
    desc: "Email-verified accounts. JWT sessions. BCrypt-hashed passwords. Your data stays yours.",
    gradient: "from-slate-700 to-slate-900",
  },
]

/* ── Stats strip — REAL data from /api/public/stats ────────────── */

function StatsStrip() {
  const { data: stats } = useStats()
  const items = [
    { label: "Active teachers", value: stats?.teacherCount ?? 0, color: "text-teal-600" },
    { label: "Students enrolled", value: stats?.studentCount ?? 0, color: "text-amber-600" },
    { label: "Courses running", value: stats?.courseCount ?? 0, color: "text-blue-600" },
    { label: "Assignments graded", value: stats?.assignmentCount ?? 0, color: "text-violet-600" },
  ]

  return (
    <section className="relative bg-stone-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-teal-700">
            By the numbers
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">
            Real classrooms, real activity.
          </h2>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-5 sm:grid-cols-4">
          {items.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl border border-stone-200 bg-white p-6 text-center"
            >
              <CountUp target={s.value} className={"font-display text-4xl font-extrabold tracking-tight sm:text-5xl " + s.color} />
              <p className="mt-2 text-[12px] font-semibold uppercase tracking-wider text-stone-500">
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* CountUp — animates a number from 0 → target when scrolled into view */
function CountUp({ target, className }: { target: number; className?: string }) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    if (!ref.current || started.current) return
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const duration = 1400
          const start = performance.now()
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration)
            const eased = 1 - Math.pow(1 - t, 3)
            setValue(Math.round(target * eased))
            if (t < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      })
    }, { threshold: 0.4 })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  return <span ref={ref} className={className}>{value}</span>
}

/* ── For students / For teachers — redesigned split ─────────────── */

function ForWhomPanel() {
  return (
    <section className="relative bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-teal-700">
            One platform, two perspectives
          </p>
          <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-stone-900 sm:text-5xl">
            Designed for both sides
            <br />
            <span className="bg-gradient-to-r from-teal-600 to-blue-700 bg-clip-text text-transparent">
              of the classroom.
            </span>
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PersonaCard
            kind="student"
            title="For students"
            tagline="No more digging through emails for lecture slides."
            items={[
              "See every course, deadline, and grade in one place",
              "Submit assignments without email attachments",
              "Track attendance and never lose marks",
              "Get instant notifications on graded work",
            ]}
            cta="Sign up as a student"
            gradient="from-amber-50 to-orange-50"
            border="border-amber-200"
            accent="text-amber-700"
            dotColor="bg-amber-500"
            iconBg="bg-gradient-to-br from-amber-500 to-orange-500"
            Icon={GraduationCap}
          />
          <PersonaCard
            kind="teacher"
            title="For teachers"
            tagline="Spend more time teaching, less time on spreadsheets."
            items={[
              "Create a course in under a minute",
              "Take attendance with one tap per student",
              "Grade submissions with inline feedback",
              "Publish final marks once, students see immediately",
            ]}
            cta="Sign up as a teacher"
            gradient="from-teal-50 to-cyan-50"
            border="border-teal-200"
            accent="text-teal-700"
            dotColor="bg-teal-600"
            iconBg="bg-gradient-to-br from-teal-600 to-cyan-600"
            Icon={BookOpen}
          />
        </div>
      </div>
    </section>
  )
}

interface PersonaCardProps {
  kind: "student" | "teacher"
  title: string
  tagline: string
  items: string[]
  cta: string
  gradient: string
  border: string
  accent: string
  dotColor: string
  iconBg: string
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
}

function PersonaCard(props: PersonaCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={"rounded-3xl border bg-gradient-to-br p-8 sm:p-10 " + props.border + " " + props.gradient}
    >
      <div className="flex items-center gap-3">
        <div className={"flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-md " + props.iconBg}>
          <props.Icon className="h-6 w-6" strokeWidth={2.25} />
        </div>
        <h3 className="font-display text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl">
          {props.title}
        </h3>
      </div>

      <p className="mt-4 text-[14.5px] leading-relaxed text-stone-700">
        {props.tagline}
      </p>

      <ul className="mt-6 space-y-3">
        {props.items.map(item => (
          <li key={item} className="flex items-start gap-3 text-[14px] text-stone-800">
            <span className={"mt-1.5 h-2 w-2 shrink-0 rounded-full " + props.dotColor} />
            {item}
          </li>
        ))}
      </ul>

      <Link
        to="/register"
        className={"mt-8 inline-flex items-center gap-2 text-[13.5px] font-bold transition-colors hover:opacity-80 " + props.accent}
      >
        {props.cta}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </motion.div>
  )
}

/* ── Final CTA — bold dark panel ───────────────────────────── */

function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-24 sm:py-28 lg:py-32">
      {/* Decorative glow */}
      <div aria-hidden className="absolute -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-teal-500/15 blur-3xl" />
      <div aria-hidden className="absolute -bottom-32 right-0 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-3xl" />

      {/* Subtle dot pattern */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-teal-300">
            Get started today
          </p>
          <h2 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Ready to transform
            <br />
            <span className="bg-gradient-to-r from-teal-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent">
              your classroom?
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-slate-300 sm:text-base">
            Join the teachers and students already using EduNexis. Free for departments, no credit card, no setup hassle.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 rounded-xl bg-white px-7 py-4 text-[14.5px] font-bold text-stone-900 shadow-[0_12px_32px_-8px_rgba(255,255,255,0.3)] transition-all hover:shadow-[0_16px_40px_-8px_rgba(255,255,255,0.45)]"
            >
              Create your account
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/faculty"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-4 text-[14.5px] font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              Browse faculty
            </Link>
          </div>

          <p className="mt-8 text-[12px] font-semibold uppercase tracking-wider text-slate-400">
            Built at JUST CSE · Designed for South Asia
          </p>
        </motion.div>
      </div>
    </section>
  )
}