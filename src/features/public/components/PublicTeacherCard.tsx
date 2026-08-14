import { useRef, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { BookOpen, ArrowUpRight } from "lucide-react"
import type { PublicFacultyCardDto } from "@/types/auth.types"

interface Props {
  teacher: PublicFacultyCardDto
}

/**
 * Faculty card.
 *
 * Previously a photo box stacked above a white text block — functional, but it
 * read as a database row with a picture on it. This is a single framed image
 * with the identity set into a scrim across the bottom, which is how a person
 * is usually presented rather than how a record is.
 *
 * Hover tilts the card toward the pointer. The tilt is small on purpose: it
 * should register as the card being a physical object, not as a novelty.
 */
export default function PublicTeacherCard({ teacher }: Props) {
  const ref = useRef<HTMLAnchorElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  const initials = teacher.fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase())
    .join("")

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    setTilt({ x: -py * 7, y: px * 7 })
  }


  return (
    <Link
      ref={ref}
      to={`/faculty/${teacher.slug}`}
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      className="group block [perspective:1100px]"
    >
      <motion.div
        animate={{ rotateX: tilt.x, rotateY: tilt.y }}
        transition={{ type: "spring", stiffness: 180, damping: 18 }}
        className={
          "relative overflow-hidden rounded-2xl border border-stone-200 bg-stone-900 shadow-[0_10px_30px_-14px_rgba(15,23,42,0.35)] transition-shadow duration-300 group-hover:border-teal-300 group-hover:shadow-[0_26px_60px_-22px_rgba(13,148,136,0.55)] " +
          "aspect-[4/5]"
        }
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* photo */}
        {teacher.profilePhotoUrl ? (
          <img
            src={teacher.profilePhotoUrl}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-teal-800 to-teal-950">
            <span className="font-display text-5xl font-extrabold text-teal-200/70">
              {initials || "T"}
            </span>
          </div>
        )}

        {/* scrim: keeps the name legible over any photo */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-stone-950 via-stone-950/80 to-transparent"
        />

        {/* course count */}
        {teacher.coursesTaught > 0 && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-2.5 py-1 text-[10.5px] font-bold text-white backdrop-blur-md">
            <BookOpen className="h-2.5 w-2.5" />
            {teacher.coursesTaught} {teacher.coursesTaught === 1 ? "course" : "courses"}
          </span>
        )}

        {/* identity */}
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          {teacher.designation && (
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-teal-300">
              {teacher.designation}
            </p>
          )}
          <h3
            className={
              "mt-1 font-display font-extrabold leading-tight text-white " +
              "text-[16px]"
            }
          >
            {teacher.fullName}
          </h3>
          <p className="mt-1 text-[11.5px] text-white/60">{teacher.department}</p>

          {/* slides up on hover */}
          <div className="mt-3 flex items-center gap-1.5 text-[12px] font-bold text-teal-300 opacity-0 transition-all duration-300 group-hover:opacity-100 sm:translate-y-1 sm:group-hover:translate-y-0">
            View profile
            <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
