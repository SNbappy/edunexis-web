import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, AlertCircle, Star, ShieldAlert, Clock, UserX, Lock } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import Avatar from "@/components/ui/Avatar"
import Button from "@/components/ui/Button"
import GradeSubmissionModal from "./GradeSubmissionModal"
import PlagiarismReportModal from "./PlagiarismReportModal"
import SubmissionAttachments from "./SubmissionAttachments"
import { useSubmissions } from "../hooks/useSubmissions"
import { useCourseMembers } from "@/features/courses/hooks/useCourseMembers"
import { checkPlagiarismAsync } from "../utils/plagiarismChecker"
import { formatRelative } from "@/utils/dateUtils"
import type { SubmissionDto, PlagiarismReport } from "@/types/assignment.types"

interface SubmissionsPanelProps {
  courseId: string
  assignmentId: string
  maxMarks: number
  isPublished?: boolean
}

type SubStatus = "Graded" | "Late" | "Submitted"

function getStatus(s: SubmissionDto): SubStatus {
  if (s.isGraded) return "Graded"
  if (s.isLate) return "Late"
  return "Submitted"
}

interface StatusConfig {
  classes: string
  icon: LucideIcon
}

function getStatusConfig(status: SubStatus): StatusConfig {
  switch (status) {
    case "Graded": return {
      classes: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
      icon: Star,
    }
    case "Late": return {
      classes: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
      icon: AlertCircle,
    }
    case "Submitted": return {
      classes: "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300",
      icon: CheckCircle2,
    }
  }
}

