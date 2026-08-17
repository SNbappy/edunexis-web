import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { MessageSquare, Send, Trash2, Pencil, Check, X } from "lucide-react"
import Avatar from "@/components/ui/Avatar"
import Linkify from "@/components/ui/Linkify"
import InlineSpinner from "@/components/ui/InlineSpinner"
import { ICON_STROKE, FOCUS, MOTION } from "@/components/ui/appTokens"
import { formatRelative } from "@/utils/dateUtils"
import { cn } from "@/utils/cn"
import { useAuthStore } from "@/store/authStore"
import type { CommentDto } from "@/types/announcement.types"

const MAX = 1000

/**
 * Class comments under one announcement.
 *
 * Collapsed to a single line until there is something to read or someone wants
 * to write, because a stream of announcements each carrying an open comment box
 * is mostly empty boxes. Existing comments always show — a reply nobody sees is
 * the failure mode this feature exists to fix.
 */
export default function CommentThread({
  announcementId, comments, readOnly,
  onAdd, onDelete, onEdit, isAdding,
  emptyLabel = "Add a class comment",
}: {
  announcementId: string
  comments: CommentDto[]
  readOnly?: boolean
  onAdd: (args: { announcementId: string; content: string }) => void
  onDelete: (commentId: string) => void
  /** Omit to disable editing. */
  onEdit?: (args: { commentId: string; content: string }) => void
  isAdding?: boolean
  emptyLabel?: string
}) {
  const { user } = useAuthStore()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState("")

  // Which comment is being rewritten, and the working copy of its text.
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState("")

  // Which comment has its delete armed and is waiting for a second click.
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const startEdit = (c: CommentDto) => { setConfirmingId(null); setEditingId(c.id); setEditDraft(c.content) }
  const cancelEdit = () => { setEditingId(null); setEditDraft("") }
  const commitEdit = () => {
    const content = editDraft.trim()
    if (!content || !editingId) return
    onEdit?.({ commentId: editingId, content })
    cancelEdit()
  }

  const count = comments.length
  const canWrite = !readOnly
  const showComposer = open && canWrite

  const submit = () => {
    const content = draft.trim()
    if (!content) return
    onAdd({ announcementId, content })
    setDraft("")
  }

  // Nothing to read and nothing to write: render only the affordance, or on an
  // archived course with no comments, nothing at all.
  if (count === 0 && !canWrite) return null

  return (
    <div className="mt-3 border-t border-border pt-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-1 py-0.5 text-[12.5px] font-semibold text-muted-foreground transition-colors duration-120 hover:text-foreground",
            FOCUS,
          )}
          aria-expanded={open}
        >
          <MessageSquare className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
          {count === 0
            ? emptyLabel
            : `${count} ${count === 1 ? "comment" : "comments"}`}
        </button>
      </div>

      {/* Existing comments are shown whenever there are any, open or not —
          hiding replies behind a toggle is how they go unread. */}
      {count > 0 && (
        <ul className="mt-2.5 space-y-2.5">
          {comments.map(c => (
            <li key={c.id} className="group flex gap-2.5">
              <Avatar
                src={c.authorPhotoUrl ?? undefined}
                name={c.authorName}
                size="xs"
                className="mt-0.5 h-6 w-6 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-[12.5px] font-semibold text-foreground">
                    {c.authorName}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {formatRelative(c.createdAt)}
                  </span>
                </div>
                {editingId === c.id ? (
                  <div className="mt-1">
                    <textarea
                      value={editDraft}
                      onChange={e => setEditDraft(e.target.value.slice(0, MAX))}
                      onKeyDown={e => {
                        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commitEdit() }
                        if (e.key === "Escape") cancelEdit()
                      }}
                      rows={2}
                      autoFocus
                      className="w-full resize-none rounded-xl border border-border bg-card px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none focus:shadow-[0_0_0_3px_rgb(var(--ring)/0.18)]"
                    />
                    <div className="mt-1.5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={commitEdit}
                        disabled={!editDraft.trim()}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-[11.5px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40",
                          FOCUS,
                        )}
                      >
                        <Check className="h-3 w-3" strokeWidth={ICON_STROKE} />
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11.5px] font-semibold text-muted-foreground transition-colors hover:text-foreground",
                          FOCUS,
                        )}
                      >
                        <X className="h-3 w-3" strokeWidth={ICON_STROKE} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap break-words text-[13px] leading-relaxed text-foreground/90">
                    <Linkify>{c.content}</Linkify>
                    {c.editedAt && (
                      <span className="ml-1.5 text-[11px] italic text-muted-foreground">
                        (edited)
                      </span>
                    )}
                  </p>
                )}
              </div>

              {!readOnly && editingId !== c.id && (
                <div className={cn(
                  "flex shrink-0 items-center gap-0.5 transition-opacity duration-120 focus-within:opacity-100 group-hover:opacity-100",
                  // An armed delete must stay on screen even if the pointer leaves.
                  confirmingId === c.id ? "opacity-100" : "opacity-0",
                )}>
                  {/* Authors edit their own words; a teacher can remove a
                      comment but never rewrite one in someone else's name. */}
                  {c.canEdit && onEdit && (
                    <button
                      type="button"
                      onClick={() => startEdit(c)}
                      aria-label="Edit comment"
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                        FOCUS,
                      )}
                    >
                      <Pencil className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
                    </button>
                  )}
                  {/* Deleting is permanent, so the first click only arms it.
                      A stray tap on a hover-revealed icon should not silently
                      destroy someone's question. */}
                  {c.canDelete && (
                    confirmingId === c.id ? (
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => { setConfirmingId(null); onDelete(c.id) }}
                          aria-label="Confirm delete comment"
                          className={cn(
                            "rounded-lg bg-destructive-soft px-2 py-1 text-[11px] font-bold text-destructive transition-colors hover:bg-destructive hover:text-white",
                            FOCUS,
                          )}
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingId(null)}
                          aria-label="Cancel delete comment"
                          className={cn(
                            "flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                            FOCUS,
                          )}
                        >
                          <X className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmingId(c.id)}
                        aria-label="Delete comment"
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive-soft hover:text-destructive",
                          FOCUS,
                        )}
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
                      </button>
                    )
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <AnimatePresence initial={false}>
        {showComposer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18, ease: MOTION.ease }}
            className="overflow-hidden"
          >
            <div className="mt-3 flex gap-2.5">
              <Avatar
                src={user?.profile?.profilePhotoUrl ?? undefined}
                name={user?.profile?.fullName ?? "You"}
                size="xs"
                className="mt-1 h-6 w-6 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <textarea
                  value={draft}
                  onChange={e => setDraft(e.target.value.slice(0, MAX))}
                  onKeyDown={e => {
                    // Enter sends, Shift+Enter breaks the line — the behaviour
                    // people already have in every messaging app.
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      submit()
                    }
                  }}
                  rows={2}
                  autoFocus
                  placeholder="Add a class comment…"
                  className="w-full resize-none rounded-xl border border-border bg-card px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground transition-all focus:border-primary focus:outline-none focus:shadow-[0_0_0_3px_rgb(var(--ring)/0.18)]"
                />
                <div className="mt-1.5 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-muted-foreground">
                    {draft.length > MAX - 100 ? `${MAX - draft.length} left` : "Enter to post"}
                  </span>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={!draft.trim() || isAdding}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[12.5px] font-semibold text-primary-foreground transition-opacity duration-120 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40",
                      FOCUS,
                    )}
                  >
                    {isAdding
                      ? <InlineSpinner size={13} />
                      : <Send className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />}
                    Post
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
