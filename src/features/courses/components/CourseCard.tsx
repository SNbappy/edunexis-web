import { memo } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Users, ArrowRight, GraduationCap, Layers, TrendingUp, BookOpen } from "lucide-react"

const PALETTES = [
  { from: "#1e3a8a", to: "#0e7490", glow: "rgba(29,78,216,0.45)",  text: "#60a5fa", soft: "rgba(59,130,246,0.12)",  border: "rgba(59,130,246,0.3)"  },
  { from: "#581c87", to: "#6d28d9", glow: "rgba(109,40,217,0.45)", text: "#c084fc", soft: "rgba(139,92,246,0.12)",  border: "rgba(139,92,246,0.3)"  },
  { from: "#0c4a6e", to: "#065f46", glow: "rgba(6,182,212,0.45)",  text: "#22d3ee", soft: "rgba(6,182,212,0.12)",   border: "rgba(6,182,212,0.3)"   },
  { from: "#064e3b", to: "#1e3a8a", glow: "rgba(16,185,129,0.45)", text: "#34d399", soft: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.3)"  },
  { from: "#831843", to: "#7c2d12", glow: "rgba(236,72,153,0.45)", text: "#fb7185", soft: "rgba(251,113,133,0.12)", border: "rgba(251,113,133,0.3)" },
  { from: "#78350f", to: "#1e3a8a", glow: "rgba(245,158,11,0.45)", text: "#fbbf24", soft: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.3)"  },
]

