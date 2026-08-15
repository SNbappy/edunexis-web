import { useState } from "react"
import { Building2, Shield, Mail, Phone, MapPin, Clock, BookOpen, FileText } from "lucide-react"
import Badge from "@/components/ui/Badge"
import { SURFACE } from "@/components/ui/appTokens"
import { cn } from "@/utils/cn"
import { getInitials } from "@/utils/names"

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
      <aside className={cn(SURFACE.card, "overflow-hidden")}>
        {/* Portrait.
            Profile is a destination page like Dashboard or Courses, but it
            already has this card doing the work a hero would, so stacking an
            ink banner above it would just say the same thing twice. Instead
            the card carries the brand itself: with no photo this is the ink
            surface with the person's initials, rather than the grey slab it
            used to be — the largest, dullest block on the page. */}
        <div className="relative aspect-square w-full overflow-hidden bg-teal-950">
          {!p.profilePhotoUrl && (
            <>
              <div
                aria-hidden
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full opacity-40 blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle, rgba(45,212,191,0.6) 0%, rgba(45,212,191,0.12) 50%, transparent 70%)",
                }}
              />
            </>
          )}

          {(isUploadingPhoto || isRemovingPhoto) ? (
            <div className="flex h-full w-full items-center justify-center">
              <InlineSpinner size={32} className="text-teal-300" />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAvatarOpen(true)}
              className="group relative block h-full w-full"
              aria-label="View profile picture"
            >
              {p.profilePhotoUrl ? (
                <>
                  <img
                    src={p.profilePhotoUrl}
                    alt={p.fullName}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/15" />
                </>
              ) : (
                <span className="flex h-full w-full items-center justify-center font-display text-6xl font-extrabold tracking-tight text-white/90">
                  {getInitials(p.fullName)}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Identity body */}
        <div className="p-5">
          <h2 className="font-display text-xl font-extrabold leading-tight tracking-tight text-foreground">
            {p.fullName}
          </h2>

          {p.designation ? (
            <p className="mt-1 text-[13.5px] font-semibold text-primary">
              {p.designation}
            </p>
          ) : null}

          {p.headline ? (
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              {p.headline}
            </p>
          ) : null}

          <div className="my-4 border-t border-border" />

          {/* Department + ID */}
          <div className="space-y-2.5 text-[13px]">
            {p.department ? (
              <div className="flex items-start gap-2.5">
                <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                <span className="font-semibold text-foreground">{p.department}</span>
              </div>
            ) : null}

            {showStudentId ? (
              <div className="flex items-start gap-2.5">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                <span className="font-mono text-foreground">{p.studentId}</span>
              </div>
            ) : null}
          </div>

          {/* Stats - inline badges */}
          {(totalCourses > 0 || p.publications.length > 0) ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {/* Two counts, one treatment. The second was violet purely to
                  differ from the first, which made "publications" look like a
                  different kind of thing than "courses". */}
              {totalCourses > 0 ? (
                <Badge variant="neutral" size="md" icon={<BookOpen strokeWidth={1.75} />}>
                  {totalCourses} {totalCourses === 1 ? "course" : "courses"}
                </Badge>
              ) : null}
              {teacher && p.publications.length > 0 ? (
                <Badge variant="neutral" size="md" icon={<FileText strokeWidth={1.75} />}>
                  {p.publications.length} {p.publications.length === 1 ? "publication" : "publications"}
                </Badge>
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
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                    <button
                      type="button"
                      onClick={openEmail}
                      className="break-all text-left text-foreground transition-colors duration-120 hover:text-primary"
                    >
                      {p.email}
                    </button>
                  </div>
                ) : null}
                {showPhone ? (
                  <div className="flex items-start gap-2.5">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
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
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                    <span className="text-foreground">{p.officeLocation}</span>
                  </div>
                ) : null}
                {showHours ? (
                  <div className="flex items-start gap-2.5">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
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