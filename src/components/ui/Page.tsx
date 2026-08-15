import { Link } from "react-router-dom"
import { ChevronRight, ArrowLeft } from "lucide-react"
import InkPanel from "@/components/ui/InkPanel"
import { ICON, ICON_STROKE, FOCUS, SURFACE, TEXT, INK } from "@/components/ui/appTokens"
import { cn } from "@/utils/cn"

/**
 * The page skeleton every signed-in screen is built from.
 *
 * This is the piece the app was missing. Each page previously invented its own
 * header — different title sizes, different gaps, some with breadcrumbs, some
 * with a gradient band — so moving between them felt like moving between
 * products. One skeleton, used everywhere, is what makes them feel like one.
 *
 *   <Page>
 *     <PageHeader title="Courses" description="…" actions={<Button/>} />
 *     <PageSection title="Active">…</PageSection>
 *   </Page>
 */

/** Content column. Capped so tables and prose stay readable on wide monitors. */
export function Page({
  children, className, width = "default",
}: {
  children: React.ReactNode
  className?: string
  /** `wide` for dense tables and gradebooks; `narrow` for single-column forms. */
  width?: "default" | "wide" | "narrow"
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-6 sm:px-6 lg:py-8",
        width === "narrow" ? "max-w-2xl" : width === "wide" ? "max-w-[1400px]" : "max-w-6xl",
        className,
      )}
    >
      {children}
    </div>
  )
}

/**
 * Ink hero for a top-level page.
 *
 * The brand-surface counterpart to `PageHeader`. Use it where a page is a
 * destination in its own right — Dashboard, Courses, Notifications — and
 * keep the plain `PageHeader` for pages nested under one, so the dark
 * band marks the top of a section rather than appearing on every screen
 * and losing its meaning.
 *
 * Sits inside `Page`'s padding, so it is a rounded panel rather than a
 * full-bleed band; the course header is full-bleed because it sits above
 * the tab bar and the two read as one unit.
 */
export function PageHero({
  title, description, actions, eyebrow, figures, className,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  /** Small uppercase line above the title — a date, a section name. */
  eyebrow?: React.ReactNode
  /** Inline counts rendered as chips on the ink. */
  figures?: { value: React.ReactNode; label: string; to?: string }[]
  className?: string
}) {
  return (
    <InkPanel className={cn("rounded-3xl", className)}>
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4 px-6 py-7 sm:px-8">
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-teal-300/80">
              {eyebrow}
            </p>
          )}
          <h1 className={cn(TEXT.hero, "mt-2 text-white")}>{title}</h1>
          {description && (
            <p className={cn(INK.body, "mt-2 max-w-lg text-[14px] leading-relaxed")}>
              {description}
            </p>
          )}

          {figures && figures.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              {figures.map((f, i) => {
                const body = (
                  <span
                    className={cn(
                      INK.chip,
                      "inline-flex items-baseline gap-2 px-3 py-2 transition-colors duration-120",
                      f.to && "hover:bg-white/[0.16]",
                    )}
                  >
                    <span className="font-display text-[17px] font-extrabold tabular-nums leading-none">
                      {f.value}
                    </span>
                    <span className="text-[12.5px] text-teal-100/70">{f.label}</span>
                  </span>
                )
                return f.to
                  ? <Link key={i} to={f.to} className={cn("rounded-lg", FOCUS)}>{body}</Link>
                  : <span key={i}>{body}</span>
              })}
            </div>
          )}
        </div>

        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </InkPanel>
  )
}

/**
 * Two-column layout for a content tab: a primary column and a context rail.
 *
 * Several course tabs were a narrow `max-w-3xl` column pinned to the left,
 * which left roughly a third of a laptop screen empty and made the app
 * look unfinished. Centring alone would not have fixed it — a 768px
 * column floating in 1536px is still mostly gap. The rail earns the space
 * by carrying things you would otherwise switch tabs to find.
 *
 * The rail drops below the main column under `lg`, so on a laptop it is a
 * sidebar and on a tablet it is a footer — never a squeezed second column.
 */
