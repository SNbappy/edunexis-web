import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar, Upload, CheckCircle2, MoreVertical,
  Eye, Edit2, Send, EyeOff, Trash2, ClipboardList, Star,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import Badge from "@/components/ui/Badge"
import { ICON, ICON_STROKE, FOCUS, MOTION, SURFACE } from "@/components/ui/appTokens"
import { cn } from "@/utils/cn"
import { formatDate } from "@/utils/dateUtils"
import { useAuthStore } from "@/store/authStore"
import { isTeacher } from "@/utils/roleGuard"
import type { CTEventDto } from "@/types/ct.types"

interface CTEventCardProps {
  ct: CTEventDto
  index?: number
  onView: (ct: CTEventDto) => void
  onDelete?: (ct: CTEventDto) => void
  onPublish?: (id: string) => void
  onUnpublish?: (id: string) => void
  onUploadKhata?: (ct: CTEventDto) => void
  onEnterMarks?: (ct: CTEventDto) => void
}

interface MenuItemProps {
  /* `LucideIcon`, not a hand-written ComponentType. The narrower signature
     declared `strokeWidth: number`, but Lucide's own prop is `string | number`,
     and TypeScript rejects every icon passed to it — six errors in this file
     alone, and the same shape recurs across the CT and presentation
     components. */
  icon: LucideIcon
  label: string
  variant: "default" | "danger"
  onClick: () => void
}

function MenuItem({ icon: Icon, label, variant, onClick }: MenuItemProps) {
  const danger = variant === "danger"

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition-colors duration-120",
        FOCUS,
        danger
          ? "text-destructive hover:bg-destructive-soft"
          : "text-foreground hover:bg-muted",
      )}
    >
      <Icon
        className={cn(ICON.sm, danger ? "" : "text-muted-foreground")}
        strokeWidth={ICON_STROKE}
      />
      {label}
    </button>
  )
}

