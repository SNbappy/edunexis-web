import { useState, useRef } from "react"
import { createPortal } from "react-dom"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowLeft, Settings, MoreHorizontal,
  Archive, ArchiveRestore, Users, Copy, Check,
  FlaskConical, BookOpen, Trash2,
} from "lucide-react"
import Avatar from "@/components/ui/Avatar"
import Badge from "@/components/ui/Badge"
import { ICON, ICON_STROKE, FOCUS, MOTION, SURFACE } from "@/components/ui/appTokens"
import { cn } from "@/utils/cn"
import toast from "react-hot-toast"
import type { CourseDto } from "@/types/course.types"

interface CourseHeaderProps {
  course: CourseDto
  isOwner: boolean
  memberCount: number
  onArchive?: () => void
  onUnarchive?: () => void
  onDelete?: () => void
}

/**
 * Course header.
 *
 * This was a full-bleed gradient hero, ~250px tall, whose colour was chosen by
 * hashing the course id — so a course was teal or violet for no reason a user
 * could ever learn, and a quarter of every course screen was spent on it. It is
 * now a normal page header on the app surface: the course code and title do the
 * identifying, and the space goes to the attendance sheet or the gradebook.
 *
 * The scroll-linked collapse went with it. It ran a Framer transform on every
 * scroll frame to save ~120px on a header that is now only 96px to begin with.
 */
export default function CourseHeader({
  course, isOwner, memberCount, onArchive, onUnarchive, onDelete,
}: CourseHeaderProps) {
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const isLab = course.courseType === "Lab"
  const TypeIcon = isLab ? FlaskConical : BookOpen

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
    <header className="border-b border-border bg-card">
      <div className="mx-auto max-w-[1400px] px-4 pb-4 pt-5 sm:px-6">
        <Link
          to="/courses"
          className={cn(
            "-ml-1 mb-2.5 inline-flex items-center gap-1.5 rounded-lg px-1 py-0.5 text-[12.5px] font-medium text-muted-foreground transition-colors duration-120 hover:text-foreground",
            FOCUS,
          )}
        >
          <ArrowLeft className={ICON.xs} strokeWidth={ICON_STROKE} />
          All courses
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg border border-primary/20 bg-primary/10 px-2 py-1 font-mono text-[11.5px] font-bold tracking-wide text-primary">
                {course.courseCode}
              </span>
              <Badge variant="neutral" size="sm" icon={<TypeIcon strokeWidth={ICON_STROKE} />}>
                {course.courseType}
              </Badge>
              {course.isArchived && (
                <Badge variant="warning" size="sm" icon={<Archive strokeWidth={ICON_STROKE} />}>
                  Archived
                </Badge>
              )}
            </div>

            <h1 className="mt-2 font-display text-[22px] font-extrabold leading-tight tracking-tight text-foreground sm:text-[26px]">
              {course.title}
            </h1>

            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="inline-flex items-center gap-2">
                <Avatar
                  src={course.teacherProfilePhotoUrl}
                  name={course.teacherName}
                  size="xs"
                  className="h-5 w-5"
                />
                <span className="text-[12.5px] font-semibold text-foreground">
                  {course.teacherName}
                </span>
              </span>

              <span className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
                <Users className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
                <span className="font-semibold tabular-nums text-foreground">{memberCount}</span>
                {memberCount === 1 ? "member" : "members"}
              </span>

              {course.semester && (
                <span className="text-[12.5px] text-muted-foreground">{course.semester}</span>
              )}

              {isOwner && course.joiningCode && (
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-2 py-1 text-[11.5px] font-semibold text-muted-foreground transition-colors duration-120 hover:border-border-strong hover:text-foreground",
                    FOCUS,
                  )}
                  aria-label="Copy joining code"
                  title="Copy joining code"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-success" strokeWidth={ICON_STROKE} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" strokeWidth={ICON_STROKE} />
                      <span className="font-mono tracking-wider text-foreground">{course.joiningCode}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {isOwner && (
            <div className="flex shrink-0 items-center gap-2">
              <Link
                to={"/courses/" + course.id + "/edit"}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-[13px] font-semibold text-foreground shadow-xs transition-colors duration-120 hover:bg-muted hover:border-border-strong",
                  FOCUS,
                )}
              >
                <Settings className={ICON.sm} strokeWidth={ICON_STROKE} />
                Edit
              </Link>

              <button
                ref={menuButtonRef}
                type="button"
                onClick={() => {
                  if (!menuOpen && menuButtonRef.current) {
                    const rect = menuButtonRef.current.getBoundingClientRect()
                    setMenuPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right })
                  }
                  setMenuOpen(v => !v)
                }}
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-xs transition-colors duration-120 hover:bg-muted hover:text-foreground",
                  FOCUS,
                )}
                aria-label="More actions"
                aria-expanded={menuOpen}
              >
                <MoreHorizontal className={ICON.sm} strokeWidth={ICON_STROKE} />
              </button>

              {menuOpen && menuPos && typeof document !== "undefined" && createPortal(
                <>
                  <button
                    aria-hidden
                    tabIndex={-1}
                    className="fixed inset-0 z-[9998] cursor-default"
                    onClick={() => setMenuOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: MOTION.base, ease: MOTION.ease }}
                    style={{ position: "fixed", top: menuPos.top, right: menuPos.right }}
                    className={cn(SURFACE.raised, "z-[9999] w-52 overflow-hidden p-1.5")}
                  >
                    {course.isArchived ? (
                      <button
                        type="button"
                        onClick={() => { setMenuOpen(false); onUnarchive?.() }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-foreground transition-colors duration-120 hover:bg-muted"
                      >
                        <ArchiveRestore className={cn(ICON.sm, "text-primary")} strokeWidth={ICON_STROKE} />
                        Restore course
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setMenuOpen(false); onArchive?.() }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-foreground transition-colors duration-120 hover:bg-muted"
                      >
                        <Archive className={cn(ICON.sm, "text-muted-foreground")} strokeWidth={ICON_STROKE} />
                        Archive course
                      </button>
                    )}

                    <div className="my-1 border-t border-border" />
                    <button
                      type="button"
                      onClick={() => { setMenuOpen(false); onDelete?.() }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-destructive transition-colors duration-120 hover:bg-destructive-soft"
                    >
                      <Trash2 className={ICON.sm} strokeWidth={ICON_STROKE} />
                      Delete course
                    </button>
                  </motion.div>
                </>,
                document.body
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
