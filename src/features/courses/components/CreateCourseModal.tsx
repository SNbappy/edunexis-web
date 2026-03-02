import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import { DEPARTMENTS, SEMESTERS, CREDIT_HOURS } from '@/config/constants'
import { useAuthStore } from '@/store/authStore'
import type { CreateCourseRequest } from '@/types/course.types'

const schema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    courseCode: z.string().min(2, 'Course code is required'),
    creditHours: z.coerce.number().min(0.5).max(6),
    department: z.string().min(1, 'Department is required'),
    academicSession: z.string().min(1, 'Academic session is required'),
    semester: z.string().min(1, 'Semester is required'),
    section: z.string().optional(),
    courseType: z.enum(['Theory', 'Lab']),
    description: z.string().optional(),
    coverImageUrl: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface Props {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: CreateCourseRequest) => void
    isLoading?: boolean
}

export default function CreateCourseModal({ isOpen, onClose, onSubmit, isLoading }: Props) {
    const { user } = useAuthStore()
    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { courseType: 'Theory', creditHours: 3 },
    })

    const handleClose = () => { reset(); onClose() }

    const submit = (data: FormData) => {
        if (!user) return
        onSubmit({
            ...data,
            teacherId: user.id,
            coverImageUrl: data.coverImageUrl || '',
            section: data.section || undefined,
            description: data.description || undefined,
        })
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Create New Course" description="Set up a new course for your students" size="xl">
            <form onSubmit={handleSubmit(submit)}>
                {/* Scrollable content area */}
                <div className="overflow-y-auto max-h-[calc(100vh-16rem)] space-y-4 pr-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <Input {...register('title')} label="Course Title" placeholder="e.g. Data Structures & Algorithms" error={errors.title?.message} />
                        </div>

                        <Input {...register('courseCode')} label="Course Code" placeholder="e.g. CSE-301" error={errors.courseCode?.message} />

                        <Select
                            {...register('department')}
                            label="Department"
                            placeholder="Select department"
                            error={errors.department?.message}
                            options={DEPARTMENTS.map((d) => ({ value: d, label: d }))}
                        />

                        <Input {...register('academicSession')} label="Academic Session" placeholder="e.g. 2024-25" error={errors.academicSession?.message} />

                        <Select
                            {...register('semester')}
                            label="Semester"
                            placeholder="Select semester"
                            error={errors.semester?.message}
                            options={SEMESTERS.map((s) => ({ value: s, label: s }))}
                        />

                        <Select
                            {...register('creditHours')}
                            label="Credit Hours"
                            error={errors.creditHours?.message}
                            options={CREDIT_HOURS.map((c) => ({ value: c, label: `${c} Credit${c > 1 ? 's' : ''}` }))}
                        />

                        <Select
                            {...register('courseType')}
                            label="Course Type"
                            options={[{ value: 'Theory', label: 'Theory' }, { value: 'Lab', label: 'Lab' }]}
                        />

                        <Input {...register('section')} label="Section (optional)" placeholder="e.g. A, B, C" />

                        <div className="sm:col-span-2">
                            <Input {...register('coverImageUrl')} label="Cover Image URL (optional)" placeholder="https://..." />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-1.5">Description (optional)</label>
                            <textarea
                                {...register('description')}
                                rows={3}
                                placeholder="Brief description of this course..."
                                className="w-full rounded-xl border border-border bg-card text-foreground text-sm px-4 py-3 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Sticky footer buttons */}
                <div className="flex gap-3 pt-4 border-t border-border mt-4">
                    <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>Cancel</Button>
                    <Button type="submit" className="flex-1" isLoading={isLoading}>Create Course</Button>
                </div>
            </form>
        </Modal>
    )
}
