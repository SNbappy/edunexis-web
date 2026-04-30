import { useId } from "react"
import { cn } from "@/utils/cn"

interface Props {
    /** pixel size, default 14 (button-friendly) */
    size?: number
    className?: string
}

/**
 * Modern gradient-ring loader.
 * Inherits color via `currentColor` — set text-* on parent or className.
 * Replaces every `animate-spin` ring across the app.
 */
export default function InlineSpinner({ size = 14, className }: Props) {
    const gradId = useId()
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            className={cn("animate-spin shrink-0", className)}
            style={{ animationDuration: "1.1s", animationTimingFunction: "cubic-bezier(0.45, 0, 0.55, 1)" }}
            aria-hidden="true"
        >
            <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
                </linearGradient>
            </defs>
            <circle
                cx="12" cy="12" r="9"
                stroke={`url(#${gradId})`}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="40 60"
            />
        </svg>
    )
}