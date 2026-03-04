import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import type { AssignmentDto, UpdateAssignmentRequest } from '@/types/assignment.types'

const schema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    instructions: z.string().optional(),
    deadline: z.string().min(1, 'Deadline is required'),
    maxMarks: z.coerce.number().min(1, 'Must be at least 1').max(1000),
    allowLateSubmission: z.boolean(),
    rubricNotes: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface Props {
    isOpen: boolean
    onClose: () => void
    assignment: AssignmentDto
    onSubmit: (data: UpdateAssignmentRequest) => void
    isLoading?: boolean
}

function toLocalDateTimeString(iso: string): string {
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, '0')
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
        'T' + pad(d.getHours()) + ':' + pad(d.getMinutes())
}

export default function EditAssignmentModal({ isOpen, onClose, assignment, onSubmit, isLoading }: Props) {
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            title: assignment.title,
            instructions: assignment.instructions ?? '',
            deadline: toLocalDateTimeString(assignment.deadline),
            maxMarks: assignment.maxMarks,
            allowLateSubmission: assignment.allowLateSubmission,
            rubricNotes: assignment.rubricNotes ?? '',
        },
    })

    const submit = (data: FormData) => {
        onSubmit({
            ...data,
            deadline: new Date(data.deadline).toISOString(),
        })
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Assignment" size="xl">
            <form onSubmit={handleSubmit(submit)} className="space-y-4">
                <Input
                    {...register('title')}
                    label="Title"
                    placeholder="Assignment title"
                    error={errors.title?.message}
                />

                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Instructions (optional)</label>
                    <textarea
                        {...register('instructions')} rows={4}
                        placeholder="Detailed instructions for students..."
                        className="w-full rounded-xl border border-border bg-card text-foreground text-sm px-4 py-3 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Rubric Notes (optional)</label>
                    <textarea
                        {...register('rubricNotes')} rows={2}
                        placeholder="Grading criteria..."
                        className="w-full rounded-xl border border-border bg-card text-foreground text-sm px-4 py-3 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        {...register('deadline')}
                        type="datetime-local"
                        label="Deadline"
                        error={errors.deadline?.message}
                    />
                    <Input
                        {...register('maxMarks')}
                        type="number"
                        label="Max Marks"
                        placeholder="100"
                        error={errors.maxMarks?.message}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="allowLateEdit"
                        {...register('allowLateSubmission')}
                        className="w-4 h-4 rounded accent-primary"
                    />
                    <label htmlFor="allowLateEdit" className="text-sm text-foreground cursor-pointer">
                        Allow late submission
                    </label>
                </div>

                <div className="flex gap-3 pt-2">
                    <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
                    <Button type="submit" className="flex-1" loading={isLoading}>Save Changes</Button>
                </div>
            </form>
        </Modal>
    )
}
