import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Mail, Phone, Linkedin, BookOpen, GraduationCap, Pencil, Plus,
  Trash2, X, Camera, ExternalLink, Building2, Calendar, User,
  Facebook, Twitter, Github, Globe, ImagePlus, Loader2, Shield, Link2,
} from "lucide-react"
import Avatar from "@/components/ui/Avatar"
import Button from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"
import Spinner from "@/components/ui/Spinner"
import { useAuthStore } from "@/store/authStore"
import { useThemeStore } from "@/store/themeStore"
import { useProfile } from "../hooks/useProfile"
import { usePublicProfile } from "../hooks/usePublicProfile"
import { DEPARTMENTS } from "@/config/constants"
import { isTeacher } from "@/utils/roleGuard"
import type { UserEducationDto, PublicProfileDto } from "@/types/auth.types"
import type { UpdateProfileRequest, EducationRequest } from "../services/profileService"

// -- Input styles --------------------------------------------
const getInputStyle = (dark: boolean, error = false) => ({
  background: dark ? "rgba(255,255,255,0.05)" : "#f9fafb",
  border: `1px solid ${error ? "#ef4444" : (dark ? "rgba(99,102,241,0.2)" : "#e5e7eb")}`,
  color: dark ? "#e2e8f8" : "#111827",
  borderRadius: 12,
  padding: "8px 12px",
  width: "100%",
  fontSize: 13,
  outline: "none",
})

// -- Fullscreen image ----------------------------------------
function FullscreenImage({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white">
        <X style={{ width: 20, height: 20 }} />
      </button>
      <img src={url} alt="" onClick={e => e.stopPropagation()}
        className="max-w-[92vw] max-h-[92vh] rounded-2xl object-contain" />
    </div>
  )
}

// -- Education Modal -----------------------------------------
function EducationModal({ isOpen, onClose, initial, onSubmit, isLoading, dark }: {
  isOpen: boolean; onClose: () => void; initial?: UserEducationDto | null
  onSubmit: (d: EducationRequest) => void; isLoading: boolean; dark: boolean
}) {
  const [form, setForm] = useState<EducationRequest>({
    institution: initial?.institution ?? "", degree: initial?.degree ?? "",
    fieldOfStudy: initial?.fieldOfStudy ?? "",
    startYear: initial?.startYear ?? new Date().getFullYear(),
    endYear: initial?.endYear ?? null, description: initial?.description ?? "",
  })
  const set = (k: keyof EducationRequest, v: any) => setForm(p => ({ ...p, [k]: v }))
  const years = Array.from({ length: 60 }, (_, i) => new Date().getFullYear() - i)
  const inp = getInputStyle(dark)
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? "Edit Education" : "Add Education"} size="md">
      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: dark ? "#8896c8" : "#6b7280" }}>Institution *</label>
          <input style={inp} value={form.institution} onChange={e => set("institution", e.target.value)} placeholder="e.g. JUST University" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: dark ? "#8896c8" : "#6b7280" }}>Degree *</label>
            <input style={inp} value={form.degree} onChange={e => set("degree", e.target.value)} placeholder="B.Sc." />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: dark ? "#8896c8" : "#6b7280" }}>Field *</label>
            <input style={inp} value={form.fieldOfStudy} onChange={e => set("fieldOfStudy", e.target.value)} placeholder="Computer Science" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: dark ? "#8896c8" : "#6b7280" }}>Start Year *</label>
            <select style={inp} value={form.startYear} onChange={e => set("startYear", parseInt(e.target.value))}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: dark ? "#8896c8" : "#6b7280" }}>End Year</label>
            <select style={inp} value={form.endYear ?? ""} onChange={e => set("endYear", e.target.value ? parseInt(e.target.value) : null)}>
              <option value="">Present</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: dark ? "#8896c8" : "#6b7280" }}>Description</label>
          <textarea style={{ ...inp, minHeight: 72, resize: "none" } as any}
            rows={2} value={form.description ?? ""} onChange={e => set("description", e.target.value)}
            placeholder="Activities, achievements..." />
        </div>
        <div className="flex gap-3 pt-1">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" loading={isLoading}
            disabled={!form.institution || !form.degree || !form.fieldOfStudy}
            onClick={() => onSubmit(form)}>
            {initial ? "Save Changes" : "Add Education"}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// -- Edit Profile Modal ---------------------------------------
