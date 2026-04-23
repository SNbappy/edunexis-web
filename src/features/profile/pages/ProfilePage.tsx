import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import {
  Mail, Phone, Building2, Shield, Pencil, Plus, Camera, Loader2,
  ImagePlus, Trash2, X, BookOpen, GraduationCap, MoreHorizontal,
} from "lucide-react"
import Avatar from "@/components/ui/Avatar"
import Button from "@/components/ui/Button"
import Skeleton from "@/components/ui/Skeleton"
import { useAuthStore } from "@/store/authStore"
import { useProfile } from "../hooks/useProfile"
import { usePublicProfile } from "../hooks/usePublicProfile"
import { isTeacher } from "@/utils/roleGuard"
import SocialLinks from "../components/SocialLinks"
import ProfileEducationItem from "../components/ProfileEducationItem"
import ProfileCoursesList from "../components/ProfileCoursesList"
import EditProfileModal from "../components/EditProfileModal"
import EducationModal from "../components/EducationModal"
import type { UserEducationDto, PublicProfileDto } from "@/types/auth.types"

interface ProfilePageProps {
  userId?:       string
  isOwnProfile?: boolean
}

export default function ProfilePage({ userId, isOwnProfile = false }: ProfilePageProps) {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const coverInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const menuRef       = useRef<HTMLDivElement>(null)

  const own = useProfile()
  const pub = usePublicProfile(isOwnProfile ? user?.id : userId)

  const isLoading = isOwnProfile ? own.isLoading : pub.isLoading
  const p: PublicProfileDto | null = pub.data ?? null

  const [coverMenuOpen, setCoverMenuOpen] = useState(false)
  const [editOpen,      setEditOpen]      = useState(false)
  const [eduModal,      setEduModal]      = useState<{ open: boolean; item?: UserEducationDto | null }>({ open: false })

  // Close cover menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setCoverMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  if (isLoading) return <ProfilePageSkeleton />

  if (!p) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center">
        <h2 className="font-display text-lg font-semibold text-foreground">Profile not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This profile may not exist or you don't have permission to view it.
        </p>
        <Button className="mt-5" onClick={() => navigate(-1)}>Go back</Button>
      </div>
    )
  }

  const teacher    = isTeacher(p.role)
  const isSelf     = isOwnProfile
  const coursemate = p.viewerRelation === "CourseMate"

  // Field visibility per viewer relation:
  // - Self:       all fields
  // - CourseMate: email + phone visible
  // - Stranger:   only public fields (name, designation, department, bio, socials)
  const canSeeContact = isSelf || coursemate

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) own.uploadPhoto(file)
    e.target.value = ""
  }
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) own.uploadCover(file)
    e.target.value = ""
  }

  const handleEduSubmit = (data: any) => {
    if (eduModal.item) {
      own.updateEducation(
        { id: eduModal.item.id, data },
        { onSuccess: () => setEduModal({ open: false }) } as any,
      )
    } else {
      own.addEducation(data, { onSuccess: () => setEduModal({ open: false }) } as any)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
      {/* ────────────────────────────────────────────────────────── */}
      {/*   Hero — cover band + avatar                                */}
      {/* ────────────────────────────────────────────────────────── */}
      <section className="relative mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        {/* Cover band */}
        <div className="group relative h-40 w-full sm:h-48">
          {p.coverPhotoUrl ? (
            <img
              src={p.coverPhotoUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700" />
          )}

          {/* Teal accent stripe at the bottom of the cover */}
          <div className="absolute inset-x-0 bottom-0 h-[3px] bg-teal-600" aria-hidden />

          {/* Cover actions — owner only */}
          {isSelf && (
            <div className="absolute right-3 top-3" ref={menuRef}>
              <button
                type="button"
                onClick={() => setCoverMenuOpen(v => !v)}
                disabled={own.isUploadingCover || own.isRemovingCover}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60 disabled:opacity-50"
                aria-label="Cover photo options"
              >
                {own.isUploadingCover || own.isRemovingCover
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <MoreHorizontal className="h-4 w-4" />
                }
              </button>

              {coverMenuOpen && (
                <div className="absolute right-0 top-10 w-48 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
                  <button
                    type="button"
                    onClick={() => { setCoverMenuOpen(false); coverInputRef.current?.click() }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-medium text-foreground transition-colors hover:bg-stone-50"
                  >
                    <ImagePlus className="h-4 w-4 text-teal-600" />
                    {p.coverPhotoUrl ? "Change cover" : "Upload cover"}
                  </button>
                  {p.coverPhotoUrl && (
                    <button
                      type="button"
                      onClick={() => { setCoverMenuOpen(false); own.removeCover() }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove cover
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverChange}
          />
        </div>

        {/* Avatar + identity row */}
        <div className="px-5 pb-5 pt-0 sm:px-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            {/* Avatar */}
            <div className="-mt-12 flex items-end gap-4 sm:-mt-14">
              <div className="relative">
                <div
                  className="h-24 w-24 overflow-hidden rounded-2xl border-4 border-card bg-card shadow-sm sm:h-28 sm:w-28"
                >
                  {own.isUploading || own.isRemovingPhoto ? (
                    <div className="flex h-full w-full items-center justify-center bg-stone-50">
                      <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
                    </div>
                  ) : (
                    <Avatar
                      src={p.profilePhotoUrl}
                      name={p.fullName}
                      size="xl"
                      className="h-full w-full rounded-none"
                    />
                  )}
                </div>

                {isSelf && (
                  <>
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      disabled={own.isUploading}
                      className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-teal-600 text-white shadow-sm transition-colors hover:bg-teal-700 disabled:opacity-50"
                      aria-label="Change profile photo"
                    >
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Edit button — self only */}
            {isSelf && (
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={() => navigate("/profile/edit")}>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit profile
                </Button>
              </div>
            )}
          </div>

          {/* Name + role chip */}
          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {p.fullName}
              </h1>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                  teacher
                    ? "border border-teal-200 bg-teal-50 text-teal-700"
                    : "border border-blue-200 bg-blue-50 text-blue-700"
                }`}
              >
                {teacher ? "Teacher" : "Student"}
              </span>
            </div>

            {p.designation && (
              <p className="mt-1 text-[14px] font-semibold text-teal-700">
                {p.designation}
              </p>
            )}

            {/* Meta row — department + optional contact */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-muted-foreground">
              {p.department && (
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  {p.department}
                </span>
              )}
              {!teacher && p.studentId && (
                <span className="inline-flex items-center gap-1.5 font-mono">
                  <Shield className="h-3.5 w-3.5" />
                  {p.studentId}
                </span>
              )}
              {canSeeContact && p.email && (
                <a
                  href={`mailto:${p.email}`}
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-teal-700"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {p.email}
                </a>
              )}
              {canSeeContact && p.phoneNumber && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  {p.phoneNumber}
                </span>
              )}
            </div>

            {/* Social links */}
            <div className="mt-4">
              <SocialLinks profile={p} />
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────── */}
      {/*   About (full width)                                        */}
      {/* ────────────────────────────────────────────────────────── */}
      {p.bio && (
        <section className="mt-6 rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            About
          </h2>
          <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-foreground">
            {p.bio}
          </p>
        </section>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/*   Body — Education (left, wider) + Courses (right)          */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Education */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Education
            </h2>
            {isSelf && (
              <button
                type="button"
                onClick={() => setEduModal({ open: true, item: null })}
                className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-700 transition-colors hover:bg-teal-100"
              >
                <Plus className="h-3 w-3" />
                Add
              </button>
            )}
          </div>

          {p.education.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-stone-50/50 px-4 py-10 text-center">
              <GraduationCap className="mx-auto h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
              <p className="mt-3 text-[13px] font-semibold text-foreground">No education added yet</p>
              {isSelf && (
                <button
                  type="button"
                  onClick={() => setEduModal({ open: true, item: null })}
                  className="mt-2 text-[12px] font-bold text-teal-700 hover:underline"
                >
                  Add your first entry
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <AnimatePresence>
                {p.education.map(edu => (
                  <ProfileEducationItem
                    key={edu.id}
                    education={edu}
                    editable={isSelf}
                    onEdit={item => setEduModal({ open: true, item })}
                    onDelete={id =>
                      new Promise<void>(resolve =>
                        own.deleteEducation(id, { onSuccess: () => resolve() } as any),
                      )
                    }
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* Courses */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              {teacher ? "Teaching" : "Enrolled courses"}
            </h2>
          </div>

          <ProfileCoursesList
            courses={p.courses}
            isSelf={isSelf}
            isTeacher={teacher}
          />
        </section>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/*   Modals                                                    */}
      {/* ────────────────────────────────────────────────────────── */}
      {isSelf && (
        <>
          <EditProfileModal
            isOpen={editOpen}
            onClose={() => setEditOpen(false)}
            profile={p}
            role={p.role}
            onSubmit={data =>
              own.updateProfile(data, { onSuccess: () => setEditOpen(false) } as any)
            }
            isLoading={own.isUpdating}
          />

          <EducationModal
            isOpen={eduModal.open}
            onClose={() => setEduModal({ open: false })}
            initial={eduModal.item}
            onSubmit={handleEduSubmit}
            isLoading={own.isAddingEducation || own.isUpdatingEducation}
          />
        </>
      )}
    </div>
  )
}

/* ─── Skeleton ────────────────────────────────────────────── */

function ProfilePageSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        <Skeleton className="h-48 w-full rounded-none" />
        <div className="px-5 pb-5 sm:px-7">
          <Skeleton className="-mt-12 h-24 w-24 rounded-2xl sm:h-28 sm:w-28" />
          <Skeleton className="mt-4 h-8 w-60" />
          <Skeleton className="mt-2 h-4 w-40" />
          <Skeleton className="mt-3 h-4 w-full max-w-md" />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  )
}

