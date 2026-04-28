import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FolderPlus, Upload, Search, Filter, X } from "lucide-react"
import MaterialsList from "./MaterialsList"
import MaterialsBreadcrumb from "./MaterialsBreadcrumb"
import UploadMaterialModal from "./UploadMaterialModal"
import CreateFolderModal from "./CreateFolderModal"
import MaterialPreviewModal from "./MaterialPreviewModal"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import { useMaterials } from "../hooks/useMaterials"
import type { FileTypeFilter } from "../hooks/useMaterials"
import { useAuthStore } from "@/store/authStore"
import { isTeacher } from "@/utils/roleGuard"
import type { MaterialDto } from "@/types/material.types"

interface MaterialsTabProps {
  courseId: string
}

const SORT_TABS = [
  { label: "All", value: "all" },
  { label: "Folders", value: "Folder" },
  { label: "Files", value: "File" },
] as const

interface FileFilterOption {
  label: string
  value: FileTypeFilter
  active: string
  dotColor: string
}

const FILE_FILTERS: FileFilterOption[] = [
  { label: "All", value: "all", active: "border-teal-300 bg-teal-50 text-teal-700 dark:border-teal-700 dark:bg-teal-950/50 dark:text-teal-300", dotColor: "bg-teal-500" },
  { label: "PDF", value: "pdf", active: "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300", dotColor: "bg-red-500" },
  { label: "Slides", value: "presentation", active: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300", dotColor: "bg-amber-500" },
  { label: "Doc", value: "document", active: "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300", dotColor: "bg-blue-500" },
  { label: "Image", value: "image", active: "border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-300", dotColor: "bg-violet-500" },
  { label: "Link", value: "link", active: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300", dotColor: "bg-emerald-500" },
  { label: "Other", value: "other", active: "border-stone-300 bg-stone-100 text-stone-700 dark:border-stone-700 dark:bg-stone-900/40 dark:text-stone-300", dotColor: "bg-stone-500" },
]

export default function MaterialsTab({ courseId }: MaterialsTabProps) {
  const { user } = useAuthStore()
  const teacher = isTeacher(user?.role ?? "Student")

  const {
    materials, isLoading, breadcrumb, openFolder, navigateTo,
    createFolder, isCreatingFolder,
    uploadFile, isUploading,
    deleteMaterial, isDeleting,
    sortMode, setSortMode,
    isFlattenMode, fileTypeFilter, setFileTypeFilter,
  } = useMaterials(courseId)

  const [uploadOpen, setUploadOpen] = useState(false)
  const [folderOpen, setFolderOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [previewMaterial, setPreviewMaterial] = useState<MaterialDto | null>(null)

  const filtered = materials.filter((m: any) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  )

  const currentFolderId = breadcrumb[breadcrumb.length - 1]?.id ?? null

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            {breadcrumb.length > 1 && !isFlattenMode ? (
              <MaterialsBreadcrumb items={breadcrumb} onNavigate={navigateTo} />
            ) : (
              <h2 className="font-display text-[15px] font-bold text-foreground">
                {isFlattenMode ? "All files" : "Course materials"}
              </h2>
            )}
          </div>

          {teacher && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFolderOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-2 text-[12px] font-semibold text-foreground transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 dark:hover:border-teal-700 dark:hover:bg-teal-950/30 dark:hover:text-teal-300"
              >
                <FolderPlus className="h-3.5 w-3.5" />
                New folder
              </button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setUploadOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-2 text-[12.5px] font-bold text-white shadow-sm transition-colors hover:bg-teal-700"
              >
                <Upload className="h-3.5 w-3.5" />
                Upload
              </motion.button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search materials…"
              className="h-9 w-full rounded-xl border border-border bg-muted/50 pl-9 pr-9 text-[13px] font-medium text-foreground placeholder:text-muted-foreground transition-all focus:border-teal-600 focus:bg-card focus:outline-none focus:ring-2 focus:ring-teal-600/30"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-0.5 rounded-xl border border-border bg-muted/50 p-1">
            {SORT_TABS.map(tab => {
              const active = sortMode === tab.value
              return (
                <button
                  type="button"
                  key={tab.value}
                  onClick={() => setSortMode(tab.value as any)}
                  className={
                    "rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all " +
                    (active
                      ? "bg-card text-teal-700 shadow-sm dark:text-teal-300"
                      : "text-muted-foreground hover:text-foreground")
                  }
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isFlattenMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap items-center gap-2 px-1">
              <Filter className="h-3 w-3 shrink-0 text-muted-foreground" />
              {FILE_FILTERS.map(opt => {
                const active = fileTypeFilter === opt.value
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setFileTypeFilter(opt.value)}
                    className={
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold transition-all " +
                      (active
                        ? opt.active
                        : "border-border bg-card text-muted-foreground hover:border-stone-300 hover:text-foreground dark:hover:border-stone-700")
                    }
                  >
                    <span className={"h-1.5 w-1.5 rounded-full " + opt.dotColor} />
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : (
        <MaterialsList
          materials={filtered}
          courseId={courseId}
          isFlattenMode={isFlattenMode}
          onDelete={teacher ? id => setDeleteId(id) : undefined}
          onOpenFolder={openFolder}
          onPreview={(m) => setPreviewMaterial(m)}
        />
      )}

      <UploadMaterialModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploadFile={(payload: any) =>
          uploadFile({ ...payload, folderId: currentFolderId } as any, {
            onSuccess: () => setUploadOpen(false),
          } as any)
        }
        isUploading={isUploading}
      />

      <CreateFolderModal
        isOpen={folderOpen}
        onClose={() => setFolderOpen(false)}
        onSubmit={(data: { title: string; description?: string }) =>
          createFolder(
            { ...data, parentFolderId: currentFolderId } as any,
            { onSuccess: () => setFolderOpen(false) } as any,
          )
        }
        isLoading={isCreatingFolder}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteMaterial(deleteId, { onSuccess: () => setDeleteId(null) } as any)
        }}
        title="Delete this item?"
        description="This will permanently remove the material. This action cannot be undone."
        confirmLabel="Delete"
        isLoading={isDeleting}
      />

      <MaterialPreviewModal
        isOpen={!!previewMaterial}
        onClose={() => setPreviewMaterial(null)}
        fileUrl={previewMaterial?.fileUrl ?? ""}
        fileName={previewMaterial?.fileName ?? previewMaterial?.title ?? ""}
        fileSizeBytes={previewMaterial?.fileSizeBytes ?? undefined}
      />
    </div>
  )
}