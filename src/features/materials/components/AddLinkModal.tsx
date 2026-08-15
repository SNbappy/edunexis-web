import { useState } from "react"
import { Link2, Youtube, ExternalLink } from "lucide-react"
import Modal from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { Textarea, Field } from "@/components/ui/field"
import { ICON_STROKE, TEXT } from "@/components/ui/appTokens"
import {
  getYouTubeId, getYouTubeThumbnail, getLinkHost, normaliseUrl,
} from "@/utils/videoEmbed"
import { cn } from "@/utils/cn"

interface AddLinkModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { title: string; url: string; description?: string; isYouTube: boolean }) => void
  isLoading?: boolean
}

/**
 * Add a link or a YouTube video as course material.
 *
 * One flow rather than two. A teacher pasting a URL should not first have to
 * classify it — the modal recognises YouTube itself and shows the thumbnail
 * as confirmation, which also catches a mistyped or private link before it is
 * posted to a class.
 */
export default function AddLinkModal({
  isOpen, onClose, onSubmit, isLoading,
}: AddLinkModalProps) {
  const [url, setUrl] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [touched, setTouched] = useState(false)

  const trimmed = url.trim()
  const ytId = getYouTubeId(trimmed)
  const isYouTube = ytId !== null
  const thumb = isYouTube ? getYouTubeThumbnail(trimmed) : null

  // A URL is valid if it parses; YouTube just gets the richer treatment.
  const urlLooksValid = (() => {
    if (!trimmed) return false
    try { new URL(normaliseUrl(trimmed)); return true } catch { return false }
  })()

  const canSubmit = urlLooksValid && title.trim().length > 0

  const reset = () => { setUrl(""); setTitle(""); setDescription(""); setTouched(false) }
  const handleClose = () => { reset(); onClose() }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      title="Add a link"
      description="Share a YouTube video, an article, or any web resource with your class."
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={() => onSubmit({
              title: title.trim(),
              url: normaliseUrl(trimmed),
              description: description.trim() || undefined,
              isYouTube,
            })}
            disabled={!canSubmit}
            loading={isLoading}
            leftIcon={isYouTube
              ? <Youtube strokeWidth={ICON_STROKE} />
              : <Link2 strokeWidth={ICON_STROKE} />}
          >
            {isYouTube ? "Add video" : "Add link"}
          </Button>
        </>
      }
    >
      <div className="space-y-3.5">
        <Input
          label="URL"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="https://youtube.com/watch?v=… or any link"
          autoFocus
          error={touched && trimmed && !urlLooksValid ? "That doesn't look like a valid URL." : undefined}
          hint={!trimmed ? "Paste a YouTube link and it will play inside EduNexis." : undefined}
        />

        {/* Recognition feedback. Seeing the actual thumbnail is what tells a
            teacher they pasted the right video, before the class does. */}
        {urlLooksValid && (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
            {thumb ? (
              <img
                src={thumb}
                alt=""
                className="h-14 w-24 shrink-0 rounded-lg object-cover"
                loading="lazy"
              />
            ) : (
              <span className="flex h-14 w-24 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground">
                <ExternalLink className="h-5 w-5" strokeWidth={ICON_STROKE} />
              </span>
            )}
            <div className="min-w-0">
              <p className={cn(
                "flex items-center gap-1.5 text-[12.5px] font-semibold",
                isYouTube ? "text-destructive" : "text-foreground",
              )}>
                {isYouTube && <Youtube className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />}
                {isYouTube ? "YouTube video" : "External link"}
              </p>
              <p className={cn(TEXT.muted, "mt-0.5 truncate")}>
                {getLinkHost(trimmed)}
              </p>
              <p className={cn(TEXT.muted, "mt-0.5")}>
                {isYouTube
                  ? "Plays inside EduNexis."
                  : "Opens in a new tab."}
              </p>
            </div>
          </div>
        )}

        <Input
          label="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={isYouTube ? "e.g. Normalization explained" : "e.g. Reference article"}
        />

        <Field label="Description" hint="Optional — tell students why this is worth their time.">
          <Textarea
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What should students take from this?"
          />
        </Field>
      </div>
    </Modal>
  )
}
