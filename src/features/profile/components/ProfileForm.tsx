import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { DEPARTMENTS } from '@/config/constants'
import { isTeacher, isStudent } from '@/utils/roleGuard'

const schema = z.object({
    fullName: z.string().min(2, 'Full name is required'),
    department: z.string().min(1, 'Department is required'),
    designation: z.string().optional(),
    studentId: z.string().optional(),
    bio: z.string().max(300, 'Bio must be under 300 characters').optional(),
    phoneNumber: z.string().optional(),
    linkedInUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

interface Props {
    defaultValues?: Partial<FormData>
    onSubmit: (data: FormData) => void
    isLoading?: boolean
    submitLabel?: string
}

export default function ProfileForm({ defaultValues, onSubmit, isLoading, submitLabel = 'Save Profile' }: Props) {
    const { user } = useAuthStore()
    const role = user?.role ?? 'Student'

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues,
    })

    useEffect(() => {
        if (defaultValues) reset(defaultValues)
    }, [defaultValues, reset])

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                    <Input {...register('fullName')} label="Full Name" placeholder="Your full name" error={errors.fullName?.message} />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Department</label>
                    <select
                        {...register('department')}
                        className="w-full h-11 rounded-xl border border-border bg-card text-foreground text-sm px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    >
                        <option value="">Select department</option>
                        {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                    {errors.department && <p className="text-xs text-destructive mt-1">{errors.department.message}</p>}
                </motion.div>

                {isTeacher(role) && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                        <Input {...register('designation')} label="Designation" placeholder="e.g. Assistant Professor" error={errors.designation?.message} />
                    </motion.div>
                )}

                {isStudent(role) && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                        <Input {...register('studentId')} label="Student ID" placeholder="e.g. 2020CSE-001" error={errors.studentId?.message} />
                    </motion.div>
                )}

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Input {...register('phoneNumber')} label="Phone Number" placeholder="+880 1X XX XXX XXX" error={errors.phoneNumber?.message} />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <Input {...register('linkedInUrl')} label="LinkedIn URL" placeholder="https://linkedin.com/in/yourname" error={errors.linkedInUrl?.message} />
                </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <label className="block text-sm font-medium text-foreground mb-1.5">Bio <span className="text-muted-foreground font-normal">(optional)</span></label>
                <textarea
                    {...register('bio')}
                    rows={3}
                    placeholder="Tell others a bit about yourself..."
                    className="w-full rounded-xl border border-border bg-card text-foreground text-sm px-4 py-3 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                />
                {errors.bio && <p className="text-xs text-destructive mt-1">{errors.bio.message}</p>}
            </motion.div>

            <Button type="submit" size="lg" loading={isLoading} className="w-full md:w-auto">
                {submitLabel}
            </Button>
        </form>
    )
}
