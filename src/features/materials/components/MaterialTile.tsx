import { useRef, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Play, MoreVertical, Trash2, Download, ExternalLink, Link2, FileText,
} from "lucide-react"
import FileIcon from "./FileIcon"
import InlineSpinner from "@/components/ui/InlineSpinner"
import { formatRelative } from "@/utils/dateUtils"
import { formatFileSize } from "@/utils/fileUtils"
import { isPreviewable } from "@/utils/filePreview"
import { isYouTubeUrl, getYouTubeThumbnail, getLinkHost } from "@/utils/videoEmbed"
import { useAuthStore } from "@/store/authStore"
import { isTeacher } from "@/utils/roleGuard"
import { FOCUS, ICON_STROKE } from "@/components/ui/appTokens"
import { cn } from "@/utils/cn"
import { useCourseReadOnly } from "@/features/courses/context/CourseReadOnly"
import type { MaterialDto } from "@/types/material.types"

interface Props {
  material: MaterialDto
  index?: number
  onDelete?: (id: string) => void
  onPreview?: (material: MaterialDto) => void
}

/**
 * One material, as a tile.
 *
 * Files and links were full-width rows: on a desktop that gave a 1200px band
 * carrying a filename and a date, so four materials filled the screen while
 * saying almost nothing, and a video was indistinguishable from a PDF until you
 * read the label.
 *
 * A tile leads with a 16:9 visual instead. For a YouTube link that is the real
 * video thumbnail with a play badge — the same shape people already read on
 * YouTube itself, so "this is a video, press it" needs no explanation. Other
 * types get a tinted panel carrying their file icon, which still separates a
 * PDF from a slide deck at a glance.
 */
export default function MaterialTile({ material, index = 0, onDelete, onPreview }: Props) {
  const { user } = useAuthStore()
  const teacher = isTeacher(user?.role ?? "Student")
  const readOnly = useCourseReadOnly()

  const [menuOpen, setMenuOpen] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [thumbFailed, setThumbFailed] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [menuOpen])

  const isLink   = ["Link", "YouTube", "GoogleDrive"].includes(material.type)
  const isVideo  = !!material.embedUrl && isYouTubeUrl(material.embedUrl)
  const thumb    = isVideo && material.embedUrl ? getYouTubeThumbnail(material.embedUrl) : null
  const canPreview = isPreviewable(material.fileName ?? "")

  const handleDownload = async () => {
    if (!material.fileUrl) return
    setDownloading(true)
    try {
      const a = document.createElement("a")
      a.href = material.fileUrl
      a.download = material.fileName ?? material.title
      a.target = "_blank"
      a.rel = "noopener noreferrer"
      a.click()
    } finally {
      setDownloading(false)
    }
  }

  const open = () => {
    if (isLink) {
      // A YouTube link plays in-app; anything else is a site we do not control.
      if (isVideo) onPreview?.(material)
      else if (material.embedUrl) window.open(material.embedUrl, "_blank", "noopener,noreferrer")
      return
    }
    if (canPreview) onPreview?.(material)
    else handleDownload()
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.24), duration: 0.28 }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card",
        "shadow-[0_1px_2px_rgb(15_23_42/0.04)] transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-border-strong",
        "hover:shadow-[0_2px_4px_rgb(15_23_42/0.06),0_16px_32px_-16px_rgb(var(--primary)/0.4)]",
        menuOpen ? "z-30" : "z-0",
      )}
    >
      {/* Media. The whole panel is the button, so the tap target is the tile
          rather than a small link inside it. */}
      <button
        type="button"
        onClick={open}
        className={cn(
          "relative aspect-video w-full overflow-hidden bg-muted text-left",
          FOCUS,
        )}
        aria-label={isVideo ? `Play ${material.title}` : `Open ${material.title}`}
      >
        {thumb && !thumbFailed ? (
          <>
            <img
              src={thumb}
              alt=""
              loading="lazy"
              onError={() => setThumbFailed(true)}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span aria-hidden className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/20" />
            {/* Play badge in YouTube's own shape — instantly legible. */}
            <span
              aria-hidden
              className="absolute left-1/2 top-1/2 flex h-11 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl bg-red-600/95 shadow-lg transition-transform duration-200 group-hover:scale-110"
            >
              <Play className="h-5 w-5 translate-x-[1px] fill-white text-white" />
            </span>
          </>
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-subtle/60">
            {isLink && !isVideo
              ? <Link2 className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
              : <FileIcon fileName={material.fileName} type={material.type} size="lg" />}
          </span>
        )}
      </button>

      {/* Body */}
      <div className="flex min-w-0 flex-1 flex-col gap-1 p-3.5">
        <div className="flex items-start gap-2">
          <button
            type="button"
            onClick={open}
            className={cn(
              "min-w-0 flex-1 rounded text-left text-[13.5px] font-bold leading-snug text-foreground transition-colors hover:text-primary",
              FOCUS,
            )}
          >
            <span className="line-clamp-2">{material.title}</span>
          </button>

          {teacher && !readOnly && (
            <div className="relative shrink-0" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen(v => !v)}
                aria-label="Material actions"
                aria-expanded={menuOpen}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  FOCUS,
                )}
              >
                <MoreVertical className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-8 z-40 w-40 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-lg"
                  >
                    {material.fileUrl && (
                      <button
                        type="button"
                        onClick={() => { setMenuOpen(false); handleDownload() }}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12.5px] font-medium text-foreground transition-colors hover:bg-muted"
                      >
                        <Download className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
                        Download
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => { setMenuOpen(false); onDelete(material.id) }}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12.5px] font-medium text-destructive transition-colors hover:bg-destructive-soft"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
                        Delete
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {material.description && (
          <p className="line-clamp-2 text-[11.5px] leading-relaxed text-muted-foreground">
            {material.description}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-x-1.5 gap-y-0.5 pt-1.5 text-[11px] text-muted-foreground">
          {isVideo ? (
            <span className="font-semibold text-red-600 dark:text-red-400">YouTube</span>
          ) : isLink && material.embedUrl ? (
            <span className="inline-flex items-center gap-1 truncate">
              <ExternalLink className="h-3 w-3 shrink-0" strokeWidth={ICON_STROKE} />
              {getLinkHost(material.embedUrl)}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1">
              <FileText className="h-3 w-3" strokeWidth={ICON_STROKE} />
              {material.fileSizeBytes ? formatFileSize(material.fileSizeBytes) : "File"}
            </span>
          )}
          {material.uploadedAt && (
            <>
              <span aria-hidden>·</span>
              <span>{formatRelative(material.uploadedAt)}</span>
            </>
          )}
        </div>
      </div>

      {downloading && (
        <span className="absolute right-3 top-3 rounded-lg bg-card/90 p-1.5 shadow-sm">
          <InlineSpinner size={13} />
        </span>
      )}
    </motion.article>
  )
}
