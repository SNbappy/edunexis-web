import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MoreVertical, Download, Trash2, ExternalLink, ChevronRight, Loader2 } from "lucide-react"
import FileIcon from "./FileIcon"
import { formatRelative } from "@/utils/dateUtils"
import { formatFileSize } from "@/utils/fileUtils"
import { useAuthStore } from "@/store/authStore"
import { useThemeStore } from "@/store/themeStore"
import { isTeacher } from "@/utils/roleGuard"
import type { MaterialDto } from "@/types/material.types"

interface Props {
  material:      MaterialDto
  index?:        number
  courseId:      string
  onDelete?:     (id: string) => void
  onOpenFolder?: (id: string, label: string) => void
}

const TYPE_COLOR: Record<string, string> = {
  Folder:      "#d97706",
  YouTube:     "#ef4444",
  GoogleDrive: "#059669",
  Link:        "#6366f1",
}

export default function MaterialCard({ material, index = 0, courseId, onDelete, onOpenFolder }: Props) {
  const { user }  = useAuthStore()
  const { dark }  = useThemeStore()
  const teacher   = isTeacher(user?.role ?? "Student")
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [downloading, setDownloading] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isFolder = material.type === "Folder"
  const isLink   = ["Link", "YouTube", "GoogleDrive"].includes(material.type)
  const accentColor = TYPE_COLOR[material.type] ?? "#6366f1"

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  const handleDownload = async () => {
    if (!material.fileUrl) return
    setDownloading(true)
    try {
      const res  = await fetch(material.fileUrl)
      const blob = await res.blob()
      const url  = window.URL.createObjectURL(blob)
      const a    = document.createElement("a")
      a.href = url; a.download = material.fileName ?? material.title
      document.body.appendChild(a); a.click()
      document.body.removeChild(a); window.URL.revokeObjectURL(url)
    } catch { window.open(material.fileUrl, "_blank") }
    finally { setDownloading(false) }
  }

  const handlePrimaryAction = () => {
    if (isFolder) onOpenFolder?.(material.id, material.title)
    else if (isLink) { if (material.embedUrl) window.open(material.embedUrl, "_blank") }
    else handleDownload()
  }

  // Theme
  const cardBg    = dark ? "rgba(16,24,44,0.75)" : "rgba(255,255,255,0.92)"
  const blur      = "blur(20px)"
  const border    = dark ? "rgba(99,102,241,0.12)" : "#e5e7eb"
  const hoverBorder = dark ? `${accentColor}40` : accentColor + "55"
  const textMain  = dark ? "#e2e8f8" : "#111827"
  const textSub   = dark ? "#8896c8" : "#6b7280"
  const textMuted = dark ? "#5a6a9a" : "#9ca3af"
  const menuBg    = dark ? "rgb(16,24,44)" : "white"
  const menuBorder= dark ? "rgba(99,102,241,0.2)" : "#e5e7eb"
  const hoverItem = dark ? "rgba(99,102,241,0.08)" : "#f9fafb"

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={isFolder ? handlePrimaryAction : undefined}
      whileHover={{ y: -2, boxShadow: `0 8px 24px ${accentColor}18` }}
      className="group relative rounded-2xl cursor-pointer"
      style={{
        background: cardBg, backdropFilter: blur, WebkitBackdropFilter: blur,
        border: `1px solid ${border}`,
        cursor: isFolder ? "pointer" : "default",
        transition: "border-color 0.2s",
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = hoverBorder)}
      onMouseLeave={e => (e.currentTarget.style.borderColor = border)}
    >
      {/* Left accent stripe */}
      <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full pointer-events-none"
        style={{ background: `linear-gradient(180deg, ${accentColor}, ${accentColor}50)` }} />

      <div className="flex items-center gap-4 px-4 py-3.5 pl-5">
        <FileIcon fileName={material.fileName} type={material.type} size="md" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span
              className="text-[13.5px] font-bold truncate max-w-sm transition-colors"
              style={{ color: textMain, cursor: !isFolder ? "pointer" : "default" }}
              onClick={!isFolder ? handlePrimaryAction : undefined}
              onMouseEnter={e => { if (!isFolder) (e.target as HTMLElement).style.color = accentColor }}
              onMouseLeave={e => { if (!isFolder) (e.target as HTMLElement).style.color = textMain }}
            >
              {material.title}
            </span>
            {isFolder && (material.childCount ?? 0) > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                style={{ background: dark ? "rgba(217,119,6,0.12)" : "#fffbeb", border: dark ? "1px solid rgba(217,119,6,0.25)" : "1px solid #fde68a", color: "#d97706" }}>
                {material.childCount} items
              </span>
            )}
          </div>
          {material.description && (
            <p className="text-[11.5px] mb-1 line-clamp-1" style={{ color: textSub }}>{material.description}</p>
          )}
          <div className="flex items-center gap-2 text-[11px] flex-wrap" style={{ color: textMuted }}>
            <span>{material.uploadedByName}</span>
            {material.uploadedAt && <><span>-</span><span>{formatRelative(material.uploadedAt)}</span></>}
            {material.fileSizeBytes ? <><span>-</span><span>{formatFileSize(material.fileSizeBytes)}</span></> : null}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={e => e.stopPropagation()}>
          {isFolder ? (
            <ChevronRight style={{ width: 16, height: 16, color: textMuted }} />
          ) : (
            <motion.button whileTap={{ scale: 0.9 }}
              onClick={handlePrimaryAction}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
              style={{ color: accentColor }}
              onMouseEnter={e => (e.currentTarget.style.background = dark ? `${accentColor}18` : `${accentColor}10`)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              {downloading
                ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />
                : isLink
                  ? <ExternalLink style={{ width: 14, height: 14 }} />
                  : <Download style={{ width: 14, height: 14 }} />
              }
            </motion.button>
          )}

          {teacher && onDelete && (
            <div className="relative" ref={menuRef}>
              <motion.button whileTap={{ scale: 0.9 }}
                onClick={() => setMenuOpen(v => !v)}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                style={{ color: textMuted }}
                onMouseEnter={e => (e.currentTarget.style.background = dark ? "rgba(255,255,255,0.07)" : "#f3f4f6")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <MoreVertical style={{ width: 14, height: 14 }} />
              </motion.button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.94, y: -4 }}
                    animate={{ opacity: 1, scale: 1,    y: 0   }}
                    exit={{   opacity: 0, scale: 0.94, y: -4   }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-full mt-1 z-50 w-40 rounded-xl overflow-hidden"
                    style={{ background: menuBg, border: `1px solid ${menuBorder}`, boxShadow: dark ? "0 12px 32px rgba(0,0,0,0.5)" : "0 8px 24px rgba(0,0,0,0.12)" }}>
                    <button
                      onClick={() => { setMenuOpen(false); onDelete(material.id) }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium transition-colors"
                      style={{ color: "#ef4444" }}
                      onMouseEnter={e => (e.currentTarget.style.background = dark ? "rgba(239,68,68,0.1)" : "#fef2f2")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <Trash2 style={{ width: 14, height: 14 }} /> Delete
                    </button>
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
