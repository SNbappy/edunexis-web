import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Link } from "react-router-dom"
import {
  ArrowLeft, FileText, Upload, X, Eye, EyeOff,
  Trash2, AlertCircle, CheckCircle2,
} from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Button from "@/components/ui/Button"
import { useProfile } from "../hooks/useProfile"
import type { UserPublicationDto, PublicationType } from "@/types/auth.types"

const PUBLICATION_TYPES: { value: PublicationType; label: string }[] = [
  { value: "JournalArticle", label: "Journal article" },
  { value: "ConferencePaper", label: "Conference paper" },
  { value: "Book", label: "Book" },
  { value: "BookChapter", label: "Book chapter" },
  { value: "Thesis", label: "Thesis" },
  { value: "Preprint", label: "Preprint" },
  { value: "Other", label: "Other" },
]

const MAX_PDF_SIZE = 10 * 1024 * 1024

const schema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  authors: z.string().min(1, "Authors are required").max(500),
  venue: z.string().max(300).optional().or(z.literal("")),
  year: z.coerce.number().int()
    .min(1900, "Year too old")
    .max(new Date().getFullYear() + 1, "Year too far in future"),
  url: z.string().url("Invalid URL").optional().or(z.literal("")),
  type: z.enum([
    "JournalArticle", "ConferencePaper", "Book",
    "BookChapter", "Thesis", "Preprint", "Other",
  ]),
})

type FormValues = z.infer<typeof schema>

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / 1024 / 1024).toFixed(1) + " MB"
}

function validatePdf(file: File): string | null {
  if (!file.name.toLowerCase().endsWith(".pdf")) return "Only PDF files are allowed."
  if (file.size > MAX_PDF_SIZE) return "PDF must be 10 MB or smaller."
  return null
}

