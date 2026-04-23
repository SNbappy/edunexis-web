import { useState, useEffect } from "react"
import Modal from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import type { UserEducationDto } from "@/types/auth.types"
import type { EducationRequest } from "../services/profileService"

interface EducationModalProps {
  isOpen:     boolean
  onClose:    () => void
  initial?:   UserEducationDto | null
  onSubmit:   (data: EducationRequest) => void
  isLoading:  boolean
}

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 60 }, (_, i) => CURRENT_YEAR - i)

export default function EducationModal({
  isOpen, onClose, initial, onSubmit, isLoading,
}: EducationModalProps) {
  const [form, setForm] = useState<EducationRequest>({
    institution:  "",
    degree:       "",
    fieldOfStudy: "",
    startYear:    CURRENT_YEAR,
    endYear:      null,
    description:  "",
  })

  // Reset form whenever the modal reopens with new data
  useEffect(() => {
    if (isOpen) {
      setForm({
        institution:  initial?.institution ?? "",
        degree:       initial?.degree ?? "",
        fieldOfStudy: initial?.fieldOfStudy ?? "",
        startYear:    initial?.startYear ?? CURRENT_YEAR,
        endYear:      initial?.endYear ?? null,
        description:  initial?.description ?? "",
      })
    }
  }, [isOpen, initial])

  const set = <K extends keyof EducationRequest>(k: K, v: EducationRequest[K]) =>
    setForm(p => ({ ...p, [k]: v }))

  const canSubmit =
    form.institution.trim().length > 0 &&
    form.degree.trim().length > 0 &&
    form.fieldOfStudy.trim().length > 0

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initial ? "Edit education" : "Add education"}
      size="md"
    >
      <div className="space-y-4">
        <Input
          label="Institution"
          value={form.institution}
          onChange={e => set("institution", e.target.value)}
          placeholder="e.g. Jashore University of Science and Technology"
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Degree"
            value={form.degree}
            onChange={e => set("degree", e.target.value)}
            placeholder="e.g. B.Sc."
          />
          <Input
            label="Field of study"
            value={form.fieldOfStudy}
            onChange={e => set("fieldOfStudy", e.target.value)}
            placeholder="Computer Science"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Start year"
            value={String(form.startYear)}
            onChange={e => set("startYear", parseInt(e.target.value, 10))}
            options={YEARS.map(y => ({ value: String(y), label: String(y) }))}
          />
          <Select
            label="End year"
            value={form.endYear === null ? "" : String(form.endYear)}
            onChange={e =>
              set("endYear", e.target.value === "" ? null : parseInt(e.target.value, 10))
            }
            options={[
              { value: "", label: "Present" },
              ...YEARS.map(y => ({ value: String(y), label: String(y) })),
            ]}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Description <span className="text-muted-foreground">(optional)</span>
          </label>
          <textarea
            rows={3}
            value={form.description ?? ""}
            onChange={e => set("description", e.target.value)}
            placeholder="Activities, achievements, research focus..."
            className="w-full resize-none rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground transition-all focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/40"
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3 border-t border-border pt-4">
        <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          type="button"
          className="flex-1"
          loading={isLoading}
          disabled={!canSubmit}
          onClick={() => onSubmit(form)}
        >
          {initial ? "Save changes" : "Add education"}
        </Button>
      </div>
    </Modal>
  )
}
