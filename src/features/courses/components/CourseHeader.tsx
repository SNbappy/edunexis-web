import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion, useScroll, useTransform } from "framer-motion"
import {
  ChevronLeft, Settings, MoreHorizontal,
  Archive, ArchiveRestore, Users, Copy, Check,
  FlaskConical, BookOpen,
} from "lucide-react"
import Avatar from "@/components/ui/Avatar"
import toast from "react-hot-toast"
import type { CourseDto } from "@/types/course.types"

/* Same rotation CourseCard uses — keep the palette in sync. */
const ACCENTS = [
  { name: "teal", bg: "from-teal-500 to-teal-700" },
  { name: "amber", bg: "from-amber-500 to-amber-700" },
  { name: "blue", bg: "from-blue-500 to-blue-700" },
  { name: "violet", bg: "from-violet-500 to-violet-700" },
] as const

function pickAccent(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0
  return ACCENTS[Math.abs(hash) % ACCENTS.length]
}

interface CourseHeaderProps {
  course: CourseDto
  isOwner: boolean
  memberCount: number
  onArchive?: () => void
  onUnarchive?: () => void
}

export default function CourseHeader({
  course, isOwner, memberCount, onArchive, onUnarchive,
}: CourseHeaderProps) {
  const accent = pickAccent(course.id)
  const isLab = course.courseType === "Lab"
  const TypeIcon = isLab ? FlaskConical : BookOpen

  const [menuOpen, setMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  /* Scroll-driven collapse: track window scroll; above 80px = full hero,
     past 120px = compact strip. Framer interpolates smoothly. */
  const { scrollY } = useScroll()
  const [collapsed, setCollapsed] = useState(false)
  useEffect(() => {
    const unsub = scrollY.on("change", (v) => {
      setCollapsed(v > 80)
    })
    return () => unsub()
  }, [scrollY])

  /* Animated dimensions — used for smooth padding/opacity transitions. */
  const paddingBottom = useTransform(scrollY, [0, 120], [32, 12])
  const paddingTop = useTransform(scrollY, [0, 120], [20, 10])
  const detailsOpacity = useTransform(scrollY, [40, 100], [1, 0])

  const handleCopyCode = async () => {
    if (!course.joiningCode) return
    try {
      await navigator.clipboard.writeText(course.joiningCode)
      setCopied(true)
      toast.success("Joining code copied.")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Couldn't copy.")
    }
  }

  return (
    <header className="relative overflow-hidden">
      <div className={"relative bg-gradient-to-br " + accent.bg}>
        {/* Subtle dot texture */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
          aria-hidden
        />
        {/* Bottom contrast gradient */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/25 to-transparent" aria-hidden />

        <motion.div
          style={{ paddingTop, paddingBottom }}
          className="relative mx-auto max-w-7xl px-5 lg:px-8"
        >
          {/* Breadcrumb — hides when collapsed */}
          <motion.div
            style={{ opacity: detailsOpacity }}
            animate={{ height: collapsed ? 0 : "auto" }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <Link
              to="/courses"
              className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white/85 transition-colors hover:text-white"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Back to courses
            </Link>
          </motion.div>

          {/* Main row */}
          <div className={(collapsed ? "" : "mt-4 ") + "flex flex-wrap items-center gap-4"}>
            <div className="min-w-0 flex-1">
              {/* Metadata chips — hide most when collapsed */}
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-md bg-white/15 px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                  {course.courseCode}
                </span>

                {!collapsed && (
                  <>
                    <motion.span
                      style={{ opacity: detailsOpacity }}
                      className="inline-flex items-center gap-1 rounded-md bg-white/15 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-sm"
                    >
                      <TypeIcon className="h-3 w-3" />
                      {course.courseType}
                    </motion.span>
                    {course.semester && (
                      <motion.span
                        style={{ opacity: detailsOpacity }}
                        className="text-[12px] font-medium text-white/85"
                      >
                        {course.semester}
                      </motion.span>
                    )}
                  </>
                )}

                {course.isArchived && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-stone-900/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    <Archive className="h-3 w-3" />
                    Archived
                  </span>
                )}
              </div>

              {/* Title — shrinks when collapsed */}
              <motion.h1
                animate={{
                  fontSize: collapsed ? "20px" : "32px",
                }}
                transition={{ duration: 0.2 }}
                className="font-display font-bold leading-tight tracking-tight text-white"
              >
                {course.title}
              </motion.h1>

              {/* Meta row — fades out when collapsed */}
              <motion.div
                style={{ opacity: detailsOpacity }}
                animate={{ height: collapsed ? 0 : "auto", marginTop: collapsed ? 0 : 16 }}
                transition={{ duration: 0.2 }}
                className="flex flex-wrap items-center gap-x-5 gap-y-2 overflow-hidden"
              >
                <div className="inline-flex items-center gap-2">
                  <Avatar
                    src={course.teacherProfilePhotoUrl}
                    name={course.teacherName}
                    size="xs"
                    className="h-6 w-6 ring-2 ring-white/40"
                  />
                  <span className="text-[13px] font-semibold text-white">
                    {course.teacherName}
                  </span>
                </div>

                <span className="inline-flex items-center gap-1.5 text-[13px] text-white/85">
                  <Users className="h-3.5 w-3.5" />
                  <span className="font-semibold tabular-nums">{memberCount}</span>
                  {memberCount === 1 ? "member" : "members"}
                </span>

                {isOwner && course.joiningCode && (
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1.5 rounded-md border border-white/30 bg-white/10 px-2.5 py-1 text-[12px] font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                    aria-label="Copy joining code"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span className="font-mono tracking-wider">{course.joiningCode}</span>
                      </>
                    )}
                  </button>
                )}
              </motion.div>

              {/* Compact join-code pill when collapsed (owner only) */}
              {collapsed && isOwner && course.joiningCode && (
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="ml-3 inline-flex items-center gap-1.5 rounded-md border border-white/30 bg-white/10 px-2 py-0.5 align-middle text-[11px] font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                  aria-label="Copy joining code"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span className="font-mono tracking-wider">{course.joiningCode}</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Owner actions — always visible */}
            {isOwner && (
              <div className="flex items-center gap-2">
                <Link
                  to={"/courses/" + course.id + "/edit"}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/30 bg-white/10 px-3 text-[12px] font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  <Settings className="h-3.5 w-3.5" />
                  {!collapsed && <span>Edit</span>}
                </Link>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMenuOpen(v => !v)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/30 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                    aria-label="More actions"
                    aria-expanded={menuOpen}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>

                  {menuOpen && (
                    <>
                      <button
                        aria-hidden
                        className="fixed inset-0 z-30 cursor-default"
                        onClick={() => setMenuOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute right-0 top-11 z-40 w-52 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
                      >
                        {course.isArchived ? (
                          <button
                            type="button"
                            onClick={() => { setMenuOpen(false); onUnarchive?.() }}
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-medium text-foreground transition-colors hover:bg-muted"
                          >
                            <ArchiveRestore className="h-4 w-4 text-teal-600" />
                            Restore course
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => { setMenuOpen(false); onArchive?.() }}
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-medium text-foreground transition-colors hover:bg-muted"
                          >
                            <Archive className="h-4 w-4 text-stone-600" />
                            Archive course
                          </button>
                        )}
                      </motion.div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </header>
  )
}