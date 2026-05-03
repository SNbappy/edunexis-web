import { Link } from "react-router-dom"
import { Globe, Lock, ExternalLink, Settings as SettingsIcon } from "lucide-react"

interface Props {
  isPublic: boolean
  slug?: string | null
}

/**
 * Compact card shown at the top of EditProfilePage for teachers.
 * Surfaces current public-profile state and links to full controls in Settings.
 */
export default function PublicVisibilityHeroCard({ isPublic, slug }: Props) {
  if (isPublic && slug) {
    return (
      <div className="rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50 to-emerald-50 p-4 dark:border-teal-800 dark:from-teal-950/40 dark:to-emerald-950/30">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white">
              <Globe className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-foreground">
                Your profile is public
              </p>
              <p className="mt-0.5 truncate font-mono text-[11.5px] text-muted-foreground">
                edunexis.app/faculty/{slug}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link
              to={`/faculty/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-teal-300 bg-white px-3 py-1.5 text-[12px] font-bold text-teal-700 transition-colors hover:bg-teal-50 dark:border-teal-700 dark:bg-stone-900 dark:text-teal-300 dark:hover:bg-stone-800"
            >
              <ExternalLink className="h-3 w-3" />
              Preview
            </Link>
            <Link
              to="/settings/visibility"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-[12px] font-bold text-foreground transition-colors hover:bg-muted"
            >
              <SettingsIcon className="h-3 w-3" />
              Manage
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Private — encourage opt-in
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-600 dark:bg-stone-900/60 dark:text-stone-400">
            <Lock className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-foreground">
              Your profile is private
            </p>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              Make it discoverable so prospective students and collaborators can find you.
            </p>
          </div>
        </div>
        <Link
          to="/settings/visibility"
          className="shrink-0 rounded-lg bg-teal-600 px-3.5 py-1.5 text-[12px] font-bold text-white transition-colors hover:bg-teal-700"
        >
          Make public
        </Link>
      </div>
    </div>
  )
}