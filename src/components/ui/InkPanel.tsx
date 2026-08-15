import { INK } from "@/components/ui/appTokens"
import { cn } from "@/utils/cn"

/**
 * The dark brand surface used for page heroes inside the app.
 *
 * It is intentionally the *same* material as the marketing hero and the
 * auth screens — teal-950, a 48px line grid at 5%, and a soft off-centre
 * glow — rather than a new dark treatment invented for the app. Before
 * this, the brand vanished the moment you signed in: the product went
 * from a saturated teal identity to a white page with grey hairlines,
 * and stopped feeling like the same piece of software.
 *
 * Heroes only. Content sits on light below, both because a full dark app
 * is tiring for people who live in it all day, and because the contrast
 * is what makes the cards beneath read as lifted.
 */
export default function InkPanel({
  children,
  className,
  glow = true,
}: {
  children: React.ReactNode
  className?: string
  /** The radial bloom. Off for short strips where it would be cropped oddly. */
  glow?: boolean
}) {
  return (
    <div className={cn(INK.panel, className)}>
      {/* 48px line grid — the texture from the public site. */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Glow, pushed off-centre so the panel has a light source rather
          than an evenly-lit, flat look. */}
      {glow && (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-40 h-[420px] w-[420px] rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(45,212,191,0.55) 0%, rgba(45,212,191,0.12) 45%, transparent 70%)",
          }}
        />
      )}

      {/* A hairline of light along the bottom edge, so the panel reads as
          a solid object the content sits under rather than a painted area. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />

      <div className="relative z-10">{children}</div>
    </div>
  )
}
