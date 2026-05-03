import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Pencil } from "lucide-react"
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

import ProfileTabs, { type ProfileTabKey } from "../components/ProfileTabs"
import ProfileIdentityCard from "../components/ProfileIdentityCard"
import OverviewTab from "../components/OverviewTab"
import CoursesTab from "../components/CoursesTab"
import ResearchTab from "../components/ResearchTab"
import AboutTab from "../components/AboutTab"
import EducationModal from "../components/EducationModal"
import PublicationModal from "../components/PublicationModal"

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
  const isFetched = isOwnProfile ? own.isFetched : pub.isFetched
  // For own profile: useProfile returns the profile DTO directly. Convert it
  // to the shared PublicProfileDto shape used by the rest of this page.
  const p: PublicProfileDto | null = isOwnProfile
    ? (own.data ? ({ ...own.data, viewerRelation: "Self" } as unknown as PublicProfileDto) : null)
    : (pub.data ?? null)

  const [activeTab, setActiveTab] = useState<ProfileTabKey>("overview")
  const [eduModal, setEduModal] = useState<{ open: boolean; item?: UserEducationDto | null }>({ open: false })
  const [pubModal, setPubModal] = useState<{ open: boolean; item?: UserPublicationDto | null }>({ open: false })

  if (isLoading) return <ProfilePageSkeleton />

  if (isFetched && !p) {
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
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-5 lg:px-6">
      {/* Two-column body — identity card persists across all tabs */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_1fr]">
        {/* Identity card (sticky on desktop) */}
        <div className="lg:sticky lg:top-5 lg:self-start">
          <ProfileIdentityCard
            profile={p}
            isSelf={isSelf}
            canSeeContact={canSeeContact}
            onUploadPhoto={isSelf ? own.uploadPhoto : undefined}
            onRemovePhoto={isSelf ? () => own.removePhoto() : undefined}
            isUploadingPhoto={own.isUploading}
            isRemovingPhoto={own.isRemovingPhoto}
          />
        </div>

        {/* Right column — tabs + tab content */}
        <div className="min-w-0">
          {/* Tab bar row — tabs on left, edit profile on right */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <ProfileTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
            {isSelf ? (
              <Button variant="secondary" onClick={() => navigate("/profile/edit")}>
                <Pencil className="h-3.5 w-3.5" />
                Edit profile
              </Button>
            ) : null}
          </div>

          {/* Tab content */}
          {activeTab === "overview" ? (
            <OverviewTab
              profile={p}
              isSelf={isSelf}
              onSeeAllCourses={() => setActiveTab("courses")}
              onSeeResearch={teacher ? () => setActiveTab("research") : undefined}
            />
          ) : null}
          {activeTab === "courses" ? (
            <CoursesTab profile={p} isSelf={isSelf} />
          ) : null}
          {activeTab === "research" && teacher ? (
            <ResearchTab
              profile={p}
              isSelf={isSelf}
              onChangeResearchInterests={isSelf ? csv => updateCsvField("researchInterestsCsv", csv) : undefined}
              onChangeFieldsOfWork={isSelf ? csv => updateCsvField("fieldsOfWorkCsv", csv) : undefined}
              onAddPublication={isSelf ? () => setPubModal({ open: true, item: null }) : undefined}
              onEditPublication={isSelf ? (pub) => setPubModal({ open: true, item: pub }) : undefined}
              onDeletePublication={isSelf ? (id) => own.deletePublication(id) : undefined}
            />
          ) : null}
          {activeTab === "about" ? (
            <AboutTab
              profile={p}
              isSelf={isSelf}
              canSeeContact={canSeeContact}
              onAddEducation={isSelf ? () => setEduModal({ open: true, item: null }) : undefined}
              onEditEducation={isSelf ? (e) => setEduModal({ open: true, item: e }) : undefined}
              onDeleteEducation={isSelf ? handleEduDelete : undefined}
            />
          ) : null}
        </div>
      </div>

      {/* Modals — owner only */}
      {isSelf ? (
        <>
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
      ) : null}
    </div>
  )
}

function ProfilePageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-5 lg:px-6">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_1fr]">
        <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
        <div className="space-y-5">
          <Skeleton className="h-12 w-72 rounded-xl" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}