import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, GraduationCap, LayoutList, Calendar as CalendarIcon } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { isTeacher } from "@/utils/roleGuard"
import AttendanceRecordsList from "@/features/attendance/components/AttendanceRecordsList"
import AttendanceCalendar from "@/features/attendance/components/AttendanceCalendar"
import AttendanceStatsCard from "@/features/attendance/components/AttendanceStatsCard"
import TakeAttendanceSheet from "@/features/attendance/components/TakeAttendanceSheet"
import AttendanceExportButton from "@/features/attendance/components/AttendanceExportButton"
import StudentAttendanceView from "@/features/attendance/components/StudentAttendanceView"
import { useAttendance } from "@/features/attendance/hooks/useAttendance"
import { useAttendanceStats } from "@/features/attendance/hooks/useAttendanceStats"
import { cn } from "@/utils/cn"

interface Props { courseId: string; courseName?: string }

export default function AttendanceTab({ courseId, courseName }: Props) {
  const { user } = useAuthStore()
  const teacher  = isTeacher(user?.role ?? "Student")

  const [takeOpen, setTakeOpen]       = useState(false)
  const [editSession, setEditSession] = useState<any>(null)
  const [view, setView]               = useState<"list" | "calendar">("list")

  const {
    sessions, members,
    isSessionsLoading,
    takeAttendance, isTaking,
    editAttendance, isEditing,
    deleteSession,
  } = useAttendance(courseId)

  const { data: stats } = useAttendanceStats(courseId)

  if (!teacher) return <StudentAttendanceView courseId={courseId} />

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3 p-4 rounded-2xl border border-border bg-card"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl inline-flex items-center justify-center bg-success-soft text-success">
            <GraduationCap className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <h2 className="font-display text-[15px] font-bold text-foreground leading-tight">
              Attendance
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {sessions.length === 0
                ? "No sessions yet"
                : `${sessions.length} session${sessions.length === 1 ? "" : "s"} recorded`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle */}
          <div className="inline-flex items-center p-1 rounded-lg bg-muted border border-border">
            {([
              { id: "list",     label: "List",     icon: LayoutList    },
              { id: "calendar", label: "Calendar", icon: CalendarIcon  },
            ] as const).map(opt => (
              <button
                key={opt.id}
                onClick={() => setView(opt.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 h-7 px-2.5 rounded text-[11px] font-semibold transition-colors",
                  view === opt.id
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <opt.icon className="h-3 w-3" />
                {opt.label}
              </button>
            ))}
          </div>

          <AttendanceExportButton courseId={courseId} courseName={courseName ?? "Course"} />

          <button
            onClick={() => setTakeOpen(true)}
            className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:brightness-105 transition-all focus-ring"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            Take attendance
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      {stats && (
        <AttendanceStatsCard
          totalSessions={stats.totalSessions}
          averageAttendance={stats.averageAttendance}
          totalStudents={stats.studentSummaries?.length}
          lastSessionDate={stats.lastSessionDate}
        />
      )}

      {/* Content */}
      {isSessionsLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl skeleton" />
          ))}
        </div>
      ) : view === "list" ? (
        <AttendanceRecordsList
          sessions={sessions}
          onEdit={(id) => setEditSession(sessions.find((s: any) => s.id === id) ?? null)}
          onDelete={deleteSession}
        />
      ) : (
        <AttendanceCalendar sessions={sessions} />
      )}

      {/* Edit sheet */}
      {editSession && (
        <TakeAttendanceSheet
          isOpen={!!editSession}
          onClose={() => setEditSession(null)}
          members={members}
          courseId={courseId}
          initialDate={editSession.date}
          initialTopic={editSession.topic}
          initialStatuses={Object.fromEntries(
            editSession.records.map((r: any) => [r.studentId, r.status]),
          )}
          onSubmit={(data: any) => {
            editAttendance({
              sessionId: editSession.id,
              data: {
                topic: data.topic,
                entries: data.records.map((r: any) => ({ studentId: r.studentId, status: r.status })),
              },
            })
            setEditSession(null)
          }}
          isLoading={isEditing}
        />
      )}

      {/* Take sheet */}
      <TakeAttendanceSheet
        isOpen={takeOpen}
        onClose={() => setTakeOpen(false)}
        members={members}
        courseId={courseId}
        onSubmit={(data: any) =>
          takeAttendance(data, { onSuccess: () => setTakeOpen(false) })
        }
        isLoading={isTaking}
      />
    </div>
  )
}
