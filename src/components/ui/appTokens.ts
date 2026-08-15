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
   Depth is what separates a designed product from a tidy one. The first
   pass here kept every card flat — same fill, same hairline border, no
   shadow — which made nine elements on a page read as equally important
   and gave the eye nowhere to land.

   Lifted surfaces now carry the same three-part treatment as the filled
   buttons: an inner highlight along the top edge (light catching a
   raised lip), a tight contact shadow, and a wider ambient one. */
export const SURFACE = {
  /**
   * Standard content card.
   *
   * Every card used to be a flat fill with a hairline and a 4%-black
   * shadow that was effectively invisible — which is most of why the app
   * read as "tidy" rather than made. The inner top highlight is the key
   * detail: it reads as light catching a raised edge, and it is what makes
   * a rectangle feel like an object rather than a painted area.
   */
  card:
    "rounded-2xl border border-border bg-card shadow-[inset_0_1px_0_rgb(255_255_255/0.55),0_1px_2px_rgb(15_23_42/0.05),0_4px_12px_-6px_rgb(15_23_42/0.10)] dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.045),0_1px_2px_rgb(0_0_0/0.45),0_4px_12px_-6px_rgb(0_0_0/0.6)]",

  /**
   * The primary card on a screen. Use sparingly — its whole job is to be
   * the thing you look at first, which stops working if everything is one.
   */
  cardLifted:
    "rounded-2xl border border-border bg-card shadow-[inset_0_1px_0_rgb(255_255_255/0.6),0_1px_2px_rgb(15_23_42/0.04),0_12px_28px_-12px_rgb(15_23_42/0.16)] dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_1px_2px_rgb(0_0_0/0.5),0_12px_28px_-12px_rgb(0_0_0/0.7)]",

  /** Card that responds to pointer — lists, course tiles. */
  cardInteractive:
    "rounded-2xl border border-border bg-card shadow-xs transition-all duration-180 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[0_1px_2px_rgb(15_23_42/0.04),0_14px_30px_-14px_rgb(var(--primary)/0.35)]",

  /** Quiet container for grouped rows and side panels. */
  inset: "rounded-2xl border border-border bg-muted/50",
  /** Floating: dropdowns, popovers. */
  raised: "rounded-2xl border border-border bg-popover shadow-lg",
  /** Modal panel. */
  overlay: "rounded-3xl border border-border bg-popover shadow-xl",

  /**
   * Backdrop behind a modal, sheet or command palette.
   *
   * Deliberately a fixed black, not `bg-foreground/45`. `foreground` inverts
   * with the theme, so in dark mode that scrim resolved to near-white and
   * *lightened* the page behind the dialog — the opposite of what a scrim is
   * for. A backdrop should recede in both themes, so the colour does not flip.
   */
  scrim: "bg-black/50 backdrop-blur-sm",
} as const

/* ── Ink ────────────────────────────────────────────────────────────
   The dark brand surface, carried over from the marketing site and the
   auth screens so the product does not change identity at the door.

   It is deliberately the same material — teal-950, a 48px line grid, a
   soft glow — rather than a new dark style, because the point is
   continuity. Used for page heroes only; content stays on light so the
   app remains comfortable to read all day. */
export const INK = {
  /** Wrapper. Needs `relative` children stacked above via `z-10`. */
  panel: "relative overflow-hidden bg-teal-950 text-white",

  /**
   * The app chrome — sidebar — sits a step DARKER than the hero panels.
   *
   * Both were teal-950, and on course pages the sidebar and the full-bleed
   * header met at exactly the same colour with no gap: one continuous
   * L-shaped dark mass, with nothing to say where navigation ended and
   * the course began. The header is content, but it read as frame.
   *
   * Now there is a ladder — chrome (darkest, unlit) → hero (teal-950, with
   * a glow) → content (light). The frame recedes so the brand moment can
   * be the lit thing on the page.
   */
  chrome: "bg-[#031f1e]",
  /** Hairline of light down the chrome's inner edge, so it reads as an object. */
  chromeEdge: "after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-white/[0.07] after:content-['']",
  /** Type colours that sit correctly on the ink. */
  title: "font-display font-extrabold tracking-tight text-white",
  body: "text-teal-100/70",
  /** Chip/pill on ink. */
  chip: "rounded-lg border border-white/15 bg-white/10 text-white backdrop-blur-sm",
} as const

/* ── Type ───────────────────────────────────────────────────────────
   Hierarchy by weight and colour first, size second — the app needs more
   information per screen than the marketing pages do. */
export const TEXT = {
  /**
   * Hero title, on ink. Big enough to carry a page the way the marketing
   * headline does — the previous 22px ceiling made every screen open in a
   * near-whisper.
   */
  hero: "font-display text-[30px] font-extrabold leading-[1.1] tracking-tight sm:text-[38px]",
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
