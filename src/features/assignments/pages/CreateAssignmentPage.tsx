import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate, useParams } from "react-router-dom"
import { ClipboardList, Calendar, Paperclip, X as XIcon, Upload } from "lucide-react"
import { addDays } from "date-fns"

import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import FormPageLayout from "@/components/forms/FormPageLayout"
import FormSection from "@/components/forms/FormSection"
import FormField from "@/components/forms/FormField"
import { useAssignments } from "../hooks/useAssignments"
import type { CreateAssignmentRequest } from "@/types/assignment.types"

const schema = z.object({
  title: z.string().min(3, "At least 3 characters"),
  instructions: z.string().optional(),
  deadline: z.string().min(1, "Due date is required"),
  maxMarks: z.coerce.number().min(1).max(1000),
  allowLateSubmission: z.boolean(),
  rubricNotes: z.string().optional(),
  referenceFile: z
    .instanceof(File)
    .optional()
    .refine(f => !f || f.size <= 10 * 1024 * 1024, "File must be 10 MB or less"),
})
type FormData = z.infer<typeof schema>

function pad(n: number) { return String(n).padStart(2, "0") }
function toLocal(d: Date) {
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) +
    "T" + pad(d.getHours()) + ":" + pad(d.getMinutes())
}

export default function CreateAssignmentPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { createAssignment, isCreating } = useAssignments(courseId!)
  const [file, setFile] = useState<File | null>(null)

  const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      maxMarks: 20,
      allowLateSubmission: false,
      deadline: toLocal(addDays(new Date(), 7)),
    },
  })

  const allowLate = watch("allowLateSubmission")

  const submit = (d: FormData) => {
    const payload: CreateAssignmentRequest = {
      ...d,
      deadline: new Date(d.deadline).toISOString(),
      referenceFile: file ?? undefined,
    }
    createAssignment(payload, {
      onSuccess: () => navigate("/courses/" + courseId + "/assignments"),
    })
  }

  const footer = (
    <>
      <Button type="button" variant="secondary" onClick={() => navigate(-1)} disabled={isCreating}>
        Cancel
      </Button>
      <Button type="button" onClick={handleSubmit(submit)} loading={isCreating} disabled={!isValid}>
        Create assignment
      </Button>
    </>
  )

  return (
    <FormPageLayout
      backLabel="Back to assignments"
      backTo={"/courses/" + courseId + "/assignments"}
      title="New assignment"
      subtitle="Set up a task for your students. You can attach a reference file like a problem statement or rubric."
      footer={footer}
    >
      <form
        onSubmit={handleSubmit(submit)}
        onKeyDown={e => { if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") e.preventDefault() }}
        className="space-y-6"
      >
        <FormSection
          icon={ClipboardList}
          title="Basics"
          subtitle="What students will see at the top of the assignment."
          tone="teal"
          complete={!!watch("title") && watch("title").length >= 3}
        >
          <FormField
            {...register("title")}
            label="Title"
            placeholder={`e.g. "Assignment 1 \u2014 Linked lists"`}
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
              placeholder={"Detailed instructions for students\u2026"}
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
              placeholder="e.g. 30% code quality, 40% output, 30% report"
              className="w-full resize-none rounded-xl border border-border bg-muted/40 px-4 py-3 text-[13px] text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-teal-500 focus:bg-card focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
        </FormSection>

        <FormSection
          icon={Calendar}
          title="Schedule & marks"
          subtitle="When the work is due and how it counts."
          tone="amber"
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
              placeholder="100"
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
        </FormSection>

        <FormSection
          icon={Paperclip}
          title="Reference materials"
          subtitle="Optional file students can download \u2014 a PDF, problem set, dataset, or starter code."
          tone="stone"
          complete={Boolean(file)}
        >
          {file ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 px-3 py-2.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <Paperclip className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-foreground">{file.name}</p>
                  <p className="text-[11px] text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                aria-label="Remove file"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="create-assignment-file"
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-3 transition-colors hover:border-teal-300 hover:bg-teal-50/50 dark:hover:border-teal-700 dark:hover:bg-teal-950/20"
            >
              <Upload className="h-4 w-4 text-muted-foreground" />
              <span className="text-[13px] font-semibold text-foreground">Choose file</span>
              <span className="text-[12px] text-muted-foreground">PDF, DOCX, ZIP, or images. Max 10 MB.</span>
            </label>
          )}
          <input
            id="create-assignment-file"
            type="file"
            accept=".pdf,.doc,.docx,.zip,image/*"
            className="hidden"
            onChange={e => {
              const f = e.target.files?.[0]
              if (f && f.size > 10 * 1024 * 1024) { e.target.value = ""; return }
              setFile(f ?? null)
              e.target.value = ""
            }}
          />
          {errors.referenceFile?.message ? (
            <p className="mt-1.5 text-[11.5px] font-semibold text-red-600 dark:text-red-400">
              {errors.referenceFile.message}
            </p>
          ) : null}
        </FormSection>
      </form>
    </FormPageLayout>
  )
}