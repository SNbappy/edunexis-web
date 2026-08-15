import { Link } from "react-router-dom"
import { ChevronRight, ArrowLeft } from "lucide-react"
import { ICON, ICON_STROKE, FOCUS, SURFACE } from "@/components/ui/appTokens"
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
      {back && (
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
