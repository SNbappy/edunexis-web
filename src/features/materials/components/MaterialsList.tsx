import { motion } from "framer-motion"
import { FolderOpen, Folder, FileText } from "lucide-react"
import MaterialCard from "./MaterialCard"
import MaterialTile from "./MaterialTile"
import type { MaterialDto } from "@/types/material.types"

interface MaterialsListProps {
  materials: MaterialDto[]
  courseId: string
  isFlattenMode?: boolean
  onDelete?: (id: string) => void
  onOpenFolder?: (id: string, label: string) => void
  /** Opens the preview modal. MaterialsTab has always passed this, but it was
   *  missing from the props type and never forwarded to the cards, so the
   *  preview simply never opened. */
  onPreview?: (material: MaterialDto) => void
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

/* Files and links render as tiles in a grid; folders stay as rows.
   A folder is navigation — a compact row you scan and click through — while a
   file is content, and content is easier to recognise by its thumbnail than by
   a filename stretched across a 1200px band. */
export default function MaterialsList({
  materials, courseId, isFlattenMode, onDelete, onOpenFolder, onPreview,
}: MaterialsListProps) {
  if (materials.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 px-6 py-16 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
          <FolderOpen className="h-7 w-7 text-primary" strokeWidth={1.5} />
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
      <div>
        <SectionLabel
          icon={<FileText className="h-3.5 w-3.5" />}
          label="All files"
          count={materials.length}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {materials.map((m, i) => (
            <MaterialTile
              key={m.id}
              material={m}
              index={i}
              onDelete={onDelete}
              onPreview={onPreview}
            />
          ))}
        </div>
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
                onPreview={onPreview}
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {files.map((m, i) => (
              <MaterialTile
                key={m.id}
                material={m}
                index={i}
                onDelete={onDelete}
                onPreview={onPreview}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
