import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { FileText, Pencil, Trash2, ExternalLink, Eye, EyeOff } from "lucide-react"
import type { UserPublicationDto } from "@/types/auth.types"

interface PublicationItemProps {
  publication: UserPublicationDto
  editable?: boolean
  onEdit?: (p: UserPublicationDto) => void
  onDelete?: (id: string) => void
}

const TYPE_LABEL: Record<string, string> = {
  Journal: "Journal article",
  Conference: "Conference paper",
  Workshop: "Workshop",
  BookChapter: "Book chapter",
  Thesis: "Thesis",
  Other: "Other",
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / 1024 / 1024).toFixed(1) + " MB"
}

export default function PublicationItem({
  publication, editable = false, onEdit, onDelete,
}: PublicationItemProps) {
  const p = publication
  const typeLabel = TYPE_LABEL[p.type] ?? p.type

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-stone-300 dark:hover:border-stone-700"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* Type chip + year */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-md bg-teal-50 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
              {typeLabel}
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">{p.year}</span>
            {p.pdfUrl ? (
              <span
                className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                title={p.isPdfPublic ? "PDF is public" : "PDF is private"}
              >
                <FileText className="h-3 w-3" />
                PDF
                {p.isPdfPublic ? null : <EyeOff className="h-3 w-3 opacity-70" />}
              </span>
            ) : null}
          </div>

          {/* Title */}
          <h3 className="mt-2 font-display text-[14px] font-bold leading-snug text-foreground">
            {p.title}
          </h3>

          {/* Authors */}
          <p className="mt-1 text-[12.5px] text-muted-foreground">{p.authors}</p>

          {/* Venue */}
          {p.venue ? (
            <p className="mt-0.5 text-[12px] italic text-muted-foreground">{p.venue}</p>
          ) : null}

          {/* Links row */}
          {(p.url || p.pdfUrl) ? (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {p.url ? (
                <Link
                  to={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  reloadDocument
                  className="inline-flex items-center gap-1 text-[11.5px] font-bold text-teal-700 transition-colors hover:underline dark:text-teal-300"
                >
                  <ExternalLink className="h-3 w-3" />
                  External link
                </Link>
              ) : null}
              {p.pdfUrl ? (
                <Link
                  to={p.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  reloadDocument
                  className="inline-flex items-center gap-1 text-[11.5px] font-bold text-rose-700 transition-colors hover:underline dark:text-rose-300"
                >
                  <FileText className="h-3 w-3" />
                  Download PDF
                  {p.pdfSizeBytes ? (
                    <span className="ml-0.5 font-normal opacity-70">({formatBytes(p.pdfSizeBytes)})</span>
                  ) : null}
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Owner actions */}
        {editable ? (
          <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => onEdit?.(p)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Edit publication"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm("Delete this publication? This will also remove the attached PDF.")) {
                  onDelete?.(p.id)
                }
              }}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive-soft hover:text-destructive"
              title="Delete publication"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}
      </div>
    </motion.div>
  )
}