export default function SubmissionsPanel({
  courseId, assignmentId, maxMarks, isPublished,
}: SubmissionsPanelProps) {
  const { submissions, isLoading, gradeSubmission, isGrading } = useSubmissions(courseId, assignmentId)
  const { members } = useCourseMembers(courseId)
  const [grading, setGrading] = useState<SubmissionDto | null>(null)
  const [plagReport, setPlagReport] = useState<PlagiarismReport | null>(null)
  const [plagOpen, setPlagOpen] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  const handleCheckPlag = async () => {
    setPlagOpen(true)
    setIsChecking(true)
    try {
      setPlagReport(await checkPlagiarismAsync(submissions))
    } catch {
      /* swallowed — modal still shows */
    } finally {
      setIsChecking(false)
    }
  }

  /* Who has NOT turned anything in.
     The panel listed only the students who submitted, so answering "who is
     missing" meant the teacher cross-referencing the roster by hand. */
  const notSubmitted = useMemo(() => {
    const submitted = new Set(submissions.map(s => s.studentId))
    return members
      .filter((m: any) => !submitted.has(m.userId))
      .sort((a: any, b: any) =>
        (a.studentId ?? "").localeCompare(b.studentId ?? "", undefined, { numeric: true }) ||
        a.fullName.localeCompare(b.fullName))
  }, [members, submissions])

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-xl border border-border bg-muted/40"
          />
        ))}
      </div>
    )
  }

  const graded = submissions.filter(s => s.isGraded).length
  const pending = submissions.filter(s => !s.isGraded).length

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 p-3">
        <div className="flex items-center gap-4">
          <Stat value={submissions.length} label="Total" tone="muted" />
          <div className="h-8 w-px bg-border" />
          <Stat value={graded} label="Graded" tone="emerald" />
          <div className="h-8 w-px bg-border" />
          <Stat value={pending} label="Pending" tone="amber" />
          {notSubmitted.length > 0 && (
            <>
              <div className="h-8 w-px bg-border" />
              <Stat value={notSubmitted.length} label="Not submitted" tone="red" />
            </>
          )}
        </div>

        {submissions.length >= 2 && (
          <Button
            size="sm"
            variant="secondary"
            onClick={handleCheckPlag}
            className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-950/60"
          >
            <ShieldAlert className="h-3 w-3" />
            Check plagiarism
          </Button>
        )}
      </div>

      {isPublished && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-[13px] text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
          <Lock className="h-4 w-4 shrink-0" />
          <span>Marks are published and visible to students. Click <strong>Unpublish</strong> at the top if you need to modify grades.</span>
        </div>
      )}

      {/* Submissions list */}
      {submissions.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-border bg-muted/30 px-6 py-12 text-center">
          <Clock className="mb-3 h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
          <p className="font-display text-[14px] font-bold text-foreground">
            No submissions yet
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Students will appear here as they submit.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {submissions.map((sub, i) => {
            const status = getStatus(sub)
            const cfg = getStatusConfig(status)
            const Icon = cfg.icon
            return (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
                className="rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-teal-200 hover:shadow-sm dark:hover:border-teal-800"
              >
                <div className="flex items-center gap-3">
                  <Avatar src={sub.studentPhotoUrl} name={sub.studentName} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold text-foreground">
                      {sub.studentName}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatRelative(sub.submittedAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {sub.isGraded && sub.marks != null && (
                      <span className="font-display text-[13px] font-extrabold tabular-nums text-emerald-700 dark:text-emerald-300">
                        {sub.marks}/{maxMarks}
                      </span>
                    )}
                    <span className={"inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider " + cfg.classes}>
                      <Icon className="h-2.5 w-2.5" strokeWidth={2.5} />
                      {status}
                    </span>
                    <Button
                      size="sm"
                      variant={sub.isGraded ? "secondary" : "primary"}
                      disabled={isPublished}
                      onClick={() => setGrading(sub)}
                    >
                      {isPublished ? "Locked" : sub.isGraded ? "Edit" : "Grade"}
                    </Button>
                  </div>
                </div>

                {/* The work itself, on the row. It was previously only reachable
                    by opening the grading modal, so a teacher could not see what
                    a student had turned in while deciding whom to mark next. */}
                <div className="mt-2.5 pl-11">
                  <SubmissionAttachments submission={sub} />
                  {sub.textContent && (
                    <p className="mt-2 line-clamp-2 rounded-lg bg-muted/40 px-3 py-2 text-[12px] leading-relaxed text-muted-foreground">
                      {sub.textContent}
                    </p>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Who is missing */}
      {notSubmitted.length > 0 && (
        <section>
          <div className="mb-2 flex items-center gap-2">
            <UserX className="h-3.5 w-3.5 text-destructive" strokeWidth={2} />
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Not submitted
            </h3>
            <span className="rounded-full bg-destructive-soft px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-destructive">
              {notSubmitted.length}
            </span>
          </div>
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
            {notSubmitted.map((m: any) => (
              <li key={m.userId} className="flex items-center gap-3 bg-card px-4 py-2.5">
                <Avatar src={m.profilePhotoUrl} name={m.fullName} size="sm" />
                <div className="min-w-0 flex-1">
                  {m.studentId ? (
                    <>
                      <p className="font-mono text-[12px] font-bold leading-tight text-foreground">
                        {m.studentId}
                      </p>
                      <p className="truncate text-[11.5px] text-muted-foreground">{m.fullName}</p>
                    </>
                  ) : (
                    <p className="truncate text-[13px] font-semibold text-foreground">{m.fullName}</p>
                  )}
                </div>
                <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                  Nothing turned in
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <GradeSubmissionModal
        isOpen={!!grading}
        onClose={() => setGrading(null)}
        submission={grading}
        maxMarks={maxMarks}
        onGrade={data =>
          gradeSubmission(
            { submissionId: grading!.id, data },
            { onSuccess: () => setGrading(null) },
          )
        }
        isLoading={isGrading}
      />

      <PlagiarismReportModal
        isOpen={plagOpen}
        onClose={() => setPlagOpen(false)}
        report={plagReport}
        isChecking={isChecking}
      />
    </div>
  )
}

interface StatProps {
  value: number
  label: string
  tone: "muted" | "emerald" | "amber" | "red"
}

function Stat({ value, label, tone }: StatProps) {
  const colorClass =
    tone === "emerald" ? "text-emerald-700 dark:text-emerald-300"
      : tone === "amber" ? "text-amber-700 dark:text-amber-300"
        : tone === "red" ? "text-red-700 dark:text-red-300"
          : "text-foreground"

  return (
    <div className="text-center">
      <p className={"font-display text-lg font-extrabold leading-none tabular-nums " + colorClass}>
        {value}
      </p>
      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  )
}