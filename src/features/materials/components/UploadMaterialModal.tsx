import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, CheckCircle2 } from "lucide-react"
import Modal from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import { ICON_STROKE } from "@/components/ui/appTokens"
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
        <FileDropzone onFilesSelected={setFiles} maxSizeMB={10} />

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
                    className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground transition-all focus:border-primary focus:outline-none focus:shadow-[0_0_0_3px_rgb(var(--ring)/0.18)]"
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
                    className="w-full resize-none rounded-xl border border-border bg-card px-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground transition-all focus:border-primary focus:outline-none focus:shadow-[0_0_0_3px_rgb(var(--ring)/0.18)]"
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
              <div className="flex items-center justify-between text-[12px] font-semibold text-primary">
                <span>Uploading…</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  animate={{ width: progress + "%" }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              {progress === 100 && (
                <div className="flex items-center gap-2 text-[12px] font-semibold text-success">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Upload complete
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={!files.length}
            loading={isUploading}
            leftIcon={<Upload strokeWidth={ICON_STROKE} />}
          >
            {files.length > 1 ? `Upload ${files.length} files` : "Upload"}
          </Button>
        </div>
      </div>
    </Modal>
  )
}