import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { FolderPlus } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

const schema = z.object({
    title: z.string().min(1, 'Folder name is required').max(60, 'Too long'),
    description: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface Props {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: { title: string; description?: string }) => void
    isLoading?: boolean
}

export default function CreateFolderModal({ isOpen, onClose, onSubmit, isLoading }: Props) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    })

    const handleClose = () => { reset(); onClose() }
    const submit = (data: FormData) => onSubmit(data)

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="New Folder" size="sm">
            <form onSubmit={handleSubmit(submit)} className="space-y-4">
                <div className="flex items-center justify-center py-3">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                        <FolderPlus className="w-8 h-8 text-amber-500" />
                    </div>
                </div>
                <Input
                    {...register('title')}
                    label="Folder Name"
                    placeholder="e.g. Week 1 Slides"
                    error={errors.title?.message}
                    autoFocus
                />
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Description (optional)</label>
                    <textarea
                        {...register('description')}
                        rows={2}
                        placeholder="What's in this folder?"
                        className="w-full rounded-xl border border-border bg-card text-foreground text-sm px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none placeholder:text-muted-foreground"
                    />
                </div>
                <div className="flex gap-3">
                    <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>Cancel</Button>
                    <Button type="submit" className="flex-1" loading={isLoading}>Create Folder</Button>
                </div>
            </form>
        </Modal>
    )
}
