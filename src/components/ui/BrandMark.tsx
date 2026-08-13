interface BrandMarkProps {
  className?: string
}

/**
 * Shared brand mark - EduNexis logo (raster PNG, transparent background).
 * Renders as a square with rounded corners; the source artwork has
 * diagonal composition (arrow + star) that would get clipped by a
 * circular crop, so square is the correct container shape here.
 */
export default function BrandMark({ className = "h-8 w-8" }: BrandMarkProps) {
  return (
    <img
      src="/logo/edunexis-logo-transparent.png"
      alt="EduNexis"
      className={className + " rounded-xl object-contain"}
    />
  )
}