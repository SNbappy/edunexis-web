import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Camera } from 'lucide-react'
import ProfileForm from '../components/ProfileForm'
import { useProfile } from '../hooks/useProfile'
import { useAuthStore } from '@/store/authStore'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'

export default function EditProfilePage() {
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const { profile, updateProfile, isUpdating, uploadPhoto, isUploading } = useProfile()

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) uploadPhoto(file)
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 p-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Edit Profile</h1>
                    <p className="text-sm text-muted-foreground">Update your personal information</p>
                </div>
            </motion.div>

            {/* Photo section */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="glass-card rounded-2xl p-6 flex items-center gap-6">
                <div className="relative">
                    <Avatar src={profile?.profilePhotoUrl} name={profile?.fullName} size="xl" />
                    <label className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full gradient-primary flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform">
                        <Camera className="w-4 h-4 text-white" />
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                    </label>
                </div>
                <div>
                    <p className="font-semibold text-foreground">{profile?.fullName}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                    {isUploading && <p className="text-xs text-primary mt-1 animate-pulse">Uploading photo...</p>}
                    <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 w-32 rounded-full bg-muted overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-500"
                                style={{ width: `${profile?.profileCompletionPercent ?? 0}%` }}
                            />
                        </div>
                        <span className="text-xs text-muted-foreground">{profile?.profileCompletionPercent ?? 0}% complete</span>
                    </div>
                </div>
            </motion.div>

            {/* Form */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="glass-card rounded-2xl p-6">
                <ProfileForm
                    defaultValues={{
                        fullName: profile?.fullName ?? '',
                        department: profile?.department ?? '',
                        designation: profile?.designation ?? '',
                        studentId: profile?.studentId ?? '',
                        bio: profile?.bio ?? '',
                        phoneNumber: profile?.phoneNumber ?? '',
                        linkedInUrl: profile?.linkedInUrl ?? '',
                    }}
                    onSubmit={updateProfile}
                    isLoading={isUpdating}
                />
            </motion.div>
        </div>
    )
}