function EditProfileModal({ isOpen, onClose, profile, role, onSubmit, isLoading, dark }: {
  isOpen: boolean; onClose: () => void; profile: any; role: string
  onSubmit: (d: UpdateProfileRequest) => void; isLoading: boolean; dark: boolean
}) {
  const teacher = isTeacher(role)
  const [form, setForm] = useState<UpdateProfileRequest>({
    fullName: profile?.fullName ?? "", department: profile?.department ?? "",
    designation: profile?.designation ?? "", studentId: profile?.studentId ?? "",
    bio: profile?.bio ?? "", phoneNumber: profile?.phoneNumber ?? "",
    linkedInUrl: profile?.linkedInUrl ?? "", facebookUrl: profile?.facebookUrl ?? "",
    twitterUrl: profile?.twitterUrl ?? "", gitHubUrl: profile?.gitHubUrl ?? "",
    websiteUrl: profile?.websiteUrl ?? "",
  })
  const set = (k: keyof UpdateProfileRequest, v: string) => setForm(p => ({ ...p, [k]: v }))
  const inp = getInputStyle(dark)
  const labelStyle = { color: dark ? "#8896c8" : "#6b7280" }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" size="lg">
      <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: "#6366f1" }}>
            <User style={{ width: 13, height: 13 }} /> Basic Info
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={labelStyle}>Full Name *</label>
              <input style={inp} value={form.fullName} onChange={e => set("fullName", e.target.value)} />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={labelStyle}>Department *</label>
              <select style={inp} value={form.department} onChange={e => set("department", e.target.value)}>
                <option value="">Select department</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            {teacher
              ? <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={labelStyle}>Designation</label>
                  <input style={inp} value={form.designation ?? ""} onChange={e => set("designation", e.target.value)} placeholder="e.g. Assistant Professor" />
                </div>
              : <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={labelStyle}>Student ID</label>
                  <input style={inp} value={form.studentId ?? ""} onChange={e => set("studentId", e.target.value)} placeholder="e.g. 200109CSE" />
                </div>
            }
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={labelStyle}>Phone</label>
              <input style={inp} value={form.phoneNumber ?? ""} onChange={e => set("phoneNumber", e.target.value)} placeholder="+880 1X XX XXX XXX" />
            </div>
            <div className="col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={labelStyle}>Bio</label>
              <textarea style={{ ...inp, minHeight: 80, resize: "none" } as any}
                rows={3} value={form.bio ?? ""} onChange={e => set("bio", e.target.value)}
                placeholder="Tell others about yourself..." />
            </div>
          </div>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: "#6366f1" }}>
            <Link2 style={{ width: 13, height: 13 }} /> Social Links
          </p>
          <div className="space-y-2.5">
            {[
              { key: "linkedInUrl", icon: <Linkedin style={{ width: 16, height: 16, color: "#0077b5" }} />, placeholder: "linkedin.com/in/yourname" },
              { key: "facebookUrl", icon: <Facebook style={{ width: 16, height: 16, color: "#1877f2" }} />, placeholder: "facebook.com/yourname" },
              { key: "twitterUrl",  icon: <Twitter  style={{ width: 16, height: 16, color: "#1da1f2" }} />, placeholder: "x.com/yourname" },
              { key: "gitHubUrl",   icon: <Github   style={{ width: 16, height: 16, color: dark ? "#e2e8f0" : "#333" }} />, placeholder: "github.com/yourname" },
              { key: "websiteUrl",  icon: <Globe    style={{ width: 16, height: 16, color: "#059669" }} />, placeholder: "yourwebsite.com" },
            ].map(({ key, icon, placeholder }) => (
              <div key={key} className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: dark ? "rgba(99,102,241,0.1)" : "#f9fafb", border: `1px solid ${dark ? "rgba(99,102,241,0.2)" : "#e5e7eb"}` }}>
                  {icon}
                </div>
                <input style={{ ...inp, flex: 1 }} value={(form as any)[key] ?? ""}
                  onChange={e => set(key as any, e.target.value)} placeholder={placeholder} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-3 pt-4 mt-4" style={{ borderTop: `1px solid ${dark ? "rgba(99,102,241,0.15)" : "#f3f4f6"}` }}>
        <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button className="flex-1" loading={isLoading}
          disabled={!form.fullName || !form.department} onClick={() => onSubmit(form)}>
          Save Changes
        </Button>
      </div>
    </Modal>
  )
}

