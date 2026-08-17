import { useState } from "react"
import { Send, Clock, Award, Link2, X, Plus, FileText, Paperclip } from "lucide-react"
import Modal from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import FileDropzone from "@/components/ui/FileDropzone"
import Linkify from "@/components/ui/Linkify"
import { formatDateTime } from "@/utils/dateUtils"
import { normaliseUrl } from "@/utils/videoEmbed"
import { FOCUS, ICON_STROKE } from "@/components/ui/appTokens"
import { cn } from "@/utils/cn"
import type { AssignmentDto, SubmitAssignmentRequest } from "@/types/assignment.types"

interface SubmitAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  assignment: AssignmentDto
  onSubmit: (d: SubmitAssignmentRequest) => void
  isLoading?: boolean
}

/**
 * Turning work in.
 *
 * Rebuilt around the fact that one piece of work is usually several things: a
 * report, the code it describes, and a link to a demo. The old version was a
 * tab switch — file *or* text — and although the dropzone collected an array it
 * submitted `files[0]`, so a student who attached three files silently turned in
 * one and had no way to tell.
 *
 * Files, links and a written note now combine in a single submission rather
 * than being mutually exclusive modes.
 */
export default function SubmitAssignmentModal({
  isOpen, onClose, assignment, onSubmit, isLoading,
}: SubmitAssignmentModalProps) {
  const [files, setFiles] = useState<File[]>([])
  const [links, setLinks] = useState<string[]>([])
  const [linkDraft, setLinkDraft] = useState("")
  const [textContent, setTextContent] = useState("")

  const reset = () => { setFiles([]); setLinks([]); setLinkDraft(""); setTextContent("") }
  const handleClose = () => { reset(); onClose() }

  const hasText = textContent.trim().length > 0
  const canSubmit = files.length > 0 || links.length > 0 || hasText

  const addLink = () => {
    const url = normaliseUrl(linkDraft.trim())
    if (!url) return
    if (links.includes(url)) { setLinkDraft(""); return }
    setLinks(l => [...l, url])
    setLinkDraft("")
  }

  const handleSubmit = () => {
    if (!canSubmit) return
    /* The type still describes the *primary* nature of the submission, because
       the API and the existing views key off it — but every attachment goes
       regardless of which one it is. */
    const submissionType =
      files.length > 0 ? "File" : links.length > 0 ? "Link" : "Text"

    onSubmit({
      submissionType,
      textContent: hasText ? textContent : undefined,
      files,
      linkUrls: links,
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Submit assignment"
      size="lg"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || !!isLoading}
            loading={isLoading}
            leftIcon={<Send strokeWidth={ICON_STROKE} />}
          >
            Submit assignment
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* What is being answered */}
        <div className="space-y-2 rounded-2xl border border-primary/25 bg-primary-soft p-4">
          <p className="font-display text-[13.5px] font-bold text-foreground">
            {assignment.title}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-primary">
              <Clock className="h-3 w-3" />
              Due: {formatDateTime(assignment.deadline)}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
              <Award className="h-3 w-3" />
              {assignment.maxMarks} marks
            </span>
          </div>
          {assignment.instructions && (
            <p className="border-t border-primary/25 pt-2 text-[11.5px] leading-relaxed text-muted-foreground">
              <Linkify>{assignment.instructions}</Linkify>
            </p>
          )}
        </div>

        {/* Files */}
        <section>
          <h3 className="mb-2 inline-flex items-center gap-1.5 text-[12px] font-bold text-foreground">
            <Paperclip className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={ICON_STROKE} />
            Files
            <span className="font-normal text-muted-foreground">(optional)</span>
          </h3>

          {/* Replace, never append: FileDropzone keeps its own list and hands
              back the full accumulated set on every change, so appending counted
              each file again on the next pick. */}
          <FileDropzone
            onFilesSelected={setFiles}
            multiple
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.txt,.py,.java,.cpp,.c,.cs,.js,.ts,.png,.jpg,.jpeg"
          />

        </section>

        {/* Links */}
        <section>
          <h3 className="mb-2 inline-flex items-center gap-1.5 text-[12px] font-bold text-foreground">
            <Link2 className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={ICON_STROKE} />
            Links
            <span className="font-normal text-muted-foreground">(optional)</span>
          </h3>

          <div className="flex gap-2">
            <input
              value={linkDraft}
              onChange={e => setLinkDraft(e.target.value)}
              onKeyDown={e => {
                // Enter adds the link rather than submitting the whole form —
                // otherwise typing a URL and pressing Enter turns the work in.
                if (e.key === "Enter") { e.preventDefault(); addLink() }
              }}
              placeholder="github.com/you/project, a Drive link, a deployed demo…"
              className="min-w-0 flex-1 rounded-xl border border-border bg-card px-3 py-2 text-[12.5px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:shadow-[0_0_0_3px_rgb(var(--ring)/0.18)]"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={addLink}
              disabled={!linkDraft.trim()}
              leftIcon={<Plus strokeWidth={ICON_STROKE} />}
            >
              Add
            </Button>
          </div>

          {links.length > 0 && (
            <ul className="mt-2 space-y-1.5">
              {links.map((l, i) => (
                <li
                  key={l}
                  className="flex items-center gap-2.5 rounded-xl border border-border bg-muted/40 px-3 py-2"
                >
                  <Link2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={ICON_STROKE} />
                  <span className="min-w-0 flex-1 truncate text-[12.5px] text-foreground">{l}</span>
                  <button
                    type="button"
                    onClick={() => setLinks(prev => prev.filter((_, idx) => idx !== i))}
                    aria-label={`Remove ${l}`}
                    className={cn(
                      "shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-destructive-soft hover:text-destructive",
                      FOCUS,
                    )}
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Written answer / note */}
        <section>
          <h3 className="mb-2 inline-flex items-center gap-1.5 text-[12px] font-bold text-foreground">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={ICON_STROKE} />
            Written answer
            <span className="font-normal text-muted-foreground">(optional)</span>
          </h3>
          <textarea
            value={textContent}
            onChange={e => setTextContent(e.target.value)}
            rows={5}
            placeholder="Type your answer, or add a note for your teacher…"
            className="w-full resize-none rounded-xl border border-border bg-muted/40 px-4 py-3 text-[13px] text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:shadow-[0_0_0_3px_rgb(var(--ring)/0.18)]"
          />
          <p className="mt-1 text-right text-[11px] text-muted-foreground">
            {textContent.length} characters
          </p>
        </section>

        {!canSubmit && (
          <p className="text-[12px] text-muted-foreground">
            Attach at least one file, link or written answer.
          </p>
        )}
      </div>
    </Modal>
  )
}
