import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, CheckCircle2, XCircle } from 'lucide-react'
import AuthLayout from '@/components/layout/AuthLayout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useRegister } from '../hooks/useRegister'
import { ROUTES, TEACHER_EMAIL_DOMAIN, STUDENT_EMAIL_DOMAIN } from '@/config/constants'

const schema = z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z
        .string()
        .email('Enter a valid email')
        .refine(
            (e) =>
                e.endsWith(TEACHER_EMAIL_DOMAIN) || e.endsWith(STUDENT_EMAIL_DOMAIN),
            'Only @just.edu.bd or @student.just.edu.bd emails are allowed'
        ),
    password: z
        .string()
        .min(8, 'At least 8 characters')
        .regex(/[A-Z]/, 'Must contain an uppercase letter')
        .regex(/[0-9]/, 'Must contain a number')
        .regex(/[^a-zA-Z0-9]/, 'Must contain a special character'),
    confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
})
type FormData = z.infer<typeof schema>

function PasswordStrength({ password }: { password: string }) {
    const checks = [
        { label: 'At least 8 characters', pass: password.length >= 8 },
        { label: 'Uppercase letter', pass: /[A-Z]/.test(password) },
        { label: 'Number', pass: /[0-9]/.test(password) },
        { label: 'Special character', pass: /[^a-zA-Z0-9]/.test(password) },
    ]
    if (!password) return null
    return (
        <div className="grid grid-cols-2 gap-1.5 pt-1">
            {checks.map((c) => (
                <div key={c.label} className="flex items-center gap-1.5">
                    {c.pass
                        ? <CheckCircle2 className="w-3 h-3 text-success shrink-0" />
                        : <XCircle className="w-3 h-3 text-muted-foreground shrink-0" />}
                    <span className={`text-xs ${c.pass ? 'text-success' : 'text-muted-foreground'}`}>
                        {c.label}
                    </span>
                </div>
            ))}
        </div>
    )
}

function RoleBadge({ email }: { email: string }) {
    if (email.endsWith(STUDENT_EMAIL_DOMAIN)) {
        return (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800">
                <span className="text-lg">🎓</span>
                <div>
                    <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-400">Student Account</p>
                    <p className="text-xs text-cyan-600/70 dark:text-cyan-500/70">You'll be registered as a student</p>
                </div>
            </div>
        )
    }
    if (email.endsWith(TEACHER_EMAIL_DOMAIN)) {
        return (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
                <span className="text-lg">👨‍🏫</span>
                <div>
                    <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">Teacher Account</p>
                    <p className="text-xs text-indigo-600/70 dark:text-indigo-500/70">You'll be registered as a teacher</p>
                </div>
            </div>
        )
    }
    return null
}

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const { register: registerUser, loading } = useRegister()

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<FormData>({ resolver: zodResolver(schema) })

    const passwordValue = watch('password', '')
    const emailValue = watch('email', '')
    const onSubmit = ({ fullName, email, password }: FormData) =>
        registerUser({ fullName, email, password })

    return (
        <AuthLayout title="Create account 🚀" subtitle="Join EduNexis with your university email">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                    <Input
                        {...register('fullName')}
                        label="Full Name"
                        placeholder="Your full name"
                        error={errors.fullName?.message}
                        leftIcon={<User className="w-4 h-4" />}
                        autoComplete="name"
                    />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Input
                        {...register('email')}
                        type="email"
                        label="University Email"
                        placeholder="you@just.edu.bd"
                        error={errors.email?.message}
                        leftIcon={<Mail className="w-4 h-4" />}
                        autoComplete="email"
                        hint="Use your @just.edu.bd or @student.just.edu.bd email"
                    />
                    {emailValue && <div className="mt-2"><RoleBadge email={emailValue} /></div>}
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <Input
                        {...register('password')}
                        type={showPassword ? 'text' : 'password'}
                        label="Password"
                        placeholder="Create a strong password"
                        error={errors.password?.message}
                        leftIcon={<Lock className="w-4 h-4" />}
                        rightIcon={
                            <button type="button" onClick={() => setShowPassword((p) => !p)} tabIndex={-1}>
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        }
                        autoComplete="new-password"
                    />
                    <PasswordStrength password={passwordValue} />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Input
                        {...register('confirmPassword')}
                        type={showConfirm ? 'text' : 'password'}
                        label="Confirm Password"
                        placeholder="Repeat your password"
                        error={errors.confirmPassword?.message}
                        leftIcon={<Lock className="w-4 h-4" />}
                        rightIcon={
                            <button type="button" onClick={() => setShowConfirm((p) => !p)} tabIndex={-1}>
                                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        }
                        autoComplete="new-password"
                    />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <Button type="submit" size="lg" className="w-full" loading={loading}>
                        Create Account
                    </Button>
                </motion.div>

                <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link to={ROUTES.LOGIN} className="text-primary font-medium hover:underline underline-offset-4">
                        Sign in
                    </Link>
                </p>
            </form>
        </AuthLayout>
    )
}
