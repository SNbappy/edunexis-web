import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowRight, Sparkles, BookOpen, ClipboardCheck,
  ClipboardList, BarChart3, Users, GraduationCap, Shield,
} from "lucide-react"

const features = [
  {
    icon: ClipboardCheck,
    title: "Attendance",
    desc: "Take attendance in seconds. Students see their record live.",
  },
  {
    icon: ClipboardList,
    title: "Assignments",
    desc: "Post assignments with reference files. Collect submissions, grade, give feedback.",
  },
  {
    icon: BookOpen,
    title: "Materials",
    desc: "Organize course materials in folders. Students download what they need.",
  },
  {
    icon: BarChart3,
    title: "Marks & gradebook",
    desc: "Build your grading formula once. Final marks publish to students automatically.",
  },
  {
    icon: Users,
    title: "Real-time updates",
    desc: "New announcements, submissions, and approvals show up across devices in seconds.",
  },
  {
    icon: Shield,
    title: "Secure by default",
    desc: "Email-verified accounts. JWT sessions. BCrypt-hashed passwords. Your data stays yours.",
  },
]

const forStudents = [
  "See every course, deadline, and grade in one place",
  "Submit assignments without email attachments",
  "Track your attendance, never lose marks",
  "Get instant notifications on graded work",
]

const forTeachers = [
  "Create a course in under a minute",
  "Take attendance with one tap per student",
  "Grade submissions with inline feedback",
  "Publish final marks once, students see immediately",
]

export default function HomePage() {
  return (
    <>
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        {/* subtle background gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-teal-50/40 via-transparent to-transparent dark:from-teal-950/20" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-[11.5px] font-semibold text-teal-700 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300">
              <Sparkles className="h-3 w-3" />
              Built at JUST CSE for South Asian universities
            </div>

            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Education that
              <br />
              <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
                just works.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
              EduNexis is a modern learning management system for universities. Courses, attendance, assignments, grading — everything in one place, designed for the local academic context.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-[14px] font-bold text-white shadow-[0_8px_24px_-8px_rgba(20,184,166,0.7)] transition-all hover:bg-teal-700 hover:shadow-[0_12px_32px_-8px_rgba(20,184,166,0.8)]"
              >
                Get started for free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/faculty"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-[14px] font-bold text-foreground transition-colors hover:bg-muted"
              >
                Browse faculty
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Features grid ─── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[12px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            Built for the classroom
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to run a course
          </h2>
          <p className="mt-3 text-[14px] text-muted-foreground sm:text-[15px]">
            Stop juggling Google Classroom, Sheets, Drive, and email. EduNexis brings every part of teaching into one focused workspace.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.08)]"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
                <f.icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <h3 className="font-display text-[15px] font-bold text-foreground">
                {f.title}
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── For students / For teachers split ─── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* For students */}
          <div className="rounded-3xl border border-border bg-card p-8 sm:p-10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                <GraduationCap className="h-5 w-5" strokeWidth={2} />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground sm:text-2xl">
                For students
              </h3>
            </div>
            <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
              No more digging through emails for lecture slides. Everything for every course, in one place.
            </p>
            <ul className="mt-6 space-y-2.5">
              {forStudents.map(item => (
                <li key={item} className="flex items-start gap-2.5 text-[13.5px] text-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              to="/register"
              className="mt-7 inline-flex items-center gap-2 text-[13px] font-bold text-amber-700 transition-colors hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-200"
            >
              Sign up as a student
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* For teachers */}
          <div className="rounded-3xl border border-teal-200 bg-gradient-to-br from-teal-50 to-emerald-50 p-8 dark:border-teal-800 dark:from-teal-950/40 dark:to-emerald-950/30 sm:p-10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white">
                <BookOpen className="h-5 w-5" strokeWidth={2} />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground sm:text-2xl">
                For teachers
              </h3>
            </div>
            <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
              Spend more time teaching, less time on spreadsheets. Run your whole course end to end.
            </p>
            <ul className="mt-6 space-y-2.5">
              {forTeachers.map(item => (
                <li key={item} className="flex items-start gap-2.5 text-[13.5px] text-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              to="/register"
              className="mt-7 inline-flex items-center gap-2 text-[13px] font-bold text-teal-700 transition-colors hover:text-teal-800 dark:text-teal-300 dark:hover:text-teal-200"
            >
              Sign up as a teacher
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA ─── */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-border bg-card p-10 text-center sm:p-14">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Ready to get organized?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[14px] text-muted-foreground sm:text-[15px]">
            Join the teachers and students already using EduNexis. Free, no credit card, no setup.
          </p>
          <Link
            to="/register"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-[14px] font-bold text-white shadow-[0_8px_24px_-8px_rgba(20,184,166,0.7)] transition-all hover:bg-teal-700"
          >
            Create your account
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  )
}