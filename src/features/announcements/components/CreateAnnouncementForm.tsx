import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Paperclip, X, ChevronDown, ChevronUp, Loader2, Sparkles } from "lucide-react"
import Avatar from "@/components/ui/Avatar"
import { useAuthStore } from "@/store/authStore"
import { useThemeStore } from "@/store/themeStore"
import type { CreateAnnouncementRequest } from "@/types/announcement.types"

interface Props {
  courseId:   string
  onSubmit:   (data: CreateAnnouncementRequest) => void
  isLoading?: boolean
}

export default function CreateAnnouncementForm({ courseId, onSubmit, isLoading }: Props) {
  const { user }  = useAuthStore()
  const { dark }  = useThemeStore()
  const [expanded,   setExpanded]   = useState(false)
  const [content,    setContent]    = useState("")
  const [attachment, setAttachment] = useState<File | null>(null)
  const [focused,    setFocused]    = useState(false)
  const fileRef  = useRef<HTMLInputElement>(null)
  const charLimit = 2000

  const handleSubmit = () => {
    if (!content.trim() || isLoading) return
    onSubmit({ courseId, content, attachment })
    setContent(""); setAttachment(null); setExpanded(false); setFocused(false)
  }
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSubmit()
  }

  const cardBg  = dark ? "rgba(16,24,44,0.85)" : "rgba(255,255,255,0.95)"
  const blur    = "blur(20px)"
  const activeBorder = dark ? "rgba(99,102,241,0.4)" : "#6366f1"
  const idleBorder   = dark ? "rgba(99,102,241,0.15)" : "#e5e7eb"
  const divider = dark ? "rgba(99,102,241,0.1)" : "#f3f4f6"
  const textMain= dark ? "#e2e8f8" : "#111827"
  const textSub = dark ? "#8896c8" : "#6b7280"
  const textMuted=dark ? "#5a6a9a" : "#9ca3af"
  const inputBg = dark ? "rgba(255,255,255,0.04)" : "#f9fafb"

  return (
    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: cardBg, backdropFilter: blur, WebkitBackdropFilter: blur,
        border: `1px solid ${focused || expanded ? activeBorder : idleBorder}`,
        boxShadow: focused || expanded ? `0 0 0 3px ${dark ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.06)"}` : "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}>

      {/* Posting overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center gap-2.5 rounded-2xl"
            style={{ background: dark ? "rgba(16,24,44,0.9)" : "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)" }}>
            <Loader2 style={{ width: 18, height: 18, color: "#6366f1" }} className="animate-spin" />
            <span className="text-[13px] font-semibold" style={{ color: textSub }}>Posting...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed header */}
      <div className="flex items-center gap-3 p-4 cursor-text"
        onClick={() => { setExpanded(true); setFocused(true) }}>
        <div className="rounded-xl overflow-hidden shrink-0"
          style={{ border: `1.5px solid ${dark ? "rgba(99,102,241,0.3)" : "#c7d2fe"}`, width: 36, height: 36 }}>
          <Avatar src={user?.profile?.profilePhotoUrl} name={user?.profile?.fullName} size="sm" className="w-full h-full rounded-none" />
        </div>
        <span className="flex-1 text-[13px] select-none" style={{ color: textMuted }}>
          Share something with your class...
        </span>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg"
            style={{ background: dark ? "rgba(99,102,241,0.1)" : "#eef2ff", border: dark ? "1px solid rgba(99,102,241,0.2)" : "1px solid #c7d2fe" }}>
            <Sparkles style={{ width: 11, height: 11, color: "#6366f1" }} />
            <span className="text-[10px] font-bold" style={{ color: "#6366f1" }}>Announce</span>
          </div>
          <button onClick={e => { e.stopPropagation(); setExpanded(v => !v); setFocused(!expanded) }}
            className="p-1 rounded-lg transition-colors" style={{ color: textMuted }}>
            {expanded
              ? <ChevronUp style={{ width: 15, height: 15 }} />
              : <ChevronDown style={{ width: 15, height: 15 }} />
            }
          </button>
        </div>
      </div>

      {/* Expanded composer */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="overflow-hidden">
            <div className="px-4 pb-4 space-y-3" style={{ borderTop: `1px solid ${divider}` }}>
              <div className="pt-3">
                <textarea autoFocus value={content}
                  onChange={e => setContent(e.target.value)}
                  onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                  onKeyDown={handleKey}
                  placeholder="Write your announcement... (Ctrl+Enter to post)"
                  rows={4} maxLength={charLimit}
                  className="w-full rounded-xl text-[13px] px-4 py-3 resize-none outline-none transition-all"
                  style={{ background: inputBg, border: `1px solid ${dark ? "rgba(99,102,241,0.2)" : "#e5e7eb"}`, color: textMain }}
                  onFocusCapture={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)" }}
                  onBlurCapture={e => { e.currentTarget.style.borderColor = dark ? "rgba(99,102,241,0.2)" : "#e5e7eb"; e.currentTarget.style.boxShadow = "none" }}
                />
                <div className="flex justify-end mt-1">
                  <span className="text-[10px]" style={{ color: content.length > charLimit * 0.9 ? "#d97706" : textMuted }}>
                    {content.length}/{charLimit}
                  </span>
                </div>
              </div>

              {/* Attachment preview */}
              <AnimatePresence>
                {attachment && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                    style={{ background: dark ? "rgba(99,102,241,0.08)" : "#eef2ff", border: dark ? "1px solid rgba(99,102,241,0.2)" : "1px solid #c7d2fe" }}>
                    <Paperclip style={{ width: 13, height: 13, color: "#6366f1" }} />
                    <span className="flex-1 text-[12px] truncate" style={{ color: textSub }}>{attachment.name}</span>
                    <button onClick={() => setAttachment(null)} style={{ color: textMuted }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#ef4444"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = textMuted}>
                      <X style={{ width: 13, height: 13 }} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between gap-3">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  type="button" onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-2 rounded-xl"
                  style={{ background: dark ? "rgba(99,102,241,0.08)" : "#f9fafb", border: dark ? "1px solid rgba(99,102,241,0.15)" : "1px solid #e5e7eb", color: "#6366f1" }}>
                  <Paperclip style={{ width: 13, height: 13 }} /> Attach file
                </motion.button>
                <input ref={fileRef} type="file" className="hidden"
                  onChange={e => setAttachment(e.target.files?.[0] ?? null)} />

                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={handleSubmit}
                  disabled={!content.trim() || isLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold text-white disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg,#6366f1,#0891b2)", boxShadow: "0 4px 14px rgba(99,102,241,0.35)" }}>
                  <Send style={{ width: 13, height: 13 }} /> Post
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
