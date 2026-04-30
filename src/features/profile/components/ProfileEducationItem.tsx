import InlineSpinner from "@/components/ui/InlineSpinner"
import { useState } from "react"
import { motion } from "framer-motion"
import { Calendar, Pencil, Trash2, Loader2, GraduationCap } from "lucide-react"
import type { UserEducationDto } from "@/types/auth.types"

interface ProfileEducationItemProps {
  education:  UserEducationDto
  editable?:  boolean
  onEdit?:    (e: UserEducationDto) => void
  onDelete?:  (id: string) => Promise<void> | void
}

export default function ProfileEducationItem({
  education, editable, onEdit, onDelete,
}: ProfileEducationItemProps) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!onDelete) return
    setDeleting(true)
    try { await onDelete(education.id) }
    finally { setDeleting(false) }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{    opacity: 0, x: -10 }}
      className="group relative flex items-start gap-4 rounded-xl p-3 transition-colors hover:bg-stone-50"
    >
      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
        <GraduationCap className="h-5 w-5" strokeWidth={2} />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-display text-[15px] font-bold text-foreground">
          {education.institution}
        </h3>
        <p className="mt-0.5 text-[13px] font-medium text-teal-700">
          {education.degree} — {education.fieldOfStudy}
        </p>
        <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {education.startYear} — {education.endYear ?? "Present"}
        </p>
        {education.description && (
          <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
            {education.description}
          </p>
        )}
      </div>

      {editable && (
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onEdit?.(education)}
            aria-label="Edit education"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-stone-100 hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            aria-label="Delete education"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
          >
            {deleting
              ? <InlineSpinner />
              : <Trash2  className="h-3.5 w-3.5" />
            }
          </button>
        </div>
      )}
    </motion.article>
  )
}
