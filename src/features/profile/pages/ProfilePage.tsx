import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail, Phone, Linkedin, BookOpen, GraduationCap, Pencil, Plus,
  Trash2, X, Camera, ExternalLink, Building2, Calendar, ChevronRight,
  User, Facebook, Twitter, Github, Globe, ImagePlus, Loader2, Shield, Link2
} from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
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

const INP = "w-full h-10 rounded-xl text-sm px-3 focus:outline-none transition-all bg-[rgba(6,13,28,0.9)] border border-[rgba(99,102,241,0.2)] text-slate-200 placeholder-slate-600 focus:border-[rgba(99,102,241,0.5)] focus:ring-2 focus:ring-[rgba(99,102,241,0.12)]"
const LABEL = "text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block"

// -- Fullscreen -----------------------------------------------------------------
function FullscreenImage({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white"><X className="w-6 h-6" /></button>
      <img src={url} alt="" onClick={e => e.stopPropagation()} className="max-w-[92vw] max-h-[92vh] rounded-2xl object-contain" />
    </div>
  )
}

// -- Education Modal ------------------------------------------------------------
function EducationModal({ isOpen, onClose, initial, onSubmit, isLoading }: {
  isOpen: boolean; onClose: () => void; initial?: UserEducationDto | null
  onSubmit: (d: EducationRequest) => void; isLoading: boolean
}) {
  const [form, setForm] = useState<EducationRequest>({
    institution: initial?.institution ?? '', degree: initial?.degree ?? '',
    fieldOfStudy: initial?.fieldOfStudy ?? '',
    startYear: initial?.startYear ?? new Date().getFullYear(),
    endYear: initial?.endYear ?? null, description: initial?.description ?? '',
  })
  const set = (k: keyof EducationRequest, v: any) => setForm(p => ({ ...p, [k]: v }))
  const years = Array.from({ length: 60 }, (_, i) => new Date().getFullYear() - i)
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? 'Edit Education' : 'Add Education'} size="md">
      <div className="space-y-4">
        <div><label className={LABEL}>Institution *</label><input className={INP} value={form.institution} onChange={e => set('institution', e.target.value)} placeholder="e.g. JUST University" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={LABEL}>Degree *</label><input className={INP} value={form.degree} onChange={e => set('degree', e.target.value)} placeholder="B.Sc." /></div>
          <div><label className={LABEL}>Field *</label><input className={INP} value={form.fieldOfStudy} onChange={e => set('fieldOfStudy', e.target.value)} placeholder="Computer Science" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={LABEL}>Start Year *</label>
            <select className={INP} value={form.startYear} onChange={e => set('startYear', parseInt(e.target.value))}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div><label className={LABEL}>End Year</label>
            <select className={INP} value={form.endYear ?? ''} onChange={e => set('endYear', e.target.value ? parseInt(e.target.value) : null)}>
              <option value="">Present</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <div><label className={LABEL}>Description</label>
          <textarea className="w-full rounded-xl text-sm px-3 py-2.5 focus:outline-none resize-none bg-[rgba(6,13,28,0.9)] border border-[rgba(99,102,241,0.2)] text-slate-200 placeholder-slate-600 focus:border-[rgba(99,102,241,0.5)]"
            rows={2} value={form.description ?? ''} onChange={e => set('description', e.target.value)} placeholder="Activities, achievements..." /></div>
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

