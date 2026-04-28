import { motion } from "framer-motion"
import { FolderOpen, Folder, FileText } from "lucide-react"
import MaterialCard from "./MaterialCard"
import type { MaterialDto } from "@/types/material.types"

interface MaterialsListProps {
  materials: MaterialDto[]
  courseId: string
  isFlattenMode?: boolean
  onDelete?: (id: string) => void
  onOpenFolder?: (id: string, label: string) => void
}

interface SectionLabelProps {
  icon: React.ReactNode
  label: string
  count: number
}

function SectionLabel({ icon, label, count }: SectionLabelProps) {
  return (
    <div className="mb-2.5 flex items-center gap-2 px-1">
      <div className="flex text-muted-foreground">{icon}</div>
      <span className="text-[10.5px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
        {count}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}

export default function MaterialsList({
  materials, courseId, isFlattenMode, onDelete, onOpenFolder,
}: MaterialsListProps) {
  if (materials.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 px-6 py-16 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-200 bg-teal-50 dark:border-teal-800 dark:bg-teal-950/50">
          <FolderOpen className="h-7 w-7 text-teal-600 dark:text-teal-400" strokeWidth={1.5} />
        </div>
        <h3 className="mt-5 font-display text-[16px] font-bold text-foreground">
          No materials here yet
        </h3>
        <p className="mt-1 max-w-xs text-[13px] text-muted-foreground">
          Upload files, create folders, or share links so students can access course content.
        </p>
      </motion.div>
    )
  }

  /* Flatten mode: all rendered as a single flat list of files. */
  if (isFlattenMode) {
    return (
      <div className="space-y-2">
        <SectionLabel
          icon={<FileText className="h-3.5 w-3.5" />}
          label="All files"
          count={materials.length}
        />
        {materials.map((m, i) => (
          <MaterialCard
            key={m.id}
            material={m}
            index={i}
            courseId={courseId}
            onDelete={onDelete}
          />
        ))}
      </div>
    )
  }

  /* Default: split into folders + files sections. */
  const folders = materials.filter(m => m.type === "Folder")
  const files = materials.filter(m => m.type !== "Folder")

  return (
    <div className="space-y-5">
      {folders.length > 0 && (
        <section>
          <SectionLabel
            icon={<Folder className="h-3.5 w-3.5" />}
            label="Folders"
            count={folders.length}
          />
          <div className="space-y-2">
            {folders.map((m, i) => (
              <MaterialCard
                key={m.id}
                material={m}
                index={i}
                courseId={courseId}
                onDelete={onDelete}
                onOpenFolder={onOpenFolder}
              />
            ))}
          </div>
        </section>
      )}

      {files.length > 0 && (
        <section>
          <SectionLabel
            icon={<FileText className="h-3.5 w-3.5" />}
            label="Files & links"
            count={files.length}
          />
          <div className="space-y-2">
            {files.map((m, i) => (
              <MaterialCard
                key={m.id}
                material={m}
                index={i}
                courseId={courseId}
                onDelete={onDelete}
                onOpenFolder={onOpenFolder}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}