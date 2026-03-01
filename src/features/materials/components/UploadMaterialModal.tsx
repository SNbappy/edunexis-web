import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Upload, Link as LinkIcon } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import FileDropzone from '@/components/ui/FileDropzone'
import ProgressBar from '@/components/ui/ProgressBar'
import Tabs from '@/components/ui/Tabs'

const linkSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    linkUrl: z.string().url('Enter a valid URL'),
    description: z.string().optional(),
})
type LinkForm = z.infer<typeof linkSchema>

interface Props {
    isOpen: boolean
    onClose: () => void
    onUploadFile: (payload: { file: File; title?: string; description?: string; onProgress: (n: number) => void }) => void
    onAddLink: (data: { title: string; linkUrl: string; description?: string }) => void
    isUploading?: boolean
    isAddingLink?: boolean
}

export default function UploadMaterialModal({ isOpen, onClose, onUploadFile, onAddLink, isUploading, isAddingLink }: Props) {
    const [tab, setTab] = useState<'file' | 'link'>('file')
    const [files, setFiles] = useState<File[]>([])
    const [fileTitle, setFileTitle] = useState('')
    const [fileDesc, setFileDesc] = useState('')
    const [progress, setProgress] = useState(0)

    const { register, handleSubmit, reset, formState: { errors } } = useForm<LinkForm>({
        resolver: zodResolver(linkSchema),
    })

    const handleClose = () => {
        setFiles([])
        setFileTitle('')
        setFileDesc('')
        setProgress(0)
        reset()
        onClose()
    }

    const handleFileUpload = () => {
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

    const handleLinkSubmit = (data: LinkForm) => {
        onAddLink(data)
        handleClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Add Material" description="Upload files or add a link to your course" size="lg">
            <div className="space-y-5">
                <Tabs
                    variant="boxed"
                    tabs={[
                        { key: 'file', label: 'Upload File', icon: <Upload className="w-3.5 h-3.5" /> },
                        { key: 'link', label: 'Add Link', icon: <LinkIcon className="w-3.5 h-3.5" /> },
                    ]}
                    active={tab}
                    onChange={(k) => setTab(k as 'file' | 'link')}
                />

                {tab === 'file' ? (
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
                                onClick={handleFileUpload}
                                leftIcon={!isUploading ? <Upload className="w-4 h-4" /> : undefined}
                            >
                                Upload {files.length > 1 ? `${files.length} Files` : 'File'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(handleLinkSubmit)} className="space-y-4">
                        <Input
                            {...register('title')}
                            label="Title"
                            placeholder="e.g. Course Textbook PDF (Google Drive)"
                            error={errors.title?.message}
                        />
                        <Input
                            {...register('linkUrl')}
                            label="URL"
                            placeholder="https://drive.google.com/..."
                            error={errors.linkUrl?.message}
                        />
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">Description (optional)</label>
                            <textarea
                                {...register('description')}
                                rows={2}
                                placeholder="What is this link about?"
                                className="w-full rounded-xl border border-border bg-card text-foreground text-sm px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none placeholder:text-muted-foreground"
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>Cancel</Button>
                            <Button type="submit" className="flex-1" loading={isAddingLink}>Add Link</Button>
                        </div>
                    </form>
                )}
            </div>
        </Modal>
    )
}
