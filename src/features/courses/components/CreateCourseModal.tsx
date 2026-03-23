import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useRef } from 'react'
import { ImagePlus, X } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import { DEPARTMENTS, CREDIT_HOURS } from '@/config/constants'
import { useAuthStore } from '@/store/authStore'
import type { CreateCourseRequest } from '@/types/course.types'

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year']
const SEMESTERS_IN_YEAR = ['1st Semester', '2nd Semester']

const schema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    courseCode: z.string().min(2, 'Course code is required'),
    creditHours: z.coerce.number().min(0.5).max(6),
    department: z.string().min(1, 'Department is required'),
    academicSession: z.string().min(1, 'Academic session is required'),
    year: z.string().min(1, 'Year is required'),
    semesterInYear: z.string().min(1, 'Semester is required'),
    section: z.string().optional(),
    courseType: z.enum(['Theory', 'Lab']),
    description: z.string().optional(),
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
    const [coverPreview, setCoverPreview] = useState<string | null>(null)
    const fileRef = useRef<HTMLInputElement>(null)

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { courseType: 'Theory', creditHours: 3 },
    })

    const handleClose = () => { reset(); setCoverPreview(null); onClose() }

    const handleCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setCoverPreview(URL.createObjectURL(file))
    }

    const submit = (data: FormData) => {
        if (!user) return
        onSubmit({
            title: data.title,
            courseCode: data.courseCode,
            creditHours: data.creditHours,
            department: data.department,
            academicSession: data.academicSession,
            semester: data.year + ' - ' + data.semesterInYear,
            section: data.section || undefined,
            courseType: data.courseType,
            description: data.description || undefined,
            coverImageUrl: '',
            teacherId: user.id,
        })
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Create New Course" description="Set up a new course for your students" size="xl">
            <form onSubmit={handleSubmit(submit)}>
                <div className="overflow-y-auto max-h-[calc(100vh-16rem)] space-y-4 pr-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <Input {...register('title')} label="Course Title" placeholder="e.g. Data Structures & Algorithms" error={errors.title?.message} />
                        </div>

                        <Input {...register('courseCode')} label="Course Code" placeholder="e.g. CSE-301" error={errors.courseCode?.message} />
                        <Select {...register('department')} label="Department" placeholder="Select department"
                            error={errors.department?.message} options={DEPARTMENTS.map(d => ({ value: d, label: d }))} />

                        <Input {...register('academicSession')} label="Academic Session" placeholder="e.g. 2024-25" error={errors.academicSession?.message} />
                        <Input {...register('section')} label="Section (optional)" placeholder="e.g. A, B, C" />

                        <Select {...register('year')} label="Year" placeholder="Select year"
                            error={errors.year?.message}
                            options={YEARS.map(y => ({ value: y, label: y }))} />
                        <Select {...register('semesterInYear')} label="Semester" placeholder="Select semester"
                            error={errors.semesterInYear?.message}
                            options={SEMESTERS_IN_YEAR.map(s => ({ value: s, label: s }))} />

                        <Select {...register('creditHours')} label="Credit Hours" error={errors.creditHours?.message}
                            options={CREDIT_HOURS.map(c => ({ value: c, label: c + ' Credit' + (c > 1 ? 's' : '') }))} />
                        <Select {...register('courseType')} label="Course Type"
                            options={[{ value: 'Theory', label: 'Theory' }, { value: 'Lab', label: 'Lab' }]} />

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-1.5">Cover Image (optional)</label>
                            {coverPreview ? (
                                <div className="relative h-36 rounded-xl overflow-hidden border border-border">
                                    <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => setCoverPreview(null)}
                                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-xs">
                                        Preview only — saved after course creation
                                    </div>
                                </div>
                            ) : (
                                <button type="button" onClick={() => fileRef.current?.click()}
                                    className="w-full h-28 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary">
                                    <ImagePlus className="w-6 h-6" />
                                    <span className="text-xs font-medium">Click to upload a cover image</span>
                                    <span className="text-[11px] opacity-60">If skipped, a unique animated cover will be auto-assigned</span>
                                </button>
                            )}
                            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleCoverFile} />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-1.5">Description (optional)</label>
                            <textarea {...register('description')} rows={3}
                                placeholder="Brief description of this course..."
                                className="w-full rounded-xl border border-border bg-card text-foreground text-sm px-4 py-3 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none" />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-border mt-4">
                    <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>Cancel</Button>
                    <Button type="submit" className="flex-1" loading={isLoading}>Create Course</Button>
                </div>
            </form>
        </Modal>
    )
}