import { Link } from "react-router-dom"
import { ArrowRight, GraduationCap, Users, Code2 } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[12px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
          About EduNexis
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          A learning platform built where it{"\u2019"}s used.
        </h1>
        <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
          EduNexis started as a final-year project at JUST{"\u2019"}s CSE department. It became a working LMS designed for the realities of South Asian universities — local processes, multi-language faculty, intermittent connectivity, and limited institutional budgets.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
            <GraduationCap className="h-5 w-5" strokeWidth={2} />
          </div>
          <h3 className="font-display text-[15px] font-bold text-foreground">Built for academia</h3>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            Course tools that match how universities actually work — class tests, presentations, attendance.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
            <Users className="h-5 w-5" strokeWidth={2} />
          </div>
          <h3 className="font-display text-[15px] font-bold text-foreground">Made with faculty</h3>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            Every feature comes from real workflows of real teachers. Not from generic SaaS templates.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-700 dark:bg-stone-900/60 dark:text-stone-300">
            <Code2 className="h-5 w-5" strokeWidth={2} />
          </div>
          <h3 className="font-display text-[15px] font-bold text-foreground">Modern engineering</h3>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            React, .NET 10, MySQL, Clean Architecture. Built to scale beyond a single department.
          </p>
        </div>
      </div>

      <div className="mt-16 rounded-3xl border border-border bg-card p-8 sm:p-12">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          The story
        </h2>
        <div className="mt-5 space-y-4 text-[14.5px] leading-relaxed text-muted-foreground">
          <p>
            EduNexis was created by Md. Sabbir Hossain Bappy as part of his final-year CSE thesis at Jashore University of Science and Technology, under the supervision of Dr. Mohammad Nowsin Amin Sheikh.
          </p>
          <p>
            The goal was simple: most universities in the region rely on Google Classroom or no LMS at all. Generic tools don{"\u2019"}t handle local realities — class tests as a separate construct from assignments, presentation grading rubrics, attendance taken on paper. EduNexis was designed around those workflows from day one.
          </p>
          <p>
            What started as a thesis project is now growing into a tool that other departments and universities can adopt. If you{"\u2019"}re interested in bringing EduNexis to your institution, we{"\u2019"}d love to talk.
          </p>
        </div>
      </div>

      <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          to="/register"
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-[14px] font-bold text-white shadow-[0_8px_24px_-8px_rgba(20,184,166,0.7)] transition-all hover:bg-teal-700"
        >
          Get started
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          to="/faculty"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-[14px] font-bold text-foreground transition-colors hover:bg-muted"
        >
          Browse faculty
        </Link>
      </div>
    </div>
  )
}