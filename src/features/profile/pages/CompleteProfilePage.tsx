import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GraduationCap } from 'lucide-react'
import ProfileForm from '../components/ProfileForm'
import { useProfile } from '../hooks/useProfile'
import { useAuthStore } from '@/store/authStore'
import { ROUTES, APP_NAME } from '@/config/constants'
import FloatingOrbs from '@/components/three/FloatingOrbs'
import ParticleBackground from '@/components/three/ParticleBackground'

export default function CompleteProfilePage() {
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const { updateProfile, isUpdating } = useProfile()

    const handleSubmit = (data: Parameters<typeof updateProfile>[0]) => {
        updateProfile(data, {
            onSuccess: (res) => {
                if (res.success) navigate(ROUTES.DASHBOARD)
            },
        })
    }

    return (
        <div className="min-h-screen bg-background auth-bg relative">
            <ParticleBackground />
            <FloatingOrbs />

            <div className="relative z-10 flex items-start justify-center min-h-screen py-12 px-4">
                <div className="w-full max-w-2xl">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-8"
                    >
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-primary shadow-lg glow-primary mb-4">
                            <GraduationCap className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-foreground">Welcome to {APP_NAME}!</h1>
                        <p className="text-muted-foreground mt-2">
                            Complete your profile to get started, <span className="text-foreground font-medium">{user?.profile?.fullName}</span>
                        </p>
                    </motion.div>

                    {/* Steps indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center justify-center gap-3 mb-8"
                    >
                        {['Account Created', 'Complete Profile', 'Start Learning'].map((step, i) => (
                            <div key={step} className="flex items-center gap-2">
                                <div className={`flex items-center gap-2 ${i < 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${i === 0 ? 'bg-success text-white' : i === 1 ? 'gradient-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                                        {i === 0 ? '✓' : i + 1}
                                    </div>
                                    <span className="text-xs font-medium hidden sm:block">{step}</span>
                                </div>
                                {i < 2 && <div className="w-8 h-px bg-border" />}
                            </div>
                        ))}
                    </motion.div>

                    {/* Form card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="glass-card rounded-2xl p-8"
                    >
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-foreground">Your Profile Details</h2>
                            <p className="text-sm text-muted-foreground mt-1">Fill in your information to complete setup</p>
                        </div>
                        <ProfileForm
                            onSubmit={handleSubmit}
                            isLoading={isUpdating}
                            submitLabel="Complete Profile & Continue →"
                            defaultValues={{
                                fullName: user?.profile?.fullName ?? '',
                                department: user?.profile?.department ?? '',
                                designation: user?.profile?.designation ?? '',
                                studentId: user?.profile?.studentId ?? '',
                                bio: user?.profile?.bio ?? '',
                                phoneNumber: user?.profile?.phoneNumber ?? '',
                                linkedInUrl: user?.profile?.linkedInUrl ?? '',
                            }}
                        />
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