// -- Edit Profile Modal ---------------------------------------------------------
function EditProfileModal({ isOpen, onClose, profile, role, onSubmit, isLoading }: {
  isOpen: boolean; onClose: () => void; profile: any; role: string
  onSubmit: (d: UpdateProfileRequest) => void; isLoading: boolean
}) {
  const teacher = isTeacher(role)
  const [form, setForm] = useState<UpdateProfileRequest>({
    fullName: profile?.fullName ?? '', department: profile?.department ?? '',
    designation: profile?.designation ?? '', studentId: profile?.studentId ?? '',
    bio: profile?.bio ?? '', phoneNumber: profile?.phoneNumber ?? '',
    linkedInUrl: profile?.linkedInUrl ?? '', facebookUrl: profile?.facebookUrl ?? '',
    twitterUrl: profile?.twitterUrl ?? '', gitHubUrl: profile?.gitHubUrl ?? '',
    websiteUrl: profile?.websiteUrl ?? '',
  })
  const set = (k: keyof UpdateProfileRequest, v: string) => setForm(p => ({ ...p, [k]: v }))
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" size="lg">
      <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
        <div>
          <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2"><User className="w-3.5 h-3.5" /> Basic Info</p>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={LABEL}>Full Name *</label><input className={INP} value={form.fullName} onChange={e => set('fullName', e.target.value)} /></div>
            <div><label className={LABEL}>Department *</label>
              <select className={INP} value={form.department} onChange={e => set('department', e.target.value)}>
                <option value="">Select department</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            {teacher
              ? <div><label className={LABEL}>Designation</label><input className={INP} value={form.designation ?? ''} onChange={e => set('designation', e.target.value)} placeholder="e.g. Assistant Professor" /></div>
              : <div><label className={LABEL}>Student ID</label><input className={INP} value={form.studentId ?? ''} onChange={e => set('studentId', e.target.value)} placeholder="e.g. 200109CSE" /></div>
            }
            <div><label className={LABEL}>Phone</label><input className={INP} value={form.phoneNumber ?? ''} onChange={e => set('phoneNumber', e.target.value)} placeholder="+880 1X XX XXX XXX" /></div>
            <div className="col-span-2"><label className={LABEL}>Bio</label>
              <textarea className="w-full rounded-xl text-sm px-3 py-2.5 focus:outline-none resize-none bg-[rgba(6,13,28,0.9)] border border-[rgba(99,102,241,0.2)] text-slate-200 placeholder-slate-600 focus:border-[rgba(99,102,241,0.5)]"
                rows={3} value={form.bio ?? ''} onChange={e => set('bio', e.target.value)} placeholder="Tell others about yourself..." /></div>
          </div>
        </div>
        <div>
          <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Link2 className="w-3.5 h-3.5" /> Social Links</p>
          <div className="space-y-2.5">
            {[
              { key: 'linkedInUrl', icon: <Linkedin className="w-4 h-4 text-blue-400" />, placeholder: 'linkedin.com/in/yourname' },
              { key: 'facebookUrl', icon: <Facebook className="w-4 h-4 text-blue-500" />, placeholder: 'facebook.com/yourname' },
              { key: 'twitterUrl', icon: <Twitter className="w-4 h-4 text-sky-400" />, placeholder: 'x.com/yourname' },
              { key: 'gitHubUrl', icon: <Github className="w-4 h-4 text-slate-300" />, placeholder: 'github.com/yourname' },
              { key: 'websiteUrl', icon: <Globe className="w-4 h-4 text-emerald-400" />, placeholder: 'yourwebsite.com' },
            ].map(({ key, icon, placeholder }) => (
              <div key={key} className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>{icon}</div>
                <input className={INP} value={(form as any)[key] ?? ''} onChange={e => set(key as any, e.target.value)} placeholder={placeholder} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-3 pt-4 mt-4" style={{ borderTop: "1px solid rgba(99,102,241,0.15)" }}>
        <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button className="flex-1" loading={isLoading} disabled={!form.fullName || !form.department} onClick={() => onSubmit(form)}>Save Changes</Button>
      </div>
    </Modal>
  )
}

// -- Helpers --------------------------------------------------------------------
const SOCIAL_META: Record<string, { icon: any; color: string; label: string }> = {
  linkedInUrl:  { icon: Linkedin, color: "#60a5fa", label: "LinkedIn" },
  facebookUrl:  { icon: Facebook, color: "#818cf8", label: "Facebook" },
  twitterUrl:   { icon: Twitter,  color: "#e2e8f0", label: "X"  },
  gitHubUrl:    { icon: Github,   color: "#e2e8f0", label: "GitHub"   },
  websiteUrl:   { icon: Globe,    color: "#34d399", label: "Website"  },
}

// -- Main -----------------------------------------------------------------------
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
      if (photoMenuRef.current && !photoMenuRef.current.contains(e.target as Node)) setPhotoMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const teacherRole = isTeacher(p?.role ?? 'Student')

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: "#060d18" }}>
      <Spinner size="lg" className="text-indigo-400" />
    </div>
  )
  if (!p) return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center" style={{ background: "#060d18" }}>
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
        <User className="w-7 h-7 text-indigo-400" />
      </div>
      <p className="text-[15px] font-bold text-slate-500 mb-2">Profile not found</p>
      <button onClick={() => navigate(-1)} className="text-sm font-semibold text-indigo-400">? Go back</button>
    </div>
  )

  const handlePhotoChange  = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) own.uploadPhoto(f) }
  const handleCoverChange  = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) own.uploadCover(f) }
  const handleEditSubmit   = (data: UpdateProfileRequest) => own.updateProfile(data, { onSuccess: () => setEditOpen(false) })
  const handleEduSubmit    = (data: EducationRequest) => {
    if (eduModal.item) own.updateEducation({ id: eduModal.item.id, data }, { onSuccess: () => setEduModal({ open: false }) })
    else own.addEducation(data, { onSuccess: () => setEduModal({ open: false }) })
  }

  // Build social links from profile
  const socialLinks = Object.entries(SOCIAL_META)
    .map(([key, meta]) => ({ key, url: (p as any)[key] as string | undefined, ...meta }))
    .filter(s => s.url)

  return (
    <div style={{ minHeight: "100vh", background: "#060d18" }}>

      {/* -- Ambient glow -- */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{ position:"absolute", top:"-5%", left:"15%", width:"600px", height:"500px", borderRadius:"50%", background:"radial-gradient(circle,rgba(79,70,229,0.10) 0%,transparent 70%)", filter:"blur(60px)" }} />
        <div style={{ position:"absolute", top:"40%", right:"-8%", width:"500px", height:"400px", borderRadius:"50%", background:"radial-gradient(circle,rgba(139,92,246,0.07) 0%,transparent 70%)", filter:"blur(60px)" }} />
        <div style={{ position:"absolute", bottom:"5%", left:"5%", width:"400px", height:"400px", borderRadius:"50%", background:"radial-gradient(circle,rgba(6,182,212,0.05) 0%,transparent 70%)", filter:"blur(60px)" }} />
      </div>

      <div style={{ position:"relative", zIndex:1 }}>

        {/* --------------------------------------------
            HERO SECTION � cover + avatar + identity
        -------------------------------------------- */}
        <div className="relative">

          {/* Cover */}
          <div className="relative h-56 lg:h-72 group overflow-hidden">
            {p.coverPhotoUrl
              ? <img src={p.coverPhotoUrl} alt="Cover" className="w-full h-full object-cover cursor-pointer" onClick={() => setFullscreen(p.coverPhotoUrl!)} />
              : <div className="w-full h-full" style={{ background: "linear-gradient(135deg,#1e1b4b 0%,#3730a3 30%,#4f46e5 55%,#2e1065 80%,#0f172a 100%)" }} />
            }
            {/* Bottom fade to page bg */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to bottom,transparent 40%,rgba(6,13,24,0.7) 80%,#060d18 100%)" }} />

            {/* Cover actions */}
            {(own.isUploadingCover || own.isRemovingCover)
              ? <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><Loader2 className="w-8 h-8 text-white animate-spin" /></div>
              : isOwnProfile && (
                <div className="absolute bottom-4 right-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-bold cursor-pointer backdrop-blur-sm transition-all"
                    style={{ background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.15)" }}>
                    <ImagePlus className="w-3.5 h-3.5" />{p.coverPhotoUrl ? 'Change Cover' : 'Add Cover'}
                    <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                  </label>
                  {p.coverPhotoUrl && (
                    <button onClick={() => own.removeCover()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-bold backdrop-blur-sm"
                      style={{ background: "rgba(239,68,68,0.65)", border: "1px solid rgba(239,68,68,0.4)" }}>
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  )}
                </div>
              )
            }
          </div>

          {/* -- Identity Panel (overlapping cover bottom) -- */}
          <div className="max-w-5xl mx-auto px-5 lg:px-10">
            <div className="-mt-20 pb-0">

              {/* Row 1: Avatar + Edit button */}
              <div className="flex items-end justify-between">

                {/* Avatar */}
                <div className="relative" ref={photoMenuRef}>
                  <div className="w-32 h-32 rounded-2xl overflow-hidden cursor-pointer relative group/av"
                    style={{
                      border: "4px solid #060d18",
                      boxShadow: "0 0 0 2px rgba(99,102,241,0.5), 0 8px 40px rgba(0,0,0,0.6)",
                    }}
                    onClick={() => isOwnProfile ? setPhotoMenuOpen(v => !v) : p.profilePhotoUrl && setFullscreen(p.profilePhotoUrl)}>
                    {own.isUploading || own.isRemovingPhoto
                      ? <div className="w-full h-full flex items-center justify-center" style={{ background: "#0a1020" }}><Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /></div>
                      : <>
                          <Avatar src={p.profilePhotoUrl} name={p.fullName} size="xl" className="w-full h-full rounded-none" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/av:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                            <Camera className="w-6 h-6 text-white" />
                          </div>
                        </>
                    }
                  </div>

                  {/* Online dot */}
                  <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2"
                    style={{ background: "#10b981", borderColor: "#060d18", boxShadow: "0 0 8px rgba(16,185,129,0.6)" }} />

                  {/* Photo menu */}
                  <AnimatePresence>
                    {isOwnProfile && photoMenuOpen && (
                      <motion.div initial={{ opacity:0, scale:0.92, y:6 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.92, y:6 }} transition={{ duration:0.15 }}
                        className="absolute left-0 top-[calc(100%+8px)] z-30 w-48 rounded-2xl overflow-hidden"
                        style={{ background:"rgba(8,14,32,0.98)", border:"1px solid rgba(99,102,241,0.25)", boxShadow:"0 8px 32px rgba(0,0,0,0.6)" }}>
                        {p.profilePhotoUrl && (
                          <button onClick={() => { setPhotoMenuOpen(false); setFullscreen(p.profilePhotoUrl!) }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[rgba(99,102,241,0.1)] transition-colors" style={{ color:"#94a3b8" }}>
                            <ExternalLink className="w-4 h-4" /> View photo
                          </button>
                        )}
                        <label className="w-full flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer hover:bg-[rgba(99,102,241,0.1)] transition-colors" style={{ color:"#94a3b8" }}>
                          <Camera className="w-4 h-4" />{p.profilePhotoUrl ? 'Change photo' : 'Upload photo'}
                          <input type="file" accept="image/*" className="hidden" onChange={e => { setPhotoMenuOpen(false); handlePhotoChange(e) }} />
                        </label>
                        {p.profilePhotoUrl && (
                          <>
                            <div className="h-px mx-3" style={{ background:"rgba(99,102,241,0.15)" }} />
                            <button onClick={() => { setPhotoMenuOpen(false); own.removePhoto() }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[rgba(239,68,68,0.1)] transition-colors" style={{ color:"#f87171" }}>
                              <Trash2 className="w-4 h-4" /> Delete photo
                            </button>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Edit button */}
                {isOwnProfile && (
                  <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} onClick={() => setEditOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold mb-2"
                    style={{ background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.35)", color:"#a5b4fc" }}>
                    <Pencil className="w-3.5 h-3.5" /> Edit Profile
                  </motion.button>
                )}
              </div>

              {/* Row 2: Name + role + designation */}
              <div className="mt-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-[26px] lg:text-[30px] font-extrabold tracking-tight" style={{ color:"#f1f5f9" }}>{p.fullName}</h1>
                  <span className="px-3 py-1 rounded-full text-[12px] font-extrabold"
                    style={{
                      background: teacherRole ? "linear-gradient(135deg,rgba(245,158,11,0.15),rgba(217,119,6,0.15))" : "linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.15))",
                      border: teacherRole ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(99,102,241,0.4)",
                      color: teacherRole ? "#fbbf24" : "#a5b4fc",
                    }}>
                    {teacherRole ? 'Teacher' : 'Student'}
                  </span>
                </div>

                {p.designation && <p className="text-[14px] font-semibold mt-1" style={{ color:"#6366f1" }}>{p.designation}</p>}

                {/* Contact meta row */}
                <div className="flex items-center gap-4 flex-wrap mt-2 text-[12.5px]" style={{ color:"#334155" }}>
                  {p.department && <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />{p.department}</span>}
                  {!teacherRole && p.studentId && <span className="flex items-center gap-1.5 font-mono"><Shield className="w-3.5 h-3.5" />{p.studentId}</span>}
                  {p.email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{p.email}</span>}
                  {p.phoneNumber && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{p.phoneNumber}</span>}
                </div>

                {/* -- SOCIAL ICONS ROW (right here, below contact) -- */}
                {socialLinks.length > 0 && (
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {socialLinks.map(s => {
                      const Icon = s.icon
                      return (
                        <motion.a key={s.key} href={s.url} target="_blank" rel="noopener noreferrer"
                          whileHover={{ scale:1.1, y:-1 }} whileTap={{ scale:0.95 }}
                          title={s.label}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all"
                          style={{ background:`${s.color}12`, border:`1px solid ${s.color}30`, color:s.color }}>
                          {s.label === "X"
                            ? <span className="text-[13px] font-black leading-none" style={{ fontFamily:"serif" }}>𝕏</span>
                            : <Icon className="w-3.5 h-3.5" />
                          }
                          <span className="hidden sm:inline">{s.label}</span>
                        </motion.a>
                      )
                    })}
                  </div>
                )}

                {/* Bio */}
                {p.bio && <p className="text-[13px] leading-relaxed mt-3 max-w-2xl" style={{ color:"#475569" }}>{p.bio}</p>}

                {/* -- Stats -- */}
                <div className="flex items-center gap-3 mt-4 pb-6 flex-wrap">
                  {[
                    { icon: <BookOpen className="w-3.5 h-3.5" style={{ color:"#818cf8" }} />, val: p.courses?.length ?? 0,   label: teacherRole ? "Teaching" : "Courses"  },
                    { icon: <GraduationCap className="w-3.5 h-3.5" style={{ color:"#34d399" }} />, val: p.education?.length ?? 0, label: "Education" },
                  ].map(s => (
                    <div key={s.label} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
                      style={{ background:"rgba(99,102,241,0.07)", border:"1px solid rgba(99,102,241,0.13)" }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background:"rgba(99,102,241,0.12)" }}>{s.icon}</div>
                      <div>
                        <p className="text-[15px] font-extrabold leading-none" style={{ color:"#e2e8f0" }}>{s.val}</p>
                        <p className="text-[10px] font-semibold mt-0.5" style={{ color:"#334155" }}>{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --------------------------------------------
            BODY � Education + Courses
        -------------------------------------------- */}
        <div className="max-w-5xl mx-auto px-5 lg:px-10 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* LEFT � About + Education */}
            <div className="lg:col-span-2 space-y-5">

              {/* About */}
              {p.bio && (
                <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
                  className="rounded-2xl p-5" style={{ background:"rgba(10,16,34,0.85)", border:"1px solid rgba(99,102,241,0.12)" }}>
                  <h2 className="text-[11px] font-extrabold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color:"#6366f1" }}>
                    <User className="w-3.5 h-3.5" /> About
                  </h2>
                  <p className="text-[13.5px] leading-relaxed" style={{ color:"#475569" }}>{p.bio}</p>
                </motion.div>
              )}

              {/* Education */}
              <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }}
                className="rounded-2xl p-5" style={{ background:"rgba(10,16,34,0.85)", border:"1px solid rgba(99,102,241,0.12)" }}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-[11px] font-extrabold uppercase tracking-widest flex items-center gap-2" style={{ color:"#6366f1" }}>
                    <GraduationCap className="w-3.5 h-3.5" /> Education
                  </h2>
                  {isOwnProfile && (
                    <motion.button whileTap={{ scale:0.95 }} onClick={() => setEduModal({ open:true, item:null })}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold"
                      style={{ background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.25)", color:"#818cf8" }}>
                      <Plus className="w-3 h-3" /> Add
                    </motion.button>
                  )}
                </div>

                {p.education.length === 0
                  ? <div className="text-center py-10">
                      <GraduationCap className="w-10 h-10 mx-auto mb-2 opacity-10" style={{ color:"#6366f1" }} />
                      <p className="text-sm" style={{ color:"#1e293b" }}>No education added yet</p>
                      {isOwnProfile && <button onClick={() => setEduModal({ open:true })} className="mt-2 text-xs font-semibold" style={{ color:"#6366f1" }}>+ Add your education</button>}
                    </div>
                  : <div className="space-y-5">
                      <AnimatePresence>
                        {p.education.map((edu, i) => (
                          <motion.div key={edu.id} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, x:-10 }} transition={{ delay:i*0.04 }}
                            className="flex items-start gap-4 group relative pl-5"
                            style={{ borderLeft:"2px solid rgba(99,102,241,0.2)" }}>
                            <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full"
                              style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow:"0 0 8px rgba(99,102,241,0.5)" }} />
                            <div className="flex-1 min-w-0">
                              <p className="font-extrabold text-[14px]" style={{ color:"#e2e8f0" }}>{edu.institution}</p>
                              <p className="text-[13px] mt-0.5 font-semibold" style={{ color:"#6366f1" }}>{edu.degree} � {edu.fieldOfStudy}</p>
                              <p className="text-[11.5px] flex items-center gap-1.5 mt-1" style={{ color:"#334155" }}>
                                <Calendar className="w-3 h-3" />{edu.startYear} � {edu.endYear ?? 'Present'}
                              </p>
                              {edu.description && <p className="text-[12px] mt-1.5 leading-relaxed" style={{ color:"#1e293b" }}>{edu.description}</p>}
                            </div>
                            {isOwnProfile && (
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <button onClick={() => setEduModal({ open:true, item:edu })} className="p-1.5 rounded-lg" style={{ color:"#475569" }}><Pencil className="w-3.5 h-3.5" /></button>
                                <button disabled={deletingEduId === edu.id}
                                  onClick={() => { setDeletingEduId(edu.id); own.deleteEducation(edu.id, { onSuccess: () => setDeletingEduId(null) }) }}
                                  className="p-1.5 rounded-lg" style={{ color:"#f87171" }}>
                                  {deletingEduId === edu.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
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

            {/* RIGHT � Courses */}
            <div className="space-y-5">
              <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.08 }}
                className="rounded-2xl p-5" style={{ background:"rgba(10,16,34,0.85)", border:"1px solid rgba(99,102,241,0.12)" }}>
                <h2 className="text-[11px] font-extrabold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color:"#6366f1" }}>
                  <BookOpen className="w-3.5 h-3.5" />{teacherRole ? 'Teaching' : 'Courses'}
                </h2>
                {p.courses.length === 0
                  ? <div className="text-center py-8">
                      <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-10" style={{ color:"#6366f1" }} />
                      <p className="text-sm" style={{ color:"#1e293b" }}>No active courses</p>
                    </div>
                  : <div className="space-y-2">
                      {p.courses.map((c, i) => (
                        <motion.div key={c.id} initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.04 }}
                          onClick={() => navigate(`/courses/${c.id}/stream`)}
                          className="flex items-center gap-3 p-3 rounded-xl cursor-pointer group transition-all"
                          style={{ background:"rgba(6,13,28,0.6)", border:"1px solid rgba(99,102,241,0.08)" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor="rgba(99,102,241,0.3)"; (e.currentTarget as HTMLElement).style.background="rgba(99,102,241,0.06)" }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor="rgba(99,102,241,0.08)"; (e.currentTarget as HTMLElement).style.background="rgba(6,13,28,0.6)" }}>
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.2)" }}>
                            <BookOpen className="w-4 h-4" style={{ color:"#818cf8" }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-bold truncate" style={{ color:"#cbd5e1" }}>{c.title}</p>
                            <p className="text-[11px]" style={{ color:"#334155" }}>{c.courseCode} � {c.semester}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 shrink-0" style={{ color:"#6366f1" }} />
                        </motion.div>
                      ))}
                    </div>
                }
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {fullscreen && <FullscreenImage url={fullscreen} onClose={() => setFullscreen(null)} />}

      {isOwnProfile && (
        <>
          <EditProfileModal isOpen={editOpen} onClose={() => setEditOpen(false)} profile={own.profile} role={user?.role ?? 'Student'} onSubmit={handleEditSubmit} isLoading={own.isUpdating} />
          <EducationModal isOpen={eduModal.open} onClose={() => setEduModal({ open:false })} initial={eduModal.item} onSubmit={handleEduSubmit} isLoading={own.isAddingEdu || own.isUpdatingEdu} />
        </>
      )}
    </div>
  )
}
