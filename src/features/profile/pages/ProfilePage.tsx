import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Mail, Phone, Linkedin, BookOpen, GraduationCap, Pencil, Plus,
    Trash2, X, Camera, ExternalLink, Building2, Calendar, ChevronRight,
    User, Facebook, Twitter, Github, Globe, ImagePlus, Loader2, Shield, Link2
} from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Spinner from '@/components/ui/Spinner'
import { useAuthStore } from '@/store/authStore'
import { useProfile } from '../hooks/useProfile'
import { usePublicProfile } from '../hooks/usePublicProfile'
import { DEPARTMENTS } from '@/config/constants'
import { isTeacher } from '@/utils/roleGuard'
import type { UserEducationDto, PublicProfileDto } from '@/types/auth.types'
import type { UpdateProfileRequest, EducationRequest } from '../services/profileService'

// ── Fullscreen viewer ──────────────────────────────────────────────────────────
function FullscreenImage({ url, onClose }: { url: string; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={onClose}>
            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white">
                <X className="w-6 h-6" />
            </button>
            <img src={url} alt="Full view" onClick={e => e.stopPropagation()}
                className="max-w-[92vw] max-h-[92vh] rounded-2xl object-contain shadow-2xl" />
        </div>
    )
}

// ── Education Modal ────────────────────────────────────────────────────────────
function EducationModal({ isOpen, onClose, initial, onSubmit, isLoading }: {
    isOpen: boolean; onClose: () => void
    initial?: UserEducationDto | null
    onSubmit: (d: EducationRequest) => void; isLoading: boolean
}) {
    const [form, setForm] = useState<EducationRequest>({
        institution: initial?.institution ?? '',
        degree: initial?.degree ?? '',
        fieldOfStudy: initial?.fieldOfStudy ?? '',
        startYear: initial?.startYear ?? new Date().getFullYear(),
        endYear: initial?.endYear ?? null,
        description: initial?.description ?? '',
    })
    const set = (k: keyof EducationRequest, v: any) => setForm(p => ({ ...p, [k]: v }))
    const cls = "w-full h-10 rounded-xl border border-border bg-background text-foreground text-sm px-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
    const years = Array.from({ length: 60 }, (_, i) => new Date().getFullYear() - i)

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initial ? 'Edit Education' : 'Add Education'} size="md">
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Institution *</label>
                    <input className={cls} value={form.institution} onChange={e => set('institution', e.target.value)} placeholder="e.g. JUST University" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Degree *</label>
                        <input className={cls} value={form.degree} onChange={e => set('degree', e.target.value)} placeholder="e.g. B.Sc." />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Field of Study *</label>
                        <input className={cls} value={form.fieldOfStudy} onChange={e => set('fieldOfStudy', e.target.value)} placeholder="e.g. Computer Science" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Start Year *</label>
                        <select className={cls} value={form.startYear} onChange={e => set('startYear', parseInt(e.target.value))}>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">End Year</label>
                        <select className={cls} value={form.endYear ?? ''} onChange={e => set('endYear', e.target.value ? parseInt(e.target.value) : null)}>
                            <option value="">Present</option>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Description (optional)</label>
                    <textarea className="w-full rounded-xl border border-border bg-background text-foreground text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all"
                        rows={2} value={form.description ?? ''} onChange={e => set('description', e.target.value)} placeholder="Activities, achievements..." />
                </div>
                <div className="flex gap-3 pt-1">
                    <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
                    <Button className="flex-1" loading={isLoading} disabled={!form.institution || !form.degree || !form.fieldOfStudy} onClick={() => onSubmit(form)}>
                        {initial ? 'Save Changes' : 'Add Education'}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}

