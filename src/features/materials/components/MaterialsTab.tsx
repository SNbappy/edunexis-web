import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FolderPlus, Upload, Search, BookOpen, Filter, X } from "lucide-react"
import MaterialsList from "./MaterialsList"
import MaterialsBreadcrumb from "./MaterialsBreadcrumb"
import UploadMaterialModal from "./UploadMaterialModal"
import CreateFolderModal from "./CreateFolderModal"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import { useMaterials } from "../hooks/useMaterials"
import type { FileTypeFilter } from "../hooks/useMaterials"
import { useAuthStore } from "@/store/authStore"
import { useThemeStore } from "@/store/themeStore"
import { isTeacher } from "@/utils/roleGuard"

interface Props { courseId: string }

const SORT_TABS = [
  { label: "All",     value: "all"    },
  { label: "Folders", value: "Folder" },
  { label: "Files",   value: "File"   },
] as const

const FILE_FILTERS: { label: string; value: FileTypeFilter; color: string }[] = [
  { label: "All Files",    value: "all",          color: "#6366f1" },
  { label: "PDF",          value: "pdf",          color: "#ef4444" },
  { label: "Presentation", value: "presentation", color: "#d97706" },
  { label: "Document",     value: "document",     color: "#0891b2" },
  { label: "Image",        value: "image",        color: "#7c3aed" },
  { label: "Links",        value: "link",         color: "#059669" },
  { label: "Other",        value: "other",        color: "#6b7280" },
]

export default function MaterialsTab({ courseId }: Props) {
  const { user }  = useAuthStore()
  const { dark }  = useThemeStore()
  const teacher   = isTeacher(user?.role ?? "Student")

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
  const [deleteId,   setDeleteId]   = useState<string | null>(null)
  const [search,     setSearch]     = useState("")

  const filtered = materials.filter((m: any) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  )

  // Theme
  const cardBg   = dark ? "rgba(16,24,44,0.75)" : "rgba(255,255,255,0.92)"
  const blur     = "blur(20px)"
  const border   = dark ? "rgba(99,102,241,0.15)" : "#e5e7eb"
  const textMain = dark ? "#e2e8f8" : "#111827"
  const textSub  = dark ? "#8896c8" : "#6b7280"
  const inputBg  = dark ? "rgba(255,255,255,0.04)" : "#f9fafb"
  const inputBorder = dark ? "rgba(99,102,241,0.2)" : "#e5e7eb"

  return (
    <div className="space-y-4 max-w-3xl mx-auto">

      {/* Toolbar */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-4"
        style={{ background: cardBg, backdropFilter: blur, WebkitBackdropFilter: blur, border: `1px solid ${border}` }}>

        {/* Top row */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: dark ? "rgba(217,119,6,0.15)" : "#fffbeb", border: dark ? "1px solid rgba(217,119,6,0.25)" : "1px solid #fde68a" }}>
              <BookOpen style={{ width: 16, height: 16, color: "#d97706" }} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold" style={{ color: textMain }}>Materials</h2>
              {!isFlattenMode
                ? <MaterialsBreadcrumb items={breadcrumb} onNavigate={navigateTo} />
                : <p className="text-[11px]" style={{ color: textSub }}>Showing all files across folders</p>
              }
            </div>
          </div>
          {teacher && (
            <div className="flex items-center gap-2">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => setFolderOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold"
                style={{ background: dark ? "rgba(217,119,6,0.12)" : "#fffbeb", border: dark ? "1px solid rgba(217,119,6,0.25)" : "1px solid #fde68a", color: "#d97706" }}>
                <FolderPlus style={{ width: 13, height: 13 }} /> New Folder
              </motion.button>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => setUploadOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-bold text-white"
                style={{ background: "linear-gradient(135deg,#6366f1,#0891b2)", boxShadow: "0 4px 16px rgba(99,102,241,0.35)" }}>
                <Upload style={{ width: 13, height: 13 }} /> Upload
              </motion.button>
            </div>
          )}
        </div>

        {/* Search + sort */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: textSub, pointerEvents: "none" }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search materials..."
              className="w-full h-9 pl-9 pr-4 rounded-xl text-[13px] font-medium transition-all outline-none"
              style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textMain }}
              onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)" }}
              onBlur={e => { e.target.style.borderColor = inputBorder; e.target.style.boxShadow = "none" }}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: textSub }}>
                <X style={{ width: 13, height: 13 }} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1 p-1 rounded-xl shrink-0"
            style={{ background: inputBg, border: `1px solid ${border}` }}>
            {SORT_TABS.map(tab => (
              <motion.button key={tab.value} whileTap={{ scale: 0.95 }}
                onClick={() => setSortMode(tab.value as any)}
                className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
                style={{
                  background: sortMode === tab.value ? (dark ? "rgba(99,102,241,0.2)" : "#eef2ff") : "transparent",
                  color:      sortMode === tab.value ? "#6366f1" : textSub,
                  border:     sortMode === tab.value ? (dark ? "1px solid rgba(99,102,241,0.3)" : "1px solid #c7d2fe") : "1px solid transparent",
                }}>
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* File type filter chips */}
      <AnimatePresence>
        {isFlattenMode && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }}
            className="overflow-hidden">
            <div className="flex items-center gap-2 flex-wrap pb-1">
              <Filter style={{ width: 13, height: 13, color: textSub, flexShrink: 0 }} />
              {FILE_FILTERS.map(opt => {
                const active = fileTypeFilter === opt.value
                return (
                  <motion.button key={opt.value} whileTap={{ scale: 0.95 }}
                    onClick={() => setFileTypeFilter(opt.value)}
                    className="px-3 py-1 rounded-full text-[11px] font-semibold transition-all"
                    style={{
                      background: active ? `${opt.color}18` : (dark ? "rgba(255,255,255,0.04)" : "#f9fafb"),
                      border:     active ? `1px solid ${opt.color}35` : `1px solid ${dark ? "rgba(255,255,255,0.08)" : "#e5e7eb"}`,
                      color:      active ? opt.color : textSub,
                    }}>
                    {opt.label}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Materials list */}
      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-16 rounded-2xl animate-pulse"
              style={{ background: dark ? "rgba(99,102,241,0.06)" : "#f3f4f6" }} />
          ))}
        </div>
      ) : (
        <MaterialsList
          materials={filtered}
          isLoading={isLoading}
          onOpenFolder={openFolder}
          onDelete={teacher ? id => setDeleteId(id) : undefined}
        />
      )}

      <UploadMaterialModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)}
        courseId={courseId} currentFolderId={breadcrumb[breadcrumb.length - 1]?.id ?? null}
        onUpload={(data: any) => uploadFile(data, { onSuccess: () => setUploadOpen(false) })}
        isLoading={isUploading} />
      <CreateFolderModal isOpen={folderOpen} onClose={() => setFolderOpen(false)}
        parentFolderId={breadcrumb[breadcrumb.length - 1]?.id ?? null}
        onSubmit={(data: any) => createFolder(data, { onSuccess: () => setFolderOpen(false) })}
        isLoading={isCreatingFolder} />
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) deleteMaterial(deleteId, { onSuccess: () => setDeleteId(null) }) }}
        title="Delete Material" description="This will permanently delete this material."
        confirmLabel="Delete" isLoading={isDeleting} />
    </div>
  )
}
