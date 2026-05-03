import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate, useParams } from "react-router-dom"
import { Calendar, Pencil } from "lucide-react"

import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import FormPageLayout from "@/components/forms/FormPageLayout"
import FormSection from "@/components/forms/FormSection"
import FormField from "@/components/forms/FormField"
import BrandLoader from "@/components/ui/BrandLoader"
import { useAssignment, useAssignments } from "../hooks/useAssignments"
import type { UpdateAssignmentRequest } from "@/types/assignment.types"

const schema = z.object({
  title: z.string().min(3, "At least 3 characters"),
  instructions: z.string().optional(),
  deadline: z.string().min(1, "Due date is required"),
  maxMarks: z.coerce.number().min(1).max(1000),
  allowLateSubmission: z.boolean(),
  rubricNotes: z.string().optional(),
})
type FormData = z.infer<typeof schema>

function pad(n: number) { return String(n).padStart(2, "0") }
function toLocal(iso: string) {
  const d = new Date(iso)
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) +
    "T" + pad(d.getHours()) + ":" + pad(d.getMinutes())
}

export default function EditAssignmentPage() {
  const { courseId, assignmentId } = useParams<{ courseId: string; assignmentId: string }>()
  const navigate = useNavigate()

  const { assignment, isLoading, isFetched } = useAssignment(courseId!, assignmentId!)
  const { updateAssignment, isUpdating } = useAssignments(courseId!)

  const { register, handleSubmit, reset, watch, formState: { errors, isValid } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  })

  // Prefill once data loads
  useEffect(() => {
    if (!assignment) return
    reset({
      title: assignment.title,
      instructions: assignment.instructions ?? "",
      deadline: toLocal(assignment.deadline),
      maxMarks: assignment.maxMarks,
      allowLateSubmission: assignment.allowLateSubmission,
      rubricNotes: assignment.rubricNotes ?? "",
    })
  }, [assignment, reset])

  if (isLoading) {
    return <BrandLoader variant="page" label="Loading assignment\u2026" />
  }

  if (isFetched && !assignment) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <h2 className="font-display text-lg font-semibold text-foreground">Assignment not found</h2>
        <Button variant="secondary" className="mt-5" onClick={() => navigate(-1)}>
          Go back
        </Button>
      </div>
    )
  }

  if (!assignment) return null

  const allowLate = watch("allowLateSubmission")

  const submit = (d: FormData) => {
    const payload: UpdateAssignmentRequest = {
      ...d,
      deadline: new Date(d.deadline).toISOString(),
    }
    updateAssignment(
      { assignmentId: assignment.id, data: payload },
      {
        onSuccess: () => navigate("/courses/" + courseId + "/assignments/" + assignment.id),
      }
    )
  }

  const footer = (
    <>
      <Button type="button" variant="secondary" onClick={() => navigate(-1)} disabled={isUpdating}>
        Cancel
      </Button>
      <Button type="button" onClick={handleSubmit(submit)} loading={isUpdating} disabled={!isValid}>
        Save changes
      </Button>
    </>
  )

  return (
    <FormPageLayout
      backLabel="Back to assignment"
      backTo={"/courses/" + courseId + "/assignments/" + assignment.id}
      title="Edit assignment"
      subtitle="Update the title, deadline, marks, or instructions. Reference materials can\u2019t be changed here yet."
      footer={footer}
    >
      <form
        onSubmit={handleSubmit(submit)}
        onKeyDown={e => { if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") e.preventDefault() }}
        className="space-y-6"
      >
        <FormSection
          icon={Pencil}
          title="Editing"
          subtitle={assignment.title}
          tone="amber"
          complete
        >
          <FormField
            {...register("title")}
            label="Title"
            placeholder="Assignment title"
            error={errors.title?.message}
            required
          />

          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-foreground">
              Instructions <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <textarea
              {...register("instructions")}
              rows={5}
              placeholder={"Detailed instructions\u2026"}
              className="w-full resize-none rounded-xl border border-border bg-muted/40 px-4 py-3 text-[13px] text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-teal-500 focus:bg-card focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-foreground">
              Rubric / grading criteria <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <textarea
              {...register("rubricNotes")}
              rows={3}
              placeholder="Grading criteria\u2026"
              className="w-full resize-none rounded-xl border border-border bg-muted/40 px-4 py-3 text-[13px] text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-teal-500 focus:bg-card focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
        </FormSection>

        <FormSection
          icon={Calendar}
          title="Schedule & marks"
          tone="teal"
          complete={!!watch("deadline") && !!watch("maxMarks")}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              {...register("deadline")}
              type="datetime-local"
              label="Deadline"
              error={errors.deadline?.message}
              required
            />
            <Input
              {...register("maxMarks")}
              type="number"
              label="Max marks"
              error={errors.maxMarks?.message}
              required
            />
          </div>

          <label className="flex cursor-pointer select-none items-center gap-3 rounded-xl border border-teal-200 bg-teal-50 p-3 dark:border-teal-800 dark:bg-teal-950/40">
            <input type="checkbox" {...register("allowLateSubmission")} className="sr-only" />
            <div className={
              "relative h-5 w-9 shrink-0 rounded-full transition-colors " +
              (allowLate ? "bg-teal-600" : "bg-stone-300 dark:bg-stone-700")
            }>
              <div className={
                "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all " +
                (allowLate ? "left-[18px]" : "left-0.5")
              } />
            </div>
            <span className="text-[13px] font-semibold text-foreground">
              Allow late submission
            </span>
          </label>

          <p className="text-[11px] text-muted-foreground">
            Switching this off does not invalidate any late submissions already received.
          </p>
        </FormSection>

      </form>
    </FormPageLayout>
  )
}