import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  X, ExternalLink, Download as DownloadIcon, Loader2,
  FileX, FileText, AlertCircle,
} from "lucide-react"
import {
  getPreviewKind, buildPreviewUrl, type PreviewKind,
} from "@/utils/filePreview"
import { formatFileSize } from "@/utils/fileUtils"

interface MaterialPreviewModalProps {
  isOpen:        boolean
  onClose:       () => void
  fileUrl:       string
  fileName:      string
  fileSizeBytes?: number
}

export default function MaterialPreviewModal({
  isOpen, onClose, fileUrl, fileName, fileSizeBytes,
}: MaterialPreviewModalProps) {
  const kind = getPreviewKind(fileName)
  const previewUrl = buildPreviewUrl(fileUrl, kind)

  useEffect(() => {
    if (!isOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = previous }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [isOpen, onClose])

  const handleDownload = async () => {
    try {
      const res  = await fetch(fileUrl)
      const blob = await res.blob()
      const url  = window.URL.createObjectURL(blob)
      const a    = document.createElement("a")
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch {
      window.open(fileUrl, "_blank")
    }
  }

  if (typeof document === "undefined") return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 flex flex-col bg-background"
          style={{ zIndex: 99999 }}
        >
          <div className="flex shrink-0 items-center gap-3 border-b border-border bg-card px-5 py-3 shadow-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">
              <FileText className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <h2
                className="truncate font-display text-[14px] font-bold text-foreground"
                title={fileName}
              >
                {fileName}
              </h2>
              {typeof fileSizeBytes === "number" && fileSizeBytes > 0 && (
                <p className="text-[11.5px] text-muted-foreground">
                  {formatFileSize(fileSizeBytes)}
                </p>
              )}
            </div>

            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-1.5 text-[12px] font-semibold text-foreground transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 dark:hover:border-teal-700 dark:hover:bg-teal-950/30 dark:hover:text-teal-300 sm:inline-flex"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open in new tab
            </a>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-[12px] font-bold text-white transition-colors hover:bg-teal-700"
            >
              <DownloadIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              title="Close (Esc)"
              className="rounded-lg bg-muted p-1.5 text-muted-foreground transition-all hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-hidden bg-muted/30">
            <PreviewBody
              kind={kind}
              previewUrl={previewUrl}
              rawUrl={fileUrl}
              fileName={fileName}
              onDownload={handleDownload}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

interface PreviewBodyProps {
  kind:        PreviewKind
  previewUrl:  string
  rawUrl:      string
  fileName:    string
  onDownload:  () => void
}

function PreviewBody({ kind, previewUrl, rawUrl, fileName, onDownload }: PreviewBodyProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false)

  if (kind === "pdf") {
    return (
      <div className="relative h-full w-full">
        {!iframeLoaded && <PreviewLoader label="Loading PDF..." />}
        <iframe
          src={previewUrl}
          title={fileName}
          onLoad={() => setIframeLoaded(true)}
          className="h-full w-full border-0"
        />
      </div>
    )
  }

  if (kind === "image") {
    return (
      <div className="flex h-full w-full items-center justify-center overflow-auto bg-stone-900 p-6">
        <img
          src={previewUrl}
          alt={fileName}
          className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
        />
      </div>
    )
  }

  if (kind === "video") {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black p-6">
        <video
          src={previewUrl}
          controls
          preload="metadata"
          className="max-h-full max-w-full rounded-lg"
        >
          Your browser does not support this video format.
        </video>
      </div>
    )
  }

  if (kind === "audio") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-6 p-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">
          <FileText className="h-9 w-9" />
        </div>
        <p className="font-display text-[14px] font-bold text-foreground">
          {fileName}
        </p>
        <audio src={previewUrl} controls className="w-full max-w-lg">
          Your browser does not support this audio format.
        </audio>
      </div>
    )
  }

  if (kind === "office") {
    return (
      <div className="relative h-full w-full">
        {!iframeLoaded && <PreviewLoader label="Loading via Office Online..." />}
        <iframe
          src={previewUrl}
          title={fileName}
          onLoad={() => setIframeLoaded(true)}
          className="h-full w-full border-0"
        />
      </div>
    )
  }

  if (kind === "text") {
    return <TextPreview url={rawUrl} fileName={fileName} />
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <FileX className="h-7 w-7" />
      </div>
      <div>
        <h3 className="font-display text-[15px] font-bold text-foreground">
          Preview not available
        </h3>
        <p className="mt-1 max-w-sm text-[13px] text-muted-foreground">
          This file type cannot be previewed in the browser. You can download it or open it in a new tab.
        </p>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <a
          href={rawUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-2 text-[12px] font-semibold text-foreground transition-colors hover:bg-stone-100 dark:hover:bg-stone-900"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open in new tab
        </a>
        <button
          type="button"
          onClick={onDownload}
          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-[12px] font-bold text-white transition-colors hover:bg-teal-700"
        >
          <DownloadIcon className="h-3.5 w-3.5" />
          Download
        </button>
      </div>
    </div>
  )
}

function PreviewLoader({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-card/80 backdrop-blur-sm">
      <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
      <p className="text-[12px] font-semibold text-muted-foreground">{label}</p>
    </div>
  )
}

function TextPreview({ url, fileName }: { url: string; fileName: string }) {
  const [content, setContent] = useState<string | null>(null)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setContent(null)
    setError(null)
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error("HTTP " + res.status)
        return res.text()
      })
      .then(text => { if (!cancelled) setContent(text) })
      .catch(err => { if (!cancelled) setError(err.message) })
    return () => { cancelled = true }
  }, [url])

  if (error) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-8 text-center">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="text-[13px] font-semibold text-foreground">Could not load preview</p>
        <p className="text-[12px] text-muted-foreground">{error}</p>
      </div>
    )
  }

  if (content === null) {
    return <PreviewLoader label={"Loading " + fileName + "..."} />
  }

  return (
    <pre className="h-full w-full overflow-auto p-6 font-mono text-[12.5px] leading-relaxed text-foreground">
      {content}
    </pre>
  )
}
