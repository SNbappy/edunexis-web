import { FileText, Link2, Download, ExternalLink } from "lucide-react"
import { formatFileSize } from "@/utils/fileUtils"
import { getLinkHost } from "@/utils/videoEmbed"
import { ICON_STROKE } from "@/components/ui/appTokens"
import type { SubmissionDto, SubmissionAttachmentDto } from "@/types/assignment.types"

/**
 * Everything turned in for one submission.
 *
 * Reads the `attachments` list, and falls back to the legacy single
 * `fileUrl`/`linkUrl` fields for work submitted before multi-attachment support
 * existed — those rows have no attachment records, and showing nothing for them
 * would look like the submission had been lost.
 */
export default function SubmissionAttachments({ submission }: { submission: SubmissionDto }) {
  const attachments: SubmissionAttachmentDto[] =
    submission.attachments && submission.attachments.length > 0
      ? submission.attachments
      : [
          ...(submission.fileUrl
            ? [{ id: "legacy-file", kind: "File" as const, url: submission.fileUrl, fileName: null, fileSizeBytes: null }]
            : []),
          ...(submission.linkUrl
            ? [{ id: "legacy-link", kind: "Link" as const, url: submission.linkUrl, fileName: null, fileSizeBytes: null }]
            : []),
        ]

  if (attachments.length === 0) return null

  return (
    <div className="space-y-2">
      {attachments.length > 1 && (
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {attachments.length} attachments
        </p>
      )}

      {attachments.map(a => (
        <a
          key={a.id}
          href={a.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 p-3 transition-colors hover:bg-muted"
        >
          {a.kind === "Link" ? (
            <Link2 className="h-4 w-4 shrink-0 text-primary" strokeWidth={ICON_STROKE} />
          ) : (
            <FileText className="h-4 w-4 shrink-0 text-primary" strokeWidth={ICON_STROKE} />
          )}

          <span className="min-w-0 flex-1 truncate text-sm text-foreground">
            {a.kind === "Link"
              ? getLinkHost(a.url)
              : a.fileName ?? "Submitted file"}
          </span>

          {a.fileSizeBytes ? (
            <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
              {formatFileSize(a.fileSizeBytes)}
            </span>
          ) : null}

          {a.kind === "Link"
            ? <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={ICON_STROKE} />
            : <Download className="h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={ICON_STROKE} />}
        </a>
      ))}
    </div>
  )
}
