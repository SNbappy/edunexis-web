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
    scheduledDate: z.string().min(1, 'Scheduled date is required'),
    durationMinutes: z.coerce.number().min(10).max(240),
    totalMarks: z.coerce.number().min(1).max(500),
    syllabus: z.string().optional(),
    venue: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface Props {
    isOpen: boolean
    onClose: () => void
    courseId: string
    onSubmit: (data: FormData & { courseId: string }) => void
    isLoading?: boolean
}

const DURATION_OPTIONS = [
    { value: 20, label: '20 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 40, label: '40 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '60 minutes' },
    { value: 90, label: '90 minutes' },
    { value: 120, label: '2 hours' },
]

export default function CreateCTEventModal({ isOpen, onClose, courseId, onSubmit, isLoading }: Props) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            totalMarks: 20,
            durationMinutes: 30,
            scheduledDate: formatInputDate(addDays(new Date(), 7)),
        },
    })

    const handleClose = () => { reset(); onClose() }
    const submit = (data: FormData) => onSubmit({ ...data, courseId })

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Schedule CT Event" description="Set up a new class test for your students" size="xl">
            <form onSubmit={handleSubmit(submit)} className="space-y-4">
                <Input
                    {...register('title')}
                    label="CT Title"
                    placeholder="e.g. CT-1 — Arrays & Linked Lists"
                    error={errors.title?.message}
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        {...register('scheduledDate')}
                        type="datetime-local"
                        label="Scheduled Date & Time"
                        error={errors.scheduledDate?.message}
                    />
                    <Select
                        {...register('durationMinutes')}
                        label="Duration"
                        options={DURATION_OPTIONS}
                        error={errors.durationMinutes?.message}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        {...register('totalMarks')}
                        type="number"
                        label="Total Marks"
                        placeholder="20"
                        error={errors.totalMarks?.message}
                    />
                    <Input
                        {...register('venue')}
                        label="Venue (optional)"
                        placeholder="e.g. Lab 301, Main Hall"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Syllabus (optional)</label>
                    <textarea
                        {...register('syllabus')}
                        rows={3}
                        placeholder="Topics covered in this CT..."
                        className="w-full rounded-xl border border-border bg-card text-foreground text-sm px-4 py-3 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Description (optional)</label>
                    <textarea
                        {...register('description')}
                        rows={2}
                        placeholder="Additional details..."
                        className="w-full rounded-xl border border-border bg-card text-foreground text-sm px-4 py-3 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>Cancel</Button>
                    <Button type="submit" className="flex-1" loading={isLoading}>Schedule CT</Button>
                </div>
            </form>
        </Modal>
    )
}
