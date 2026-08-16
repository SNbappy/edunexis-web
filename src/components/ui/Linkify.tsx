import { Fragment, useMemo } from "react"
import { cn } from "@/utils/cn"

/**
 * Renders user-typed text with URLs and emails turned into real links.
 *
 * Course content is plain text — an announcement saying "slides are at
 * https://drive.google.com/..." rendered that URL as dead characters the reader
 * had to select and copy by hand. Every chat app they already use links it, so
 * a URL that is not clickable reads as broken.
 *
 * Built by splitting the string and returning React elements, never by
 * assembling an HTML string for dangerouslySetInnerHTML. The input is written
 * by students and teachers, so treating it as markup at any point would make
 * every announcement box an XSS hole. Here the text stays text: React escapes
 * it, and only the href — which is validated against a scheme allow-list — is
 * ever interpreted.
 */

/* Matches http(s):// URLs, bare www. hosts, and bare emails.
   Deliberately conservative: it would rather leave something as plain text than
   swallow trailing punctuation into a link. */
const PATTERN =
  /((?:https?:\/\/|www\.)[^\s<]+|[^\s<@]+@[^\s<@]+\.[^\s<@.]+)/gi

/** Trailing characters that are almost always sentence punctuation, not URL. */
const TRAILING = /[.,;:!?)\]}'"]+$/

const SAFE_SCHEME = /^https?:$/i

function toHref(token: string): string | null {
  if (token.includes("@") && !token.includes("/")) {
    return "mailto:" + token
  }
  const withScheme = token.startsWith("www.") ? "https://" + token : token
  try {
    const url = new URL(withScheme)
    // Allow-list the scheme so a pasted "javascript:..." can never become an
    // href, however the regex above is later relaxed.
    return SAFE_SCHEME.test(url.protocol) ? url.href : null
  } catch {
    return null
  }
}

/** Long URLs are shortened for display only; the href stays complete. */
function displayText(token: string, max = 48): string {
  if (token.length <= max) return token
  return token.slice(0, max - 1) + "…"
}

export default function Linkify({
  children, className, linkClassName,
}: {
  children?: string | null
  className?: string
  /** Override link styling where the surface is dark. */
  linkClassName?: string
}) {
  const parts = useMemo(() => {
    const text = children ?? ""
    const out: React.ReactNode[] = []
    let last = 0
    let key = 0

    for (const match of text.matchAll(PATTERN)) {
      const raw = match[0]
      const start = match.index ?? 0

      // Punctuation that ended the sentence belongs outside the link.
      const trimmed = raw.replace(TRAILING, "")
      const tail = raw.slice(trimmed.length)
      const href = toHref(trimmed)

      if (start > last) out.push(<Fragment key={key++}>{text.slice(last, start)}</Fragment>)

      if (href) {
        out.push(
          <a
            key={key++}
            href={href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            onClick={e => e.stopPropagation()}
            className={cn(
              "font-medium text-primary underline decoration-primary/40 underline-offset-2 transition-colors hover:decoration-primary",
              linkClassName,
            )}
          >
            {displayText(trimmed)}
          </a>,
        )
        if (tail) out.push(<Fragment key={key++}>{tail}</Fragment>)
      } else {
        out.push(<Fragment key={key++}>{raw}</Fragment>)
      }

      last = start + raw.length
    }

    if (last < text.length) out.push(<Fragment key={key++}>{text.slice(last)}</Fragment>)
    return out
  }, [children, linkClassName])

  return <span className={className}>{parts}</span>
}