export default function PublicationFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = !!id

  const {
    profile,
    addPublication, isAddingPublication,
    updatePublication, isUpdatingPublication,
    deletePublication, isDeletingPublication,
    uploadPublicationPdf, isUploadingPublicationPdf,
    removePublicationPdf, isRemovingPublicationPdf,
    updatePublicationPdfVisibility, isUpdatingPublicationPdfVisibility,
  } = useProfile()

  const existing: UserPublicationDto | null = isEdit && profile?.publications
    ? profile.publications.find(p => p.id === id) ?? null
    : null

  const isSaving = isAddingPublication || isUpdatingPublication

  // Pending PDF for "new publication" flow — held until publication is created
  const [pendingPdf, setPendingPdf] = useState<File | null>(null)
  const [pendingPdfError, setPendingPdfError] = useState<string | null>(null)

  const {
    register, handleSubmit, reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "", authors: "", venue: "",
      year: new Date().getFullYear(),
      url: "", type: "JournalArticle",
    },
  })

  useEffect(() => {
    if (existing) {
      reset({
        title: existing.title,
        authors: existing.authors,
        venue: existing.venue ?? "",
        year: existing.year,
        url: existing.url ?? "",
        type: existing.type,
      })
    }
  }, [existing, reset])

  useEffect(() => {
    if (isEdit && profile && !existing) {
      navigate("/profile", { replace: true })
    }
  }, [isEdit, profile, existing, navigate])

  const onSubmit = (values: FormValues) => {
    const data = {
      title: values.title.trim(),
      authors: values.authors.trim(),
      venue: values.venue?.trim() || undefined,
      year: values.year,
      url: values.url?.trim() || undefined,
      type: values.type,
    }
    if (isEdit && id) {
      updatePublication(
        { id, data },
        { onSuccess: () => navigate("/profile?tab=research") } as any,
      )
      return
    }
    // New publication flow: create first, then upload PDF if any
    addPublication(data, {
      onSuccess: (res: any) => {
        const newPub = res?.data
        if (pendingPdf && newPub?.id) {
          uploadPublicationPdf(
            { id: newPub.id, file: pendingPdf },
            { onSuccess: () => navigate("/profile?tab=research") } as any,
          )
        } else {
          navigate("/profile?tab=research")
        }
      },
    } as any)
  }

  const onDelete = () => {
    if (!id) return
    if (!confirm("Delete this publication? This will also remove the attached PDF.")) return
    deletePublication(id, {
      onSuccess: () => navigate("/profile?tab=research"),
    } as any)
  }

  const handlePendingPdf = (file: File) => {
    const err = validatePdf(file)
    if (err) {
      setPendingPdf(null)
      setPendingPdfError(err)
      return
    }
    setPendingPdf(file)
    setPendingPdfError(null)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={() => navigate("/profile?tab=research")}
        className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to profile
      </button>

      <h1 className="mt-4 font-display text-2xl font-bold text-foreground sm:text-3xl">
        {isEdit ? "Edit publication" : "Add publication"}
      </h1>
      <p className="mt-1 text-[13.5px] text-muted-foreground">
        Add details and an optional PDF. Visible on your public faculty profile.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
        <div>
          <label className="block text-[12.5px] font-bold uppercase tracking-wider text-foreground">
            Type <span className="text-destructive">*</span>
          </label>
          <select
            {...register("type")}
            className="mt-1.5 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {PUBLICATION_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          {errors.type ? <FieldError msg={errors.type.message} /> : null}
        </div>

        <div>
          <label className="block text-[12.5px] font-bold uppercase tracking-wider text-foreground">
            Title <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            {...register("title")}
            placeholder="Title of the paper or work"
            className="mt-1.5 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.title ? <FieldError msg={errors.title.message} /> : null}
        </div>

        <div>
          <label className="block text-[12.5px] font-bold uppercase tracking-wider text-foreground">
            Authors <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            {...register("authors")}
            placeholder="Last, First; Last, First; ..."
            className="mt-1.5 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="mt-1 text-[11.5px] text-muted-foreground">Separate authors with commas or semicolons</p>
          {errors.authors ? <FieldError msg={errors.authors.message} /> : null}
        </div>

        <div>
          <label className="block text-[12.5px] font-bold uppercase tracking-wider text-foreground">
            Venue
          </label>
          <input
            type="text"
            {...register("venue")}
            placeholder="Journal, conference, or publisher"
            className="mt-1.5 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-[12.5px] font-bold uppercase tracking-wider text-foreground">
              Year <span className="text-destructive">*</span>
            </label>
            <input
              type="number"
              {...register("year")}
              className="mt-1.5 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.year ? <FieldError msg={errors.year.message} /> : null}
          </div>
          <div>
            <label className="block text-[12.5px] font-bold uppercase tracking-wider text-foreground">
              Link
            </label>
            <input
              type="url"
              {...register("url")}
              placeholder="https://doi.org/..."
              className="mt-1.5 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.url ? <FieldError msg={errors.url.message} /> : null}
          </div>
        </div>

        {/* PDF section for NEW publication — pending upload, sent after create */}
        {!isEdit ? (
          <div>
            <label className="block text-[12.5px] font-bold uppercase tracking-wider text-foreground">
              PDF (optional)
            </label>
            <PendingPdfPicker
              file={pendingPdf}
              error={pendingPdfError}
              onSelect={handlePendingPdf}
              onClear={() => { setPendingPdf(null); setPendingPdfError(null) }}
            />
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3 border-t border-border pt-5">
          <div>
            {isEdit ? (
              <button
                type="button"
                onClick={onDelete}
                disabled={isDeletingPublication}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12.5px] font-semibold text-destructive transition-colors hover:bg-destructive-soft disabled:opacity-60"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete publication
              </button>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/profile?tab=research")}
              disabled={isSaving || isUploadingPublicationPdf}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || isUploadingPublicationPdf || (isEdit && !isDirty)}>
              {isSaving || isUploadingPublicationPdf
                ? "Saving..."
                : isEdit ? "Save changes" : "Add publication"}
            </Button>
          </div>
        </div>
      </form>

      {/* PDF section for EDIT — full controls (replace, remove, visibility) */}
      {isEdit && existing ? (
        <div className="mt-10 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-foreground" />
            <h2 className="font-display text-[15px] font-bold text-foreground">PDF attachment</h2>
          </div>
          <p className="mt-1.5 text-[12.5px] text-muted-foreground">
            Attach the paper as a PDF. Maximum size 10 MB. PDFs are visible on your public profile by default.
          </p>

          <PdfSection
            publication={existing}
            isUploading={isUploadingPublicationPdf}
            isRemoving={isRemovingPublicationPdf}
            isUpdatingVisibility={isUpdatingPublicationPdfVisibility}
            onUpload={(file) => uploadPublicationPdf({ id: existing.id, file })}
            onRemove={() => removePublicationPdf(existing.id)}
            onToggleVisibility={(isPublic) =>
              updatePublicationPdfVisibility({ id: existing.id, isPublic })
            }
          />
        </div>
      ) : null}
    </div>
  )
}

/* ── Pending PDF picker (for new publication) ──────────────── */

interface PendingPdfPickerProps {
  file: File | null
  error: string | null
  onSelect: (file: File) => void
  onClear: () => void
}

function PendingPdfPicker({ file, error, onSelect, onClear }: PendingPdfPickerProps) {
  const ref = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  if (file) {
    return (
      <div className="mt-1.5 flex items-center justify-between gap-3 rounded-xl border border-teal-200 bg-teal-50/50 p-3 dark:border-teal-800/50 dark:bg-teal-950/30">
        <div className="flex min-w-0 items-center gap-2.5">
          <FileText className="h-4 w-4 shrink-0 text-teal-700 dark:text-teal-300" />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-foreground">{file.name}</p>
            <p className="text-[11.5px] text-muted-foreground">{formatBytes(file.size)} | will upload after publication is saved</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          Remove
        </button>
      </div>
    )
  }

  return (
    <>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          const f = e.dataTransfer.files[0]
          if (f) onSelect(f)
        }}
        onClick={() => ref.current?.click()}
        className={
          "mt-1.5 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-6 text-center transition-colors " +
          (isDragging
            ? "border-teal-500 bg-teal-50 dark:bg-teal-950/30"
            : "border-border bg-muted/20 hover:bg-muted/40")
        }
      >
        <Upload className="h-6 w-6 text-muted-foreground" />
        <p className="mt-2 text-[13px] font-semibold text-foreground">
          Drop PDF here or click to select
        </p>
        <p className="mt-0.5 text-[11.5px] text-muted-foreground">
          Optional | PDF only, max 10 MB
        </p>
      </div>
      <input
        ref={ref}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onSelect(f)
          e.target.value = ""
        }}
      />
      {error ? <ErrorRow msg={error} /> : null}
    </>
  )
}

