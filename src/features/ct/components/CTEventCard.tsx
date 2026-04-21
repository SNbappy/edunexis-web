import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Upload, CheckCircle2, MoreVertical, Eye, Edit2, Send, EyeOff, Trash2, ClipboardList } from "lucide-react"
import { formatDate } from "@/utils/dateUtils"
import { useAuthStore } from "@/store/authStore"
import { useThemeStore } from "@/store/themeStore"
import { isTeacher } from "@/utils/roleGuard"
import type { CTEventDto } from "@/types/ct.types"

interface Props {
  ct:             CTEventDto
  index?:         number
  onView:         (ct: CTEventDto) => void
  onDelete?:      (ct: CTEventDto) => void
  onPublish?:     (id: string) => void
  onUnpublish?:   (id: string) => void
  onUploadKhata?: (ct: CTEventDto) => void
  onEnterMarks?:  (ct: CTEventDto) => void
}

function MenuBtn({ icon: Icon, label, color, onClick, dark }: { icon: any; label: string; color: string; onClick: () => void; dark: boolean }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors"
      style={{ color }}
      onMouseEnter={e => (e.currentTarget.style.background = dark ? `${color}15` : `${color}0f`)}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
      <Icon style={{ width: 14, height: 14 }} strokeWidth={2} />
      {label}
    </button>
  )
}