// Abstract SVG pattern unique per palette index
const BannerPattern = ({ index, from, to }: { index: number; from: string; to: string }) => {
  const patterns = [
    // Geometric circles
    <svg key={0} className="absolute inset-0 w-full h-full" viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice">
      <circle cx="320" cy="20"  r="80"  fill="rgba(255,255,255,0.06)" />
      <circle cx="360" cy="100" r="60"  fill="rgba(255,255,255,0.04)" />
      <circle cx="60"  cy="130" r="90"  fill="rgba(255,255,255,0.05)" />
      <circle cx="200" cy="-20" r="70"  fill="rgba(255,255,255,0.04)" />
      <line x1="0" y1="160" x2="400" y2="0" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
      <line x1="0" y1="80"  x2="400" y2="160" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
    </svg>,
    // Grid lines
    <svg key={1} className="absolute inset-0 w-full h-full" viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice">
      {[0,1,2,3,4,5].map(i => <line key={i} x1={i*80} y1="0" x2={i*80} y2="160" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>)}
      {[0,1,2,3].map(i => <line key={i} x1="0" y1={i*53} x2="400" y2={i*53} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>)}
      <circle cx="320" cy="40"  r="50" fill="rgba(255,255,255,0.06)" />
      <circle cx="80"  cy="120" r="40" fill="rgba(255,255,255,0.04)" />
    </svg>,
    // Hexagon dots
    <svg key={2} className="absolute inset-0 w-full h-full" viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice">
      {[40,120,200,280,360].map(x => [20,80,140].map(y => (
        <circle key={`${x}${y}`} cx={x} cy={y} r="3" fill="rgba(255,255,255,0.15)" />
      )))}
      <circle cx="300" cy="30"  r="70" fill="rgba(255,255,255,0.06)" />
      <circle cx="100" cy="140" r="60" fill="rgba(255,255,255,0.04)" />
    </svg>,
    // Diagonal stripes
    <svg key={3} className="absolute inset-0 w-full h-full" viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice">
      {[-2,-1,0,1,2,3,4,5,6,7,8].map(i => (
        <line key={i} x1={i*50-40} y1="0" x2={i*50+120} y2="160" stroke="rgba(255,255,255,0.05)" strokeWidth="12"/>
      ))}
      <circle cx="350" cy="20" r="55" fill="rgba(255,255,255,0.07)" />
    </svg>,
    // Concentric rings
    <svg key={4} className="absolute inset-0 w-full h-full" viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice">
      {[30,55,80,105].map(r => <circle key={r} cx="360" cy="80" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5"/>)}
      {[20,40,60].map(r => <circle key={r} cx="60" cy="140" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5"/>)}
    </svg>,
    // Triangle mesh
    <svg key={5} className="absolute inset-0 w-full h-full" viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice">
      <polygon points="0,0 160,0 80,160"   fill="rgba(255,255,255,0.04)" />
      <polygon points="240,0 400,0 400,160" fill="rgba(255,255,255,0.05)" />
      <polygon points="150,0 300,160 0,160" fill="rgba(255,255,255,0.03)" />
    </svg>,
  ]
  return <>{patterns[index % patterns.length]}</>
}

interface CourseCardProps {
  course: any; index?: number; isTeacher?: boolean; viewMode?: "grid" | "list"
}

export default memo(function CourseCard({ course, index = 0, isTeacher = false, viewMode = "grid" }: CourseCardProps) {
  const p = PALETTES[index % PALETTES.length]
  const studentCount = course.memberCount ?? course.enrollmentCount ?? course.studentCount ?? course._count?.members ?? 0
  const assignmentCount = 0
  const progress        = course.progress ?? null
  const teacherName     = course.teacherName ?? null
  const teacherPhoto    = course.teacherProfilePhotoUrl ?? null
  const teacherInitial = teacherName?.charAt(0)?.toUpperCase() ?? "T"
  const link = `/courses/${course.id}/stream`

  // -- LIST VIEW --
  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: 3 }} transition={{ duration: 0.18 }}
        className="group relative overflow-hidden rounded-2xl"
        style={{
          background: "linear-gradient(135deg,rgba(13,22,48,0.97),rgba(8,14,32,0.99))",
          border: `1px solid ${p.border}`,
          boxShadow: `0 4px 20px rgba(0,0,0,0.3), 0 0 30px ${p.glow.replace("0.45","0.1")}`,
        }}>
        <div className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: `linear-gradient(90deg,transparent,${p.from},${p.to},transparent)` }} />
        <Link to={link} className="flex items-center gap-4 px-5 py-3.5 pt-4">
          {/* Color swatch */}
          <div className="w-11 h-11 rounded-xl shrink-0 relative overflow-hidden"
            style={{ background: `linear-gradient(135deg,${p.from},${p.to})`, boxShadow: `0 4px 14px ${p.glow}` }}>
            <BookOpen className="absolute inset-0 m-auto w-5 h-5 text-white opacity-80" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[13.5px] font-bold truncate" style={{ color: "#e2e8f0" }}>{course.title}</h3>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              {course.courseCode && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                  style={{ background: p.soft, color: p.text, border: `1px solid ${p.border}` }}>
                  {course.courseCode}
                </span>
              )}
              {teacherName && (
                <span className="text-[11.5px] font-semibold" style={{ color: "#475569" }}>
                  {teacherName}
                </span>
              )}
              <span className="flex items-center gap-1 text-[11px]" style={{ color: "#334155" }}>
                <Users className="w-3 h-3" />{studentCount}
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shrink-0"
            style={{ background: `linear-gradient(135deg,${p.from},${p.to})`, boxShadow: `0 4px 12px ${p.glow}` }}>
            <ArrowRight className="w-4 h-4 text-white" />
          </div>
        </Link>
      </motion.div>
    )
  }

  // -- GRID VIEW --
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -6, scale: 1.015 }}
      transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative flex flex-col overflow-hidden rounded-2xl"
      style={{
        background: "linear-gradient(160deg,rgba(13,22,48,0.97) 0%,rgba(8,14,32,0.99) 100%)",
        border: `1px solid ${p.border}`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04), 0 0 40px ${p.glow.replace("0.45","0.12")}`,
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.boxShadow = `0 20px 56px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07), 0 0 60px ${p.glow.replace("0.45","0.25")}`
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.boxShadow = `0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04), 0 0 40px ${p.glow.replace("0.45","0.12")}`
      }}>

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] z-10"
        style={{ background: `linear-gradient(90deg,transparent,${p.from},${p.to},transparent)` }} />

      {/* -- BANNER (compact, no initials box) -- */}
      <div className="relative overflow-hidden shrink-0" style={{ height: 120, background: `linear-gradient(135deg,${p.from} 0%,${p.to} 100%)` }}>
        {/* Abstract SVG pattern */}
        <BannerPattern index={index} from={p.from} to={p.to} />

        {/* Dark gradient fade to body */}
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(180deg,rgba(0,0,0,0.05) 0%,rgba(0,0,0,0.55) 100%)" }} />

        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          {isTeacher ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10.5px] font-bold"
              style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(10px)", color: "rgba(255,255,255,0.92)", border: "1px solid rgba(255,255,255,0.18)" }}>
              <GraduationCap className="w-3 h-3" /> Teacher
            </div>
          ) : <div />}
          {course.courseCode && (
            <div className="px-2.5 py-1 rounded-xl text-[10.5px] font-bold tracking-wide"
              style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(10px)", color: "rgba(255,255,255,0.95)", border: "1px solid rgba(255,255,255,0.18)" }}>
              {course.courseCode}
            </div>
          )}
        </div>

        {/* Course name overlay at bottom of banner */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 z-10">
          <h3 className="text-[14.5px] font-extrabold leading-snug line-clamp-2 drop-shadow-lg" style={{ color: "#f8fafc" }}>
            {course.title}
          </h3>
        </div>
      </div>

      {/* -- BODY (no gap, tight) -- */}
      <div className="flex flex-col flex-1 px-4 pt-3 pb-4">
        {/* Teacher row */}
        {teacherName && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl"
            style={{ background: p.soft, border: `1px solid ${p.border}` }}>
            {/* Teacher avatar */}
            <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 flex items-center justify-center font-bold text-[10px] text-white"
              style={{ background: `linear-gradient(135deg,${p.from},${p.to})`, boxShadow: `0 2px 8px ${p.glow}` }}>
              {teacherPhoto
                ? <img src={teacherPhoto} alt={teacherName} className="w-full h-full object-cover" />
                : teacherInitial}
            </div>
            <span className="text-[12px] font-semibold truncate" style={{ color: p.text }}>{teacherName}</span>
            <div className="ml-auto">
              <GraduationCap className="w-3.5 h-3.5" style={{ color: p.text, opacity: 0.6 }} />
            </div>
          </div>
        )}

        <div className="flex-1 min-h-[4px]" />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[
            { icon: Users,  val: studentCount,    label: "students" },
            { icon: Layers, val: assignmentCount, label: "tasks"    },
          ].map(({ icon: Icon, val, label }) => (
            <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: p.soft, border: `1px solid ${p.border}` }}>
              <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `linear-gradient(135deg,${p.from},${p.to})`, boxShadow: `0 3px 8px ${p.glow}` }}>
                <Icon className="w-3 h-3 text-white" />
              </div>
              <div>
                <p className="text-[14px] font-extrabold leading-none" style={{ color: p.text }}>{val}</p>
                <p className="text-[9.5px] font-semibold leading-none mt-0.5" style={{ color: "#334155" }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Progress */}
        {progress !== null && !isTeacher && (
          <div className="mb-3 px-3 py-2.5 rounded-xl" style={{ background: p.soft, border: `1px solid ${p.border}` }}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="flex items-center gap-1 text-[11px] font-bold" style={{ color: p.text }}>
                <TrendingUp className="w-3 h-3" /> Progress
              </span>
              <span className="text-[12px] font-extrabold" style={{ color: p.text }}>{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(15,23,42,0.7)" }}>
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                transition={{ duration: 1.0, ease: "easeOut", delay: 0.3 }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg,${p.from},${p.to})`, boxShadow: `0 0 8px ${p.glow}` }} />
            </div>
          </div>
        )}

        {/* CTA */}
        <Link to={link}>
          <motion.div
            whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
            className="w-full h-10 rounded-xl flex items-center justify-center gap-2 font-bold text-[13px] text-white relative overflow-hidden"
            style={{ background: `linear-gradient(135deg,${p.from},${p.to})`, boxShadow: `0 4px 20px ${p.glow}, inset 0 1px 0 rgba(255,255,255,0.18)` }}>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.1),transparent)" }} />
            <span className="relative z-10">{isTeacher ? "Manage Course" : "Continue Learning"}</span>
            <ArrowRight className="w-3.5 h-3.5 relative z-10" />
          </motion.div>
        </Link>
      </div>
    </motion.div>
  )
})



