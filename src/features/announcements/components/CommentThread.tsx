import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { MessageSquare, Send, Trash2, Pencil, Check, X, CornerDownRight } from "lucide-react"
import Avatar from "@/components/ui/Avatar"
import UserLink from "@/components/ui/UserLink"
import Linkify from "@/components/ui/Linkify"
import InlineSpinner from "@/components/ui/InlineSpinner"
import RowMenu from "@/components/ui/RowMenu"
import { ICON_STROKE, FOCUS, MOTION } from "@/components/ui/appTokens"
import { formatRelative } from "@/utils/dateUtils"
import { cn } from "@/utils/cn"
import { useAuthStore } from "@/store/authStore"
import type { CommentDto } from "@/types/announcement.types"

const MAX = 1000

interface AddArgs {
  announcementId: string
  content: string
  /** Set to answer an existing comment. */
  parentCommentId?: string
}

/**
 * Class comments under one announcement or assignment.
 *
 * Collapsed to a single line until there is something to read or someone wants
 * to write, because a stream of announcements each carrying an open comment box
 * is mostly empty boxes. Existing comments always show — a reply nobody sees is
 * the failure mode this feature exists to fix.
 *
 * Threads are one level deep. A flat list could not say which of five questions
 * an answer belonged to, which is exactly what class threads are made of; full
 * nesting would trade that for a tree that indents off the side of a phone. One
 * level answers "who is this to" and stops there — the server flattens a reply
 * to a reply onto the same root, so the shape here is guaranteed.
 */
