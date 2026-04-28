/**
 * Determines how a file should be previewed in the UI.
 * Used by MaterialPreviewModal to switch between renderers.
 */

export type PreviewKind =
  | "pdf"
  | "image"
  | "video"
  | "audio"
  | "office"
  | "text"
  | "none"

const EXT_PDF      = ["pdf"]
const EXT_IMAGE    = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"]
const EXT_VIDEO    = ["mp4", "webm", "ogg", "mov", "m4v"]
const EXT_AUDIO    = ["mp3", "wav", "m4a", "aac", "flac"]
const EXT_OFFICE   = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"]
const EXT_TEXT     = ["txt", "md", "csv", "json", "xml", "log", "yml", "yaml"]

function getExtension(filename: string): string {
  const dot = filename.lastIndexOf(".")
  if (dot === -1) return ""
  return filename.slice(dot + 1).toLowerCase()
}

export function getPreviewKind(filename: string): PreviewKind {
  const ext = getExtension(filename)
  if (EXT_PDF.includes(ext))    return "pdf"
  if (EXT_IMAGE.includes(ext))  return "image"
  if (EXT_VIDEO.includes(ext))  return "video"
  if (EXT_AUDIO.includes(ext))  return "audio"
  if (EXT_OFFICE.includes(ext)) return "office"
  if (EXT_TEXT.includes(ext))   return "text"
  return "none"
}

export function isPreviewable(filename: string): boolean {
  return getPreviewKind(filename) !== "none"
}

/**
 * Strips Cloudinary's fl_attachment flag from a URL if present, since
 * that flag forces download instead of inline display.
 */
export function stripAttachmentFlag(url: string): string {
  return url.replace(/\/fl_attachment[^/]*\//, "/")
}

/**
 * Builds the URL to render in the preview modal.
 * For Office docs, wraps in Microsoft's free Office Online viewer.
 * For everything else, returns the (cleaned) raw URL.
 */
export function buildPreviewUrl(rawUrl: string, kind: PreviewKind): string {
  const cleaned = stripAttachmentFlag(rawUrl)
  if (kind === "office") {
    return "https://view.officeapps.live.com/op/embed.aspx?src=" + encodeURIComponent(cleaned)
  }
  return cleaned
}
