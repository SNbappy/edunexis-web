import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  BookOpen, CalendarDays, Sparkles, ChevronRight, ChevronLeft,
} from "lucide-react"
import toast from "react-hot-toast"

import Button from "@/components/ui/Button"
import Select from "@/components/ui/Select"
import FormPageLayout from "@/components/forms/FormPageLayout"
import FormSection from "@/components/forms/FormSection"
import FormField from "@/components/forms/FormField"
import FormStepper from "@/components/forms/FormStepper"
import ShowAdvancedToggle from "@/components/forms/ShowAdvancedToggle"
import LivePreviewPanel from "@/components/forms/LivePreviewPanel"
import { ActiveCourseCard } from "../components/CourseCard"

import {
  DEPARTMENTS, YEARS, SEMESTERS, ACADEMIC_SESSIONS,
} from "@/config/constants"
import { useAuthStore } from "@/store/authStore"
import { useCourses } from "../hooks/useCourses"
import { courseService } from "../services/courseService"
import type { CourseSummaryDto } from "@/types/course.types"

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  courseCode: z.string().min(2, "Course code is required"),
  courseType: z.enum(["Theory", "Lab"]),
  creditHours: z.coerce.number().min(0.5).max(6),
  department: z.string().min(1, "Department is required"),
  academicSession: z.string().min(1, "Academic session is required"),
  year: z.string().min(1, "Year is required"),
  semesterInYear: z.string().min(1, "Semester is required"),
  section: z.string().optional(),
  description: z.string().optional(),
})
type FormData = z.infer<typeof schema>

const STEPS = [
  { label: "Identity" },
  { label: "When" },
  { label: "Describe" },
]

const STEP_FIELDS: ReadonlyArray<ReadonlyArray<keyof FormData>> = [
  ["title", "courseCode", "courseType", "creditHours"],
  ["department", "academicSession", "year", "semesterInYear"],
  [],
]

const PREVIEW_COURSE_ID = "create-course-preview"

