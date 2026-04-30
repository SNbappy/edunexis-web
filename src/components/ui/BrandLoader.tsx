import { motion } from "framer-motion"
import { cn } from "@/utils/cn"

type Variant = "screen" | "page" | "inline"

interface BrandLoaderProps {
  variant?: Variant
  label?:   string
  className?: string
}

function Mark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <path d="M8 12L16 8L24 12L16 16L8 12Z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
      <path d="M11 14V18C11 19.5 13.2 21 16 21C18.8 21 21 19.5 21 18V14" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <circle cx="24" cy="12" r="1.2" fill="white" />
    </svg>
  )
}

function OrbitRing({ size }: { size: number }) {
  const strokeW = Math.max(2, Math.round(size / 28))
  const r = size / 2 - strokeW
  const c = size / 2
  const circumference = 2 * Math.PI * r
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="absolute inset-0"
      aria-hidden
    >
      {/* Faint track */}
      <circle
        cx={c} cy={c} r={r}
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.12"
        strokeWidth={strokeW}
      />
      {/* Moving arc */}
      <motion.circle
        cx={c} cy={c} r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeW}
        strokeLinecap="round"
        strokeDasharray={`${circumference * 0.18} ${circumference}`}
        transform={`rotate(-90 ${c} ${c})`}
        animate={{ rotate: [-90, 270] }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ transformOrigin: `${c}px ${c}px` }}
      />
    </svg>
  )
}

function Dots() {
  return (
    <div className="flex items-center gap-1.5" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-primary"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.85, 1, 0.85] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.18,
          }}
        />
      ))}
    </div>
  )
}

export default function BrandLoader({
  variant = "page",
  label,
  className,
}: BrandLoaderProps) {
  // --- inline — compact, next to text ---
  if (variant === "inline") {
    const size = 18
    return (
      <span
        className={cn("inline-flex items-center gap-2 text-muted-foreground", className)}
        role="status"
        aria-label={label ?? "Loading"}
      >
        <span className="relative inline-flex text-primary" style={{ width: size, height: size }}>
          <OrbitRing size={size} />
        </span>
        {label && <span className="text-xs font-medium">{label}</span>}
      </span>
    )
  }

  // --- screen / page — branded moment ---
  const ringSize = 96
  const markSize = 48

  const container =
    variant === "screen"
      ? "fixed inset-0 z-[100] bg-background"
      : "min-h-[calc(100vh-4rem)]"

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-6",
        container,
        className,
      )}
      role="status"
      aria-label={label ?? "Loading"}
    >
      {/* Mark + orbit */}
      <div className="relative flex items-center justify-center text-primary" style={{ width: ringSize, height: ringSize }}>
        <OrbitRing size={ringSize} />
        <motion.div
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="relative flex items-center justify-center"
        >
          <Mark size={markSize} />
        </motion.div>
      </div>

      {/* Wordmark */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-3"
      >
        <span className="font-display font-bold text-lg tracking-tight text-foreground">
          EduNexis
        </span>
        <Dots />
        {label && (
          <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        )}
      </motion.div>
    </div>
  )
}
