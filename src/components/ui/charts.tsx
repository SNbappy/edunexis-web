import { cn } from "@/utils/cn"

/**
 * Small data visualisations, built with plain SVG and CSS.
 *
 * No charting library: everything here is a handful of elements, and a
 * ~90KB dependency to draw ten bars would cost more than it returns. It
 * also means these inherit the theme tokens directly and work in dark
 * mode without configuration.
 *
 * The goal is a *shape* the eye reads instantly — is attendance drifting
 * down, is the class bunched at the top or spread thin. Exact values stay
 * in the table underneath; these are for the glance.
 */

/* ── Trend bars ─────────────────────────────────────────────────── */

export interface TrendPoint {
  /** Short axis label, e.g. "12 Aug". */
  label: string
  /** 0–100. */
  value: number
  /** Optional richer tooltip line. */
  detail?: string
}

/**
 * Attendance (or any 0–100 series) across sessions, oldest to newest.
 *
 * A threshold line is drawn where a rule actually exists — 75% attendance
 * here — because that is the only value on the axis anyone acts on. Bars
 * below it are tinted; the rest stay neutral, so the exceptions pop
 * instead of every bar competing.
 */
export function TrendBars({
  points,
  threshold,
  className,
  height = 64,
  showLabels = false,
}: {
  points: TrendPoint[]
  threshold?: number
  className?: string
  height?: number
  /** Print each bar's percentage above it and its date below. */
  showLabels?: boolean
}) {
  if (points.length === 0) return null

  /**
   * The axis does NOT start at zero, and that is deliberate.
   *
   * Attendance clusters in a narrow band near the top — a real class runs
   * 75–95%. Drawn on a 0–100 axis every bar is nearly full height and the
   * variation that actually matters becomes invisible; the first version
   * of this chart rendered ten sessions as ten identical blocks.
   *
   * So the floor drops just below whichever is lower, the worst session or
   * the threshold, and the bars are mapped into that range. The threshold
   * line is positioned in the same space, which keeps "below the line"
   * honest — the only claim this chart makes.
   */
  const values = points.map(p => p.value)
  const lowest = Math.min(...values, threshold ?? 100)
  const floor  = Math.max(0, Math.floor((lowest - 8) / 5) * 5)
  const span   = Math.max(1, 100 - floor)
  const toPct  = (v: number) => ((Math.min(100, Math.max(floor, v)) - floor) / span) * 100

  return (
    <div className={cn("w-full", className)}>
      <div
        className="relative flex items-end gap-[3px]"
        style={{ height }}
        role="img"
        aria-label={
          `Trend across ${points.length} sessions, ` +
          `from ${values[0]}% to ${values[values.length - 1]}%` +
          (threshold ? `, requirement ${threshold}%` : "")
        }
      >
        {threshold !== undefined && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 z-10 border-t border-dashed border-foreground/25"
            style={{ bottom: `${toPct(threshold)}%` }}
          />
        )}

        {points.map((p, i) => {
          const low = threshold !== undefined && p.value < threshold
          return (
            <div
              key={i}
              className="group relative min-w-[6px] flex-1"
              style={{ height: "100%" }}
            >
              <div
                className={cn(
                  "absolute bottom-0 w-full rounded-t-[3px] transition-[height] duration-500 ease-out",
                  low ? "bg-warning" : "bg-primary/55",
                  "group-hover:bg-primary",
                )}
                style={{ height: `${Math.max(3, toPct(p.value))}%` }}
              />
              {/* Native tooltip: zero JS, works on keyboard focus too. */}
              <span className="absolute inset-0" title={`${p.label}: ${p.detail ?? `${p.value}%`}`} />
            </div>
          )
        })}
      </div>

      {showLabels ? (
        /* Every session carries its own date and figure. A teacher asked for
           the number on the bar rather than only in a hover tooltip, which is
           invisible on a touch screen and on a printed screenshot. */
        <div className="mt-1 flex gap-[3px]">
          {points.map((p, i) => {
            const low = threshold !== undefined && p.value < threshold
            return (
              <div key={i} className="min-w-[6px] flex-1 text-center leading-tight">
                <div
                  className={cn(
                    "text-[10px] font-bold tabular-nums",
                    low ? "text-warning" : "text-foreground",
                  )}
                >
                  {p.value}%
                </div>
                <div className="truncate text-[9.5px] tabular-nums text-muted-foreground">
                  {p.label}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="mt-1.5 flex items-center justify-between text-[10.5px] tabular-nums text-muted-foreground">
          <span>{points[0].label}</span>
          <span>{points[points.length - 1].label}</span>
        </div>
      )}
    </div>
  )
}

/* ── Distribution ───────────────────────────────────────────────── */

export interface DistributionBucket {
  label: string
  count: number
  /** Tailwind bg class. Defaults to the brand ramp. */
  className?: string
}

/**
 * How a class is spread across grade bands — one stacked bar plus a
 * legend, rather than a chart with axes.
 *
 * A teacher's question here is "is the class bunched or spread, and how
 * many are failing", which a single proportional bar answers faster than
 * a histogram does.
 */
export function DistributionBar({
  buckets,
  className,
}: {
  buckets: DistributionBucket[]
  className?: string
}) {
  const total = buckets.reduce((s, b) => s + b.count, 0)
  if (total === 0) return null

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label={buckets.map(b => `${b.label}: ${b.count}`).join(", ")}
      >
        {buckets.map((b, i) =>
          b.count === 0 ? null : (
            <div
              key={i}
              className={cn("h-full transition-[width] duration-500 ease-out", b.className ?? "bg-primary")}
              style={{ width: `${(b.count / total) * 100}%` }}
              title={`${b.label}: ${b.count} of ${total}`}
            />
          ),
        )}
      </div>

      <div className="flex flex-wrap gap-x-3.5 gap-y-1">
        {buckets.map((b, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
            <span className={cn("h-2 w-2 rounded-full", b.className ?? "bg-primary")} aria-hidden />
            {b.label}
            <span className="font-semibold tabular-nums text-foreground">{b.count}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

/* ── Ring ───────────────────────────────────────────────────────── */

/**
 * A single percentage as a ring. Used where one number is the headline
 * and deserves more presence than text can give it.
 */
export function StatRing({
  value,
  size = 72,
  stroke = 7,
  label,
  tone = "primary",
  className,
}: {
  /** 0–100. */
  value: number
  size?: number
  stroke?: number
  label?: string
  tone?: "primary" | "success" | "warning" | "destructive"
  className?: string
}) {
  const pct = Math.max(0, Math.min(100, value))
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r

  const strokeColor = {
    primary: "stroke-primary",
    success: "stroke-success",
    warning: "stroke-warning",
    destructive: "stroke-destructive",
  }[tone]

  return (
    <div className={cn("relative inline-flex shrink-0", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`${Math.round(pct)}%${label ? ` ${label}` : ""}`}>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          className="stroke-muted" strokeWidth={stroke} fill="none"
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          className={cn(strokeColor, "transition-[stroke-dashoffset] duration-700 ease-out")}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (pct / 100) * circumference}
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-[15px] font-extrabold tabular-nums leading-none text-foreground">
          {Math.round(pct)}%
        </span>
      </span>
    </div>
  )
}
