import { useState } from "react"
import { Building2, Shield, Mail, Phone, MapPin, Clock, BookOpen, FileText } from "lucide-react"
import Avatar from "@/components/ui/Avatar"
import InlineSpinner from "@/components/ui/InlineSpinner"
import { isTeacher } from "@/utils/roleGuard"
import type { PublicProfileDto } from "@/types/auth.types"
import SocialLinks from "./SocialLinks"
import FullscreenAvatar from "./FullscreenAvatar"

interface ProfileIdentityCardProps {
  profile: PublicProfileDto
  isSelf: boolean
  canSeeContact: boolean
  onUploadPhoto?: (file: File) => void
  onRemovePhoto?: () => void
  isUploadingPhoto?: boolean
  isRemovingPhoto?: boolean
}

export default function ProfileIdentityCard(props: ProfileIdentityCardProps) {
  const {
    profile: p, isSelf, canSeeContact,
    onUploadPhoto, onRemovePhoto, isUploadingPhoto, isRemovingPhoto,
  } = props

  const teacher = isTeacher(p.role)
  const [avatarOpen, setAvatarOpen] = useState(false)

  const showStudentId = !teacher && Boolean(p.studentId)
  const showEmail = canSeeContact && Boolean(p.email)
  const showPhone = canSeeContact && Boolean(p.phoneNumber)
  const showOffice = teacher && Boolean(p.officeLocation)
  const showHours = teacher && Boolean(p.officeHours)
  const showAnyContact = showEmail || showPhone
  const showAnyOffice = showOffice || showHours

  const totalCourses = p.runningCoursesCount + p.archivedCoursesCount

  const openEmail = () => {
    if (p.email) window.location.href = "mailto:" + p.email
  }

  return (
    <>
      <aside className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm ring-1 ring-stone-200/50 dark:ring-white/5">
        {/* Photo � square, fills card width */}
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          {(isUploadingPhoto || isRemovingPhoto) ? (
            <div className="flex h-full w-full items-center justify-center">
              <InlineSpinner size={32} className="text-teal-600" />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAvatarOpen(true)}
              className="group block h-full w-full"
              aria-label="View profile picture"
            >
              <Avatar
                src={p.profilePhotoUrl}
                name={p.fullName}
                size="xl"
                className="h-full w-full rounded-none text-5xl transition-transform group-hover:scale-[1.02]"
              />
              {p.profilePhotoUrl ? (
                <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/15" />
              ) : null}
            </button>
          )}

        </div>

        {/* Identity body */}
        <div className="p-5">
          <h2 className="font-display text-xl font-extrabold leading-tight tracking-tight text-foreground">
            {p.fullName}
          </h2>

          {p.designation ? (
            <p className="mt-1 text-[13.5px] font-semibold italic text-teal-700 dark:text-teal-400">
              {p.designation}
            </p>
          ) : null}

          {p.headline ? (
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              {p.headline}
            </p>
          ) : null}

          {/* Teal accent divider */}
          <div className="my-4 h-[2px] w-12 rounded-full bg-teal-600 dark:bg-teal-500" />

          {/* Department + ID */}
          <div className="space-y-2.5 text-[13px]">
            {p.department ? (
              <div className="flex items-start gap-2.5">
                <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                <span className="font-semibold text-foreground">{p.department}</span>
              </div>
            ) : null}

            {showStudentId ? (
              <div className="flex items-start gap-2.5">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                <span className="font-mono text-foreground">{p.studentId}</span>
              </div>
            ) : null}
          </div>

          {/* Stats � inline badges */}
          {(totalCourses > 0 || p.publications.length > 0) ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {totalCourses > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-2.5 py-1 text-[11.5px] font-bold text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
                  <BookOpen className="h-3 w-3" />
                  {totalCourses} {totalCourses === 1 ? "course" : "courses"}
                </span>
              ) : null}
              {teacher && p.publications.length > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-2.5 py-1 text-[11.5px] font-bold text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
                  <FileText className="h-3 w-3" />
                  {p.publications.length} {p.publications.length === 1 ? "publication" : "publications"}
                </span>
              ) : null}
            </div>
          ) : null}

          {/* Contact */}
          {showAnyContact ? (
            <>
              <div className="my-4 h-px w-full bg-border" />
              <div className="space-y-2.5 text-[13px]">
                {showEmail ? (
                  <div className="flex items-start gap-2.5">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                    <button
                      type="button"
                      onClick={openEmail}
                      className="break-all text-left text-foreground transition-colors hover:text-teal-700 dark:hover:text-teal-400"
                    >
                      {p.email}
                    </button>
                  </div>
                ) : null}
                {showPhone ? (
                  <div className="flex items-start gap-2.5">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                    <span className="text-foreground">{p.phoneNumber}</span>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}

          {/* Office (teacher only) */}
          {showAnyOffice ? (
            <>
              <div className="my-4 h-px w-full bg-border" />
              <div className="space-y-2.5 text-[13px]">
                {showOffice ? (
                  <div className="flex items-start gap-2.5">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                    <span className="text-foreground">{p.officeLocation}</span>
                  </div>
                ) : null}
                {showHours ? (
                  <div className="flex items-start gap-2.5">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                    <span className="text-foreground">{p.officeHours}</span>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}

          {/* Socials */}
          <div className="mt-5">
            <SocialLinks profile={p} size="sm" />
          </div>
        </div>
      </aside>

      <FullscreenAvatar
        open={avatarOpen}
        onClose={() => setAvatarOpen(false)}
        src={p.profilePhotoUrl}
        name={p.fullName}
        isSelf={isSelf}
        onUpload={onUploadPhoto}
        onRemove={onRemovePhoto}
        isUploading={isUploadingPhoto}
        isRemoving={isRemovingPhoto}
      />
    </>
  )
}