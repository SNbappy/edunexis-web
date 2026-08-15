/**
 * YouTube URL handling for course materials.
 *
 * Deliberately strict: only URLs we can positively identify as YouTube are
 * ever embedded. Arbitrary links are opened in a new tab instead, for two
 * reasons — most sites send `X-Frame-Options: DENY` so the frame would just
 * be blank, and framing a page you do not control inside the app is a bad
 * idea regardless of whether it happens to render.
 */

/** Recognised YouTube hosts. A bare `includes("youtube")` would also match
 *  `youtube.evil.example`, so hosts are compared exactly. */
const YT_HOSTS = new Set([
  "youtube.com", "www.youtube.com", "m.youtube.com",
  "youtu.be", "www.youtu.be",
  "youtube-nocookie.com", "www.youtube-nocookie.com",
])

/** YouTube IDs are 11 chars of [A-Za-z0-9_-]. */
const ID_RE = /^[A-Za-z0-9_-]{11}$/

/**
 * Extracts the video id from any common YouTube URL shape:
 *   youtube.com/watch?v=ID · youtu.be/ID · /embed/ID · /shorts/ID · /live/ID
 * Returns null for anything else, including malformed or non-YouTube URLs.
 */
export function getYouTubeId(rawUrl: string): string | null {
  if (!rawUrl?.trim()) return null

  let url: URL
  try {
    // Tolerate input pasted without a scheme.
    url = new URL(rawUrl.trim().match(/^https?:\/\//i) ? rawUrl.trim() : `https://${rawUrl.trim()}`)
  } catch {
    return null
  }

  if (!YT_HOSTS.has(url.hostname.toLowerCase())) return null

  // youtu.be/<id>
  if (url.hostname.toLowerCase().endsWith("youtu.be")) {
    const id = url.pathname.split("/").filter(Boolean)[0]
    return id && ID_RE.test(id) ? id : null
  }

  // youtube.com/watch?v=<id>
  const v = url.searchParams.get("v")
  if (v && ID_RE.test(v)) return v

  // /embed/<id>, /shorts/<id>, /live/<id>, /v/<id>
  const parts = url.pathname.split("/").filter(Boolean)
  if (parts.length >= 2 && ["embed", "shorts", "live", "v"].includes(parts[0])) {
    return ID_RE.test(parts[1]) ? parts[1] : null
  }

  return null
}

export function isYouTubeUrl(url: string): boolean {
  return getYouTubeId(url) !== null
}

/**
 * Privacy-preserving embed URL. `youtube-nocookie.com` does not set tracking
 * cookies until the viewer actually presses play, which matters when the page
 * is shown to a whole class by default.
 */
export function getYouTubeEmbedUrl(url: string): string | null {
  const id = getYouTubeId(url)
  return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1` : null
}

/** Thumbnail for list and preview headers. */
export function getYouTubeThumbnail(url: string): string | null {
  const id = getYouTubeId(url)
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null
}

/** Host shown on link cards, e.g. "drive.google.com". */
export function getLinkHost(rawUrl: string): string {
  try {
    const u = new URL(rawUrl.match(/^https?:\/\//i) ? rawUrl : `https://${rawUrl}`)
    return u.hostname.replace(/^www\./, "")
  } catch {
    return rawUrl
  }
}

/** Normalises user input to an absolute https URL for storage. */
export function normaliseUrl(rawUrl: string): string {
  const t = rawUrl.trim()
  if (!t) return t
  return /^https?:\/\//i.test(t) ? t : `https://${t}`
}
