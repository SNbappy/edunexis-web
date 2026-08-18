import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate, useParams } from "react-router-dom"
import { ClipboardList, Calendar, Paperclip, X as XIcon, File as FileIcon } from "lucide-react"
import { addDays } from "date-fns"

import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import FormPageLayout from "@/components/forms/FormPageLayout"
import FormSection from "@/components/forms/FormSection"
import FormField from "@/components/forms/FormField"
import FileDropzone from "@/components/ui/FileDropzone"
import { formatFileSize } from "@/utils/fileUtils"
import { useAssignments } from "../hooks/useAssignments"
import type { CreateAssignmentRequest } from "@/types/assignment.types"

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
function toLocal(d: Date) {
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) +
    "T" + pad(d.getHours()) + ":" + pad(d.getMinutes())
}

export default function CreateAssignmentPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { createAssignment, isCreating } = useAssignments(courseId!)
  const [files, setFiles] = useState<File[]>([])

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
      referenceFiles: files.length > 0 ? files : undefined,
    }
    createAssignment(payload, {
      onSuccess: () => navigate("/courses/" + courseId + "/assignments"),
    })
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
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
      subtitle="Set up a task for your students. You can attach reference files like problem statements, datasets, or rubrics."
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
              className="w-full resize-none rounded-xl border border-border bg-muted/40 px-4 py-3 text-[13px] text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:ring-2 focus:ring-teal-500/20"
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
              className="w-full resize-none rounded-xl border border-border bg-muted/40 px-4 py-3 text-[13px] text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:ring-2 focus:ring-teal-500/20"
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

          <label className="flex cursor-pointer select-none items-center gap-3 rounded-xl border border-primary/25 bg-primary-soft p-3">
            <input type="checkbox" {...register("allowLateSubmission")} className="sr-only" />
            <div className={
              "relative h-5 w-9 shrink-0 rounded-full transition-colors " +
              (allowLate ? "bg-primary" : "bg-stone-300 dark:bg-stone-700")
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
          subtitle="Optional files students can download — PDFs, problem sets, datasets, or starter code."
          tone="stone"
          complete={files.length > 0}
        >
          <div className="space-y-3">
            <FileDropzone
              onFilesSelected={setFiles}
              multiple={true}
              maxSizeMB={10}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.txt,.py,.java,.cpp,.c,.cs,.js,.ts,.png,.jpg,.jpeg"
            />
          </div>
        </FormSection>
      </form>
    </FormPageLayout>
  )
}