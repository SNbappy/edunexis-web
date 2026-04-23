import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate, useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { BookOpen, CalendarDays, Sparkles } from "lucide-react"
import toast from "react-hot-toast"

import Button from "@/components/ui/Button"
import Select from "@/components/ui/Select"
import Skeleton from "@/components/ui/Skeleton"
import FormPageLayout from "@/components/forms/FormPageLayout"
import FormSection from "@/components/forms/FormSection"
import FormField from "@/components/forms/FormField"
import ShowAdvancedToggle from "@/components/forms/ShowAdvancedToggle"
import LivePreviewPanel from "@/components/forms/LivePreviewPanel"
import { ActiveCourseCard } from "../components/CourseCard"

import {
  DEPARTMENTS, YEARS, SEMESTERS, ACADEMIC_SESSIONS,
} from "@/config/constants"
import { useAuthStore } from "@/store/authStore"
import { courseService } from "../services/courseService"
import type { CourseSummaryDto } from "@/types/course.types"

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  courseCode: z.string().min(2, "Course code is required"),
  creditHours: z.coerce.number().min(0.5).max(6),
  department: z.string().min(1, "Department is required"),
  academicSession: z.string().min(1, "Academic session is required"),
  year: z.string().min(1, "Year is required"),
  semesterInYear: z.string().min(1, "Semester is required"),
  section: z.string().optional(),
  courseType: z.enum(["Theory", "Lab"]),
  description: z.string().optional(),
})
type FormData = z.infer<typeof schema>

function splitSemester(semester: string): { year: string; semesterInYear: string } {
  const parts = semester.split(" - ")
  if (parts.length === 2) return { year: parts[0], semesterInYear: parts[1] }
  return { year: "", semesterInYear: semester }
}

