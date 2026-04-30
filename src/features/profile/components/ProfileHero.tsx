import { useMemo, useRef, useState, useEffect } from "react"
import { ImagePlus, Trash2, MoreHorizontal, Pencil } from "lucide-react"
import Button from "@/components/ui/Button"
import InlineSpinner from "@/components/ui/InlineSpinner"
import type { PublicProfileDto } from "@/types/auth.types"

const GRADIENTS = [
  "from-teal-500 via-cyan-500 to-sky-600",
  "from-amber-500 via-orange-500 to-rose-600",
  "from-violet-500 via-purple-500 to-fuchsia-600",
  "from-emerald-500 via-teal-500 to-cyan-600",
  "from-blue-500 via-indigo-500 to-violet-600",
] as const

function hashGradient(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length]
}

interface ProfileHeroProps {
  profile: PublicProfileDto
  isSelf: boolean
  onUploadCover?: (file: File) => void
  onRemoveCover?: () => void
  isUploadingCover?: boolean
  isRemovingCover?: boolean
  onEditClick?: () => void
}

export default function ProfileHero(props: ProfileHeroProps) {
  const {
    profile: p, isSelf,
    onUploadCover, onRemoveCover,
    isUploadingCover, isRemovingCover,
    onEditClick,
  } = props

  const gradient = useMemo(() => hashGradient(p.userId), [p.userId])
  const coverInputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [coverMenuOpen, setCoverMenuOpen] = useState(false)

  useEffect(() => {
    if (!coverMenuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setCoverMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [coverMenuOpen])

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onUploadCover) onUploadCover(file)
    e.target.value = ""
  }

  return (
    <section className="relative h-32 w-full overflow-hidden rounded-2xl border border-border sm:h-36 lg:h-40">
      {p.coverPhotoUrl ? (
        <img
          src={p.coverPhotoUrl}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className={"h-full w-full bg-gradient-to-br " + gradient} />
      )}

      {/* Subtle bottom gradient for legibility of action buttons */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/15 to-transparent" />

      {/* Edit profile (self only) */}
      {(isSelf && onEditClick) ? (
        <div className="absolute left-4 top-4 z-10">
          <Button variant="secondary" onClick={onEditClick}>
            <Pencil className="h-3.5 w-3.5" />
            Edit profile
          </Button>
        </div>
      ) : null}

      {/* Cover menu (self only) */}
      {isSelf ? (
        <div className="absolute right-4 top-4 z-10" ref={menuRef}>
          <button
            type="button"
            onClick={() => setCoverMenuOpen(v => !v)}
            disabled={isUploadingCover || isRemovingCover}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60 disabled:opacity-50"
            aria-label="Cover photo options"
          >
            {(isUploadingCover || isRemovingCover) ? (
              <InlineSpinner size={16} />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
          </button>

          {coverMenuOpen ? (
            <div className="absolute right-0 top-11 w-52 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
              <button
                type="button"
                onClick={() => { setCoverMenuOpen(false); coverInputRef.current?.click() }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-medium text-foreground transition-colors hover:bg-muted"
              >
                <ImagePlus className="h-4 w-4 text-teal-600" />
                {p.coverPhotoUrl ? "Change cover" : "Upload cover"}
              </button>
              {p.coverPhotoUrl ? (
                <button
                  type="button"
                  onClick={() => { setCoverMenuOpen(false); if (onRemoveCover) onRemoveCover() }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove cover
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCoverChange}
      />
    </section>
  )
}