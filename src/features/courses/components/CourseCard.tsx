import { memo } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Users, BookOpen, ChevronRight, Clock, GraduationCap } from "lucide-react"
import { useThemeStore } from "@/store/themeStore"

const PALETTES = [
  { color: "#6366f1", grad: "linear-gradient(135deg,#4f46e5 0%,#0891b2 100%)", light: "#eef2ff", darkBg: "rgba(99,102,241,0.15)",  border: "#c7d2fe", darkBorder: "rgba(99,102,241,0.3)"  },
  { color: "#0891b2", grad: "linear-gradient(135deg,#0e7490 0%,#059669 100%)", light: "#ecfeff", darkBg: "rgba(8,145,178,0.15)",   border: "#a5f3fc", darkBorder: "rgba(6,182,212,0.3)"   },
  { color: "#7c3aed", grad: "linear-gradient(135deg,#7c3aed 0%,#db2777 100%)", light: "#f5f3ff", darkBg: "rgba(124,58,237,0.15)",  border: "#ddd6fe", darkBorder: "rgba(139,92,246,0.3)"  },
  { color: "#d97706", grad: "linear-gradient(135deg,#b45309 0%,#dc2626 100%)", light: "#fffbeb", darkBg: "rgba(217,119,6,0.15)",   border: "#fde68a", darkBorder: "rgba(251,191,36,0.3)"  },
  { color: "#059669", grad: "linear-gradient(135deg,#047857 0%,#0891b2 100%)", light: "#ecfdf5", darkBg: "rgba(5,150,105,0.15)",   border: "#a7f3d0", darkBorder: "rgba(16,185,129,0.3)"  },
  { color: "#db2777", grad: "linear-gradient(135deg,#be185d 0%,#7c3aed 100%)", light: "#fdf2f8", darkBg: "rgba(219,39,119,0.15)",  border: "#fbcfe8", darkBorder: "rgba(244,114,182,0.3)" },
]

// Unique SVG decorations per palette
const BannerDeco = ({ i }: { i: number }) => {
  const decos = [
    // Floating circles + diagonal
    <svg key={0} className="absolute inset-0 w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="xMidYMid slice">
      <circle cx="340" cy="-10" r="100" fill="rgba(255,255,255,0.08)"/>
      <circle cx="340" cy="-10" r="70"  fill="rgba(255,255,255,0.06)"/>
      <circle cx="50"  cy="130" r="80"  fill="rgba(255,255,255,0.06)"/>
      <line x1="0" y1="120" x2="400" y2="0" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
    </svg>,
    // Dot grid
    <svg key={1} className="absolute inset-0 w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="xMidYMid slice">
      {[40,100,160,220,280,340].map(x=>[20,60,100].map(y=><circle key={`${x}${y}`} cx={x} cy={y} r="2" fill="rgba(255,255,255,0.2)"/>))}
      <circle cx="350" cy="20" r="70" fill="rgba(255,255,255,0.07)"/>
    </svg>,
    // Concentric rings
    <svg key={2} className="absolute inset-0 w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="xMidYMid slice">
      {[35,60,85,110].map(r=><circle key={r} cx="370" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="1.5"/>)}
      <circle cx="60" cy="130" r="60" fill="rgba(255,255,255,0.06)"/>
    </svg>,
    // Grid lines
    <svg key={3} className="absolute inset-0 w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="xMidYMid slice">
      {[0,1,2,3,4].map(i=><line key={i} x1={i*100} y1="0" x2={i*100} y2="120" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>)}
      {[0,1,2].map(i=><line key={i} x1="0" y1={i*60} x2="400" y2={i*60} stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>)}
      <circle cx="320" cy="20" r="65" fill="rgba(255,255,255,0.07)"/>
    </svg>,
    // Diagonal stripes
    <svg key={4} className="absolute inset-0 w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="xMidYMid slice">
      {[-2,-1,0,1,2,3,4,5].map(i=><line key={i} x1={i*60-20} y1="0" x2={i*60+100} y2="120" stroke="rgba(255,255,255,0.06)" strokeWidth="14"/>)}
      <circle cx="340" cy="10" r="60" fill="rgba(255,255,255,0.08)"/>
    </svg>,
    // Triangle shapes
    <svg key={5} className="absolute inset-0 w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="xMidYMid slice">
      <polygon points="200,0 400,0 400,120" fill="rgba(255,255,255,0.06)"/>
      <polygon points="280,0 400,0 400,80"  fill="rgba(255,255,255,0.05)"/>
      <circle cx="80" cy="130" r="75" fill="rgba(255,255,255,0.06)"/>
    </svg>,
  ]
  return <>{decos[i % 6]}</>
}

interface CourseCardProps {
  course: any; index?: number; isTeacher?: boolean; viewMode?: "grid" | "list"
}