export function TabSplit({
  children, aside, className,
}: {
  children: React.ReactNode
  aside?: React.ReactNode
  className?: string
}) {
  if (!aside) return <div className={cn("w-full", className)}>{children}</div>

  return (
    <div className={cn("grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]", className)}>
      <div className="min-w-0">{children}</div>
      <aside className="min-w-0 space-y-4">{aside}</aside>
    </div>
  )
}

/** A titled block for the context rail. */
export function RailCard({
  title, children, className,
}: {
  title?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn(SURFACE.card, "overflow-hidden", className)}>
      {title && (
        <div className="border-b border-border px-3.5 py-2.5">
          <h3 className={TEXT.eyebrow}>{title}</h3>
        </div>
      )}
      <div className="p-3.5">{children}</div>
    </div>
  )
}

export interface Crumb { label: string; to?: string }

/**
 * Page header.
 *
 * Title and actions share a baseline, with the description beneath rather than
 * beside — descriptions vary in length and would otherwise push the actions
 * around from page to page.
 */
export function PageHeader({
  title, description, actions, crumbs, back, icon, className,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  crumbs?: Crumb[]
  /** Renders a back link above the title. Use instead of crumbs one level deep. */
  back?: { label: string; to: string }
  icon?: React.ReactNode
  className?: string
}) {
  return (
    <header className={cn("mb-6", className)}>
      {/* `back.to` must be non-empty. Onboarding passes empty strings because it
          has nowhere to go back to, which used to render a bare arrow linking to
          the current page — a control that looks live and does nothing. */}
      {back && back.to && (
        <Link
          to={back.to}
          className={cn(
            "-ml-1 mb-2.5 inline-flex items-center gap-1.5 rounded-lg px-1 py-0.5 text-[12.5px] font-medium text-muted-foreground transition-colors duration-120 hover:text-foreground",
            FOCUS,
          )}
        >
          <ArrowLeft className={ICON.xs} strokeWidth={ICON_STROKE} />
          {back.label}
        </Link>
      )}

      {crumbs && crumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-2.5 flex items-center gap-1 text-[12.5px]">
          {crumbs.map((c, i) => (
            <span key={`${c.label}-${i}`} className="flex items-center gap-1">
              {i > 0 && (
                <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/50" strokeWidth={ICON_STROKE} aria-hidden />
              )}
              {c.to ? (
                <Link
                  to={c.to}
                  className={cn("rounded font-medium text-muted-foreground transition-colors duration-120 hover:text-foreground", FOCUS)}
                >
                  {c.label}
                </Link>
              ) : (
                <span className="font-medium text-foreground" aria-current="page">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="flex min-w-0 items-center gap-3">
          {icon && (
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground [&_svg]:h-[18px] [&_svg]:w-[18px]"
              aria-hidden
            >
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="truncate font-display text-[21px] font-extrabold leading-tight tracking-tight text-foreground sm:text-[23px]">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>

        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}

/**
 * A titled block within a page. Use this instead of another card-in-a-card:
 * the heading sits *outside* the surface, so nesting stays one level deep.
 */
export function PageSection({
  title, description, actions, children, className, bare,
}: {
  title?: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  /** Skip the card frame — for sections that are already a grid of cards. */
  bare?: boolean
}) {
  return (
    <section className={cn("mb-6 last:mb-0", className)}>
      {(title || actions) && (
        <div className="mb-3 flex items-end justify-between gap-4">
          <div className="min-w-0">
            {title && (
              <h2 className="font-display text-[15px] font-bold tracking-tight text-foreground">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-0.5 text-[12.5px] text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      {bare ? children : <div className={SURFACE.card}>{children}</div>}
    </section>
  )
}

/** Generic content card, for use outside the section pattern. */
export function Card({
  children, className, interactive, padded = true,
}: {
  children: React.ReactNode
  className?: string
  interactive?: boolean
  padded?: boolean
}) {
  return (
    <div
      className={cn(
        interactive ? SURFACE.cardInteractive : SURFACE.card,
        padded && "p-4",
        className,
      )}
    >
      {children}
    </div>
  )
}