// -- Social config --------------------------------------------
const SOCIAL_META: Record<string, { icon: any; color: string; label: string }> = {
  linkedInUrl:  { icon: Linkedin, color: "#0077b5", label: "LinkedIn" },
  facebookUrl:  { icon: Facebook, color: "#1877f2", label: "Facebook" },
  twitterUrl:   { icon: Twitter,  color: "#1da1f2", label: "X"        },
  gitHubUrl:    { icon: Github,   color: "#6b7280", label: "GitHub"   },
  websiteUrl:   { icon: Globe,    color: "#059669", label: "Website"  },
}

// -- Main Component -------------------------------------------
interface Props { userId?: string; isOwnProfile?: boolean }

export default function ProfilePage({ userId, isOwnProfile = false }: Props) {
  const { user }   = useAuthStore()
  const { dark }   = useThemeStore()
  const navigate   = useNavigate()
  const coverRef   = useRef<HTMLInputElement>(null)

  const own = useProfile()
  const pub = usePublicProfile(isOwnProfile ? user?.id : userId)
  const isLoading = isOwnProfile ? own.isLoading : pub.isLoading
  const p: PublicProfileDto | null = pub.data ?? null

  const [fullscreen,    setFullscreen]    = useState<string | null>(null)
  const [photoMenuOpen, setPhotoMenuOpen] = useState(false)
  const [editOpen,      setEditOpen]      = useState(false)
  const [eduModal,      setEduModal]      = useState<{ open: boolean; item?: UserEducationDto | null }>({ open: false })
  const [deletingEduId, setDeletingEduId] = useState<string | null>(null)
  const photoMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (photoMenuRef.current && !photoMenuRef.current.contains(e.target as Node))
        setPhotoMenuOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const teacherRole = isTeacher(p?.role ?? "Student")

  // Theme tokens
  const bg       = dark ? "rgb(11,17,32)"         : "rgb(248,249,255)"
  const cardBg   = dark ? "rgba(16,24,44,0.75)"   : "rgba(255,255,255,0.92)"
  const blur     = "blur(20px)"
  const border   = dark ? "rgba(99,102,241,0.15)" : "#e5e7eb"
  const divider  = dark ? "rgba(99,102,241,0.1)"  : "#f3f4f6"
  const textMain = dark ? "#e2e8f8"               : "#111827"
  const textSub  = dark ? "#8896c8"               : "#6b7280"
  const textMuted= dark ? "#5a6a9a"               : "#9ca3af"
  const labelCol = dark ? "rgba(99,102,241,0.55)" : "#9ca3af"

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: bg }}>
      <Spinner size="lg" />
    </div>
  )
  if (!p) return (
    <div className="flex flex-col items-center justify-center min-h-screen" style={{ background: bg }}>
      <p style={{ color: textSub }}>Profile not found.</p>
      <button onClick={() => navigate(-1)} className="mt-2 text-sm font-semibold" style={{ color: "#6366f1" }}>Go back</button>
    </div>
  )

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) own.uploadPhoto(f) }
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) own.uploadCover(f) }
  const handleEditSubmit  = (data: UpdateProfileRequest) => own.updateProfile(data, { onSuccess: () => setEditOpen(false) })
  const handleEduSubmit   = (data: EducationRequest) => {
    if (eduModal.item) own.updateEducation({ id: eduModal.item.id, data }, { onSuccess: () => setEduModal({ open: false }) })
    else own.addEducation(data, { onSuccess: () => setEduModal({ open: false }) })
  }

  const socialLinks = Object.entries(SOCIAL_META)
    .map(([key, meta]) => ({ key, url: (p as any)[key] as string | undefined, ...meta }))
    .filter(s => s.url)

  const bannerGrad = teacherRole
    ? "linear-gradient(135deg,#4f46e5 0%,#0891b2 100%)"
    : "linear-gradient(135deg,#7c3aed 0%,#db2777 100%)"

  return (
    <div style={{ minHeight: "100vh", background: bg }}>
      {fullscreen && <FullscreenImage url={fullscreen} onClose={() => setFullscreen(null)} />}

      {/* -- Cover -- */}
      <div className="relative h-52 lg:h-64 group overflow-hidden">
        {p.coverPhotoUrl
          ? <img src={p.coverPhotoUrl} alt="Cover" className="w-full h-full object-cover cursor-pointer opacity-90"
              onClick={() => setFullscreen(p.coverPhotoUrl!)} />
          : <div className="w-full h-full" style={{ background: bannerGrad }} />
        }
        {/* Overlay pattern */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        {/* Bottom fade */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `linear-gradient(to bottom,transparent 40%,${bg} 100%)` }} />

        {/* Cover actions */}
        {(own.isUploadingCover || own.isRemovingCover)
          ? <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 style={{ width: 28, height: 28, color: "white" }} className="animate-spin" />
            </div>
          : isOwnProfile && (
            <div className="absolute bottom-4 right-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-[12px] font-bold cursor-pointer"
                style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)" }}>
                <ImagePlus style={{ width: 13, height: 13 }} />
                {p.coverPhotoUrl ? "Change" : "Add Cover"}
                <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
              </label>
              {p.coverPhotoUrl && (
                <button onClick={() => own.removeCover()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-[12px] font-bold"
                  style={{ background: "rgba(239,68,68,0.6)", backdropFilter: "blur(8px)" }}>
                  <Trash2 style={{ width: 13, height: 13 }} /> Remove
                </button>
              )}
            </div>
          )
        }
      </div>

      {/* -- Identity -- */}
      <div className="max-w-5xl mx-auto px-5 lg:px-10 -mt-16 relative z-10">
        <div className="flex items-end justify-between mb-4">

          {/* Avatar */}
          <div className="relative" ref={photoMenuRef}>
            <div className="w-28 h-28 rounded-2xl overflow-hidden cursor-pointer relative group/av"
              style={{ border: `4px solid ${bg}`, boxShadow: `0 0 0 2px ${dark ? "rgba(99,102,241,0.4)" : "#c7d2fe"}, 0 8px 32px rgba(0,0,0,0.2)` }}
              onClick={() => isOwnProfile ? setPhotoMenuOpen(v => !v) : p.profilePhotoUrl && setFullscreen(p.profilePhotoUrl)}>
              {own.isUploading || own.isRemovingPhoto
                ? <div className="w-full h-full flex items-center justify-center" style={{ background: cardBg }}>
                    <Loader2 style={{ width: 22, height: 22, color: "#6366f1" }} className="animate-spin" />
                  </div>
                : <>
                    <Avatar src={p.profilePhotoUrl} name={p.fullName} size="xl" className="w-full h-full rounded-none" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/av:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera style={{ width: 20, height: 20, color: "white" }} />
                    </div>
                  </>
              }
            </div>
            {/* Online dot */}
            <div className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full"
              style={{ background: "#10b981", border: `2px solid ${bg}`, boxShadow: "0 0 6px rgba(16,185,129,0.5)" }} />

            {/* Photo menu */}
            <AnimatePresence>
              {isOwnProfile && photoMenuOpen && (
                <motion.div initial={{ opacity: 0, scale: 0.94, y: 6 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: 6 }} transition={{ duration: 0.14 }}
                  className="absolute left-0 top-[calc(100%+8px)] z-30 w-48 rounded-2xl overflow-hidden"
                  style={{ background: dark ? "rgb(16,24,44)" : "white", border: `1px solid ${border}`, boxShadow: dark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 24px rgba(0,0,0,0.12)" }}>
                  {p.profilePhotoUrl && (
                    <button onClick={() => { setPhotoMenuOpen(false); setFullscreen(p.profilePhotoUrl!) }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-colors"
                      style={{ color: textSub }}
                      onMouseEnter={e => (e.currentTarget.style.background = dark ? "rgba(99,102,241,0.1)" : "#f9fafb")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <ExternalLink style={{ width: 14, height: 14 }} /> View photo
                    </button>
                  )}
                  <label className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium cursor-pointer transition-colors"
                    style={{ color: textSub }}
                    onMouseEnter={e => (e.currentTarget.style.background = dark ? "rgba(99,102,241,0.1)" : "#f9fafb")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <Camera style={{ width: 14, height: 14 }} />
                    {p.profilePhotoUrl ? "Change photo" : "Upload photo"}
                    <input type="file" accept="image/*" className="hidden"
                      onChange={e => { setPhotoMenuOpen(false); handlePhotoChange(e) }} />
                  </label>
                  {p.profilePhotoUrl && (
                    <>
                      <div className="h-px mx-3" style={{ background: divider }} />
                      <button onClick={() => { setPhotoMenuOpen(false); own.removePhoto() }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-colors"
                        style={{ color: "#ef4444" }}
                        onMouseEnter={e => (e.currentTarget.style.background = dark ? "rgba(239,68,68,0.1)" : "#fef2f2")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                        <Trash2 style={{ width: 14, height: 14 }} /> Delete photo
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Edit button */}
          {isOwnProfile && (
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold mb-2"
              style={{ background: dark ? "rgba(99,102,241,0.12)" : "#eef2ff", border: `1px solid ${dark ? "rgba(99,102,241,0.3)" : "#c7d2fe"}`, color: "#6366f1" }}>
              <Pencil style={{ width: 13, height: 13 }} /> Edit Profile
            </motion.button>
          )}
        </div>

        {/* Name + role */}
        <div className="mb-5">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <h1 className="text-[26px] font-extrabold tracking-tight" style={{ color: textMain }}>{p.fullName}</h1>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold"
              style={{
                background: teacherRole ? (dark ? "rgba(217,119,6,0.15)" : "#fffbeb") : (dark ? "rgba(99,102,241,0.15)" : "#eef2ff"),
                border: teacherRole ? (dark ? "1px solid rgba(217,119,6,0.3)" : "1px solid #fde68a") : (dark ? "1px solid rgba(99,102,241,0.3)" : "1px solid #c7d2fe"),
                color: teacherRole ? "#d97706" : "#6366f1",
              }}>
              {teacherRole ? "Teacher" : "Student"}
            </span>
          </div>

          {p.designation && <p className="text-[14px] font-semibold mb-2" style={{ color: "#6366f1" }}>{p.designation}</p>}

          <div className="flex items-center gap-4 flex-wrap text-[12.5px] mb-3" style={{ color: textSub }}>
            {p.department   && <span className="flex items-center gap-1.5"><Building2 style={{ width: 13, height: 13 }} />{p.department}</span>}
            {!teacherRole && p.studentId && <span className="flex items-center gap-1.5 font-mono"><Shield style={{ width: 13, height: 13 }} />{p.studentId}</span>}
            {p.email        && <span className="flex items-center gap-1.5"><Mail style={{ width: 13, height: 13 }} />{p.email}</span>}
            {p.phoneNumber  && <span className="flex items-center gap-1.5"><Phone style={{ width: 13, height: 13 }} />{p.phoneNumber}</span>}
          </div>

          {/* Social links */}
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {socialLinks.map(s => (
                <motion.a key={s.key} href={s.url} target="_blank" rel="noopener noreferrer"
                  whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all"
                  style={{ background: `${s.color}12`, border: `1px solid ${s.color}28`, color: s.color }}>
                  <s.icon style={{ width: 13, height: 13 }} />
                  <span className="hidden sm:inline">{s.label}</span>
                </motion.a>
              ))}
            </div>
          )}

          {/* Bio */}
          {p.bio && <p className="text-[13px] leading-relaxed max-w-2xl" style={{ color: textSub }}>{p.bio}</p>}

          {/* Stats */}
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            {[
              { icon: BookOpen,      color: "#6366f1", val: p.courses?.length ?? 0,   label: teacherRole ? "Teaching" : "Courses" },
              { icon: GraduationCap, color: "#059669", val: p.education?.length ?? 0, label: "Education" },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl"
                style={{ background: dark ? `${s.color}12` : `${s.color}08`, border: `1px solid ${s.color}22` }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${s.color}18` }}>
                  <s.icon style={{ width: 13, height: 13, color: s.color }} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[15px] font-extrabold leading-none" style={{ color: textMain }}>{s.val}</p>
                  <p className="text-[10px] font-semibold mt-0.5" style={{ color: textMuted }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* -- Body -- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pb-12">

          {/* Left: About + Education */}
          <div className="lg:col-span-2 space-y-5">

            {/* About */}
            {p.bio && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-5"
                style={{ background: cardBg, backdropFilter: blur, WebkitBackdropFilter: blur, border: `1px solid ${border}` }}>
                <h2 className="text-[11px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: labelCol }}>
                  <User style={{ width: 12, height: 12 }} /> About
                </h2>
                <p className="text-[13.5px] leading-relaxed" style={{ color: textSub }}>{p.bio}</p>
              </motion.div>
            )}

            {/* Education */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="rounded-2xl p-5"
              style={{ background: cardBg, backdropFilter: blur, WebkitBackdropFilter: blur, border: `1px solid ${border}` }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: labelCol }}>
                  <GraduationCap style={{ width: 12, height: 12 }} /> Education
                </h2>
                {isOwnProfile && (
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => setEduModal({ open: true, item: null })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold"
                    style={{ background: dark ? "rgba(99,102,241,0.1)" : "#eef2ff", border: `1px solid ${dark ? "rgba(99,102,241,0.25)" : "#c7d2fe"}`, color: "#6366f1" }}>
                    <Plus style={{ width: 12, height: 12 }} /> Add
                  </motion.button>
                )}
              </div>

              {p.education.length === 0 ? (
                <div className="text-center py-10">
                  <GraduationCap style={{ width: 36, height: 36, color: dark ? "rgba(99,102,241,0.2)" : "#e5e7eb" }} className="mx-auto mb-2" strokeWidth={1} />
                  <p className="text-[13px]" style={{ color: textMuted }}>No education added yet</p>
                  {isOwnProfile && (
                    <button onClick={() => setEduModal({ open: true })}
                      className="mt-2 text-[12px] font-semibold" style={{ color: "#6366f1" }}>
                      + Add your education
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-5">
                  <AnimatePresence>
                    {p.education.map((edu, i) => (
                      <motion.div key={edu.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }} transition={{ delay: i * 0.04 }}
                        className="flex items-start gap-4 group relative pl-5"
                        style={{ borderLeft: `2px solid ${dark ? "rgba(99,102,241,0.25)" : "#c7d2fe"}` }}>
                        <div className="absolute left-[-5px] top-2 w-2.5 h-2.5 rounded-full"
                          style={{ background: "linear-gradient(135deg,#6366f1,#0891b2)", boxShadow: "0 0 6px rgba(99,102,241,0.4)" }} />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[14px]" style={{ color: textMain }}>{edu.institution}</p>
                          <p className="text-[13px] mt-0.5 font-semibold" style={{ color: "#6366f1" }}>
                            {edu.degree} - {edu.fieldOfStudy}
                          </p>
                          <p className="text-[11.5px] flex items-center gap-1.5 mt-1" style={{ color: textMuted }}>
                            <Calendar style={{ width: 11, height: 11 }} />
                            {edu.startYear} - {edu.endYear ?? "Present"}
                          </p>
                          {edu.description && <p className="text-[12px] mt-1.5 leading-relaxed" style={{ color: textSub }}>{edu.description}</p>}
                        </div>
                        {isOwnProfile && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button onClick={() => setEduModal({ open: true, item: edu })}
                              className="p-1.5 rounded-lg transition-colors" style={{ color: textMuted }}
                              onMouseEnter={e => (e.currentTarget.style.background = dark ? "rgba(99,102,241,0.1)" : "#f3f4f6")}
                              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                              <Pencil style={{ width: 13, height: 13 }} />
                            </button>
                            <button
                              onClick={async () => { setDeletingEduId(edu.id); await own.deleteEducation(edu.id); setDeletingEduId(null) }}
                              className="p-1.5 rounded-lg transition-colors" style={{ color: "#ef4444" }}
                              onMouseEnter={e => (e.currentTarget.style.background = dark ? "rgba(239,68,68,0.1)" : "#fef2f2")}
                              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                              {deletingEduId === edu.id
                                ? <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" />
                                : <Trash2  style={{ width: 13, height: 13 }} />
                              }
                            </button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right: Teaching/Courses */}
          <div className="space-y-5">
            {p.courses && p.courses.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
                className="rounded-2xl p-5"
                style={{ background: cardBg, backdropFilter: blur, WebkitBackdropFilter: blur, border: `1px solid ${border}` }}>
                <h2 className="text-[11px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: labelCol }}>
                  <BookOpen style={{ width: 12, height: 12 }} />
                  {teacherRole ? "Teaching" : "Courses"}
                </h2>
                <div className="space-y-2.5">
                  {p.courses.map((c: any, i: number) => {
                    const colors = ["#6366f1", "#0891b2", "#d97706", "#059669", "#7c3aed", "#db2777"]
                    const col    = colors[i % colors.length]
                    return (
                      <div key={c.id ?? i} className="flex items-center gap-3 p-3 rounded-xl"
                        style={{ background: dark ? `${col}0d` : `${col}08`, border: `1px solid ${col}20` }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: `${col}18` }}>
                          <BookOpen style={{ width: 14, height: 14, color: col }} strokeWidth={2} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-semibold truncate" style={{ color: textMain }}>{c.title}</p>
                          <p className="text-[11px]" style={{ color: textMuted }}>
                            {[c.courseCode, c.semester].filter(Boolean).join(" · ")}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal isOpen={editOpen} onClose={() => setEditOpen(false)}
        profile={p} role={p.role} onSubmit={handleEditSubmit}
        isLoading={own.isUpdating} dark={dark} />
      <EducationModal isOpen={eduModal.open} onClose={() => setEduModal({ open: false })}
        initial={eduModal.item} onSubmit={handleEduSubmit}
        isLoading={own.isAddingEducation || own.isUpdatingEducation} dark={dark} />
    </div>
  )
}
