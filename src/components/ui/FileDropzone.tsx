import { useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, File, CheckCircle2 } from 'lucide-react'
import { formatFileSize, ACCEPTED_MATERIAL_TYPES } from '@/utils/fileUtils'
import { cn } from '@/utils/cn'

interface FileDropzoneProps {
    onFilesSelected: (files: File[]) => void
    accept?: string
    multiple?: boolean
    maxSizeMB?: number
    className?: string
}

export default function FileDropzone({
    onFilesSelected,
    accept = ACCEPTED_MATERIAL_TYPES,
    multiple = true,
    maxSizeMB = 50,
    className,
}: FileDropzoneProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [dragOver, setDragOver] = useState(false)
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [errors, setErrors] = useState<string[]>([])

    const validate = (files: File[]): { valid: File[]; errors: string[] } => {
        const valid: File[] = []
        const errs: string[] = []
        for (const f of files) {
            if (f.size > maxSizeMB * 1024 * 1024) {
                errs.push(`${f.name} exceeds ${maxSizeMB}MB limit`)
            } else {
                valid.push(f)
            }
        }
        return { valid, errors: errs }
    }

    const processFiles = useCallback((files: File[]) => {
        const { valid, errors: errs } = validate(files)
        setErrors(errs)
        if (valid.length > 0) {
            const next = multiple ? [...selectedFiles, ...valid] : [valid[0]]
            setSelectedFiles(next)
            onFilesSelected(next)
        }
    }, [selectedFiles, multiple, onFilesSelected])

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        processFiles(Array.from(e.dataTransfer.files))
    }

    const removeFile = (index: number) => {
        const next = selectedFiles.filter((_, i) => i !== index)
        setSelectedFiles(next)
        onFilesSelected(next)
    }

    return (
        <div className={cn('space-y-3', className)}>
            {/* Drop zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={cn(
                    'relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all',
                    dragOver
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/30 scale-[1.01]'
                        : 'border-border hover:border-teal-300 dark:border-teal-700 hover:bg-muted/50'
                )}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    className="hidden"
                    onChange={(e) => processFiles(Array.from(e.target.files ?? []))}
                />
                <motion.div
                    animate={dragOver ? { scale: 1.2 } : { scale: 1 }}
                    className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg"
                >
                    <Upload className="w-6 h-6 text-white" />
                </motion.div>
                <div className="text-center">
                    <p className="text-sm font-medium text-foreground">
                        {dragOver ? 'Drop files here!' : 'Drag & drop files or click to browse'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        PDF, DOC, PPT, images, videos, archives Â· Max {maxSizeMB}MB each
                    </p>
                </div>
            </div>

            {/* Errors */}
            {errors.map((err, i) => (
                <p key={i} className="text-xs text-destructive">{err}</p>
            ))}

            {/* Selected files */}
            <AnimatePresence>
                {selectedFiles.map((file, i) => (
                    <motion.div
                        key={`${file.name}-${i}`}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card"
                    >
                        <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center shrink-0">
                            <File className="w-4 h-4 text-teal-700 dark:text-teal-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); removeFile(i) }}
                            className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all shrink-0"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}

