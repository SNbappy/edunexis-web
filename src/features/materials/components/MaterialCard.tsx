import InlineSpinner from "@/components/ui/InlineSpinner"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MoreVertical, Download, Trash2, ExternalLink,
  ChevronRight, Loader2, Eye,
} from "lucide-react"
import FileIcon from "./FileIcon"
import { formatRelative } from "@/utils/dateUtils"
import { formatFileSize } from "@/utils/fileUtils"
import { isPreviewable } from "@/utils/filePreview"
import { useAuthStore } from "@/store/authStore"
import { isTeacher } from "@/utils/roleGuard"
import type { MaterialDto } from "@/types/material.types"

interface MaterialCardProps {
  material: MaterialDto
  index?: number
  courseId: string
  onDelete?: (id: string) => void
  onOpenFolder?: (id: string, label: string) => void
  onPreview?: (material: MaterialDto) => void
}

interface AccentSpec {
  stripe: string
  iconHover: string
}

const ACCENTS: Record<string, AccentSpec> = {
  Folder: { stripe: "bg-amber-500", iconHover: "hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/40 dark:hover:text-amber-300" },
  YouTube: { stripe: "bg-red-500", iconHover: "hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-300" },
  GoogleDrive: { stripe: "bg-emerald-500", iconHover: "hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300" },
  Link: { stripe: "bg-blue-500", iconHover: "hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-300" },
}

const DEFAULT_ACCENT: AccentSpec = {
  stripe: "bg-teal-500",
  iconHover: "hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-teal-950/40 dark:hover:text-teal-300",
}

export default function MaterialCard({
  material, index = 0, onDelete, onOpenFolder, onPreview,
}: MaterialCardProps) {
  const { user } = useAuthStore()
  const teacher = isTeacher(user?.role ?? "Student")

  const [menuOpen, setMenuOpen] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isFolder = material.type === "Folder"
  const isLink = ["Link", "YouTube", "GoogleDrive"].includes(material.type)
  const accent = ACCENTS[material.type] ?? DEFAULT_ACCENT
  const canPreview = !isFolder && !isLink && !!material.fileUrl && isPreviewable(material.fileName ?? material.title)

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

  const handleDownload = async () => {
    if (!material.fileUrl) return
    setDownloading(true)
    try {
      const res = await fetch(material.fileUrl)
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = material.fileName ?? material.title
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch {
      window.open(material.fileUrl, "_blank")
    } finally {
      setDownloading(false)
    }
  }

  const handlePrimaryAction = () => {
    if (isFolder) {
      onOpenFolder?.(material.id, material.title)
    } else if (isLink) {
      if (material.embedUrl) window.open(material.embedUrl, "_blank")
    } else if (canPreview) {
      onPreview?.(material)
    } else {
      handleDownload()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.2) }}
      onClick={isFolder ? handlePrimaryAction : undefined}
      whileHover={{ y: -2 }}
      className={
        "group relative rounded-2xl border border-border bg-card shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] transition-all hover:border-stone-300 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.12)] dark:hover:border-stone-700 " +
        (isFolder ? "cursor-pointer " : "cursor-default ") +
        (menuOpen ? "z-30" : "z-0")
      }
    >
      <div
        className={"pointer-events-none absolute bottom-3 left-0 top-3 w-[3px] rounded-full " + accent.stripe}
        aria-hidden
      />

      <div className="flex items-center gap-4 px-4 py-3.5 pl-5">
        <FileIcon fileName={material.fileName} type={material.type} size="md" />

        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex flex-wrap items-center gap-2">
            <span
              className={
                "max-w-sm truncate text-[13.5px] font-bold text-foreground transition-colors " +
                (!isFolder ? "cursor-pointer hover:text-teal-700 dark:hover:text-teal-300" : "")
              }
              onClick={!isFolder ? (e) => { e.stopPropagation(); handlePrimaryAction() } : undefined}
            >
              {material.title}
            </span>
            {isFolder && (material.childCount ?? 0) > 0 && (
              <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                {material.childCount} {material.childCount === 1 ? "item" : "items"}
              </span>
            )}
          </div>

          {material.description && (
            <p className="mb-1 line-clamp-1 text-[11.5px] text-muted-foreground">
              {material.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
            <span>{material.uploadedByName}</span>
            {material.uploadedAt && (
              <>
                <span>·</span>
                <span>{formatRelative(material.uploadedAt)}</span>
              </>
            )}
            {material.fileSizeBytes ? (
              <>
                <span>·</span>
                <span>{formatFileSize(material.fileSizeBytes)}</span>
              </>
            ) : null}
          </div>
        </div>

        {/* Actions */}
        <div
          className={
            "flex shrink-0 items-center gap-1 transition-opacity " +
            (menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100")
          }
          onClick={e => e.stopPropagation()}
        >
          {isFolder ? (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          ) : (
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={handlePrimaryAction}
              aria-label={canPreview ? "Preview" : isLink ? "Open link" : "Download"}
              className={
                "flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-colors " +
                accent.iconHover
              }
            >
              {downloading ? (
                <InlineSpinner />
              ) : isLink ? (
                <ExternalLink className="h-3.5 w-3.5" />
              ) : canPreview ? (
                <Eye className="h-3.5 w-3.5" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
            </motion.button>
          )}

          {/* Kebab menu — show whenever there's at least one action available */}
          {!isFolder && (canPreview || teacher) && (
            <div className="relative" ref={menuRef}>
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => setMenuOpen(v => !v)}
                aria-label="More actions"
                aria-expanded={menuOpen}
                className={
                  "flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-colors " +
                  (menuOpen
                    ? "bg-muted text-foreground"
                    : "hover:bg-muted hover:text-foreground")
                }
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </motion.button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-9 z-50 w-44 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
                  >
                    {canPreview && (
                      <button
                        type="button"
                        onClick={() => { setMenuOpen(false); handleDownload() }}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-medium text-foreground transition-colors hover:bg-teal-50 dark:hover:bg-teal-950/30"
                      >
                        <Download className="h-3.5 w-3.5 text-teal-700 dark:text-teal-300" />
                        Download
                      </button>
                    )}
                    {teacher && onDelete && (
                      <button
                        type="button"
                        onClick={() => { setMenuOpen(false); onDelete(material.id) }}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}