import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import FileDropzone from '@/components/ui/FileDropzone'
import ProgressBar from '@/components/ui/ProgressBar'

interface Props {
    isOpen: boolean
    onClose: () => void
    onUploadFile: (payload: { file: File; title?: string; description?: string; onProgress: (n: number) => void }) => void
    isUploading?: boolean
}

export default function UploadMaterialModal({ isOpen, onClose, onUploadFile, isUploading }: Props) {
    const [files, setFiles] = useState<File[]>([])
    const [fileTitle, setFileTitle] = useState('')
    const [fileDesc, setFileDesc] = useState('')
    const [progress, setProgress] = useState(0)

    const handleClose = () => {
        setFiles([])
        setFileTitle('')
        setFileDesc('')
        setProgress(0)
        onClose()
    }

    const handleUpload = () => {
        if (files.length === 0) return
        files.forEach((file) => {
            onUploadFile({
                file,
                title: fileTitle || file.name,
                description: fileDesc || undefined,
                onProgress: setProgress,
            })
        })
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Upload File" description="Add a file to this folder" size="md">
            <div className="space-y-4">
                <FileDropzone onFilesSelected={setFiles} />
                {files.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                        <Input
                            label="Title (optional)"
                            value={fileTitle}
                            onChange={(e) => setFileTitle(e.target.value)}
                            placeholder={files[0]?.name}
                        />
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">Description (optional)</label>
                            <textarea
                                value={fileDesc}
                                onChange={(e) => setFileDesc(e.target.value)}
                                rows={2}
                                placeholder="Brief description..."
                                className="w-full rounded-xl border border-border bg-card text-foreground text-sm px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none placeholder:text-muted-foreground"
                            />
                        </div>
                    </motion.div>
                )}
                {isUploading && progress > 0 && (
                    <ProgressBar value={progress} showPercent label="Uploading..." color="primary" />
                )}
                <div className="flex gap-3">
                    <Button variant="secondary" className="flex-1" onClick={handleClose}>Cancel</Button>
                    <Button
                        className="flex-1"
                        disabled={files.length === 0}
                        loading={isUploading}
                        onClick={handleUpload}
                        leftIcon={!isUploading ? <Upload className="w-4 h-4" /> : undefined}
                    >
                        Upload {files.length > 1 ? `${files.length} Files` : 'File'}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
