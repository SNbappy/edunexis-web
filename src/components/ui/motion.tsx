import { useEffect, useState } from "react"
import { motion } from "framer-motion"

/**
 * Shared scroll-motion primitives for the public pages.
 *
 * The homepage grew its own copies of these first; About and the faculty pages
 * had none at all, which is a large part of why they read as a different site.
 * Extracted here so every public page reveals content the same way.
 */

export const EASE = [0.16, 1, 0.3, 1] as const
export const REVEAL_VIEWPORT = { once: true, margin: "-70px" } as const

/** One shared listener rather than one per component. */
const store = { value: false, subs: new Set<() => void>(), init: false }

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(store.value)
  useEffect(() => {
    if (!store.init) {
      store.init = true
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
      store.value = mq.matches
      mq.addEventListener("change", e => {
        store.value = e.matches
        store.subs.forEach(fn => fn())
      })
    }
    const sync = () => setReduced(store.value)
    sync()
    store.subs.add(sync)
    return () => { store.subs.delete(sync) }
  }, [])
  return reduced
}

/** Rises and fades in when scrolled to. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: React.ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  const reduced = usePrefersReducedMotion()
  if (reduced) return <div className={className}>{children}</div>
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={REVEAL_VIEWPORT}
      transition={{ duration: 0.65, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Heading whose lines wipe up from behind one another.
 *
 * The trigger sits on the unclipped wrapper, never on the sliding span: a span
 * translated 110% down is entirely outside its overflow-hidden parent, so an
 * observer on it would report "never visible" and the line would stay hidden
 * for good.
 */
export function RevealLines({
  lines,
  className,
  as: Tag = "h1",
  accentFrom,
  accentClass = "bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-700 bg-clip-text text-transparent",
}: {
  lines: string[]
  className?: string
  as?: "h1" | "h2"
  accentFrom?: number
  accentClass?: string
}) {
  const reduced = usePrefersReducedMotion()
  return (
    <Tag className={className}>
      {lines.map((line, i) => {
        const accent = accentFrom !== undefined && i >= accentFrom
        if (reduced) {
          return (
            <span key={line} className={"block " + (accent ? accentClass : "")}>
              {line}
            </span>
          )
        }
        return (
          <motion.span
            key={line}
            className="block overflow-hidden pb-[0.06em]"
            initial="hidden"
            whileInView="show"
            viewport={REVEAL_VIEWPORT}
          >
            <motion.span
              variants={{ hidden: { y: "110%" }, show: { y: "0%" } }}
              transition={{ duration: 0.7, delay: i * 0.11, ease: EASE }}
              className={"block " + (accent ? accentClass : "")}
            >
              {line}
            </motion.span>
          </motion.span>
        )
      })}
    </Tag>
  )
}

/** The 48px line grid used on every teal-ink surface. */
export function InkGrid() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 opacity-[0.05]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }}
    />
  )
}
