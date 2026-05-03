import { useState, useEffect } from "react"
import { Globe, Lock, ExternalLink, Copy, Check, Info } from "lucide-react"
import Button from "@/components/ui/Button"
import { useProfile } from "@/features/profile/hooks/useProfile"
import { useAuthStore } from "@/store/authStore"
import { isTeacher } from "@/utils/roleGuard"
import toast from "react-hot-toast"

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/

function validateSlug(slug: string): string | null {
  if (slug.length < 3) return "URL must be at least 3 characters."
  if (slug.length > 30) return "URL must be 30 characters or fewer."
  if (!SLUG_RE.test(slug)) return "Use only lowercase letters, numbers, and single hyphens (no leading/trailing hyphens)."
  return null
}

export default function VisibilitySettingsPage() {
  const { user } = useAuthStore()
  const teacher = isTeacher(user?.role ?? "Student")
  const { profile, updateVisibility, isUpdatingVisibility } = useProfile() as any

  const [isPublic, setIsPublic] = useState(false)
  const [slug, setSlug] = useState("")
  const [slugError, setSlugError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!profile?.fullName || slug) return
    const seed = profile.fullName
      .toLowerCase()
      .replace(/^(md\.?|mr\.?|mrs\.?|ms\.?|dr\.?|prof\.?)\s+/i, "")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 30)
      .replace(/^-+|-+$/g, "")
    setSlug(seed || "user")
  }, [profile?.fullName, slug])

  const handleSlugChange = (v: string) => {
    const cleaned = v.toLowerCase().replace(/[^a-z0-9-]/g, "")
    setSlug(cleaned)
    if (cleaned) setSlugError(validateSlug(cleaned))
    else setSlugError(null)
  }

  const previewHref = `/faculty/${slug}`
  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${previewHref}` : previewHref

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    toast.success("URL copied")
    setTimeout(() => setCopied(false), 1500)
  }

  const handleToggle = (next: boolean) => {
    if (next) {
      const err = validateSlug(slug)
      if (err) { setSlugError(err); toast.error(err); return }
    }
    updateVisibility(
      { isPublic: next, slug: next ? slug : undefined },
      { onSuccess: (res: any) => { if (res.success) setIsPublic(next) } }
    )
  }

  const handleSaveSlug = () => {
    const err = validateSlug(slug)
    if (err) { setSlugError(err); return }
    updateVisibility({ isPublic: true, slug })
  }

  if (!teacher) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <Lock className="mx-auto h-10 w-10 text-muted-foreground" />
        <h2 className="mt-3 font-display text-lg font-bold text-foreground">
          Public profiles are for teachers
        </h2>
        <p className="mt-1.5 max-w-sm mx-auto text-[13px] text-muted-foreground">
          Student profiles stay private and are only visible to course members.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">Public profile</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Make your faculty profile visible to anyone on the web. Useful for sharing your bio, research, and courses with prospective students or collaborators.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {isPublic ? <Globe className="h-4 w-4 text-teal-600" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
              <span className="font-display text-[14px] font-bold text-foreground">
                {isPublic ? "Profile is public" : "Profile is private"}
              </span>
            </div>
            <p className="mt-1.5 text-[12.5px] text-muted-foreground">
              {isPublic
                ? "Anyone with the URL can view your bio, research interests, education, and publications. Phone and email stay private."
                : "Only course members can view your profile."}
            </p>
          </div>
          <button
            type="button"
            disabled={isUpdatingVisibility}
            onClick={() => handleToggle(!isPublic)}
            className={"relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 " + (isPublic ? "bg-teal-600" : "bg-stone-300 dark:bg-stone-700")}
            aria-label="Toggle public profile"
          >
            <span className={"absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all " + (isPublic ? "left-[22px]" : "left-0.5")} />
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <label className="block text-[13px] font-bold text-foreground">Custom URL</label>
        <p className="mt-0.5 text-[12px] text-muted-foreground">
          The URL where your public profile lives. Lowercase letters, numbers, and hyphens.
        </p>

        <div className="mt-3 flex items-stretch overflow-hidden rounded-xl border border-border bg-muted/40">
          <span className="flex shrink-0 items-center px-3 text-[12.5px] text-muted-foreground border-r border-border">
            edunexis.app/faculty/
          </span>
          <input
            type="text"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="your-name"
            className="flex-1 bg-transparent px-3 py-2.5 text-[13px] font-mono text-foreground outline-none"
            maxLength={30}
          />
        </div>

        {slugError ? (
          <p className="mt-2 text-[11.5px] font-semibold text-red-600 dark:text-red-400">{slugError}</p>
        ) : (
          <p className="mt-2 text-[11.5px] text-muted-foreground">Tip: a short, professional URL is easier to share. {slug.length}/30</p>
        )}

        {isPublic && !slugError ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={previewHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-[12.5px] font-bold text-foreground transition-colors hover:bg-muted"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Preview public profile
            </a>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-[12.5px] font-bold text-foreground transition-colors hover:bg-muted"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-teal-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy URL"}
            </button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveSlug}
              loading={isUpdatingVisibility}
              disabled={!!slugError}
            >
              Save URL
            </Button>
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
        <div className="flex items-start gap-2.5">
          <Info className="h-4 w-4 shrink-0 text-amber-700 dark:text-amber-300 mt-0.5" />
          <div>
            <p className="text-[12.5px] font-bold text-foreground">What is shown publicly</p>
            <ul className="mt-1.5 space-y-1 text-[12px] text-muted-foreground">
              <li>- Your name, designation, department, and headline</li>
              <li>- Bio, research interests, and fields of work</li>
              <li>- Education and publications</li>
              <li>- Office location and office hours</li>
              <li>- Public links (LinkedIn, GitHub, website, etc.)</li>
              <li>- Number of active courses (not their content)</li>
            </ul>
            <p className="mt-2 text-[12px] font-bold text-foreground">Stays private</p>
            <ul className="mt-1 space-y-1 text-[12px] text-muted-foreground">
              <li>- Email address</li>
              <li>- Phone number</li>
              <li>- Course materials, students, grades</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