export default function CTEventCard({
  ct, index = 0, onView, onDelete, onPublish, onUnpublish, onUploadKhata, onEnterMarks,
}: CTEventCardProps) {
  const { user } = useAuthStore()
  const teacher = isTeacher(user?.role ?? "Student")
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isPublished = ct.status === "Published"
  const isDraft = ct.status === "Draft"


  const hasMenu = teacher && (onUploadKhata || onEnterMarks || onPublish || onUnpublish || onDelete)

  useEffect(() => {
    if (!menuOpen) return
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [menuOpen])

  return (
    /* role/tabIndex/onKeyDown rather than a bare onClick div: opening a CT was
       mouse-only, so a keyboard user could reach the actions menu inside the
       card but never the card itself. It cannot be a real <button> because it
       contains one (the actions menu), and nesting interactive elements is
       invalid — hence the explicit button role. */
    <div
      role="button"
      tabIndex={0}
      onClick={() => onView(ct)}
      onKeyDown={e => {
        if (e.target !== e.currentTarget) return
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onView(ct)
        }
      }}
      className={cn(
        SURFACE.cardInteractive,
        FOCUS,
        "group relative cursor-pointer",
        menuOpen ? "z-30" : "z-0",
      )}
    >
      <div className="flex items-start gap-3 p-4">
        {/* CT number — the label people use ("what did you get in CT2?"). */}
        <div className="flex h-9 w-11 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
          <span className="font-mono text-[11.5px] font-bold">CT{ct.ctNumber}</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="line-clamp-2 font-display text-[14px] font-bold leading-snug text-foreground">
              {ct.title}
            </h3>

            <div className="flex shrink-0 items-center gap-1.5" onClick={e => e.stopPropagation()}>
              {/* Draft vs published is the one thing worth colouring: it decides
                  whether students can see their marks. */}
              {teacher ? (
                <Badge
                  variant={isPublished ? "success" : "warning"}
                  size="sm"
                  icon={isPublished
                    ? <CheckCircle2 strokeWidth={ICON_STROKE} />
                    : <Edit2 strokeWidth={ICON_STROKE} />}
                >
                  {isPublished ? "Published" : "Draft"}
                </Badge>
              ) : ct.myIsAbsent ? (
                <Badge variant="destructive" size="sm">
                  Absent · 0 / {ct.maxMarks}
                </Badge>
              ) : ct.myObtainedMarks != null ? (
                <Badge
                  variant="success"
                  size="sm"
                  icon={<Star className="h-3 w-3 fill-emerald-600 text-emerald-600 dark:fill-emerald-400 dark:text-emerald-400" />}
                >
                  {ct.myObtainedMarks} / {ct.maxMarks}
                </Badge>
              ) : null}

              {hasMenu && (
                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}
                    aria-label="CT actions"
                    aria-expanded={menuOpen}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-120",
                      FOCUS,
                      menuOpen
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <MoreVertical className={ICON.sm} strokeWidth={ICON_STROKE} />
                  </button>

                  <AnimatePresence>
                    {menuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: -4 }}
                        transition={{ duration: MOTION.base, ease: MOTION.ease }}
                        className={cn(SURFACE.raised, "absolute right-0 top-9 z-50 w-52 overflow-hidden p-1.5")}
                        onClick={e => e.stopPropagation()}
                      >
                        <MenuItem
                          icon={Eye}
                          label="View details"
                          variant="default"
                          onClick={() => { onView(ct); setMenuOpen(false) }}
                        />

                        {onUploadKhata && (
                          <MenuItem
                            icon={Upload}
                            label={ct.khataUploaded ? "Re-upload scripts" : "Upload scripts"}
                            variant="default"
                            onClick={() => { onUploadKhata(ct); setMenuOpen(false) }}
                          />
                        )}

                        {ct.khataUploaded && onEnterMarks && (
                          <MenuItem
                            icon={ClipboardList}
                            label={isPublished ? "View / edit marks" : "Enter marks"}
                            variant="default"
                            onClick={() => { onEnterMarks(ct); setMenuOpen(false) }}
                          />
                        )}

                        {isDraft && ct.khataUploaded && onPublish && (
                          <MenuItem
                            icon={Send}
                            label="Publish results"
                            variant="default"
                            onClick={() => { onPublish(ct.id); setMenuOpen(false) }}
                          />
                        )}

                        {isPublished && onUnpublish && (
                          <MenuItem
                            icon={EyeOff}
                            label="Unpublish"
                            variant="default"
                            onClick={() => { onUnpublish(ct.id); setMenuOpen(false) }}
                          />
                        )}

                        {onDelete && (
                          <>
                            <div className="my-1 border-t border-border" />
                            <MenuItem
                              icon={Trash2}
                              label="Delete"
                              variant="danger"
                              onClick={() => { onDelete(ct); setMenuOpen(false) }}
                            />
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {/* Meta row. */}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] text-muted-foreground">
            <span className={cn("inline-flex items-center gap-1.5", !ct.heldOn && "font-semibold text-warning")}>
              <Calendar className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
              {ct.heldOn ? formatDate(ct.heldOn, "dd MMM yyyy") : "Date not set"}
            </span>

            <span className="tabular-nums">
              {teacher ? (
                <>
                  <span className="font-semibold text-foreground">{ct.maxMarks}</span> marks
                </>
              ) : (
                <>
                  Max: <span className="font-semibold text-foreground">{ct.maxMarks}</span> marks
                </>
              )}
            </span>

            {teacher && (
              ct.khataUploaded
                ? <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
                    Scripts uploaded
                  </span>
                : <span className="inline-flex items-center gap-1.5 font-semibold text-warning">
                    <Upload className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
                    Scripts pending
                  </span>
            )}

            {teacher && (
              ct.isMarksComplete ? (
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
                  Marks given
                </span>
              ) : (ct.gradedStudentsCount ?? 0) > 0 ? (
                <span className="inline-flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
                  <ClipboardList className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
                  Marks partial ({ct.gradedStudentsCount}/{ct.totalStudentsCount})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <ClipboardList className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
                  Marks pending
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}