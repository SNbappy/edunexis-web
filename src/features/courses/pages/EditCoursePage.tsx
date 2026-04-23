import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"
import Select from "@/components/ui/Select"
import Skeleton from "@/components/ui/Skeleton"
import {
  DEPARTMENTS, CREDIT_HOURS, YEARS, SEMESTERS, ACADEMIC_SESSIONS,
} from "@/config/constants"
import { courseService } from "../services/courseService"
import toast from "react-hot-toast"
import { useState } from "react"

const schema = z.object({
  title:            z.string().min(3),
  courseCode:       z.string().min(2),
  creditHours:      z.coerce.number().min(0.5).max(6),
  department:       z.string().min(1),
  academicSession:  z.string().min(1),
  year:             z.string().min(1),
  semesterInYear:   z.string().min(1),
  section:          z.string().optional(),
  courseType:       z.enum(["Theory", "Lab"]),
  description:      z.string().optional(),
})
type FormData = z.infer<typeof schema>

/**
 * Splits "1st Year - 2nd Semester" back into { year, semesterInYear }.
 * Returns best-effort defaults if format isn't recognized.
 */
function splitSemester(semester: string): { year: string; semesterInYear: string } {
  const parts = semester.split(" - ")
  if (parts.length === 2) return { year: parts[0], semesterInYear: parts[1] }
  return { year: "", semesterInYear: semester }
}

export default function EditCoursePage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  const { data: courseRes, isLoading } = useQuery({
    queryKey: ["courses", "detail", courseId],
    queryFn:  () => courseService.getById(courseId!),
    enabled:  !!courseId,
  })

  const course = courseRes?.data

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (course) {
      const { year, semesterInYear } = splitSemester(course.semester)
      reset({
        title:           course.title,
        courseCode:      course.courseCode,
        creditHours:     course.creditHours,
        department:      course.department,
        academicSession: course.academicSession,
        year,
        semesterInYear,
        section:         course.section ?? "",
        courseType:      course.courseType,
        description:     course.description ?? "",
      })
    }
  }, [course, reset])

  const submit = async (data: FormData) => {
    if (!courseId) return
    setSaving(true)
    try {
      const payload = {
        title:           data.title,
        courseCode:      data.courseCode,
        creditHours:     data.creditHours,
        department:      data.department,
        academicSession: data.academicSession,
        year:            data.year,
        semester:        data.year + " - " + data.semesterInYear,
        section:         data.section || undefined,
        courseType:      data.courseType,
        description:     data.description || undefined,
      }

      const res = await courseService.updateCourse(courseId, payload)
      if (res.success) {
        toast.success("Course updated.")
        navigate(`/courses/${courseId}/stream`)
      } else {
        toast.error(res.message ?? "Failed to update course.")
      }
    } catch {
      toast.error("Failed to update course.")
    } finally {
      setSaving(false)
    }
  }

  if (isLoading || !course) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-8">
        <Skeleton className="mb-6 h-8 w-32" />
        <Skeleton className="mb-8 h-10 w-64" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    )
  }

  if (course.viewerRole !== "Owner") {
    return (
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Not allowed
        </h1>
        <p className="mt-2 text-muted-foreground">
          Only the course owner can edit this course.
        </p>
        <Button className="mt-6" onClick={() => navigate(`/courses/${courseId}/stream`)}>
          Back to course
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <button
        onClick={() => navigate(`/courses/${courseId}/stream`)}
        className="mb-6 inline-flex items-center gap-2 text-[13px] font-semibold text-muted-foreground transition-colors hover:text-teal-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to course
      </button>

      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Edit course
        </h1>
        <p className="mt-1 text-[14px] text-muted-foreground">
          Changes take effect immediately for students.
        </p>
      </header>

      <form onSubmit={handleSubmit(submit)} className="space-y-8">
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-5 text-[13px] font-bold uppercase tracking-widest text-muted-foreground">
            Basics
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input {...register("title")} label="Course title" error={errors.title?.message} />
            </div>
            <Input {...register("courseCode")} label="Course code" error={errors.courseCode?.message} />
            <Select
              {...register("courseType")}
              label="Course type"
              options={[
                { value: "Theory", label: "Theory" },
                { value: "Lab",    label: "Lab" },
              ]}
            />
            <Select
              {...register("creditHours")}
              label="Credit hours"
              options={CREDIT_HOURS.map(c => ({ value: c, label: `${c} Credit${c > 1 ? "s" : ""}` }))}
            />
            <Input {...register("section")} label="Section (optional)" />

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Description
              </label>
              <textarea
                {...register("description")}
                rows={4}
                className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground transition-all focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/50"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-5 text-[13px] font-bold uppercase tracking-widest text-muted-foreground">
            Academic details
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              {...register("department")}
              label="Department"
              options={DEPARTMENTS.map(d => ({ value: d, label: d }))}
            />
            <Select
              {...register("academicSession")}
              label="Academic session"
              options={ACADEMIC_SESSIONS.map(s => ({ value: s, label: s }))}
            />
            <Select
              {...register("year")}
              label="Year"
              options={YEARS.map(y => ({ value: y, label: y }))}
            />
            <Select
              {...register("semesterInYear")}
              label="Semester"
              options={SEMESTERS.map(s => ({ value: s, label: s }))}
            />
          </div>
        </section>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`/courses/${courseId}/stream`)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            Save changes
          </Button>
        </div>
      </form>
    </div>
  )
}
