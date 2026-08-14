/**
 * Shared styling for the site's primary call-to-action buttons.
 *
 * Deliberately a single-hue gradient rather than a two-colour one. A
 * teal→cyan blend is the 2020 SaaS look and tends to read as dated; what
 * actually makes a button feel like a physical object is:
 *
 *   1. a light-to-dark ramp within one hue, as if lit from above
 *   2. a 1px inner highlight along the top edge (the specular line)
 *   3. a coloured ambient shadow beneath it, tinted to the button
 *
 * Kept in one place so the navbar, hero, auth screens and in-page CTAs can't
 * drift apart — they were already three slightly different teals.
 */

/** Deep teal CTA for light backgrounds. */
export const CTA_PRIMARY = [
  "bg-gradient-to-b from-teal-700 to-teal-900",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_10px_24px_-10px_rgba(13,148,136,0.7)]",
  "hover:from-teal-600 hover:to-teal-800",
  "hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_14px_32px_-10px_rgba(13,148,136,0.85)]",
  "active:translate-y-px",
  "transition-all duration-200",
].join(" ")

/** White CTA used on the teal-ink surfaces (final CTA band). */
export const CTA_ON_DARK = [
  "bg-gradient-to-b from-white to-stone-100",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_34px_-10px_rgba(45,212,191,0.45)]",
  "hover:from-white hover:to-white",
  "hover:shadow-[inset_0_1px_0_rgba(255,255,255,1),0_16px_42px_-10px_rgba(45,212,191,0.65)]",
  "active:translate-y-px",
  "transition-all duration-200",
].join(" ")

/** Secondary/outline CTA for light backgrounds. */
export const CTA_SECONDARY = [
  "bg-gradient-to-b from-white to-stone-50",
  "border border-stone-300",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_2px_6px_-2px_rgba(15,23,42,0.08)]",
  "hover:border-stone-400 hover:shadow-[inset_0_1px_0_rgba(255,255,255,1),0_6px_14px_-4px_rgba(15,23,42,0.12)]",
  "active:translate-y-px",
  "transition-all duration-200",
].join(" ")
