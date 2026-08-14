import { motion } from "framer-motion"
import { cn } from "@/utils/cn"
import BrandMark from "@/components/ui/BrandMark"

type Variant = "screen" | "page" | "inline"

interface BrandLoaderProps {
  variant?: Variant
  label?: string
  className?: string
}

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * Brand loader.
 *
 * Reserved for genuinely blocking waits — signing in, creating an account,
 * verifying a code — not for route transitions. Fast navigation uses
 * RouteProgress instead, because a full-screen splash that appears and
 * vanishes inside 200ms reads as jank rather than polish.
 *
 * The previous version was an orbit spinner on a plain background: generic,
 * and the one branded moment in the product that didn't look like the product.
 * The "screen" variant now sits on the same teal-ink surface, grid texture and
 * brand glow as the homepage's dark sections and the auth panels.
 */

/** Indeterminate sweep — calmer and more considered than bouncing dots. */
function ProgressLine({ dark }: { dark?: boolean }) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative h-[3px] w-40 overflow-hidden rounded-full",
        dark ? "bg-white/10" : "bg-stone-200",
      )}
    >
      <motion.div
        className={cn(
          "absolute inset-y-0 w-1/2 rounded-full",
          dark
            ? "bg-gradient-to-r from-transparent via-teal-300 to-transparent"
            : "bg-gradient-to-r from-transparent via-teal-600 to-transparent",
        )}
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  )
}

/** The mark, breathing inside a soft brand glow. */
function GlowMark({ size, dark }: { size: number; dark?: boolean }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size * 2, height: size * 2 }}>
      {/* pulsing halo */}
      <motion.span
        aria-hidden
        className={cn(
          "absolute rounded-full blur-2xl",
          dark ? "bg-teal-400/30" : "bg-teal-300/40",
        )}
        style={{ width: size * 1.7, height: size * 1.7 }}
        animate={{ scale: [1, 1.18, 1], opacity: [0.55, 0.9, 0.55] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* expanding ring, like a signal going out */}
      <motion.span
        aria-hidden
        className={cn(
          "absolute rounded-full border",
          dark ? "border-teal-300/40" : "border-teal-500/35",
        )}
        style={{ width: size * 1.5, height: size * 1.5 }}
        animate={{ scale: [0.85, 1.35], opacity: [0.7, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
      />
      <motion.div
        initial={{ scale: 0.86, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="relative"
      >
        <BrandMark style={{ width: size, height: size }} />
      </motion.div>
    </div>
  )
}

/** Wordmark that settles from wide tracking — a small, deliberate flourish. */
function Wordmark({ dark }: { dark?: boolean }) {
  return (
    <motion.span
      initial={{ opacity: 0, letterSpacing: "0.34em", y: 6 }}
      animate={{ opacity: 1, letterSpacing: "-0.02em", y: 0 }}
      transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
      className={cn(
        "font-display text-[22px] font-extrabold",
        dark ? "text-white" : "text-stone-900",
      )}
    >
      EduNexis
    </motion.span>
  )
}

export default function BrandLoader({ variant = "page", label, className }: BrandLoaderProps) {
  /* --- inline: sits next to text --- */
  if (variant === "inline") {
    return (
      <span
        className={cn("inline-flex items-center gap-2 text-muted-foreground", className)}
        role="status"
        aria-label={label ?? "Loading"}
      >
        <motion.span
          aria-hidden
          className="h-3.5 w-3.5 rounded-full border-2 border-teal-600/25 border-t-teal-600"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
        {label && <span className="text-xs font-medium">{label}</span>}
      </span>
    )
  }

  /* --- screen: blocking, full brand moment on the teal-ink surface --- */
  if (variant === "screen") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className={cn("fixed inset-0 z-[100] flex flex-col items-center justify-center bg-teal-950", className)}
        role="status"
        aria-label={label ?? "Loading"}
      >
        {/* same 48px grid used by every dark surface on the site */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div aria-hidden className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/10 blur-3xl" />

        <div className="relative flex flex-col items-center gap-6">
          <GlowMark size={56} dark />
          <Wordmark dark />
          <ProgressLine dark />
          {label && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-[12.5px] font-medium text-teal-100/60"
            >
              {label}
            </motion.p>
          )}
        </div>
      </motion.div>
    )
  }

  /* --- page: in-content, keeps the surrounding chrome visible --- */
  return (
    <div
      className={cn("flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center gap-5", className)}
      role="status"
      aria-label={label ?? "Loading"}
    >
      <GlowMark size={40} />
      <ProgressLine />
      {label && <p className="text-[12.5px] font-medium text-stone-500">{label}</p>}
    </div>
  )
}
