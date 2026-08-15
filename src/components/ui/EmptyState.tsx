import { motion } from "framer-motion"
import { MOTION } from "@/components/ui/appTokens"
import { cn } from "@/utils/cn"

interface EmptyStateProps {
  icon?: React.ReactNode
  /** @deprecated Pass `icon` instead — emoji render differently on every OS. */
  emoji?: string
  title: string
  description?: string
  action?: React.ReactNode
  /** `inset` sits inside an existing card and drops its own frame. */
  variant?: "panel" | "inset"
  className?: string
}

/**
 * Empty state.
 *
 * The icon sits in a dashed square rather than a filled tile: a dashed outline
 * is the visual language of "nothing here yet", where a solid tinted tile looks
 * like a feature badge and makes an empty list read as if it loaded fine.
 */
export default function EmptyState({
  icon, emoji, title, description, action, variant = "inset", className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: MOTION.base, ease: MOTION.ease }}
      className={cn(
        "flex flex-col items-center justify-center px-6 py-14 text-center",
        variant === "panel" && "rounded-2xl border border-dashed border-border bg-card/40",
        className,
      )}
    >
      {emoji ? (
        <div className="mb-4 text-4xl">{emoji}</div>
      ) : icon ? (
        <div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-dashed border-border-strong text-muted-foreground [&_svg]:h-5 [&_svg]:w-5"
          aria-hidden
        >
          {icon}
        </div>
      ) : null}

      <p className="font-display text-[15px] font-bold text-foreground">{title}</p>
      {description && (
        <p className="mt-1.5 max-w-[38ch] text-[13px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  )
}
