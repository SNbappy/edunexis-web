import { useState, useEffect } from "react"
import { User, Link2, Linkedin, Github, Twitter, Facebook, Globe } from "lucide-react"
import Modal from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import { DEPARTMENTS } from "@/config/constants"
import { isTeacher } from "@/utils/roleGuard"
import type { PublicProfileDto, UserRole } from "@/types/auth.types"
import type { UpdateProfileRequest } from "../services/profileService"

interface EditProfileModalProps {
  isOpen:    boolean
  onClose:   () => void
  profile:   PublicProfileDto
  role:      UserRole
  onSubmit:  (data: UpdateProfileRequest) => void
  isLoading: boolean
}

const SOCIAL_FIELDS: ReadonlyArray<{
  key:         keyof UpdateProfileRequest
  icon:        React.ComponentType<{ className?: string }>
  placeholder: string
  label:       string
}> = [
  { key: "linkedInUrl", icon: Linkedin, placeholder: "linkedin.com/in/yourname", label: "LinkedIn" },
  { key: "gitHubUrl",   icon: Github,   placeholder: "github.com/yourname",      label: "GitHub" },
  { key: "twitterUrl",  icon: Twitter,  placeholder: "x.com/yourname",           label: "X" },
  { key: "facebookUrl", icon: Facebook, placeholder: "facebook.com/yourname",    label: "Facebook" },
  { key: "websiteUrl",  icon: Globe,    placeholder: "yourwebsite.com",          label: "Website" },
]

export default function EditProfileModal({
  isOpen, onClose, profile, role, onSubmit, isLoading,
}: EditProfileModalProps) {
  const teacher = isTeacher(role)

  const [form, setForm] = useState<UpdateProfileRequest>({
    fullName:    "",
    department:  "",
    designation: "",
    studentId:   "",
    bio:         "",
    phoneNumber: "",
    linkedInUrl: "",
    facebookUrl: "",
    twitterUrl:  "",
    gitHubUrl:   "",
    websiteUrl:  "",
  })

  useEffect(() => {
    if (isOpen) {
      setForm({
        fullName:    profile.fullName ?? "",
        department:  profile.department ?? "",
        designation: profile.designation ?? "",
        studentId:   profile.studentId ?? "",
        bio:         profile.bio ?? "",
        phoneNumber: profile.phoneNumber ?? "",
        linkedInUrl: profile.linkedInUrl ?? "",
        facebookUrl: profile.facebookUrl ?? "",
        twitterUrl:  profile.twitterUrl ?? "",
        gitHubUrl:   profile.gitHubUrl ?? "",
        websiteUrl:  profile.websiteUrl ?? "",
      })
    }
  }, [isOpen, profile])

  const set = <K extends keyof UpdateProfileRequest>(k: K, v: UpdateProfileRequest[K]) =>
    setForm(p => ({ ...p, [k]: v }))

  const canSubmit = !!form.fullName?.trim() && !!form.department?.trim()

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit profile" size="lg">
      <div className="max-h-[70vh] space-y-7 overflow-y-auto pr-1">
        {/* Basics */}
        <section>
          <h3 className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-teal-700">
            <User className="h-3 w-3" />
            Basics
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Input
                label="Full name"
                value={form.fullName}
                onChange={e => set("fullName", e.target.value)}
              />
            </div>

            <Select
              label="Department"
              value={form.department}
              onChange={e => set("department", e.target.value)}
              placeholder="Select department"
              options={DEPARTMENTS.map(d => ({ value: d, label: d }))}
            />

            {teacher ? (
              <Input
                label="Designation"
                value={form.designation ?? ""}
                onChange={e => set("designation", e.target.value)}
                placeholder="e.g. Assistant Professor"
              />
            ) : (
              <Input
                label="Student ID"
                value={form.studentId ?? ""}
                onChange={e => set("studentId", e.target.value)}
                placeholder="e.g. 200109"
              />
            )}

            <div className="col-span-2">
              <Input
                label="Phone number"
                value={form.phoneNumber ?? ""}
                onChange={e => set("phoneNumber", e.target.value)}
                placeholder="+880 1X XX XXX XXX"
              />
            </div>

            <div className="col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Bio <span className="text-muted-foreground">(optional)</span>
              </label>
              <textarea
                rows={3}
                value={form.bio ?? ""}
                onChange={e => set("bio", e.target.value)}
                placeholder="A short description about yourself."
                className="w-full resize-none rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground transition-all focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/40"
              />
            </div>
          </div>
        </section>

        {/* Social links */}
        <section>
          <h3 className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-teal-700">
            <Link2 className="h-3 w-3" />
            Social links
          </h3>

          <div className="space-y-2.5">
            {SOCIAL_FIELDS.map(({ key, icon: Icon, placeholder, label }) => (
              <div key={key} className="flex items-center gap-2">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-stone-50 text-stone-600"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={(form[key] as string | undefined) ?? ""}
                  onChange={e => set(key, e.target.value as any)}
                  placeholder={placeholder}
                  className="h-10 flex-1 rounded-xl border border-border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/40"
                />
              </div>
            ))}
          </div>
        </section>
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
          Save changes
        </Button>
      </div>
    </Modal>
  )
}
