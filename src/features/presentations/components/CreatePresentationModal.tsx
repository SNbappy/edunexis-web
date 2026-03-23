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
    title:                   z.string().min(3, 'Title must be at least 3 characters'),
    description:             z.string().optional(),
    scheduledDate:           z.string().min(1, 'Scheduled date is required'),
    totalMarks:              z.coerce.number().min(1, 'Min 1').max(500, 'Max 500'),
    format:                  z.enum(['Individual', 'Group']),
    durationPerGroupMinutes: z.coerce.number().min(1).max(120).optional(),
    venue:                   z.string().optional(),
    topicsAllowed:           z.boolean(),
})
type FormData = z.infer<typeof schema>

interface Props {
    isOpen:     boolean
    onClose:    () => void
    courseId:   string
    onSubmit:   (data: FormData & { courseId: string }) => void
    isLoading?: boolean
}

export default function CreatePresentationModal({ isOpen, onClose, courseId, onSubmit, isLoading }: Props) {
    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            totalMarks:              20,
            format:                  'Individual',
            topicsAllowed:           true,
            scheduledDate:           formatInputDate(addDays(new Date(), 14)),
            durationPerGroupMinutes: 10,
        },
    })

    const format     = watch('format')
    const handleClose = () => { reset(); onClose() }
    const submit      = (data: FormData) => onSubmit({ ...data, courseId })

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Schedule Presentation" description="Fill in the details to schedule a new presentation." size="xl">
            <form onSubmit={handleSubmit(submit)} className="space-y-4">

                <Input
                    {...register('title')}
                    label="Title"
                    placeholder="e.g. Term Presentation — Project Proposal"
                    error={errors.title?.message}
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        {...register('scheduledDate')}
                        type="datetime-local"
                        label="Scheduled Date"
                        error={errors.scheduledDate?.message}
                    />
                    <Input
                        {...register('totalMarks')}
                        type="number"
                        label="Total Marks"
                        placeholder="20"
                        error={errors.totalMarks?.message}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Select
                        {...register('format')}
                        label="Format"
                        options={[
                            { value: 'Individual', label: 'Individual' },
                            { value: 'Group',      label: 'Group' },
                        ]}
                    />
                    <Input
                        {...register('venue')}
                        label="Venue (optional)"
                        placeholder="e.g. Seminar Hall"
                    />
                </div>

                {format === 'Group' && (
                    <Input
                        {...register('durationPerGroupMinutes')}
                        type="number"
                        label="Duration per group (minutes)"
                        placeholder="10"
                        error={errors.durationPerGroupMinutes?.message}
                    />
                )}

                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                    <input
                        type="checkbox"
                        id="topicsAllowed"
                        {...register('topicsAllowed')}
                        className="w-4 h-4 rounded accent-primary"
                    />
                    <label htmlFor="topicsAllowed" className="text-sm text-foreground cursor-pointer">
                        Allow students to submit their presentation topic
                    </label>
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                        Description <span className="text-muted-foreground font-normal">(optional)</span>
                    </label>
                    <textarea
                        {...register('description')}
                        rows={3}
                        placeholder="Guidelines, evaluation criteria, topics..."
                        className="w-full rounded-xl border border-border bg-card text-foreground text-sm px-4 py-3 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>Cancel</Button>
                    <Button type="submit" className="flex-1" loading={isLoading}>Schedule Presentation</Button>
                </div>
            </form>
        </Modal>
    )
}
