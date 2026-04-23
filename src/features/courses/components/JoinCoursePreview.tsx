import { motion } from "framer-motion"
import { Users, GraduationCap, BookOpen, Check, ArrowLeft } from "lucide-react"
import Button from "@/components/ui/Button"
import type { CourseByCodeDto } from "@/types/course.types"

interface JoinCoursePreviewProps {
  course:      CourseByCodeDto
  onConfirm:   () => void
  onBack:      () => void
  isJoining?:  boolean
}

export default function JoinCoursePreview({
  course, onConfirm, onBack, isJoining,
}: JoinCoursePreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full max-w-md"
    >
      <div className="rounded-3xl border border-border bg-card p-7 shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-teal-200 bg-teal-50">
          <Check className="h-7 w-7 text-teal-600" strokeWidth={2.5} />
        </div>

        <h2 className="text-center font-display text-[20px] font-bold text-foreground">
          Course found
        </h2>
        <p className="mt-1 text-center text-[13px] text-muted-foreground">
          Review and confirm your join request.
        </p>

        {/* Course card */}
        <div className="mt-6 rounded-2xl border border-border bg-stone-50 p-5">
          <p className="mb-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-teal-700">
            {course.courseCode}
          </p>
          <h3 className="font-display text-[17px] font-bold leading-snug text-foreground">
            {course.title}
          </h3>

          <div className="mt-4 flex items-center gap-2">
            {course.teacherProfilePhotoUrl ? (
              <img
                src={course.teacherProfilePhotoUrl}
                alt=""
                className="h-7 w-7 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-200 text-[12px] font-bold text-stone-700">
                {course.teacherName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="truncate text-[13px] font-medium text-foreground">
              {course.teacherName}
            </span>
          </div>

          <div className="my-4 h-px bg-border" />

          <div className="grid grid-cols-3 gap-3 text-[11px]">
            <div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <GraduationCap className="h-3 w-3" />
                <span className="font-bold uppercase tracking-wider">Semester</span>
              </div>
              <p className="mt-0.5 truncate text-[12px] font-semibold text-foreground">
                {course.semester}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <BookOpen className="h-3 w-3" />
                <span className="font-bold uppercase tracking-wider">Type</span>
              </div>
              <p className="mt-0.5 text-[12px] font-semibold text-foreground">
                {course.courseType}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-3 w-3" />
                <span className="font-bold uppercase tracking-wider">Members</span>
              </div>
              <p className="mt-0.5 text-[12px] font-semibold tabular-nums text-foreground">
                {course.memberCount}
              </p>
            </div>
          </div>

          <p className="mt-4 truncate text-[11px] text-muted-foreground">
            {course.department}
          </p>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex gap-3">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={onBack}
            disabled={isJoining}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            type="button"
            className="flex-[2]"
            onClick={onConfirm}
            loading={isJoining}
          >
            Send join request
          </Button>
        </div>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Your request will be reviewed by the teacher before you're added.
        </p>
      </div>
    </motion.div>
  )
}