/* ── PDF section for edit page (full controls) ────────────── */

interface PdfSectionProps {
  publication: UserPublicationDto
  isUploading: boolean
  isRemoving: boolean
  isUpdatingVisibility: boolean
  onUpload: (file: File) => void
  onRemove: () => void
  onToggleVisibility: (isPublic: boolean) => void
}

function PdfSection(props: PdfSectionProps) {
  const { publication: pub } = props
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const validateAndUpload = (file: File) => {
    setError(null)
    const err = validatePdf(file)
    if (err) { setError(err); return }
    props.onUpload(file)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) validateAndUpload(file)
  }

  if (pub.pdfUrl) {
    return (
      <div className="mt-5 space-y-4">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-950/40">
              <FileText className="h-5 w-5 text-rose-700 dark:text-rose-300" />
            </div>
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[13.5px] font-bold text-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                PDF attached
              </p>
              <p className="text-[11.5px] text-muted-foreground">
                {pub.pdfSizeBytes ? formatBytes(pub.pdfSizeBytes) : "?"}
                {pub.pdfUploadedAt ? " | uploaded " + new Date(pub.pdfUploadedAt).toLocaleDateString() : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Link
              to={pub.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              reloadDocument
              className="rounded-lg border border-border px-3 py-1.5 text-[12px] font-semibold text-foreground transition-colors hover:bg-muted"
            >
              View
            </Link>
            <button
              type="button"
              onClick={props.onRemove}
              disabled={props.isRemoving}
              className="rounded-lg px-3 py-1.5 text-[12px] font-semibold text-destructive transition-colors hover:bg-destructive-soft disabled:opacity-60"
            >
              {props.isRemoving ? "Removing..." : "Remove"}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={props.isUploading}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-[12.5px] font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-60"
          >
            <Upload className="h-3.5 w-3.5" />
            {props.isUploading ? "Replacing..." : "Replace PDF"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) validateAndUpload(f)
              e.target.value = ""
            }}
          />

          <button
            type="button"
            onClick={() => props.onToggleVisibility(!pub.isPdfPublic)}
            disabled={props.isUpdatingVisibility}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-[12.5px] font-semibold transition-colors hover:bg-muted disabled:opacity-60"
            title={pub.isPdfPublic ? "PDF is currently public" : "PDF is currently private"}
          >
            {pub.isPdfPublic ? (
              <><Eye className="h-3.5 w-3.5 text-teal-700" /> Public</>
            ) : (
              <><EyeOff className="h-3.5 w-3.5 text-muted-foreground" /> Private</>
            )}
          </button>
        </div>

        {error ? <ErrorRow msg={error} /> : null}
      </div>
    )
  }

  return (
    <div className="mt-5">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors " +
          (isDragging
            ? "border-teal-500 bg-teal-50 dark:bg-teal-950/30"
            : "border-border bg-muted/20 hover:bg-muted/40")
        }
      >
        <Upload className="h-8 w-8 text-muted-foreground" />
        <p className="mt-3 text-[14px] font-bold text-foreground">
          {props.isUploading ? "Uploading..." : "Drop PDF here or click to upload"}
        </p>
        <p className="mt-1 text-[11.5px] text-muted-foreground">
          PDF only, max 10 MB
        </p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) validateAndUpload(f)
          e.target.value = ""
        }}
      />
      {error ? <ErrorRow msg={error} /> : null}
    </div>
  )
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return (
    <p className="mt-1 flex items-center gap-1 text-[11.5px] text-destructive">
      <AlertCircle className="h-3 w-3" />
      {msg}
    </p>
  )
}

function ErrorRow({ msg }: { msg: string }) {
  return (
    <div className="mt-3 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive-soft px-3 py-2">
      <X className="h-3.5 w-3.5 text-destructive" />
      <p className="text-[12px] font-semibold text-destructive">{msg}</p>
    </div>
  )
}