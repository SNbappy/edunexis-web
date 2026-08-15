import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Paperclip, X, Megaphone } from "lucide-react"
import Avatar from "@/components/ui/Avatar"
import Button from "@/components/ui/Button"
import InlineSpinner from "@/components/ui/InlineSpinner"
import { Textarea } from "@/components/ui/field"
import { ICON_STROKE, FOCUS, MOTION, SURFACE } from "@/components/ui/appTokens"
import { useAuthStore } from "@/store/authStore"
import { cn } from "@/utils/cn"
import type { CreateAnnouncementRequest } from "@/types/announcement.types"

interface CreateAnnouncementFormProps {
  courseId: string
  onSubmit: (data: CreateAnnouncementRequest) => void
  isLoading?: boolean
}

const CHAR_LIMIT = 2000
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024 // 10 MB, matches Cloudinary raw-upload cap

/**
 * Announcement composer.
 *
 * Collapsed it is a single row that looks like the thing it becomes; expanding
 * grows the same card rather than opening a modal, so the feed you are posting
 * to stays on screen. The character counter only appears near the limit —
 * a permanent "2,000 characters left" is noise on a two-line post.
 */
export default function CreateAnnouncementForm({
  courseId, onSubmit, isLoading,
}: CreateAnnouncementFormProps) {
  const { user } = useAuthStore()
  const [expanded, setExpanded] = useState(false)
  const [content, setContent] = useState("")
  const [attachment, setAttachment] = useState<File | null>(null)
  const [attachError, setAttachError] = useState<string | null>(null)
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
    setAttachError(null)
    setExpanded(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmit()
    }
    if (e.key === "Escape") handleCancel()
  }

  const charsLeft = CHAR_LIMIT - content.length
  const nearLimit = content.length > CHAR_LIMIT * 0.9

  return (
    <div
      className={cn(
        SURFACE.card,
        "relative overflow-hidden transition-colors duration-120",
        expanded ? "border-primary/40" : "hover:border-border-strong",
      )}
    >
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center gap-2.5 bg-card/90 backdrop-blur-sm"
          >
            <InlineSpinner size={16} className="text-primary" />
            <span className="text-[13px] font-semibold text-foreground">Posting…</span>
          </motion.div>
        )}
      </AnimatePresence>

      {!expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className={cn(
            "flex w-full items-center gap-3 p-3.5 text-left transition-colors duration-120 hover:bg-muted/50",
            FOCUS,
          )}
        >
          <Avatar
            src={user?.profile?.profilePhotoUrl}
            name={user?.profile?.fullName}
            size="sm"
            className="h-9 w-9 shrink-0"
          />
          <span className="flex-1 truncate text-[13.5px] text-muted-foreground">
            Share something with your class…
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1.5 text-[12px] font-semibold text-primary">
            <Megaphone className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
            Announce
          </span>
        </button>
      )}

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: MOTION.overlay, ease: MOTION.ease }}
            className="overflow-hidden"
          >
            <div className="space-y-3 p-3.5">
              <div className="flex items-center gap-3">
                <Avatar
                  src={user?.profile?.profilePhotoUrl}
                  name={user?.profile?.fullName}
                  size="sm"
                  className="h-9 w-9 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-foreground">
                    {user?.profile?.fullName ?? "You"}
                  </p>
                  <p className="text-[11.5px] text-muted-foreground">Posting to this course</p>
                </div>
              </div>

              <Textarea
                autoFocus
                value={content}
                onChange={e => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What's on your mind? Ctrl+Enter to post."
                rows={5}
                maxLength={CHAR_LIMIT}
              />

              {nearLimit && (
                <p className="text-right text-[11.5px] font-medium text-warning">
                  {charsLeft.toLocaleString()} characters left
                </p>
              )}

              <AnimatePresence>
                {attachment && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2.5 rounded-xl border border-border bg-muted/60 px-3 py-2.5"
                  >
                    <Paperclip className="h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={ICON_STROKE} />
                    <span className="flex-1 truncate text-[12.5px] text-foreground">
                      {attachment.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAttachment(null)}
                      aria-label="Remove attachment"
                      className={cn("rounded p-0.5 text-muted-foreground transition-colors duration-120 hover:text-destructive", FOCUS)}
                    >
                      <X className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {attachError && (
                <div className="flex items-start gap-2 rounded-xl border border-destructive/25 bg-destructive-soft px-3 py-2.5 text-[12.5px] font-medium text-destructive">
                  <span className="flex-1">{attachError}</span>
                  <button
                    type="button"
                    onClick={() => setAttachError(null)}
                    aria-label="Dismiss"
                    className="shrink-0 rounded-full p-0.5 transition-opacity duration-120 hover:opacity-70"
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
                  </button>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fileRef.current?.click()}
                  leftIcon={<Paperclip strokeWidth={ICON_STROKE} />}
                >
                  Attach file
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0] ?? null
                    if (file && file.size > MAX_ATTACHMENT_BYTES) {
                      setAttachError(`"${file.name}" is ${(file.size / (1024 * 1024)).toFixed(1)}MB, which exceeds the 10MB limit.`)
                      setAttachment(null)
                      e.target.value = ""
                      return
                    }
                    setAttachError(null)
                    setAttachment(file)
                  }}
                />

                <div className="flex items-center gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSubmit}
                    disabled={!content.trim() || isLoading}
                    leftIcon={<Send strokeWidth={ICON_STROKE} />}
                  >
                    Post announcement
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
