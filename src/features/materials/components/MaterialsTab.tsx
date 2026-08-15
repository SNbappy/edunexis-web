import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FolderPlus, Upload, Search, Filter, X, Link2 } from "lucide-react"
import MaterialsList from "./MaterialsList"
import MaterialsBreadcrumb from "./MaterialsBreadcrumb"
import UploadMaterialModal from "./UploadMaterialModal"
import CreateFolderModal from "./CreateFolderModal"
import AddLinkModal from "./AddLinkModal"
import MaterialPreviewModal from "./MaterialPreviewModal"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { ICON_STROKE, FOCUS } from "@/components/ui/appTokens"
import { cn } from "@/utils/cn"
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

/**
 * File-type filters.
 *
 * Each of the seven previously carried its own colour — red PDF, amber slides,
 * blue doc, violet image — as border, background, text and a leading dot. Seven
 * palettes for what is a single "pick one" control, and the colours only
 * appeared once selected, so they taught the reader nothing while browsing.
 * One selected treatment now, matching every other filter row in the app.
 */
const FILE_FILTERS: { label: string; value: FileTypeFilter }[] = [
  { label: "All",    value: "all" },
  { label: "PDF",    value: "pdf" },
  { label: "Slides", value: "presentation" },
  { label: "Doc",    value: "document" },
  { label: "Image",  value: "image" },
  { label: "Link",   value: "link" },
  { label: "Other",  value: "other" },
]

export default function MaterialsTab({ courseId }: MaterialsTabProps) {
  const { user } = useAuthStore()
  const teacher = isTeacher(user?.role ?? "Student")

  const {
    materials, isLoading, breadcrumb, openFolder, navigateTo,
    createFolder, isCreatingFolder,
    uploadFile, isUploading,
    addLink, isAddingLink,
    deleteMaterial, isDeleting,
    sortMode, setSortMode,
    isFlattenMode, fileTypeFilter, setFileTypeFilter,
  } = useMaterials(courseId)

  const [uploadOpen, setUploadOpen] = useState(false)
  const [folderOpen, setFolderOpen] = useState(false)
  const [linkOpen, setLinkOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [previewMaterial, setPreviewMaterial] = useState<MaterialDto | null>(null)

  const filtered = materials.filter((m: any) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  )

  const currentFolderId = breadcrumb[breadcrumb.length - 1]?.id ?? null

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            {breadcrumb.length > 1 && !isFlattenMode ? (
              <MaterialsBreadcrumb items={breadcrumb} onNavigate={navigateTo} />
            ) : (
              <p className="text-[13px] text-muted-foreground">
                {isFlattenMode ? "All files" : "Course materials"}
              </p>
            )}
          </div>

          {teacher && (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => setFolderOpen(true)}
                leftIcon={<FolderPlus strokeWidth={ICON_STROKE} />}
              >
                New folder
              </Button>
              <Button
                variant="secondary"
                onClick={() => setLinkOpen(true)}
                leftIcon={<Link2 strokeWidth={ICON_STROKE} />}
              >
                Add link
              </Button>
              <Button onClick={() => setUploadOpen(true)} leftIcon={<Upload strokeWidth={ICON_STROKE} />}>
                Upload
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search materials…"
              leftIcon={<Search strokeWidth={ICON_STROKE} />}
              className={search ? "pr-9" : undefined}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className={cn(
                  "absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground transition-colors duration-120 hover:text-foreground",
                  FOCUS,
                )}
              >
                <X className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-0.5 rounded-xl border border-border bg-muted p-0.5">
            {SORT_TABS.map(tab => {
              const active = sortMode === tab.value
              return (
                <button
                  type="button"
                  key={tab.value}
                  onClick={() => setSortMode(tab.value as any)}
                  aria-pressed={active}
                  className={cn(
                    "h-8 rounded-[9px] px-3 text-[12.5px] font-semibold transition-colors duration-120",
                    FOCUS,
                    active
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
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
            <div className="flex flex-wrap items-center gap-1.5 px-1">
              <Filter className="h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={ICON_STROKE} />
              {FILE_FILTERS.map(opt => {
                const active = fileTypeFilter === opt.value
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setFileTypeFilter(opt.value)}
                    aria-pressed={active}
                    className={cn(
                      "inline-flex h-7 items-center rounded-lg border px-2.5 text-[12px] font-semibold transition-colors duration-120",
                      FOCUS,
                      active
                        ? "border-primary/25 bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-border-strong hover:text-foreground",
                    )}
                  >
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

      <AddLinkModal
        isOpen={linkOpen}
        onClose={() => setLinkOpen(false)}
        onSubmit={(data) =>
          addLink(data, { onSuccess: () => setLinkOpen(false) } as any)
        }
        isLoading={isAddingLink}
      />

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
        /* Link materials carry their URL in `embedUrl` and have no file, so
           fall back to it — otherwise the player receives an empty string. */
        fileUrl={previewMaterial?.fileUrl || previewMaterial?.embedUrl || ""}
        fileName={previewMaterial?.fileName ?? previewMaterial?.title ?? ""}
        fileSizeBytes={previewMaterial?.fileSizeBytes ?? undefined}
      />
    </div>
  )
}