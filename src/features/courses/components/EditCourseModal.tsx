import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import { DEPARTMENTS, SEMESTERS, CREDIT_HOURS } from '@/config/constants'
import type { CourseDto, UpdateCourseRequest } from '@/types/course.types'

const schema = z.object({
    title: z.string().min(3),
    courseCode: z.string().min(2),
    creditHours: z.coerce.number().min(0.5).max(6),
    department: z.string().min(1),
    academicSession: z.string().min(1),
    semester: z.string().min(1),
    section: z.string().optional(),
    courseType: z.enum(['Theory', 'Lab']),
    description: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface Props {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: UpdateCourseRequest) => void
    isLoading?: boolean
    course: CourseDto | null
}

export default function EditCourseModal({ isOpen, onClose, onSubmit, isLoading, course }: Props) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    })

    useEffect(() => {
        if (course) {
            reset({
                title: course.title,
                courseCode: course.courseCode,
                creditHours: course.creditHours,
                department: course.department,
                academicSession: course.academicSession,
                semester: course.semester,
                section: course.section ?? '',
                courseType: course.courseType,
                description: course.description ?? '',
            })
        }
    }, [course, reset])

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Course" size="xl" scrollable>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                        <Input {...register('title')} label="Course Title" error={errors.title?.message} />
                    </div>
                    <Input {...register('courseCode')} label="Course Code" error={errors.courseCode?.message} />
                    <Select {...register('department')} label="Department" options={DEPARTMENTS.map((d) => ({ value: d, label: d }))} />
                    <Input {...register('academicSession')} label="Academic Session" />
                    <Select {...register('semester')} label="Semester" options={SEMESTERS.map((s) => ({ value: s, label: s }))} />
                    <Select {...register('creditHours')} label="Credit Hours" options={CREDIT_HOURS.map((c) => ({ value: c, label: `${c} Credit${c > 1 ? 's' : ''}` }))} />
                    <Select {...register('courseType')} label="Course Type" options={[{ value: 'Theory', label: 'Theory' }, { value: 'Lab', label: 'Lab' }]} />
                    <Input {...register('section')} label="Section (optional)" />
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                        <textarea {...register('description')} rows={3} className="w-full rounded-xl border border-border bg-card text-foreground text-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none" />
                    </div>
                </div>
                <div className="flex gap-3 pt-2">
                    <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
                    <Button type="submit" className="flex-1" loading={isLoading}>Save Changes</Button>
                </div>
            </form>
        </Modal>
    )
}