export default function CTEventCard({ ct, index = 0, onView, onDelete, onPublish, onUnpublish, onUploadKhata, onEnterMarks }: Props) {
  const { user }  = useAuthStore()
  const { dark }  = useThemeStore()
  const teacher   = isTeacher(user?.role ?? "Student")
  const [menuOpen, setMenuOpen] = useState(false)

  const isPublished = ct.status === "Published"
  const isDraft     = ct.status === "Draft"

  const statusColor  = isPublished ? "#059669" : "#d97706"
  const statusLight  = isPublished ? "#ecfdf5" : "#fffbeb"
  const statusDark   = isPublished ? "rgba(5,150,105,0.15)"  : "rgba(217,119,6,0.15)"
  const statusBorder = isPublished ? (dark ? "rgba(5,150,105,0.3)" : "#a7f3d0") : (dark ? "rgba(217,119,6,0.3)" : "#fde68a")

  const hasMenu = teacher && (onUploadKhata || onEnterMarks || onPublish || onUnpublish || onDelete)

  // Theme
  const cardBg    = dark ? "rgba(16,24,44,0.75)" : "rgba(255,255,255,0.92)"
  const blur      = "blur(20px)"
  const border    = dark ? "rgba(124,58,237,0.15)" : "#e5e7eb"
  const hoverBorder = dark ? "rgba(124,58,237,0.35)" : "#ddd6fe"
  const textMain  = dark ? "#e2e8f8" : "#111827"
  const textSub   = dark ? "#8896c8" : "#6b7280"
  const textMuted = dark ? "#5a6a9a" : "#9ca3af"
  const menuBg    = dark ? "rgb(16,24,44)" : "white"
  const menuBorder= dark ? "rgba(124,58,237,0.2)" : "#e5e7eb"
  const divider   = dark ? "rgba(124,58,237,0.1)" : "#f3f4f6"

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onView(ct)}
      whileHover={{ y: -2, boxShadow: dark ? "0 8px 24px rgba(124,58,237,0.15)" : "0 4px 16px rgba(124,58,237,0.1)" }}
      className="group relative rounded-2xl cursor-pointer"
      style={{ background: cardBg, backdropFilter: blur, WebkitBackdropFilter: blur, border: `1px solid ${border}`, transition: "border-color 0.2s" }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = hoverBorder)}
      onMouseLeave={e => (e.currentTarget.style.borderColor = border)}
    >
      {/* Status stripe */}
      <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full pointer-events-none"
        style={{ background: `linear-gradient(180deg, ${statusColor}, ${statusColor}50)` }} />

      <div className="flex items-start gap-4 px-5 py-4">
        {/* CT number badge */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: dark ? "rgba(124,58,237,0.15)" : "#f5f3ff", border: dark ? "1px solid rgba(124,58,237,0.25)" : "1px solid #ddd6fe" }}>
          <span className="text-[12px] font-extrabold" style={{ color: "#7c3aed" }}>CT{ct.ctNumber}</span>
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          {/* Title row */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-[14px] leading-snug line-clamp-1 group-hover:text-purple-400 transition-colors"
              style={{ color: textMain }}>
              {ct.title}
            </h3>
            <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
              {/* Status badge */}
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5"
                style={{ background: dark ? statusDark : statusLight, border: `1px solid ${statusBorder}`, color: statusColor }}>
                {isPublished
                  ? <><CheckCircle2 style={{ width: 11, height: 11 }} strokeWidth={2.5} /> Published</>
                  : <><Edit2 style={{ width: 11, height: 11 }} strokeWidth={2.5} /> Draft</>
                }
              </span>

              {/* Menu */}
              {hasMenu && (
                <div className="relative">
                  <motion.button whileTap={{ scale: 0.9 }}
                    onClick={e => { e.stopPropagation(); setMenuOpen(o => !o) }}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                    style={{ color: textMuted, background: menuOpen ? (dark ? "rgba(124,58,237,0.15)" : "#f5f3ff") : "transparent" }}
                    onMouseEnter={e => (e.currentTarget.style.background = dark ? "rgba(124,58,237,0.12)" : "#f5f3ff")}
                    onMouseLeave={e => { if (!menuOpen) e.currentTarget.style.background = "transparent" }}>
                    <MoreVertical style={{ width: 15, height: 15 }} />
                  </motion.button>

                  <AnimatePresence>
                    {menuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.94, y: -4 }}
                        animate={{ opacity: 1, scale: 1,    y: 0   }}
                        exit={{   opacity: 0, scale: 0.94, y: -4   }}
                        transition={{ duration: 0.12 }}
                        className="absolute right-0 top-full mt-1 z-50 w-52 rounded-xl overflow-hidden p-1"
                        style={{ background: menuBg, border: `1px solid ${menuBorder}`, boxShadow: dark ? "0 16px 40px rgba(0,0,0,0.5)" : "0 8px 24px rgba(0,0,0,0.12)" }}
                        onClick={e => e.stopPropagation()}>
                        <MenuBtn dark={dark} icon={Eye} label="View Details" color="#7c3aed"
                          onClick={() => { onView(ct); setMenuOpen(false) }} />
                        {onUploadKhata && (
                          <MenuBtn dark={dark} icon={Upload} label={ct.khataUploaded ? "Re-upload Khata" : "Upload Khata"} color="#6366f1"
                            onClick={() => { onUploadKhata(ct); setMenuOpen(false) }} />
                        )}
                        {ct.khataUploaded && onEnterMarks && (
                          <MenuBtn dark={dark} icon={ClipboardList} label={isPublished ? "View / Edit Marks" : "Enter Marks"} color="#d97706"
                            onClick={() => { onEnterMarks(ct); setMenuOpen(false) }} />
                        )}
                        {isDraft && ct.khataUploaded && onPublish && (
                          <MenuBtn dark={dark} icon={Send} label="Publish Results" color="#059669"
                            onClick={() => { onPublish(ct.id); setMenuOpen(false) }} />
                        )}
                        {isPublished && onUnpublish && (
                          <MenuBtn dark={dark} icon={EyeOff} label="Unpublish" color="#d97706"
                            onClick={() => { onUnpublish(ct.id); setMenuOpen(false) }} />
                        )}
                        {onDelete && (
                          <>
                            <div className="h-px mx-2 my-1" style={{ background: divider }} />
                            <MenuBtn dark={dark} icon={Trash2} label="Delete" color="#ef4444"
                              onClick={() => { onDelete(ct); setMenuOpen(false) }} />
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-3 flex-wrap">
            {ct.heldOn ? (
              <span className="flex items-center gap-1.5 text-[12px]" style={{ color: textSub }}>
                <Calendar style={{ width: 13, height: 13 }} /> {formatDate(ct.heldOn, "dd MMM yyyy")}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[12px]" style={{ color: "#d97706" }}>
                <Calendar style={{ width: 13, height: 13 }} /> Date not set
              </span>
            )}
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: dark ? "rgba(124,58,237,0.12)" : "#f5f3ff", border: dark ? "1px solid rgba(124,58,237,0.2)" : "1px solid #ddd6fe", color: "#7c3aed" }}>
              {ct.maxMarks} marks
            </span>
            {teacher && (
              ct.khataUploaded
                ? <span className="flex items-center gap-1 text-[12px] font-semibold" style={{ color: "#059669" }}>
                    <CheckCircle2 style={{ width: 12, height: 12 }} /> Khata uploaded
                  </span>
                : <span className="flex items-center gap-1 text-[12px] font-semibold" style={{ color: "#d97706" }}>
                    <Upload style={{ width: 12, height: 12 }} /> Khata pending
                  </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
