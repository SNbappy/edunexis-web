import { AnimatePresence } from "framer-motion"
import { Plus, GraduationCap, Mail, Phone, Globe } from "lucide-react"
import type { PublicProfileDto, UserEducationDto } from "@/types/auth.types"
import ProfileEducationItem from "./ProfileEducationItem"

interface AboutTabProps {
  profile: PublicProfileDto
  isSelf: boolean
  canSeeContact: boolean
  onAddEducation?: () => void
  onEditEducation?: (e: UserEducationDto) => void
  onDeleteEducation?: (id: string) => Promise<void>
}

export default function AboutTab(props: AboutTabProps) {
  const { profile: p, isSelf, canSeeContact } = props
  const { onAddEducation, onEditEducation, onDeleteEducation } = props

  const showEmail = canSeeContact && Boolean(p.email)
  const showPhone = canSeeContact && Boolean(p.phoneNumber)
  const showWebsite = Boolean(p.websiteUrl)
  const showContactCard = showEmail || showPhone || showWebsite
  const websiteDisplay = p.websiteUrl ? p.websiteUrl.replace(/^https?:\/\//, "") : ""

  const openEmail = () => {
    if (p.email) window.location.href = "mailto:" + p.email
  }
  const openWebsite = () => {
    if (p.websiteUrl) window.open(p.websiteUrl, "_blank", "noopener,noreferrer")
  }

  const linkClass = "break-all text-left text-foreground transition-colors hover:text-teal-700 dark:hover:text-teal-400"

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        {p.bio ? (
          <section className="rounded-2xl border border-border bg-card shadow-sm ring-1 ring-stone-200/50 dark:ring-white/5 p-6">
            <h2 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              About
            </h2>
            <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-foreground">
              {p.bio}
            </p>
          </section>
        ) : null}

        <section className="rounded-2xl border border-border bg-card shadow-sm ring-1 ring-stone-200/50 dark:ring-white/5 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Education
            </h2>
            {isSelf && onAddEducation ? (
              <button
                type="button"
                onClick={onAddEducation}
                className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-700 transition-colors hover:bg-teal-100 dark:border-teal-800/50 dark:bg-teal-950/40 dark:text-teal-300 dark:hover:bg-teal-950/60"
              >
                <Plus className="h-3 w-3" />
                Add
              </button>
            ) : null}
          </div>

          {p.education.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-10 text-center">
              <GraduationCap className="mx-auto h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
              <p className="mt-3 text-[13px] font-semibold text-foreground">
                No education added yet
              </p>
              {isSelf && onAddEducation ? (
                <button
                  type="button"
                  onClick={onAddEducation}
                  className="mt-2 text-[12px] font-bold text-teal-700 hover:underline dark:text-teal-400"
                >
                  Add your first entry
                </button>
              ) : null}
            </div>
          ) : (
            <div className="space-y-1">
              <AnimatePresence>
                {p.education.map(edu => (
                  <ProfileEducationItem
                    key={edu.id}
                    education={edu}
                    editable={isSelf}
                    onEdit={onEditEducation}
                    onDelete={onDeleteEducation}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </div>

      <aside className="space-y-6">
        {showContactCard ? (
          <section className="rounded-2xl border border-border bg-card shadow-sm ring-1 ring-stone-200/50 dark:ring-white/5 p-6">
            <h3 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Contact
            </h3>
            <div className="space-y-2.5 text-[13px]">
              {showEmail ? (
                <div className="flex items-start gap-2.5">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                  <button type="button" onClick={openEmail} className={linkClass}>
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
              {showWebsite ? (
                <div className="flex items-start gap-2.5">
                  <Globe className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                  <button type="button" onClick={openWebsite} className={linkClass}>
                    {websiteDisplay}
                  </button>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}
      </aside>
    </div>
  )
}