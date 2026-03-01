import { motion } from 'framer-motion'
import FloatingOrbs from '@/components/three/FloatingOrbs'
import ParticleBackground from '@/components/three/ParticleBackground'
import { APP_NAME, APP_UNIVERSITY } from '@/config/constants'
import { GraduationCap } from 'lucide-react'

interface AuthLayoutProps {
    children: React.ReactNode
    title: string
    subtitle: string
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-background auth-bg relative flex">
            <ParticleBackground />
            <FloatingOrbs />

            {/* Left panel — branding */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex items-center gap-3"
                >
                    <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg glow-primary">
                        <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold gradient-text">{APP_NAME}</span>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="space-y-6"
                >
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-primary">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            Smart Learning Platform
                        </div>
                        <h1 className="text-5xl font-bold text-foreground leading-tight">
                            The Future of
                            <span className="block gradient-text">University Learning</span>
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
                            Streamline classroom management, automate academic workflows,
                            and unlock insights — all in one powerful platform.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                        {[
                            { icon: '🎯', label: 'Smart Attendance' },
                            { icon: '📝', label: 'Auto Grading' },
                            { icon: '📊', label: 'Analytics' },
                            { icon: '🤖', label: 'AI Plagiarism Check' },
                        ].map((f) => (
                            <div key={f.label} className="flex items-center gap-3 glass-card rounded-xl p-3">
                                <span className="text-2xl">{f.icon}</span>
                                <span className="text-sm font-medium text-foreground">{f.label}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-sm text-muted-foreground"
                >
                    {APP_UNIVERSITY}
                </motion.p>
            </div>

            {/* Right panel — form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="w-full max-w-md"
                >
                    <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
                        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-bold gradient-text">{APP_NAME}</span>
                    </div>

                    <div className="glass-card rounded-2xl p-8 shadow-card-hover">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
                            <p className="text-muted-foreground mt-1">{subtitle}</p>
                        </div>
                        {children}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
