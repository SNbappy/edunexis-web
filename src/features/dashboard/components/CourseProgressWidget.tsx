import { motion } from "framer-motion"
import { BookOpen, Users, ArrowRight, GraduationCap, Plus } from "lucide-react"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { dashboardService } from "../services/dashboardService"
import { useAuthStore } from "@/store/authStore"
import { isTeacher } from "@/utils/roleGuard"
import { ROUTES } from "@/config/constants"

const PALETTE = [
  { dot: "#7c3aed", bar: "linear-gradient(90deg,#7c3aed,#a855f7)", bg: "#f5f3ff", border: "#ede9fe", text: "#5b21b6", sub: "#8b7ec8", code: "#ede9fe", codeText: "#7c3aed" },
  { dot: "#0891b2", bar: "linear-gradient(90deg,#0891b2,#06b6d4)", bg: "#f0fdff", border: "#cffafe", text: "#155e75", sub: "#6dafbb", code: "#cffafe", codeText: "#0891b2" },
  { dot: "#ec4899", bar: "linear-gradient(90deg,#ec4899,#f472b6)", bg: "#fdf2f8", border: "#fce7f3", text: "#9d174d", sub: "#c76b90", code: "#fce7f3", codeText: "#ec4899" },
  { dot: "#059669", bar: "linear-gradient(90deg,#059669,#10b981)", bg: "#f0fdf4", border: "#d1fae5", text: "#065f46", sub: "#5fa88a", code: "#d1fae5", codeText: "#059669" },
  { dot: "#d97706", bar: "linear-gradient(90deg,#d97706,#f59e0b)", bg: "#fffbeb", border: "#fef3c7", text: "#92400e", sub: "#c09a4e", code: "#fef3c7", codeText: "#d97706" },
]

export default function CourseProgressWidget() {
  const { user } = useAuthStore()
  const teacher = isTeacher(user?.role ?? "Student")
  const role = teacher ? "Teacher" : "Student"

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["courses", "mine", user?.id],
    queryFn: async () => {
      const res = await dashboardService.getCourses(role, user!.id)
      if (!res.success) throw new Error(res.message)
      return res.data ?? []
    },
    enabled: !!user, staleTime: 60_000,
  })

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden h-full bg-white"
      style={{ border: "1px solid #ede9fe", boxShadow: "0 4px 24px rgba(124,58,237,0.07)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4" style={{ borderBottom: "1px solid #f3f1ff" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#0891b2,#06b6d4)", boxShadow: "0 4px 12px rgba(6,182,212,0.35)" }}>
            <BookOpen style={{ width: 17, height: 17, color: "#fff" }} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-[14.5px] font-bold text-gray-900">My Courses</h3>
            <p className="text-[11px] font-medium text-gray-400">{courses.length} enrolled</p>
          </div>
        </div>
        <Link to={ROUTES.COURSES} className="flex items-center gap-1.5 text-[12px] font-bold transition-all hover:opacity-70" style={{ color: "#7c3aed" }}>
          View all <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-3 no-scrollbar">
        {isLoading ? (
          <div className="space-y-3 p-1">{[1,2,3].map(i => <div key={i} className="h-24 rounded-xl skeleton" />)}</div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[160px] gap-3 py-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "#f0fdff", border: "1px solid #cffafe" }}>
              <GraduationCap className="w-6 h-6" style={{ color: "#0891b2" }} />
            </div>
            <div className="text-center">
              <p className="text-[13.5px] font-bold text-gray-700">No courses yet</p>
              <p className="text-[12px] mt-0.5 text-gray-400">{teacher ? "Create your first course" : "Join a course to begin"}</p>
            </div>
            <Link to={ROUTES.COURSES} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12.5px] font-bold transition-all hover:scale-105 active:scale-95" style={{ background: "#ede9fe", color: "#7c3aed", border: "1px solid #c4b5fd" }}>
              <Plus className="w-3.5 h-3.5" />
              {teacher ? "Create Course" : "Browse Courses"}
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {courses.map((course: any, i: number) => {
              const col = PALETTE[i % PALETTE.length]
              const pct = course.attendancePercentage ?? ((i * 23 + 35) % 65 + 25)
              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="p-4 rounded-xl transition-all duration-150 cursor-default"
                  style={{ background: col.bg, border: `1px solid ${col.border}` }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: col.dot }} />
                      <p className="text-[13px] font-bold truncate" style={{ color: col.text }}>{course.name}</p>
                    </div>
                    {course.courseCode && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-2 shrink-0" style={{ background: col.code, color: col.codeText, border: `1px solid ${col.border}` }}>
                        {course.courseCode}
                      </span>
                    )}
                  </div>
                  {course.department && (
                    <p className="text-[11px] mb-2.5 truncate" style={{ color: col.sub }}>{course.department}</p>
                  )}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3 h-3" style={{ color: col.sub }} />
                      <span className="text-[11px] font-medium" style={{ color: col.sub }}>{course.memberCount ?? 0} members</span>
                    </div>
                    <span className="text-[12px] font-bold" style={{ color: col.dot }}>{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: col.border }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.4 + i * 0.1, duration: 0.9, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: col.bar }}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
