import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Button from "@/components/ui/Button"
import Skeleton from "@/components/ui/Skeleton"
import { useAuthStore } from "@/store/authStore"
import { useProfile } from "../hooks/useProfile"
import { usePublicProfile } from "../hooks/usePublicProfile"
import type {
  UserEducationDto, UserPublicationDto, PublicProfileDto,
} from "@/types/auth.types"
import type { PublicationRequest, UpdateProfileRequest } from "../services/profileService"
import { isTeacher } from "@/utils/roleGuard"

import ProfileHero from "../components/ProfileHero"
import ProfileTabs, { type ProfileTabKey } from "../components/ProfileTabs"
import ProfileStatStrip from "../components/ProfileStatStrip"
import OverviewTab from "../components/OverviewTab"
import CoursesTab from "../components/CoursesTab"
import ResearchTab from "../components/ResearchTab"
import AboutTab from "../components/AboutTab"
import EducationModal from "../components/EducationModal"
import PublicationModal from "../components/PublicationModal"
import EditProfileModal from "../components/EditProfileModal"

interface ProfilePageProps {
  userId?: string
  isOwnProfile?: boolean
}

export default function ProfilePage({ userId, isOwnProfile = false }: ProfilePageProps) {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const own = useProfile()
  const pub = usePublicProfile(isOwnProfile ? user?.id : userId)

  const isLoading = isOwnProfile ? own.isLoading : pub.isLoading
  const p: PublicProfileDto | null = pub.data ?? null

  const [activeTab, setActiveTab] = useState<ProfileTabKey>("overview")

  const [editOpen, setEditOpen] = useState(false)
  const [eduModal, setEduModal] = useState<{ open: boolean; item?: UserEducationDto | null }>({ open: false })
  const [pubModal, setPubModal] = useState<{ open: boolean; item?: UserPublicationDto | null }>({ open: false })

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

  const teacher = isTeacher(p.role)
  const isSelf = isOwnProfile
  const coursemate = p.viewerRelation === "CourseMate"
  const canSeeContact = isSelf || coursemate

  const tabs: { key: ProfileTabKey; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "courses", label: "Courses" },
    ...(teacher ? [{ key: "research" as const, label: "Research" }] : []),
    { key: "about", label: "About" },
  ]

  /* ── Education handlers ────────────────────── */
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
  const handleEduDelete = (id: string) =>
    new Promise<void>(resolve =>
      own.deleteEducation(id, { onSuccess: () => resolve() } as any),
    )

  /* ── Publication handlers ──────────────────── */
  const handlePubSubmit = (data: PublicationRequest) => {
    if (pubModal.item) {
      own.updatePublication(
        { id: pubModal.item.id, data },
        { onSuccess: () => setPubModal({ open: false }) } as any,
      )
    } else {
      own.addPublication(data, { onSuccess: () => setPubModal({ open: false }) } as any)
    }
  }

  /* ── CSV chip handlers ─────────────────────── */
  const updateCsvField = (field: "researchInterestsCsv" | "fieldsOfWorkCsv", csv: string) => {
    if (!isSelf || !own.profile) return
    const profile = own.profile
    const payload: UpdateProfileRequest = {
      fullName: profile.fullName,
      department: profile.department ?? "",
      designation: profile.designation ?? undefined,
      studentId: profile.studentId ?? undefined,
      bio: profile.bio ?? undefined,
      headline: profile.headline ?? undefined,
      phoneNumber: profile.phoneNumber ?? undefined,
      officeLocation: profile.officeLocation ?? undefined,
      officeHours: profile.officeHours ?? undefined,
      researchInterestsCsv: profile.researchInterestsCsv ?? undefined,
      fieldsOfWorkCsv: profile.fieldsOfWorkCsv ?? undefined,
      linkedInUrl: profile.linkedInUrl ?? undefined,
      facebookUrl: profile.facebookUrl ?? undefined,
      twitterUrl: profile.twitterUrl ?? undefined,
      gitHubUrl: profile.gitHubUrl ?? undefined,
      websiteUrl: profile.websiteUrl ?? undefined,
      [field]: csv || undefined,
    }
    own.updateProfile(payload)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="mt-6">
        <ProfileHero
          profile={p}
          isSelf={isSelf}
          canSeeContact={canSeeContact}
          onUploadPhoto={isSelf ? own.uploadPhoto : undefined}
          onUploadCover={isSelf ? own.uploadCover : undefined}
          onRemoveCover={isSelf ? own.removeCover : undefined}
          isUploadingPhoto={own.isUploading}
          isUploadingCover={own.isUploadingCover}
          isRemovingPhoto={own.isRemovingPhoto}
          isRemovingCover={own.isRemovingCover}
          onEditClick={isSelf ? () => setEditOpen(true) : undefined}
        />
      </div>

      <ProfileStatStrip profile={p} />

      <ProfileTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === "overview" && (
          <OverviewTab
            profile={p}
            isSelf={isSelf}
            onSeeAllCourses={() => setActiveTab("courses")}
            onSeeResearch={teacher ? () => setActiveTab("research") : undefined}
          />
        )}
        {activeTab === "courses" && (
          <CoursesTab profile={p} isSelf={isSelf} />
        )}
        {activeTab === "research" && teacher && (
          <ResearchTab
            profile={p}
            isSelf={isSelf}
            onChangeResearchInterests={isSelf ? csv => updateCsvField("researchInterestsCsv", csv) : undefined}
            onChangeFieldsOfWork={isSelf ? csv => updateCsvField("fieldsOfWorkCsv", csv) : undefined}
            onAddPublication={isSelf ? () => setPubModal({ open: true, item: null }) : undefined}
            onEditPublication={isSelf ? (pub) => setPubModal({ open: true, item: pub }) : undefined}
            onDeletePublication={isSelf ? (id) => own.deletePublication(id) : undefined}
          />
        )}
        {activeTab === "about" && (
          <AboutTab
            profile={p}
            isSelf={isSelf}
            canSeeContact={canSeeContact}
            onAddEducation={isSelf ? () => setEduModal({ open: true, item: null }) : undefined}
            onEditEducation={isSelf ? (e) => setEduModal({ open: true, item: e }) : undefined}
            onDeleteEducation={isSelf ? handleEduDelete : undefined}
          />
        )}
      </div>

      {/* Modals — owner only */}
      {isSelf && (
        <>
          <EditProfileModal
            isOpen={editOpen}
            onClose={() => setEditOpen(false)}
            profile={p}
            role={p.role}
            onSubmit={(data: UpdateProfileRequest) =>
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

          <PublicationModal
            isOpen={pubModal.open}
            onClose={() => setPubModal({ open: false })}
            initial={pubModal.item}
            onSubmit={handlePubSubmit}
            isLoading={own.isAddingPublication || own.isUpdatingPublication}
          />
        </>
      )}
    </div>
  )
}

/* ── Skeleton ────────────────────────────────── */

function ProfilePageSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        <Skeleton className="h-56 w-full rounded-none" />
        <div className="px-5 pb-6 sm:px-7">
          <Skeleton className="-mt-16 h-32 w-32 rounded-2xl sm:h-36 sm:w-36" />
          <Skeleton className="mt-4 h-8 w-60" />
          <Skeleton className="mt-2 h-4 w-40" />
          <Skeleton className="mt-3 h-4 w-full max-w-md" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 rounded-xl" />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  )
}