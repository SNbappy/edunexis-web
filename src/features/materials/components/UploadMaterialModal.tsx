import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, CheckCircle2 } from "lucide-react"
import Modal from "@/components/ui/Modal"
import FileDropzone from "@/components/ui/FileDropzone"

interface UploadMaterialModalProps {
  isOpen: boolean
  onClose: () => void
  onUploadFile: (payload: {
    file: File
    title?: string
    description?: string
    onProgress: (n: number) => void
  }) => void
  isUploading?: boolean
}

export default function UploadMaterialModal({
  isOpen, onClose, onUploadFile, isUploading,
}: UploadMaterialModalProps) {
  const [files, setFiles] = useState<File[]>([])
  const [fileTitle, setFileTitle] = useState("")
  const [fileDesc, setFileDesc] = useState("")
  const [progress, setProgress] = useState(0)

  const handleClose = () => {
    setFiles([])
    setFileTitle("")
    setFileDesc("")
    setProgress(0)
    onClose()
  }

  const handleUpload = () => {
    if (!files.length) return
    files.forEach(file =>
      onUploadFile({
        file,
        title: fileTitle || file.name,
        description: fileDesc || undefined,
        onProgress: setProgress,
      }),
    )
  }

  const singleFile = files.length === 1 ? files[0] : null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload file" size="md">
      <div className="space-y-4">
        <FileDropzone onFilesSelected={setFiles} />

        {/* Title + description for single-file uploads */}
        <AnimatePresence>
          {singleFile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-2.5">
                <div>
                  <label className="mb-1 block text-[12px] font-semibold text-foreground">
                    Title
                    <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
                  </label>
                  <input
                    value={fileTitle}
                    onChange={e => setFileTitle(e.target.value)}
                    placeholder={"Default: " + singleFile.name}
                    className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground transition-all focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/30"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[12px] font-semibold text-foreground">
                    Description
                    <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
                  </label>
                  <textarea
                    value={fileDesc}
                    onChange={e => setFileDesc(e.target.value)}
                    placeholder="What is this file about?"
                    rows={2}
                    className="w-full resize-none rounded-xl border border-border bg-card px-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground transition-all focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/30"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress */}
        <AnimatePresence>
          {isUploading && progress > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between text-[12px] font-semibold text-teal-700 dark:text-teal-300">
                <span>Uploading…</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-teal-600"
                  animate={{ width: progress + "%" }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              {progress === 100 && (
                <div className="flex items-center gap-2 text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Upload complete
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex gap-3 border-t border-border pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-[13px] font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </button>
          <motion.button
            type="button"
            whileHover={files.length ? { scale: 1.02 } : {}}
            whileTap={files.length ? { scale: 0.98 } : {}}
            onClick={handleUpload}
            disabled={!files.length || !!isUploading}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-[13px] font-bold text-white shadow-sm transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Uploading…
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                {files.length > 1 ? "Upload " + files.length + " files" : "Upload"}
              </>
            )}
          </motion.button>
        </div>
      </div>
    </Modal>
  )
}