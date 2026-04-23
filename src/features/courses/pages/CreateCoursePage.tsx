import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"
import Select from "@/components/ui/Select"
import {
  DEPARTMENTS, CREDIT_HOURS, YEARS, SEMESTERS, ACADEMIC_SESSIONS,
} from "@/config/constants"
import { useAuthStore } from "@/store/authStore"
import { useCourses } from "../hooks/useCourses"
import { courseService } from "../services/courseService"
import toast from "react-hot-toast"
import { useState } from "react"

const schema = z.object({
  title:            z.string().min(3, "Title must be at least 3 characters"),
  courseCode:       z.string().min(2, "Course code is required"),
  creditHours:      z.coerce.number().min(0.5).max(6),
  department:       z.string().min(1, "Department is required"),
  academicSession:  z.string().min(1, "Academic session is required"),
  year:             z.string().min(1, "Year is required"),
  semesterInYear:   z.string().min(1, "Semester is required"),
  section:          z.string().optional(),
  courseType:       z.enum(["Theory", "Lab"]),
  description:      z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function CreateCoursePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { createCourse, isCreating } = useCourses()
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { courseType: "Theory", creditHours: 3 },
  })

  const submit = async (data: FormData) => {
    if (!user) return
    setSubmitting(true)

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
        coverImageUrl:   "",
        teacherId:       user.id,
      }

      const res = await courseService.create(payload)
      if (res.success && res.data) {
        toast.success("Course created.")
        navigate(`/courses/${res.data.id}/stream`, { replace: true })
      } else {
        toast.error(res.message ?? "Failed to create course.")
      }
    } catch {
      toast.error("Failed to create course.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      {/* Breadcrumb + header */}
      <button
        onClick={() => navigate("/courses")}
        className="mb-6 inline-flex items-center gap-2 text-[13px] font-semibold text-muted-foreground transition-colors hover:text-teal-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to courses
      </button>

      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          New course
        </h1>
        <p className="mt-1 text-[14px] text-muted-foreground">
          Set up a course that students can join with a code.
        </p>
      </header>

      <form onSubmit={handleSubmit(submit)} className="space-y-8">
        {/* Basics */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-5">
            <h2 className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground">
              Basics
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                {...register("title")}
                label="Course title"
                placeholder="e.g. Data Structures & Algorithms"
                error={errors.title?.message}
              />
            </div>

            <Input
              {...register("courseCode")}
              label="Course code"
              placeholder="e.g. CSE-301"
              error={errors.courseCode?.message}
            />

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
              error={errors.creditHours?.message}
              options={CREDIT_HOURS.map(c => ({
                value: c,
                label: `${c} Credit${c > 1 ? "s" : ""}`,
              }))}
            />

            <Input
              {...register("section")}
              label="Section (optional)"
              placeholder="e.g. A, B, C"
            />

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Description (optional)
              </label>
              <textarea
                {...register("description")}
                rows={4}
                placeholder="What is this course about?"
                className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/50"
              />
            </div>
          </div>
        </section>

        {/* Academic details */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-5">
            <h2 className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground">
              Academic details
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              {...register("department")}
              label="Department"
              placeholder="Select department"
              error={errors.department?.message}
              options={DEPARTMENTS.map(d => ({ value: d, label: d }))}
            />

            <Select
              {...register("academicSession")}
              label="Academic session"
              placeholder="Select session"
              error={errors.academicSession?.message}
              options={ACADEMIC_SESSIONS.map(s => ({ value: s, label: s }))}
            />

            <Select
              {...register("year")}
              label="Year"
              placeholder="Select year"
              error={errors.year?.message}
              options={YEARS.map(y => ({ value: y, label: y }))}
            />

            <Select
              {...register("semesterInYear")}
              label="Semester"
              placeholder="Select semester"
              error={errors.semesterInYear?.message}
              options={SEMESTERS.map(s => ({ value: s, label: s }))}
            />
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/courses")}
            disabled={submitting || isCreating}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={submitting || isCreating}
          >
            Create course
          </Button>
        </div>
      </form>
    </div>
  )
}
