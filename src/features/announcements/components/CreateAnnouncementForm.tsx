import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Send, Paperclip, X, Loader2, Megaphone,
} from "lucide-react"
import Avatar from "@/components/ui/Avatar"
import { useAuthStore } from "@/store/authStore"
import type { CreateAnnouncementRequest } from "@/types/announcement.types"

interface CreateAnnouncementFormProps {
  courseId: string
  onSubmit: (data: CreateAnnouncementRequest) => void
  isLoading?: boolean
}

const CHAR_LIMIT = 2000

export default function CreateAnnouncementForm({
  courseId, onSubmit, isLoading,
}: CreateAnnouncementFormProps) {
  const { user } = useAuthStore()
  const [expanded, setExpanded] = useState(false)
  const [content, setContent] = useState("")
  const [attachment, setAttachment] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleSubmit = () => {
    if (!content.trim() || isLoading) return
    onSubmit({ courseId, content, attachment })
    setContent("")
    setAttachment(null)
    setExpanded(false)
  }

  const handleCancel = () => {
    setContent("")
    setAttachment(null)
    setExpanded(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmit()
    }
    if (e.key === "Escape") handleCancel()
  }

  const charCount = content.length
  const charsLeft = CHAR_LIMIT - charCount
  const overWarning = charCount > CHAR_LIMIT * 0.9

  return (
    <motion.div
      layout
      transition={{ layout: { duration: 0.22, ease: "easeOut" } }}
      className={
        "relative overflow-hidden rounded-2xl border bg-card shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] transition-all " +
        (expanded
          ? "border-teal-300 shadow-[0_0_0_3px_rgba(20,184,166,0.10)]"
          : "border-border hover:border-teal-200 hover:shadow-[0_4px_16px_-4px_rgba(20,184,166,0.12)]")
      }
    >
      {/* Submitting overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center gap-2.5 bg-card/85 backdrop-blur-sm"
          >
            <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
            <span className="text-[13px] font-semibold text-foreground">Posting…</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed state — inviting prompt */}
      {!expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex w-full items-center gap-3 p-4 text-left"
        >
          <Avatar
            src={user?.profile?.profilePhotoUrl}
            name={user?.profile?.fullName}
            size="sm"
            className="h-10 w-10 shrink-0"
          />
          <span className="flex-1 truncate text-[14px] text-muted-foreground">
            Share something with your class…
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-teal-700">
            <Megaphone className="h-3 w-3" />
            Announce
          </span>
        </button>
      )}

      {/* Expanded composer */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-3 p-4">
              <div className="flex items-start gap-3">
                <Avatar
                  src={user?.profile?.profilePhotoUrl}
                  name={user?.profile?.fullName}
                  size="sm"
                  className="h-10 w-10 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-foreground">
                    {user?.profile?.fullName ?? "You"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Posting to this course
                  </p>
                </div>
              </div>

              <textarea
                autoFocus
                value={content}
                onChange={e => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What's on your mind? Use Ctrl+Enter to post."
                rows={5}
                maxLength={CHAR_LIMIT}
                className="w-full resize-none rounded-xl border border-border bg-stone-50/60 px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground transition-all focus:border-teal-600 focus:bg-card focus:outline-none focus:ring-2 focus:ring-teal-600/30"
              />

              <div className="flex items-center justify-end">
                <span
                  className={
                    "text-[11px] font-medium " +
                    (overWarning ? "text-amber-600" : "text-muted-foreground")
                  }
                >
                  {charsLeft.toLocaleString()} characters left
                </span>
              </div>

              {/* Attachment chip */}
              <AnimatePresence>
                {attachment && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2.5 rounded-xl border border-teal-200 bg-teal-50/60 px-3 py-2.5"
                  >
                    <Paperclip className="h-3.5 w-3.5 shrink-0 text-teal-700" />
                    <span className="flex-1 truncate text-[12px] text-foreground">
                      {attachment.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAttachment(null)}
                      aria-label="Remove attachment"
                      className="text-muted-foreground transition-colors hover:text-red-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-stone-50 px-3 py-2 text-[12px] font-semibold text-foreground transition-colors hover:bg-teal-50 hover:text-teal-700"
                >
                  <Paperclip className="h-3.5 w-3.5" />
                  Attach file
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  onChange={e => setAttachment(e.target.files?.[0] ?? null)}
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-lg px-3 py-2 text-[12px] font-semibold text-muted-foreground transition-colors hover:bg-stone-100 hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSubmit}
                    disabled={!content.trim() || isLoading}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-[12.5px] font-bold text-white shadow-sm transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Post announcement
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}