export default function EditCoursePage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [saving, setSaving] = useState(false)

  const { data: courseRes, isLoading } = useQuery({
    queryKey: ["courses", "detail", courseId],
    queryFn: () => courseService.getById(courseId!),
    enabled: !!courseId,
  })
  const course = courseRes?.data

  const {
    register, handleSubmit, reset, watch,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur",
  })

  useEffect(() => {
    if (course) {
      const { year, semesterInYear } = splitSemester(course.semester)
      reset({
        title: course.title,
        courseCode: course.courseCode,
        creditHours: course.creditHours,
        department: course.department,
        academicSession: course.academicSession,
        year,
        semesterInYear,
        section: course.section ?? "",
        courseType: course.courseType,
        description: course.description ?? "",
      })
    }
  }, [course, reset])

  const values = watch()

  const submit = async (data: FormData) => {
    if (!courseId) return
    setSaving(true)
    try {
      const payload = {
        title: data.title,
        courseCode: data.courseCode,
        creditHours: data.creditHours,
        department: data.department,
        academicSession: data.academicSession,
        year: data.year,
        semester: data.year + " - " + data.semesterInYear,
        section: data.section || undefined,
        courseType: data.courseType,
        description: data.description || undefined,
      }

      const res = await courseService.updateCourse(courseId, payload)
      if (res.success) {
        toast.success("Course updated.")
        navigate("/courses/" + courseId + "/stream")
      } else {
        toast.error(res.message ?? "Failed to update course.")
      }
    } catch {
      toast.error("Failed to update course.")
    } finally {
      setSaving(false)
    }
  }

  /* ─── Loading & permission gates ─── */

  if (isLoading || !course) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-8 lg:px-8">
        <Skeleton className="mb-6 h-5 w-32" />
        <Skeleton className="mb-4 h-10 w-80" />
        <Skeleton className="mb-8 h-5 w-96" />
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
          <Skeleton className="hidden h-72 rounded-2xl xl:block" />
        </div>
      </div>
    )
  }

  if (course.viewerRole !== "Owner") {
    return (
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Not allowed
        </h1>
        <p className="mt-2 text-muted-foreground">
          Only the course owner can edit this course.
        </p>
        <Button className="mt-6" onClick={() => navigate("/courses/" + courseId + "/stream")}>
          Back to course
        </Button>
      </div>
    )
  }

  /* ─── Preview ─── */

  const previewCourse: CourseSummaryDto = {
    id: course.id,
    title: values.title?.trim() || course.title,
    courseCode: (values.courseCode?.trim() || course.courseCode).toUpperCase(),
    department: values.department || course.department,
    academicSession: values.academicSession || course.academicSession,
    semester: values.year && values.semesterInYear
      ? values.year + " - " + values.semesterInYear
      : course.semester,
    courseType: values.courseType ?? course.courseType,
    coverImageUrl: course.coverImageUrl,
    teacherName: course.teacherName,
    teacherProfilePhotoUrl: course.teacherProfilePhotoUrl,
    isArchived: course.isArchived,
    memberCount: course.memberCount,
    createdAt: course.createdAt,
  }

  const preview = (
    <LivePreviewPanel caption="Students see changes as soon as you save.">
      <ActiveCourseCard course={previewCourse} />
    </LivePreviewPanel>
  )

  /* ─── Footer ─── */

  const footer = (
    <>
      <Button
        type="button"
        variant="secondary"
        onClick={() => navigate("/courses/" + courseId + "/stream")}
        disabled={saving}
      >
        Cancel
      </Button>
      <Button
        type="button"
        onClick={handleSubmit(submit)}
        loading={saving}
        disabled={!isValid}
      >
        Save changes
      </Button>
    </>
  )

  /* ─── Render ─── */

  return (
    <FormPageLayout
      backLabel="Back to course"
      backTo={"/courses/" + courseId + "/stream"}
      title="Edit course"
      subtitle="Changes take effect immediately for everyone enrolled."
      preview={preview}
      footer={footer}
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-6">
        <FormSection
          icon={BookOpen}
          title="Identity"
          subtitle="The name, code, and shape of this course."
          tone="teal"
        >
          <FormField
            {...register("title")}
            label="Course title"
            error={errors.title?.message}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              {...register("courseCode")}
              label="Course code"
              error={errors.courseCode?.message}
            />
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-foreground">
                Course type
              </label>
              <Select
                {...register("courseType")}
                options={[
                  { value: "Theory", label: "Theory" },
                  { value: "Lab", label: "Lab" },
                ]}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-foreground">
              Credit hours
            </label>
            <Select
              {...register("creditHours")}
              options={[
                { value: "0.75", label: "0.75 Credits" },
                { value: "1", label: "1 Credit" },
                { value: "1.5", label: "1.5 Credits" },
                { value: "2", label: "2 Credits" },
                { value: "3", label: "3 Credits" },
                { value: "4", label: "4 Credits" },
                { value: "6", label: "6 Credits" },
              ]}
            />
          </div>
        </FormSection>

        <FormSection
          icon={CalendarDays}
          title="When & where"
          subtitle="The department and semester this course belongs to."
          tone="amber"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-foreground">
                Department
              </label>
              <Select
                {...register("department")}
                options={DEPARTMENTS.map(d => ({ value: d, label: d }))}
              />
              {errors.department?.message && (
                <p className="mt-1.5 text-[11.5px] font-semibold text-red-600">
                  {errors.department.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-foreground">
                Academic session
              </label>
              <Select
                {...register("academicSession")}
                options={ACADEMIC_SESSIONS.map(s => ({ value: s, label: s }))}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-foreground">
                Year
              </label>
              <Select
                {...register("year")}
                options={YEARS.map(y => ({ value: y, label: y }))}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-foreground">
                Semester
              </label>
              <Select
                {...register("semesterInYear")}
                options={SEMESTERS.map(s => ({ value: s, label: s }))}
              />
            </div>
          </div>

          <ShowAdvancedToggle storageKey="edit-course:advanced">
            <FormField
              {...register("section")}
              label="Section"
              optional
              placeholder="e.g. A, B, or C"
              help="Useful when the same course runs for multiple student groups."
            />
          </ShowAdvancedToggle>
        </FormSection>

        <FormSection
          icon={Sparkles}
          title="Description"
          subtitle="Tell students what this course covers."
          tone="stone"
        >
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-foreground">
              Description
              <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
            </label>
            <textarea
              {...register("description")}
              rows={6}
              placeholder="What the course covers, main topics, and what students should learn by the end."
              className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground transition-all focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/30"
            />
          </div>
        </FormSection>
      </form>
    </FormPageLayout>
  )
}