export default function CreateCoursePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { isCreating } = useCourses()
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState(0)

  const {
    register, handleSubmit, watch, trigger,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      courseType: "Theory",
      creditHours: 3,
      title: "",
      courseCode: "",
      department: "",
      academicSession: "",
      year: "",
      semesterInYear: "",
      section: "",
      description: "",
    },
  })

  const values = watch()

  const nextStep = async () => {
    const fields = STEP_FIELDS[step]
    if (fields.length > 0) {
      const ok = await trigger(fields)
      if (!ok) return
    }
    setStep(s => Math.min(s + 1, STEPS.length - 1))
  }

  const prevStep = () => setStep(s => Math.max(s - 1, 0))

  const goToStep = async (target: number) => {
    if (target <= step) {
      setStep(target)
      return
    }
    if (target === step + 1) {
      await nextStep()
    }
  }

  const submit = async (data: FormData) => {
    if (!user) return
    setSubmitting(true)

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
        coverImageUrl: "",
        teacherId: user.id,
      }

      const res = await courseService.create(payload)
      if (res.success && res.data) {
        toast.success("Course created.")
        navigate("/courses/" + res.data.id + "/stream", { replace: true })
      } else {
        toast.error(res.message ?? "Failed to create course.")
      }
    } catch {
      toast.error("Failed to create course.")
    } finally {
      setSubmitting(false)
    }
  }

  const step1Complete = !!values.title && values.title.length >= 3
    && !!values.courseCode && values.courseCode.length >= 2
    && !!values.courseType && !!values.creditHours
  const step2Complete = !!values.department && !!values.academicSession
    && !!values.year && !!values.semesterInYear

  const previewCourse: CourseSummaryDto = {
    id: PREVIEW_COURSE_ID,
    title: values.title?.trim() || "Your course title",
    courseCode: values.courseCode?.trim().toUpperCase() || "COURSE-000",
    department: values.department || "Department",
    academicSession: values.academicSession || "",
    semester: values.year && values.semesterInYear
      ? values.year + " - " + values.semesterInYear
      : "Semester",
    courseType: values.courseType ?? "Theory",
    coverImageUrl: "",
    teacherName: user?.profile?.fullName ?? "You",
    teacherProfilePhotoUrl: user?.profile?.profilePhotoUrl ?? null,
    isArchived: false,
    memberCount: 0,
    createdAt: new Date().toISOString(),
  }

  const preview = (
    <LivePreviewPanel caption="Students will see your course exactly like this.">
      <ActiveCourseCard course={previewCourse} />
    </LivePreviewPanel>
  )

  const isLastStep = step === STEPS.length - 1

  const footer = (
    <>
      <Button
        type="button"
        variant="secondary"
        onClick={() => navigate("/courses")}
        disabled={submitting || isCreating}
      >
        Cancel
      </Button>

      {step > 0 && (
        <Button
          type="button"
          variant="secondary"
          onClick={prevStep}
          disabled={submitting || isCreating}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back
        </Button>
      )}

      {!isLastStep ? (
        <Button type="button" onClick={nextStep} disabled={submitting || isCreating}>
          Next step
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      ) : (
        <Button
          type="button"
          onClick={handleSubmit(submit)}
          loading={submitting || isCreating}
          disabled={!isValid}
        >
          Create course
        </Button>
      )}
    </>
  )

  return (
    <FormPageLayout
      backLabel="Back to courses"
      backTo="/courses"
      title="Launch a new course"
      subtitle="Set this up once. Students join with a code, and you get tools for attendance, assignments, and announcements."
      topSlot={
        <FormStepper
          steps={STEPS}
          currentStep={step}
          onStepClick={goToStep}
        />
      }
      preview={preview}
      footer={footer}
    >
      <form
        onSubmit={handleSubmit(submit)}
        onKeyDown={e => {
          if (e.key === "Enter" && !isLastStep) e.preventDefault()
        }}
        className="space-y-6"
      >
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              <FormSection
                icon={BookOpen}
                title="Identity"
                subtitle="The name, code, and shape of your course."
                tone="teal"
                complete={step1Complete}
              >
                <FormField
                  {...register("title")}
                  label="Course title"
                  placeholder="e.g. Data Structures & Algorithms"
                  hint="This is what students see first. Be descriptive."
                  error={errors.title?.message}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    {...register("courseCode")}
                    label="Course code"
                    placeholder="e.g. CSE-301"
                    hint="Short code like CSE-301 or MATH-101."
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
                      { value: "3", label: "3 Credits (most common)" },
                      { value: "4", label: "4 Credits" },
                      { value: "6", label: "6 Credits" },
                    ]}
                  />
                  {errors.creditHours?.message && (
                    <p className="mt-1.5 text-[11.5px] font-semibold text-red-600">
                      {errors.creditHours.message}
                    </p>
                  )}
                </div>
              </FormSection>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              <FormSection
                icon={CalendarDays}
                title="When & where"
                subtitle="Tell us the department and semester this course belongs to."
                tone="amber"
                complete={step2Complete}
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-foreground">
                      Department
                    </label>
                    <Select
                      {...register("department")}
                      placeholder="Select department"
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
                      placeholder="Select session"
                      options={ACADEMIC_SESSIONS.map(s => ({ value: s, label: s }))}
                    />
                    {errors.academicSession?.message && (
                      <p className="mt-1.5 text-[11.5px] font-semibold text-red-600">
                        {errors.academicSession.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-foreground">
                      Year
                    </label>
                    <Select
                      {...register("year")}
                      placeholder="Select year"
                      options={YEARS.map(y => ({ value: y, label: y }))}
                    />
                    {errors.year?.message && (
                      <p className="mt-1.5 text-[11.5px] font-semibold text-red-600">
                        {errors.year.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-foreground">
                      Semester
                    </label>
                    <Select
                      {...register("semesterInYear")}
                      placeholder="Select semester"
                      options={SEMESTERS.map(s => ({ value: s, label: s }))}
                    />
                    {errors.semesterInYear?.message && (
                      <p className="mt-1.5 text-[11.5px] font-semibold text-red-600">
                        {errors.semesterInYear.message}
                      </p>
                    )}
                  </div>
                </div>

                <ShowAdvancedToggle storageKey="create-course:advanced">
                  <FormField
                    {...register("section")}
                    label="Section"
                    optional
                    placeholder="e.g. A, B, or C"
                    help="Useful when the same course runs for multiple student groups."
                  />
                </ShowAdvancedToggle>
              </FormSection>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              <FormSection
                icon={Sparkles}
                title="Describe this course"
                subtitle="What will students learn? A good description helps students decide to join."
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
                    placeholder="A short paragraph about what the course covers, the main topics, and what students should be able to do by the end."
                    className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground transition-all focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/30"
                  />
                  <p className="mt-1.5 text-[11.5px] text-muted-foreground">
                    You can edit this later from the course settings.
                  </p>
                </div>
              </FormSection>

              <div className="mt-6 rounded-2xl border border-teal-200 bg-teal-50/60 p-5">
                <p className="text-[12px] font-bold uppercase tracking-widest text-teal-700">
                  Ready to launch
                </p>
                <p className="mt-1.5 text-[13px] text-teal-900/80">
                  Double-check the preview. Once created, your course will appear on your Courses list and students can join with the code you share.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </FormPageLayout>
  )
}