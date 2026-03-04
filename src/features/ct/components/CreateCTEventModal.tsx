import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import type { CreateCTEventRequest } from '@/types/ct.types'

const schema = z.object({
    title:    z.string().min(3, 'Title must be at least 3 characters').max(100),
    maxMarks: z.coerce.number().min(1, 'Marks must be at least 1').max(500),
    heldOn:   z.string().optional().nullable(),
})
type FormData = z.infer<typeof schema>

interface Props {
    isOpen: boolean
    onClose: () => void
    courseId: string
    onSubmit: (data: CreateCTEventRequest) => void
    isLoading?: boolean
}

export default function CreateCTEventModal({ isOpen, onClose, onSubmit, isLoading }: Props) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { maxMarks: 20, heldOn: null },
    })

    const handleClose = () => { reset(); onClose() }

    const submit = (data: FormData) =>
        onSubmit({
            title:    data.title,
            maxMarks: data.maxMarks,
            heldOn:   data.heldOn || null,
        })

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Create New CT"
            description="CT number will be assigned automatically"
            size="md"
        >
            <form onSubmit={handleSubmit(submit)} className="space-y-4">
                <Input
                    {...register('title')}
                    label="CT Title"
                    placeholder='e.g. "Chapter 3 — Linked Lists"'
                    error={errors.title?.message}
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        {...register('maxMarks')}
                        type="number"
                        label="Total Marks"
                        placeholder="20"
                        error={errors.maxMarks?.message}
                    />
                    <Input
                        {...register('heldOn')}
                        type="date"
                        label="Date Held (optional)"
                        error={errors.heldOn?.message}
                    />
                </div>

                <p className="text-xs text-muted-foreground bg-muted/50 rounded-xl px-4 py-3 border border-border">
                    ?? After creating, upload the <strong>Best</strong>, <strong>Worst</strong>, and <strong>Average</strong> khata scripts before entering marks.
                </p>

                <div className="flex gap-3 pt-2">
                    <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button type="submit" className="flex-1" loading={isLoading}>
                        Create CT
                    </Button>
                </div>
            </form>
        </Modal>
    )
}