export default memo(function CourseCard({ course, index = 0, isTeacher = false, viewMode = "grid" }: CourseCardProps) {
  const { dark } = useThemeStore()
  const p = PALETTES[index % PALETTES.length]
  const members = course.memberCount ?? course.enrollmentCount ?? course.studentCount ?? 0
  const link = `/courses/${course.id}/stream`

  const cardBg   = dark ? "rgba(16,24,44,0.75)" : "rgba(255,255,255,0.92)"
  const blur     = "blur(20px)"
  const textMain = dark ? "#e2e8f8" : "#111827"
  const textSub  = dark ? "#8896c8" : "#6b7280"
  const textMuted= dark ? "#5a6a9a" : "#9ca3af"
  const divider  = dark ? "rgba(255,255,255,0.05)" : "#f3f4f6"
  const border   = dark ? p.darkBorder : p.border

  // LIST VIEW
  if (viewMode === "list") {
    return (
      <Link to={link}>
        <motion.div
          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.04 }}
          whileHover={{ x: 2, boxShadow: `0 4px 20px ${p.color}18` }}
          className="group flex items-center gap-4 p-4 rounded-2xl cursor-pointer"
          style={{ background: cardBg, backdropFilter: blur, WebkitBackdropFilter: blur, border: `1px solid ${border}` }}
        >
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: p.grad, boxShadow: `0 4px 12px ${p.color}40` }}>
            <BookOpen className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold truncate" style={{ color: textMain }}>
              {course.title ?? "Untitled"}
            </p>
            <p className="text-[12px] truncate mt-0.5" style={{ color: textMuted }}>
              {[course.courseCode, course.semester, course.teacherName].filter(Boolean).join(" · ")}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5">
              <Users style={{ width: 12, height: 12, color: textMuted }} />
              <span className="text-[12px]" style={{ color: textMuted }}>{members}</span>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
              style={{ background: dark ? p.darkBg : p.light, color: p.color }}>
              {course.isArchived ? "Archived" : "Active"}
            </span>
            <ChevronRight style={{ width: 15, height: 15, color: textMuted }}
              className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </motion.div>
      </Link>
    )
  }

  // GRID VIEW
  return (
    <Link to={link}>
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ y: -5, boxShadow: `0 20px 48px ${p.color}25` }}
        className="group rounded-2xl overflow-hidden cursor-pointer"
        style={{ background: cardBg, backdropFilter: blur, WebkitBackdropFilter: blur, border: `1px solid ${border}` }}
      >
        {/* -- Gradient Banner -- */}
        <div className="relative overflow-hidden" style={{ height: 110, background: p.grad }}>
          <BannerDeco i={index} />

          {/* Shine on hover */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ x: "-110%" }}
            whileHover={{ x: "110%" }}
            transition={{ duration: 0.55, ease: "easeInOut" }}
            style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)" }}
          />

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-12"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.18), transparent)" }} />

          {/* Course type badge */}
          {course.courseType && (
            <div className="absolute top-3 right-3">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.2)", color: "white", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)" }}>
                {course.courseType}
              </span>
            </div>
          )}

          {/* Icon */}
          <div className="absolute bottom-3 left-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)" }}>
              <BookOpen className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
          </div>

          {/* Credit hours */}
          {course.creditHours && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1"
              style={{ color: "rgba(255,255,255,0.75)" }}>
              <Clock style={{ width: 11, height: 11 }} />
              <span className="text-[10px] font-semibold">{course.creditHours} cr</span>
            </div>
          )}
        </div>

        {/* -- Card Body -- */}
        <div className="p-4">

          {/* Course code */}
          {course.courseCode && (
            <p className="text-[11px] font-bold font-mono mb-1.5 tracking-wide"
              style={{ color: p.color }}>
              {course.courseCode}
              {course.semester && (
                <span className="font-sans font-medium ml-1.5" style={{ color: textMuted }}>
                  {course.semester}
                </span>
              )}
            </p>
          )}

          {/* Title */}
          <h3 className="text-[14px] font-bold line-clamp-2 leading-snug mb-2"
            style={{ color: textMain }}>
            {course.title ?? "Untitled Course"}
          </h3>

          {/* Teacher (for students) */}
          {!isTeacher && course.teacherName && (
            <div className="flex items-center gap-1.5 mb-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                style={{ background: p.grad, flexShrink: 0 }}>
                {course.teacherName.charAt(0).toUpperCase()}
              </div>
              <p className="text-[12px] truncate" style={{ color: textSub }}>
                {course.teacherName}
              </p>
            </div>
          )}

          {/* Department */}
          {course.department && (
            <p className="text-[11px] truncate mb-3" style={{ color: textMuted }}>
              {course.department}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3"
            style={{ borderTop: `1px solid ${divider}` }}>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Users style={{ width: 12, height: 12, color: textMuted }} />
                <span className="text-[11px]" style={{ color: textMuted }}>{members} members</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: dark ? p.darkBg : p.light, color: p.color }}>
                {course.isArchived ? "Archived" : "Active"}
              </span>
              <ChevronRight style={{ width: 14, height: 14, color: p.color }}
                className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
})
