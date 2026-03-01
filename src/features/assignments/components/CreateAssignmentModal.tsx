import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import { formatInputDate } from '@/utils/dateUtils'
import { addDays } from 'date-fns'

const schema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    instructions: z.string().optional(),
    dueDate: z.string().min(1, 'Due date is required'),
    totalMarks: z.coerce.number().min(1, 'Must be at least 1').max(1000),
    allowLateSubmission: z.boolean(),
    status: z.enum(['Draft', 'Published']),
})
type FormData = z.infer<typeof schema>

interface Props {
    isOpen: boolean
    onClose: () => void
    courseId: string
    onSubmit: (data: FormData & { courseId: string }) => void
    isLoading?: boolean
}

export default function CreateAssignmentModal({ isOpen, onClose, courseId, onSubmit, isLoading }: Props) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            totalMarks: 100,
            allowLateSubmission: false,
            status: 'Draft',
            dueDate: formatInputDate(addDays(new Date(), 7)),
        },
    })

    const handleClose = () => { reset(); onClose() }
    const submit = (data: FormData) => onSubmit({ ...data, courseId })

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Create Assignment" size="xl">
            <form onSubmit={handleSubmit(submit)} className="space-y-4">
                <Input {...register('title')} label="Title" placeholder="e.g. Assignment 1 — Linked Lists" error={errors.title?.message} />

                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Description (optional)</label>
                    <textarea
                        {...register('description')} rows={2}
                        placeholder="Brief overview of the assignment..."
                        className="w-full rounded-xl border border-border bg-card text-foreground text-sm px-4 py-3 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Instructions (optional)</label>
                    <textarea
                        {...register('instructions')} rows={4}
                        placeholder="Detailed instructions for students..."
                        className="w-full rounded-xl border border-border bg-card text-foreground text-sm px-4 py-3 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        {...register('dueDate')}
                        type="datetime-local"
                        label="Due Date"
                        error={errors.dueDate?.message}
                    />
                    <Input
                        {...register('totalMarks')}
                        type="number"
                        label="Total Marks"
                        placeholder="100"
                        error={errors.totalMarks?.message}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Select
                        {...register('status')}
                        label="Status"
                        options={[
                            { value: 'Draft', label: 'Save as Draft' },
                            { value: 'Published', label: 'Publish Now' },
                        ]}
                    />
                    <div className="flex items-center gap-3 pt-7">
                        <input
                            type="checkbox"
                            id="allowLate"
                            {...register('allowLateSubmission')}
                            className="w-4 h-4 rounded accent-primary"
                        />
                        <label htmlFor="allowLate" className="text-sm text-foreground cursor-pointer">
                            Allow late submission
                        </label>
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>Cancel</Button>
                    <Button type="submit" className="flex-1" loading={isLoading}>Create Assignment</Button>
                </div>
            </form>
        </Modal>
    )
}
