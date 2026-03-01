import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, Chrome } from 'lucide-react'
import AuthLayout from '@/components/layout/AuthLayout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useLogin } from '../hooks/useLogin'
import { useFirebaseAuth } from '../hooks/useFirebaseAuth'
import { ROUTES } from '@/config/constants'

const schema = z.object({
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false)
    const { login, loading } = useLogin()
    const { signInWithGoogle, loading: googleLoading } = useFirebaseAuth()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({ resolver: zodResolver(schema) })

    const onSubmit = (data: FormData) => login(data)

    return (
        <AuthLayout title="Welcome back 👋" subtitle="Sign in to your EduNexis account">
            <div className="space-y-5">
                {/* Google sign-in */}
                <Button
                    variant="glass"
                    size="lg"
                    className="w-full border border-border hover:border-primary/40"
                    onClick={signInWithGoogle}
                    loading={googleLoading}
                    leftIcon={
                        !googleLoading && (
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        )
                    }
                >
                    Continue with Google
                </Button>

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-card px-4 text-xs text-muted-foreground uppercase tracking-wider">
                            or continue with email
                        </span>
                    </div>
                </div>

                {/* Email/Password form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Input
                            {...register('email')}
                            type="email"
                            label="University Email"
                            placeholder="you@just.edu.bd"
                            error={errors.email?.message}
                            leftIcon={<Mail className="w-4 h-4" />}
                            autoComplete="email"
                        />
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                        <Input
                            {...register('password')}
                            type={showPassword ? 'text' : 'password'}
                            label="Password"
                            placeholder="Enter your password"
                            error={errors.password?.message}
                            leftIcon={<Lock className="w-4 h-4" />}
                            rightIcon={
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((p) => !p)}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            }
                            autoComplete="current-password"
                        />
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Button type="submit" size="lg" className="w-full" loading={loading}>
                            Sign In
                        </Button>
                    </motion.div>
                </form>

                {/* Register link */}
                <p className="text-center text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Link
                        to={ROUTES.REGISTER}
                        className="text-primary font-medium hover:underline underline-offset-4"
                    >
                        Create account
                    </Link>
                </p>

                {/* Domain hint */}
                <div className="rounded-xl bg-muted/60 border border-border p-3 space-y-1">
                    <p className="text-xs text-muted-foreground font-medium text-center">Supported email domains</p>
                    <div className="flex gap-2 justify-center flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-mono">@just.edu.bd</span>
                        <span className="px-2 py-0.5 rounded-md bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 text-xs font-mono">@student.just.edu.bd</span>
                    </div>
                </div>
            </div>
        </AuthLayout>
    )
}