// ── Edit Profile Modal ─────────────────────────────────────────────────────────
function EditProfileModal({ isOpen, onClose, profile, role, onSubmit, isLoading }: {
    isOpen: boolean; onClose: () => void; profile: any; role: string
    onSubmit: (d: UpdateProfileRequest) => void; isLoading: boolean
}) {
    const teacher = isTeacher(role)
    const [form, setForm] = useState<UpdateProfileRequest>({
        fullName: profile?.fullName ?? '',
        department: profile?.department ?? '',
        designation: profile?.designation ?? '',
        studentId: profile?.studentId ?? '',
        bio: profile?.bio ?? '',
        phoneNumber: profile?.phoneNumber ?? '',
        linkedInUrl: profile?.linkedInUrl ?? '',
        facebookUrl: profile?.facebookUrl ?? '',
        twitterUrl: profile?.twitterUrl ?? '',
        gitHubUrl: profile?.gitHubUrl ?? '',
        websiteUrl: profile?.websiteUrl ?? '',
    })
    const set = (k: keyof UpdateProfileRequest, v: string) => setForm(p => ({ ...p, [k]: v }))
    const cls = "w-full h-10 rounded-xl border border-border bg-background text-foreground text-sm px-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" size="lg">
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Basic Info</p>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-muted-foreground mb-1.5 block">Full Name *</label>
                            <input className={cls} value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="Your full name" />
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground mb-1.5 block">Department *</label>
                            <select className={cls} value={form.department} onChange={e => set('department', e.target.value)}>
                                <option value="">Select department</option>
                                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        {teacher
                            ? <div>
                                <label className="text-xs text-muted-foreground mb-1.5 block">Designation</label>
                                <input className={cls} value={form.designation ?? ''} onChange={e => set('designation', e.target.value)} placeholder="e.g. Assistant Professor" />
                              </div>
                            : <div>
                                <label className="text-xs text-muted-foreground mb-1.5 block">Student ID</label>
                                <input className={cls} value={form.studentId ?? ''} onChange={e => set('studentId', e.target.value)} placeholder="e.g. 200109CSE" />
                              </div>
                        }
                        <div>
                            <label className="text-xs text-muted-foreground mb-1.5 block">Phone Number</label>
                            <input className={cls} value={form.phoneNumber ?? ''} onChange={e => set('phoneNumber', e.target.value)} placeholder="+880 1X XX XXX XXX" />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs text-muted-foreground mb-1.5 block">Bio (optional)</label>
                            <textarea className="w-full rounded-xl border border-border bg-background text-foreground text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all"
                                rows={3} value={form.bio ?? ''} onChange={e => set('bio', e.target.value)} placeholder="Tell others about yourself..." />
                        </div>
                    </div>
                </div>
                <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Social Links</p>
                    <div className="space-y-3">
                        {[
                            { key: 'linkedInUrl', icon: <Linkedin className="w-4 h-4 text-blue-500" />, placeholder: 'https://linkedin.com/in/yourname' },
                            { key: 'facebookUrl', icon: <Facebook className="w-4 h-4 text-blue-600" />, placeholder: 'https://facebook.com/yourname' },
                            { key: 'twitterUrl', icon: <Twitter className="w-4 h-4 text-sky-500" />, placeholder: 'https://twitter.com/yourname' },
                            { key: 'gitHubUrl', icon: <Github className="w-4 h-4 text-foreground" />, placeholder: 'https://github.com/yourname' },
                            { key: 'websiteUrl', icon: <Globe className="w-4 h-4 text-emerald-500" />, placeholder: 'https://yourwebsite.com' },
                        ].map(({ key, icon, placeholder }) => (
                            <div key={key} className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">{icon}</div>
                                <input className={cls} value={(form as any)[key] ?? ''} onChange={e => set(key as keyof UpdateProfileRequest, e.target.value)} placeholder={placeholder} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex gap-3 pt-4 border-t border-border mt-4">
                <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
                <Button className="flex-1" loading={isLoading} disabled={!form.fullName || !form.department} onClick={() => onSubmit(form)}>
                    Save Changes
                </Button>
            </div>
        </Modal>
    )
}

// ── Main ProfilePage ───────────────────────────────────────────────────────────
interface Props { userId?: string; isOwnProfile?: boolean }

export default function ProfilePage({ userId, isOwnProfile = false }: Props) {
    const { user } = useAuthStore()
    const navigate = useNavigate()
    const coverRef = useRef<HTMLInputElement>(null)

    const own = useProfile()
    const pub = usePublicProfile(isOwnProfile ? user?.id : userId)

    const isLoading = isOwnProfile ? own.isLoading : pub.isLoading
    const p: PublicProfileDto | null = pub.data ?? null

    const [fullscreen, setFullscreen] = useState<string | null>(null)
    const [photoMenuOpen, setPhotoMenuOpen] = useState(false)
    const photoMenuRef = useRef<HTMLDivElement>(null)
    const [editOpen, setEditOpen] = useState(false)
    const [eduModal, setEduModal] = useState<{ open: boolean; item?: UserEducationDto | null }>({ open: false })
    const [deletingEduId, setDeletingEduId] = useState<string | null>(null)

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (photoMenuRef.current && !photoMenuRef.current.contains(e.target as Node))
                setPhotoMenuOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const teacherRole = isTeacher(p?.role ?? 'Student')

    if (isLoading) return (
        <div className="flex items-center justify-center py-24"><Spinner size="lg" className="text-primary" /></div>
    )
    if (!p) return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <User className="w-12 h-12 text-muted-foreground mb-3 opacity-30" />
            <p className="text-muted-foreground">Profile not found.</p>
            <button onClick={() => navigate(-1)} className="mt-4 text-sm text-primary hover:underline">Go back</button>
        </div>
    )

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) own.uploadPhoto(file)
    }
    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) own.uploadCover(file)
    }
    const handleEditSubmit = (data: UpdateProfileRequest) => {
        own.updateProfile(data, { onSuccess: () => setEditOpen(false) })
    }
    const handleEduSubmit = (data: EducationRequest) => {
        if (eduModal.item)
            own.updateEducation({ id: eduModal.item.id, data }, { onSuccess: () => setEduModal({ open: false }) })
        else
            own.addEducation(data, { onSuccess: () => setEduModal({ open: false }) })
    }

    const socialLinks = [
        { url: p.linkedInUrl, icon: <Linkedin className="w-4 h-4" />, label: 'LinkedIn', color: 'text-blue-500' },
        { url: p.facebookUrl, icon: <Facebook className="w-4 h-4" />, label: 'Facebook', color: 'text-blue-600' },
        { url: p.twitterUrl, icon: <Twitter className="w-4 h-4" />, label: 'Twitter', color: 'text-sky-500' },
        { url: p.gitHubUrl, icon: <Github className="w-4 h-4" />, label: 'GitHub', color: 'text-foreground' },
        { url: p.websiteUrl, icon: <Globe className="w-4 h-4" />, label: 'Website', color: 'text-emerald-500' },
    ].filter(s => s.url)

    return (
        <div className="min-h-full">

            {/* ── Cover + Identity bar ── */}
            <div className="relative">

                {/* Cover photo */}
                <div className="relative h-52 lg:h-64 group overflow-hidden">
                    {p.coverPhotoUrl
                        ? <img src={p.coverPhotoUrl} alt="Cover"
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => setFullscreen(p.coverPhotoUrl!)} />
                        : <div className="w-full h-full bg-gradient-to-br from-primary/30 via-primary/10 to-violet-500/20" />
                    }
                    {(own.isUploadingCover || own.isRemovingCover) && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                        </div>
                    )}
                    {isOwnProfile && !own.isUploadingCover && !own.isRemovingCover && (
                        <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-white text-xs font-medium cursor-pointer hover:bg-black/80 transition-colors">
                                <ImagePlus className="w-3.5 h-3.5" />
                                {p.coverPhotoUrl ? 'Change Cover' : 'Add Cover'}
                                <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                            </label>
                            {p.coverPhotoUrl && (
                                <button onClick={() => own.removeCover()}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/80 backdrop-blur-sm text-white text-xs font-medium hover:bg-destructive transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" /> Remove
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Identity bar */}
                <div className="bg-card border-b border-border">
                    <div className="px-6 lg:px-10 max-w-7xl mx-auto">

                        {/* Avatar row */}
                        <div className="flex items-end justify-between -mt-16 pb-4 flex-wrap gap-3">
                            {/* Photo */}
                            <div className="relative w-32 h-32" ref={photoMenuRef}>
                                <div
                                    className="w-32 h-32 rounded-2xl border-[5px] border-card overflow-hidden ring-2 ring-border cursor-pointer group/avatar shadow-xl"
                                    onClick={() => isOwnProfile ? setPhotoMenuOpen(v => !v) : p.profilePhotoUrl && setFullscreen(p.profilePhotoUrl)}
                                >
                                    {own.isUploading || own.isRemovingPhoto
                                        ? <div className="w-full h-full bg-muted flex items-center justify-center">
                                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                          </div>
                                        : <>
                                            <Avatar src={p.profilePhotoUrl} name={p.fullName} size="xl" className="w-full h-full rounded-none" />
                                            <div className="absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                                                <Camera className="w-6 h-6 text-white" />
                                            </div>
                                          </>
                                    }
                                </div>

                                <AnimatePresence>
                                    {isOwnProfile && photoMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.92, y: 6 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.92, y: 6 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute left-0 top-[calc(100%+8px)] z-30 w-48 rounded-xl border border-border bg-card shadow-xl overflow-hidden"
                                        >
                                            {p.profilePhotoUrl && (
                                                <button
                                                    onClick={() => { setPhotoMenuOpen(false); setFullscreen(p.profilePhotoUrl!) }}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                                                >
                                                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                                    View full photo
                                                </button>
                                            )}
                                            <label className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors cursor-pointer">
                                                <Camera className="w-4 h-4 text-muted-foreground" />
                                                {p.profilePhotoUrl ? 'Change photo' : 'Upload photo'}
                                                <input type="file" accept="image/*" className="hidden" onChange={e => { setPhotoMenuOpen(false); handlePhotoChange(e) }} />
                                            </label>
                                            {p.profilePhotoUrl && (
                                                <>
                                                    <div className="h-px bg-border mx-3" />
                                                    <button
                                                        onClick={() => { setPhotoMenuOpen(false); own.removePhoto() }}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Delete photo
                                                    </button>
                                                </>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {isOwnProfile && (
                                <div className="pb-1">
                                    <Button size="sm" variant="secondary" leftIcon={<Pencil className="w-3.5 h-3.5" />} onClick={() => setEditOpen(true)}>
                                        Edit Profile
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Name + meta */}
                        <div className="pb-6 space-y-2">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-3xl font-bold text-foreground tracking-tight">{p.fullName}</h1>
                                {teacherRole
                                    ? <Badge variant="teacher">Teacher</Badge>
                                    : <Badge variant="student">Student</Badge>
                                }
                            </div>
                            {p.designation && (
                                <p className="text-base text-muted-foreground font-medium">{p.designation}</p>
                            )}
                            <div className="flex items-center gap-5 flex-wrap text-sm text-muted-foreground">
                                {p.department && (
                                    <span className="flex items-center gap-1.5">
                                        <Building2 className="w-3.5 h-3.5" /> {p.department}
                                    </span>
                                )}
                                {!teacherRole && p.studentId && (
                                    <span className="flex items-center gap-1.5 font-mono">
                                        <Shield className="w-3.5 h-3.5" /> {p.studentId}
                                    </span>
                                )}
                                {p.email && (
                                    <span className="flex items-center gap-1.5">
                                        <Mail className="w-3.5 h-3.5" /> {p.email}
                                    </span>
                                )}
                                {p.phoneNumber && (
                                    <span className="flex items-center gap-1.5">
                                        <Phone className="w-3.5 h-3.5" /> {p.phoneNumber}
                                    </span>
                                )}
                            </div>
                            {p.bio && (
                                <p className="text-sm text-foreground/75 leading-relaxed max-w-2xl pt-0.5">{p.bio}</p>
                            )}
                            {socialLinks.length > 0 && (
                                <div className="flex items-center gap-4 pt-1 flex-wrap">
                                    {socialLinks.map(s => (
                                        <a key={s.label} href={s.url!} target="_blank" rel="noopener noreferrer"
                                            className={`flex items-center gap-1.5 text-xs font-medium ${s.color} hover:opacity-70 transition-opacity`}>
                                            {s.icon} {s.label}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT: About + Education + Contact */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* About */}
                        {p.bio && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="p-6 rounded-2xl bg-card border border-border">
                                <h2 className="flex items-center gap-2 text-base font-semibold text-foreground mb-4">
                                    <User className="w-4 h-4 text-primary" /> About
                                </h2>
                                <p className="text-sm text-foreground/80 leading-relaxed">{p.bio}</p>
                            </motion.div>
                        )}

                        {/* Education */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                            className="p-6 rounded-2xl bg-card border border-border">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                                    <GraduationCap className="w-4 h-4 text-primary" /> Education
                                </h2>
                                {isOwnProfile && (
                                    <button onClick={() => setEduModal({ open: true, item: null })}
                                        className="flex items-center gap-1.5 text-xs text-primary font-medium bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-lg transition-colors">
                                        <Plus className="w-3.5 h-3.5" /> Add
                                    </button>
                                )}
                            </div>
                            {p.education.length === 0
                                ? <div className="text-center py-10">
                                    <GraduationCap className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">No education added yet</p>
                                    {isOwnProfile && (
                                        <button onClick={() => setEduModal({ open: true })} className="mt-2 text-xs text-primary hover:underline">Add your education</button>
                                    )}
                                  </div>
                                : <div className="space-y-5">
                                    <AnimatePresence>
                                        {p.education.map((edu, i) => (
                                            <motion.div key={edu.id}
                                                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -10 }} transition={{ delay: i * 0.04 }}
                                                className="flex items-start gap-4 group">
                                                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                                    <GraduationCap className="w-5 h-5 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-foreground">{edu.institution}</p>
                                                    <p className="text-sm text-muted-foreground mt-0.5">{edu.degree} · {edu.fieldOfStudy}</p>
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {edu.startYear} – {edu.endYear ?? 'Present'}
                                                    </p>
                                                    {edu.description && (
                                                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{edu.description}</p>
                                                    )}
                                                </div>
                                                {isOwnProfile && (
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                        <button onClick={() => setEduModal({ open: true, item: edu })}
                                                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => { setDeletingEduId(edu.id); own.deleteEducation(edu.id, { onSuccess: () => setDeletingEduId(null) }) }}
                                                            disabled={deletingEduId === edu.id}
                                                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                                                            {deletingEduId === edu.id
                                                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                : <Trash2 className="w-3.5 h-3.5" />}
                                                        </button>
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                  </div>
                            }
                        </motion.div>
                    </div>

                    {/* RIGHT: Courses + Social links */}
                    <div className="space-y-6">

                        {/* Courses */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
                            className="p-6 rounded-2xl bg-card border border-border">
                            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground mb-4">
                                <BookOpen className="w-4 h-4 text-primary" />
                                {teacherRole ? 'Courses Teaching' : 'Enrolled Courses'}
                            </h2>
                            {p.courses.length === 0
                                ? <div className="text-center py-8">
                                    <BookOpen className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">No active courses</p>
                                  </div>
                                : <div className="space-y-2">
                                    {p.courses.map((c, i) => (
                                        <motion.div key={c.id}
                                            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.04 }}
                                            onClick={() => navigate(`/courses/${c.id}/stream`)}
                                            className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/50 cursor-pointer transition-all group">
                                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                <BookOpen className="w-4 h-4 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                                                <p className="text-xs text-muted-foreground">{c.courseCode} · {c.semester}</p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                        </motion.div>
                                    ))}
                                  </div>
                            }
                        </motion.div>

                        {/* Social links */}
                        {socialLinks.length > 0 && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
                                className="p-6 rounded-2xl bg-card border border-border">
                                <h2 className="flex items-center gap-2 text-base font-semibold text-foreground mb-4">
                                    <Link2 className="w-4 h-4 text-primary" /> Links
                                </h2>
                                <div className="space-y-3">
                                    {socialLinks.map(s => (
                                        <a key={s.label} href={s.url!} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-3 text-sm group">
                                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                                <span className={s.color}>{s.icon}</span>
                                            </div>
                                            <span className="text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                                                {s.label}
                                                <ExternalLink className="w-3 h-3 opacity-40" />
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Fullscreen */}
            {fullscreen && <FullscreenImage url={fullscreen} onClose={() => setFullscreen(null)} />}

            {/* Modals */}
            {isOwnProfile && (
                <>
                    <EditProfileModal isOpen={editOpen} onClose={() => setEditOpen(false)}
                        profile={own.profile} role={user?.role ?? 'Student'}
                        onSubmit={handleEditSubmit} isLoading={own.isUpdating} />
                    <EducationModal isOpen={eduModal.open} onClose={() => setEduModal({ open: false })}
                        initial={eduModal.item} onSubmit={handleEduSubmit}
                        isLoading={own.isAddingEdu || own.isUpdatingEdu} />
                </>
            )}
        </div>
    )
}

