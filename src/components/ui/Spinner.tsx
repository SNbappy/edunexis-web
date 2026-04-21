import { cn } from "@/utils/cn"

interface SpinnerProps {
  size?:      "sm" | "md" | "lg"
  className?: string
}

export default function Spinner({ size = "md", className }: SpinnerProps) {
  const s = { sm: 16, md: 22, lg: 32 }[size]
  return (
    <svg
      width={s} height={s} viewBox="0 0 24 24" fill="none"
      className={cn("animate-spin", className)}
      xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeOpacity="0.15" />
      <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round" />
    </svg>
  )
}