export default function CommentThread({
  announcementId, comments, readOnly,
  onAdd, onDelete, onEdit, isAdding,
  emptyLabel = "Add a class comment",
}: {
  announcementId: string
  comments: CommentDto[]
  readOnly?: boolean
  onAdd: (args: AddArgs) => void
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

  // Which comment is being answered, and the working copy of the reply.
  const [replyToId, setReplyToId] = useState<string | null>(null)
  const [replyDraft, setReplyDraft] = useState("")

  /* A notification about a comment links straight to it as
     `#comment-<id>`. Landing on the announcement and leaving the reader to
     find the reply themselves is barely better than not linking at all, so
     the thread opens itself, scrolls the comment into view and marks it. */
  const [highlightId, setHighlightId] = useState<string | null>(null)

  useEffect(() => {
    const target = window.location.hash.match(/^#comment-(.+)$/)?.[1]
    if (!target || !comments.some(c => c.id === target)) return

    setOpen(true)
    setHighlightId(target)

    const el = document.getElementById(`comment-${target}`)
    el?.scrollIntoView({ behavior: "smooth", block: "center" })

    // The tint is a pointer, not a permanent state — it fades once the reader
    // has plainly found the thing they were sent to.
    const t = setTimeout(() => setHighlightId(null), 2600)
    return () => clearTimeout(t)
  }, [comments])

  /* Roots in time order, each followed by its own replies in time order.
     A reply whose parent has been deleted is promoted to a root rather than
     dropped — moderating one comment must not silently take unrelated answers
     down with it. */
  const threads = useMemo(() => {
    const byTime = [...comments].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
    const ids = new Set(byTime.map(c => c.id))
    const roots = byTime.filter(c => !c.parentCommentId || !ids.has(c.parentCommentId))

    return roots.map(root => ({
      root,
      replies: byTime.filter(c => c.parentCommentId === root.id),
    }))
  }, [comments])

  const startEdit = (c: CommentDto) => {
    setReplyToId(null)
    setEditingId(c.id)
    setEditDraft(c.content)
  }
  const cancelEdit = () => { setEditingId(null); setEditDraft("") }
  const commitEdit = () => {
    const content = editDraft.trim()
    if (!content || !editingId) return
    onEdit?.({ commentId: editingId, content })
    cancelEdit()
  }

  const startReply = (c: CommentDto) => {
    setEditingId(null)
    setReplyToId(c.id)
    setReplyDraft("")
    setOpen(true)
  }
  const cancelReply = () => { setReplyToId(null); setReplyDraft("") }
  const commitReply = () => {
    const content = replyDraft.trim()
    if (!content || !replyToId) return
    onAdd({ announcementId, content, parentCommentId: replyToId })
    cancelReply()
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

  const renderComment = (c: CommentDto, isReply: boolean) => (
    <li
      key={c.id}
      id={`comment-${c.id}`}
      className={cn(
        "group flex items-start gap-2.5 rounded-xl transition-colors duration-500",
        highlightId === c.id && "bg-primary-soft ring-1 ring-primary/30 -mx-2 px-2 py-1.5",
      )}
    >
      <UserLink
        userId={c.authorId}
        name={c.authorName}
        photoUrl={c.authorPhotoUrl ?? null}
        avatarSize="xs"
        avatarClassName={cn("shrink-0", isReply ? "h-5 w-5" : "h-6 w-6")}
        avatarOnly
        className="mt-0.5 shrink-0"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <UserLink
            userId={c.authorId}
            name={c.authorName}
            photoUrl={c.authorPhotoUrl ?? null}
            avatarOnly={false}
            avatarSize="xs"
            avatarClassName="hidden"
            nameClassName="text-[12.5px] font-semibold text-foreground"
          />
          {isReply && c.replyToName && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <CornerDownRight className="h-3 w-3" strokeWidth={ICON_STROKE} />
              {c.replyToName}
            </span>
          )}
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
          <>
            <p className="whitespace-pre-wrap break-words text-[13px] leading-relaxed text-foreground/90">
              <Linkify>{c.content}</Linkify>
              {c.editedAt && (
                <span className="ml-1.5 text-[11px] italic text-muted-foreground">
                  (edited)
                </span>
              )}
            </p>

            {canWrite && replyToId !== c.id && (
              <button
                type="button"
                onClick={() => startReply(c)}
                className={cn(
                  "mt-1 inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-[11.5px] font-semibold text-muted-foreground transition-colors hover:text-primary",
                  FOCUS,
                )}
              >
                <CornerDownRight className="h-3 w-3" strokeWidth={ICON_STROKE} />
                Reply
              </button>
            )}
          </>
        )}

        {/* The reply box opens under the comment it answers, so the target is
            never in doubt — the whole reason for having replies at all. */}
        {replyToId === c.id && (
          <div className="mt-2 flex items-start gap-2">
            <Avatar
              src={user?.profile?.profilePhotoUrl ?? undefined}
              name={user?.profile?.fullName ?? "You"}
              size="xs"
              className="mt-1 h-5 w-5 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <textarea
                value={replyDraft}
                onChange={e => setReplyDraft(e.target.value.slice(0, MAX))}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commitReply() }
                  if (e.key === "Escape") cancelReply()
                }}
                rows={2}
                autoFocus
                placeholder={`Reply to ${c.authorName}…`}
                className="w-full resize-none rounded-xl border border-border bg-card px-3 py-2 text-[12.5px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:shadow-[0_0_0_3px_rgb(var(--ring)/0.18)]"
              />
              <div className="mt-1.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={commitReply}
                  disabled={!replyDraft.trim() || isAdding}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-[11.5px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40",
                    FOCUS,
                  )}
                >
                  {isAdding
                    ? <InlineSpinner size={12} />
                    : <Send className="h-3 w-3" strokeWidth={ICON_STROKE} />}
                  Reply
                </button>
                <button
                  type="button"
                  onClick={cancelReply}
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
          </div>
        )}
      </div>

      {/* One "…" rather than a row of hover-revealed icons: those never
          appear on a touch screen, and edit-plus-delete already crowded
          the right edge of a narrow comment. */}
      {!readOnly && editingId !== c.id && (
        <RowMenu
          label={`Actions for ${c.authorName}'s comment`}
          items={[
            ...(c.canEdit && onEdit
              ? [{
                  label: "Edit",
                  icon: <Pencil className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />,
                  onSelect: () => startEdit(c),
                }]
              : []),
            ...(c.canDelete
              ? [{
                  label: "Delete",
                  icon: <Trash2 className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />,
                  onSelect: () => onDelete(c.id),
                  danger: true,
                }]
              : []),
          ]}
        />
      )}
    </li>
  )

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
          {threads.map(({ root, replies }) => (
            <li key={root.id}>
              <ul>{renderComment(root, false)}</ul>

              {replies.length > 0 && (
                /* The rail, rather than indentation alone: on a narrow card an
                   indent of a few pixels is not readable as "these belong to
                   that", and a deeper one costs the reply most of its width. */
                <ul className="ml-3 mt-2 space-y-2.5 border-l-2 border-border pl-3">
                  {replies.map(r => renderComment(r, true))}
                </ul>
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
