import { useEffect } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowRight, Sparkles, Target, Users, Code2,
  Building2, Heart, Lightbulb,
} from "lucide-react"

function useForceLight() {
  useEffect(() => {
    const html = document.documentElement
    const had = html.classList.contains("dark")
    html.classList.remove("dark")
    return () => { if (had) html.classList.add("dark") }
  }, [])
}

export default function AboutPage() {
  useForceLight()
  return (
    <div className="bg-white text-stone-900">
      <Hero />
      <MissionPanel />
      <ValuesPanel />
      <StoryPanel />
      <FinalCta />
    </div>
  )
}

/* ── Hero ─────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative -mt-16 overflow-hidden pt-16">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-teal-100/60 blur-3xl" />
        <div className="absolute -top-20 right-0 h-[400px] w-[400px] rounded-full bg-blue-100/50 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-3 py-1.5 text-[11.5px] font-semibold text-teal-700 shadow-sm">
            <Sparkles className="h-3 w-3" />
            About EduNexis
          </div>

          <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-stone-900 sm:text-5xl md:text-6xl lg:text-7xl">
            A learning platform
            <br />
            <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-700 bg-clip-text text-transparent">
              built where it is used.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-[15.5px] leading-relaxed text-stone-600 sm:text-base">
            EduNexis began as a final-year project at Jashore University of Science and Technology. It became a working LMS designed for the realities of South Asian universities &mdash; local processes, multi-language faculty, intermittent connectivity, and limited institutional budgets.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

/* ── Mission — dark panel ─────────────────────────────────────── */

function MissionPanel() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-20 sm:py-24 lg:py-28">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div aria-hidden className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-teal-500/20 blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-teal-300">
            Our mission
          </p>
          <h2 className="mt-4 font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-4xl md:text-5xl">
            Make great teaching tools
            <br />
            <span className="bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">
              accessible to every classroom.
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-relaxed text-slate-300 sm:text-base">
            Universities across South Asia rely on Google Classroom or no LMS at all. Generic tools weren&apos;t built for the way courses actually run here. EduNexis was designed around those workflows from day one &mdash; class tests, presentation grading, attendance taken in real classrooms.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

/* ── Values grid ─────────────────────────────────────────────── */

const VALUES = [
  {
    Icon: Target,
    title: "Built for academia",
    desc: "Course tools that match how universities actually work &mdash; class tests, presentations, attendance, grading rubrics.",
    gradient: "from-teal-500 to-emerald-500",
  },
  {
    Icon: Users,
    title: "Made with faculty",
    desc: "Every feature comes from real workflows of real teachers. Not from generic SaaS templates or Western LMS conventions.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    Icon: Code2,
    title: "Modern engineering",
    desc: "React, .NET 10, MySQL, Clean Architecture. Built to scale beyond a single department to entire universities.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    Icon: Heart,
    title: "Free for departments",
    desc: "No per-seat pricing. No locked features. Universities adopt EduNexis without asking the budget committee for permission.",
    gradient: "from-rose-500 to-pink-500",
  },
  {
    Icon: Lightbulb,
    title: "Designed to evolve",
    desc: "We listen to what teachers and students actually need. Features ship monthly, based on real use, not roadmap theater.",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    Icon: Building2,
    title: "Made in Bangladesh",
    desc: "Built locally at JUST CSE, designed for the local academic context, with deep awareness of how things work here.",
    gradient: "from-slate-700 to-slate-900",
  },
]

function ValuesPanel() {
  return (
    <section className="relative bg-white py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-teal-700">
            What we stand for
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl md:text-5xl">
            Principles that shape
            <br />
            every feature.
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {VALUES.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-teal-300 hover:shadow-[0_20px_48px_-16px_rgba(0,0,0,0.12)]"
            >
              <div className={"absolute inset-x-0 top-0 h-1 bg-gradient-to-r " + v.gradient + " opacity-0 transition-opacity duration-300 group-hover:opacity-100"} />
              <div className={"mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br " + v.gradient + " text-white shadow-md"}>
                <v.Icon className="h-5 w-5" strokeWidth={2.25} />
              </div>
              <h3 className="font-display text-[16px] font-bold text-stone-900">
                {v.title}
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-stone-600" dangerouslySetInnerHTML={{ __html: v.desc }} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Story ────────────────────────────────────────────────────── */

function StoryPanel() {
  return (
    <section className="relative bg-stone-50 py-20 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-teal-700">
            The story
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl md:text-5xl">
            How EduNexis came to be.
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 space-y-6 rounded-3xl border border-stone-200 bg-white p-8 sm:p-12"
        >
          <p className="text-[15px] leading-relaxed text-stone-700">
            EduNexis was created by <strong className="font-bold text-stone-900">Md. Sabbir Hossain Bappy</strong> as part of his final-year CSE thesis at Jashore University of Science and Technology, under the supervision of <strong className="font-bold text-stone-900">Dr. Mohammad Nowsin Amin Sheikh</strong>.
          </p>
          <p className="text-[15px] leading-relaxed text-stone-700">
            The goal was simple: most universities in the region rely on Google Classroom or no LMS at all. Generic tools don&apos;t handle local realities &mdash; class tests as a separate construct from assignments, presentation grading rubrics, attendance taken on paper. EduNexis was designed around those workflows from day one.
          </p>
          <p className="text-[15px] leading-relaxed text-stone-700">
            What started as a thesis project is now growing into a tool that other departments and universities can adopt. If you&apos;re interested in bringing EduNexis to your institution, we&apos;d love to talk.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

/* ── Final CTA ────────────────────────────────────────────────── */

function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-24 sm:py-28">
      <div aria-hidden className="absolute -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-teal-500/15 blur-3xl" />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="font-display text-3xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-4xl md:text-5xl">
            Ready to see it in action?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-slate-300 sm:text-base">
            Sign up free in under a minute, or browse the public faculty directory to see who is already using EduNexis.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 rounded-xl bg-white px-7 py-4 text-[14.5px] font-bold text-stone-900 shadow-[0_12px_32px_-8px_rgba(255,255,255,0.3)] transition-all hover:shadow-[0_16px_40px_-8px_rgba(255,255,255,0.45)]"
            >
              Get started free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/faculty"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-4 text-[14.5px] font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              Browse faculty
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}