/**
 * Design tokens for the signed-in application.
 *
 * The public site and the app share a palette but not a personality: marketing
 * pages persuade with scale and motion, the app has to be usable at speed by
 * someone mid-lecture. These tokens exist so every in-app screen — dashboard,
 * course tabs, forms, modals, tables — reads as one product.
 *
 * The chrome was audited before writing this: five icon sizes and four stroke
 * weights across just the sidebar, topbar and dashboard. That inconsistency,
 * not the icon set, is what made it look unfinished.
 *
 * Everything below is written against the semantic colour variables in
 * index.css (background / card / border / muted / primary …), never against raw
 * palette classes — the app has a working class-based dark mode and a literal
 * `stone-200` would survive the theme switch unchanged.
 */

/* ── Icons ──────────────────────────────────────────────────────────
   One stroke weight everywhere. Lucide defaults to 2, which is heavy at
   small sizes and is a large part of why dense UI drawn with it reads as
   "admin panel". 1.75 keeps the shapes legible while feeling drawn rather
   than stamped. Icons label things here; they never decorate. */
export const ICON = {
  /** Inline with body text, inside chips and table cells. */
  xs: "h-3.5 w-3.5",
  /** Default: nav items, buttons, form affordances. */
  sm: "h-4 w-4",
  /** Section headers and toolbar buttons. */
  md: "h-[18px] w-[18px]",
  /** Reserved for empty-state illustrations only. */
  lg: "h-6 w-6",
} as const

export const ICON_STROKE = 1.75

/* ── Surfaces ───────────────────────────────────────────────────────
   A single shadow ramp. Cards sit almost flat; only things that float
   above the page (menus, modals) get real elevation. */
export const SURFACE = {
  /** Standard content card. */
  card: "rounded-2xl border border-border bg-card",
  /** Card that responds to pointer — lists, course tiles. */
  cardInteractive:
    "rounded-2xl border border-border bg-card transition-all duration-180 hover:border-border-strong hover:shadow-md",
  /** Quiet container for grouped rows and side panels. */
  inset: "rounded-2xl border border-border bg-muted/50",
  /** Floating: dropdowns, popovers. */
  raised: "rounded-2xl border border-border bg-popover shadow-lg",
  /** Modal panel. */
  overlay: "rounded-3xl border border-border bg-popover shadow-xl",
} as const

/* ── Type ───────────────────────────────────────────────────────────
   Hierarchy by weight and colour first, size second — the app needs more
   information per screen than the marketing pages do. */
export const TEXT = {
  /** Page title. */
  pageTitle: "font-display text-[22px] font-extrabold tracking-tight text-foreground",
  /** Card / section heading. */
  section: "font-display text-[15px] font-bold text-foreground",
  /** The small uppercase label above a group. */
  eyebrow: "text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground/80",
  /** Default body copy. */
  body: "text-[13.5px] text-foreground",
  /** Secondary / supporting copy. */
  muted: "text-[12.5px] text-muted-foreground",
  /** Numerals in tables and stats. */
  numeric: "tabular-nums font-display font-bold text-foreground",
} as const

/* ── Motion ─────────────────────────────────────────────────────────
   In-app motion confirms an action; it never announces content. Nothing
   here is scroll-triggered, because a screen you visit many times a day
   should not re-animate on every visit. */
export const MOTION = {
  /** Hover, focus, colour changes. */
  fast: 0.12,
  /** Panels, popovers, tab content. */
  base: 0.18,
  /** Modal enter/exit. */
  overlay: 0.22,
  ease: [0.16, 1, 0.3, 1] as const,
} as const

/* ── Focus ──────────────────────────────────────────────────────────
   One visible focus treatment across every interactive element. */
export const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
