import { Link } from "react-router-dom"
import { Building2, MapPin, Clock, BookOpen, Lock } from "lucide-react"
import { FaLinkedinIn, FaGithub, FaXTwitter, FaFacebookF } from "react-icons/fa6"
import { Globe } from "lucide-react"
import type { PublicFacultyProfileDto } from "@/types/auth.types"

interface Props {
  profile: PublicFacultyProfileDto
}

const SOCIAL_LINKS = [
  { key: "linkedInUrl", label: "LinkedIn", Icon: FaLinkedinIn, color: "bg-[#0A66C2] text-white" },
  { key: "gitHubUrl", label: "GitHub", Icon: FaGithub, color: "bg-[#181717] text-white dark:bg-[#2a2a2a]" },
  { key: "twitterUrl", label: "X / Twitter", Icon: FaXTwitter, color: "bg-black text-white" },
  { key: "facebookUrl", label: "Facebook", Icon: FaFacebookF, color: "bg-[#1877F2] text-white" },
] as const

export default function PublicFacultyIdentityCard({ profile: p }: Props) {
  const initials = p.fullName
    .split(/\s+/).filter(Boolean).slice(0, 2)
    .map(s => s[0]?.toUpperCase()).join("")

  const totalCourses = p.coursesTaught
  const showOffice = Boolean(p.officeLocation) || Boolean(p.officeHours)
  const hasAnySocial = SOCIAL_LINKS.some(s => Boolean((p as any)[s.key])) || Boolean(p.websiteUrl)

  return (
    <aside className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm ring-1 ring-stone-200/50 dark:ring-white/5">
      {/* Photo - square, fills card width */}
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {p.profilePhotoUrl ? (
          <img
            src={p.profilePhotoUrl}
            alt={p.fullName}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-teal-100 text-5xl font-bold text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
            {initials || "T"}
          </div>
        )}
      </div>

      {/* Identity */}
      <div className="px-5 py-5">
        <h1 className="font-display text-[17px] font-bold leading-tight text-foreground">
          {p.fullName}
        </h1>
        {p.designation ? (
          <p className="mt-1 text-[12.5px] font-semibold text-muted-foreground">
            {p.designation}
          </p>
        ) : null}
        {p.headline ? (
          <p className="mt-2.5 text-[12.5px] italic leading-relaxed text-muted-foreground">
            {p.headline}
          </p>
        ) : null}

        {/* Dept + courses badges */}
        <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-2 py-1 text-[11px] font-bold text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
            <Building2 className="h-3 w-3" />
            {p.department}
          </span>
          {totalCourses > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              <BookOpen className="h-3 w-3" />
              {totalCourses} {totalCourses === 1 ? "course" : "courses"}
            </span>
          ) : null}
        </div>
      </div>

      {/* Office */}
      {showOffice ? (
        <div className="border-t border-border px-5 py-4">
          <p className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
            Office
          </p>
          <div className="mt-2.5 space-y-2">
            {p.officeLocation ? (
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <p className="text-[12px] text-foreground">{p.officeLocation}</p>
              </div>
            ) : null}
            {p.officeHours ? (
              <div className="flex items-start gap-2.5">
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <p className="text-[12px] text-foreground">{p.officeHours}</p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Social */}
      {hasAnySocial ? (
        <div className="border-t border-border px-5 py-4">
          <p className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
            On the web
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {p.websiteUrl ? (
              <SocialChip url={p.websiteUrl} label="Website" Icon={Globe} color="bg-teal-600 text-white" />
            ) : null}
            {SOCIAL_LINKS.map(({ key, label, Icon, color }) => {
              const url = (p as any)[key]
              if (!url) return null
              return <SocialChip key={key} url={url} label={label} Icon={Icon} color={color} />
            })}
          </div>
        </div>
      ) : null}

      {/* Contact private CTA */}
      <div className="border-t border-border px-5 py-4">
        <div className="flex items-start gap-2.5">
          <Lock className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="text-[11.5px] font-bold text-foreground">Contact details are private</p>
            <p className="mt-0.5 text-[10.5px] text-muted-foreground">
              Only course members see email and phone.
            </p>
            <Link
              to="/login"
              className="mt-2 inline-flex text-[11px] font-bold text-teal-700 hover:underline dark:text-teal-300"
            >
              Sign in to contact
            </Link>
          </div>
        </div>
      </div>
    </aside>
  )
}

interface SocialChipProps {
  url: string
  label: string
  Icon: React.ComponentType<{ className?: string }>
  color: string
}

function SocialChip({ url, label, Icon, color }: SocialChipProps) {
  return (
    <Link
      to={url}
      target="_blank"
      rel="noopener noreferrer"
      reloadDocument
      title={label}
      className={"flex h-8 w-8 items-center justify-center rounded-lg transition-transform hover:scale-110 " + color}
    >
      <Icon className="h-3.5 w-3.5" />
    </Link>
  )
}