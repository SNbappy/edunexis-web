import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AnimatePresence, motion } from "framer-motion"
import {
  User as UserIcon, FileText, Microscope, LinkIcon,
  ChevronRight, ChevronLeft, Camera, Upload, Trash2} from "lucide-react"
import toast from "react-hot-toast"

import Button from "@/components/ui/Button"
import Select from "@/components/ui/Select"
import FormPageLayout from "@/components/forms/FormPageLayout"
import FormSection from "@/components/forms/FormSection"
import FormField from "@/components/forms/FormField"
import FormStepper from "@/components/forms/FormStepper"
import LivePreviewPanel from "@/components/forms/LivePreviewPanel"
import Avatar from "@/components/ui/Avatar"
import InlineSpinner from "@/components/ui/InlineSpinner"
import BrandLoader from "@/components/ui/BrandLoader"

import { DEPARTMENT_GROUPS } from "@/config/constants"
import { useAuthStore } from "@/store/authStore"
import { useProfile } from "../hooks/useProfile"
import { isTeacher } from "@/utils/roleGuard"
import type { UpdateProfileRequest } from "../services/profileService"
import type { PublicProfileDto, UserRole } from "@/types/auth.types"
import ProfileIdentityCard from "../components/ProfileIdentityCard"

/* ── Schema ──────────────────────────────────── */

function buildSchema(teacher: boolean) {
  return z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    department: z.string().min(1, "Department is required"),
    designation: teacher
      ? z.string().min(2, "Designation is required for teachers")
      : z.string().optional(),
    studentId: !teacher
      ? z.string().min(2, "Student ID is required for students")
      : z.string().optional(),
    headline: z.string().max(160, "Keep headline under 160 characters").optional(),

    bio: z.string().max(2000, "Bio must be under 2000 characters").optional(),

    officeLocation: z.string().max(120).optional(),
    officeHours: z.string().max(160).optional(),
    researchInterestsCsv: z.string().max(500).optional(),
    fieldsOfWorkCsv: z.string().max(500).optional(),

    phoneNumber: z.string().optional(),
    linkedInUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
    gitHubUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
    twitterUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
    facebookUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
    websiteUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  })
}

type FormData = {
  fullName: string
  department: string
  designation?: string
  studentId?: string
  headline?: string
  bio?: string
  officeLocation?: string
  officeHours?: string
  researchInterestsCsv?: string
  fieldsOfWorkCsv?: string
  phoneNumber?: string
  linkedInUrl?: string
  gitHubUrl?: string
  twitterUrl?: string
  facebookUrl?: string
  websiteUrl?: string
}

/* ── Page ────────────────────────────────────── */

export default function EditProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const own = useProfile()

  const role: UserRole = user?.role ?? "Student"
  const teacher = isTeacher(role)

  const STEPS = teacher
    ? [{ label: "Identity" }, { label: "About" }, { label: "Office & research" }, { label: "Links" }]
    : [{ label: "Identity" }, { label: "About" }, { label: "Links" }]

  const STEP_FIELDS: ReadonlyArray<ReadonlyArray<keyof FormData>> = teacher
    ? [
        ["fullName", "department", "designation", "headline"],
        ["bio"],
        ["officeLocation", "officeHours", "researchInterestsCsv", "fieldsOfWorkCsv"],
        ["phoneNumber", "linkedInUrl", "gitHubUrl", "twitterUrl", "facebookUrl", "websiteUrl"],
      ]
    : [
        ["fullName", "department", "studentId", "headline"],
        ["bio"],
        ["phoneNumber", "linkedInUrl", "gitHubUrl", "twitterUrl", "facebookUrl", "websiteUrl"],
      ]

  const [step, setStep] = useState(0)

  const schema = buildSchema(teacher)
  const {
    register, handleSubmit, watch, trigger, reset,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      department: "",
      designation: "",
      studentId: "",
      headline: "",
      bio: "",
      officeLocation: "",
      officeHours: "",
      researchInterestsCsv: "",
      fieldsOfWorkCsv: "",
      phoneNumber: "",
      linkedInUrl: "",
      gitHubUrl: "",
      twitterUrl: "",
      facebookUrl: "",
      websiteUrl: "",
    },
  })

  // Hydrate form from existing profile
  useEffect(() => {
    const p = own.profile
    if (!p) return
    reset({
      fullName: p.fullName ?? "",
      department: p.department ?? "",
      designation: p.designation ?? "",
      studentId: p.studentId ?? "",
      headline: p.headline ?? "",
      bio: p.bio ?? "",
      officeLocation: p.officeLocation ?? "",
      officeHours: p.officeHours ?? "",
      researchInterestsCsv: p.researchInterestsCsv ?? "",
      fieldsOfWorkCsv: p.fieldsOfWorkCsv ?? "",
      phoneNumber: p.phoneNumber ?? "",
      linkedInUrl: p.linkedInUrl ?? "",
      gitHubUrl: p.gitHubUrl ?? "",
      twitterUrl: p.twitterUrl ?? "",
      facebookUrl: p.facebookUrl ?? "",
      websiteUrl: p.websiteUrl ?? "",
    })
  }, [own.profile, reset])

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
    if (target === step + 1) await nextStep()
  }

  const submit = (data: FormData) => {
    const payload: UpdateProfileRequest = {
      fullName: data.fullName,
      department: data.department,
      designation: data.designation || undefined,
      studentId: data.studentId || undefined,
      bio: data.bio || undefined,
      headline: data.headline || undefined,
      officeLocation: data.officeLocation || undefined,
      officeHours: data.officeHours || undefined,
      researchInterestsCsv: data.researchInterestsCsv || undefined,
      fieldsOfWorkCsv: data.fieldsOfWorkCsv || undefined,
      phoneNumber: data.phoneNumber || undefined,
      linkedInUrl: data.linkedInUrl || undefined,
      gitHubUrl: data.gitHubUrl || undefined,
      twitterUrl: data.twitterUrl || undefined,
      facebookUrl: data.facebookUrl || undefined,
      websiteUrl: data.websiteUrl || undefined,
    }

    own.updateProfile(payload, {
      onSuccess: () => {
        toast.success("Profile saved.")
        navigate("/profile")
      },
    } as any)
  }

  if (own.isLoading || !own.profile) {
    return <BrandLoader variant="page" />
  }

  // ── Live preview built from current form values ──
  const previewProfile: PublicProfileDto = {
    userId: user?.id ?? "preview",
    fullName: values.fullName?.trim() || "Your name",
    department: values.department || null,
    designation: values.designation || null,
    studentId: values.studentId || null,
    bio: values.bio || null,
    headline: values.headline || null,
    profilePhotoUrl: own.profile.profilePhotoUrl ?? null,
    coverPhotoUrl: own.profile.coverPhotoUrl ?? null,
    phoneNumber: values.phoneNumber || null,
    officeLocation: values.officeLocation || null,
    officeHours: values.officeHours || null,
    researchInterestsCsv: values.researchInterestsCsv || null,
    fieldsOfWorkCsv: values.fieldsOfWorkCsv || null,
    linkedInUrl: values.linkedInUrl || null,
    facebookUrl: values.facebookUrl || null,
    twitterUrl: values.twitterUrl || null,
    gitHubUrl: values.gitHubUrl || null,
    websiteUrl: values.websiteUrl || null,
    email: user?.email ?? null,
    role,
    education: [],
    publications: [],
    courses: [],
    runningCoursesCount: 0,
    archivedCoursesCount: 0,
    viewerRelation: "Self",
  }

  const preview = (
    <LivePreviewPanel caption="This is how your profile card looks to others.">
      <ProfileIdentityCard
        profile={previewProfile}
        isSelf={false}
        canSeeContact={true}
      />
    </LivePreviewPanel>
  )

  const isLastStep = step === STEPS.length - 1

  // ── Per-step completion (for stepper checkmark visual) ──
  const step1Complete = !!values.fullName && values.fullName.length >= 2
    && !!values.department
    && (teacher ? !!values.designation : !!values.studentId)

  const footer = (
    <>
      <Button
        type="button"
        variant="secondary"
        onClick={() => navigate("/profile")}
        disabled={own.isUpdating}
      >
        Cancel
      </Button>

      {step > 0 ? (
        <Button
          type="button"
          variant="secondary"
          onClick={prevStep}
          disabled={own.isUpdating}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back
        </Button>
      ) : null}

      {!isLastStep ? (
        <Button type="button" onClick={nextStep} disabled={own.isUpdating}>
          Next step
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      ) : (
        <Button
          type="button"
          onClick={handleSubmit(submit)}
          loading={own.isUpdating}
          disabled={!isValid}
        >
          Save changes
        </Button>
      )}
    </>
  )

  return (
    <FormPageLayout
      backLabel="Back to profile"
      backTo="/profile"
      title="Edit your profile"
      subtitle="Polished, public-facing details. The right side shows a live preview of how others will see your profile card."
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
          {step === 0 ? (
            <motion.div
              key="step-identity"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              <FormSection
                icon={Camera}
                title="Profile photo"
                subtitle="A clear headshot helps students and colleagues recognise you."
                tone="stone"
                complete={Boolean(own.profile.profilePhotoUrl)}
              >
                <div className="flex items-center gap-5">
                  <div className="relative h-20 w-20 shrink-0">
                    {(own.isUploading || own.isRemovingPhoto) ? (
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                        <InlineSpinner size={24} className="text-teal-600" />
                      </div>
                    ) : (
                      <Avatar
                        src={own.profile.profilePhotoUrl}
                        name={own.profile.fullName ?? "You"}
                        size="xl"
                        className="h-20 w-20 text-2xl"
                      />
                    )}
                  </div>

                  <div className="flex flex-1 flex-wrap items-center gap-2">
                    <label
                      htmlFor="edit-profile-photo-input"
                      className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-teal-700"
                    >
                      <Upload className="h-4 w-4" />
                      {own.profile.profilePhotoUrl ? "Change photo" : "Upload photo"}
                    </label>
                    <input
                      id="edit-profile-photo-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const f = e.target.files?.[0]
                        if (f) own.uploadPhoto(f)
                        e.target.value = ""
                      }}
                    />

                    {own.profile.profilePhotoUrl ? (
                      <button
                        type="button"
                        onClick={() => own.removePhoto()}
                        disabled={own.isRemovingPhoto}
                        className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-[13px] font-bold text-red-600 transition-colors hover:border-red-300 hover:bg-red-50 disabled:opacity-50 dark:hover:border-red-800/60 dark:hover:bg-red-950/30 dark:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    ) : null}
                  </div>
                </div>

                <p className="mt-3 text-[12px] text-muted-foreground">
                  JPG, PNG, or WebP. Maximum 5 MB.
                </p>
              </FormSection>

              <div className="h-6" />

              <FormSection
                icon={UserIcon}
                title="Identity"
                subtitle="Your name, role, and how you describe yourself in one line."
                tone="teal"
                complete={step1Complete}
              >
                <FormField
                  {...register("fullName")}
                  label="Full name"
                  placeholder="e.g. Dr. Mohammad Nowsin"
                  error={errors.fullName?.message}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-foreground">
                      Department
                    </label>
                    <Select
                      {...register("department")}
                      placeholder="Select department"
                      optionGroups={DEPARTMENT_GROUPS}
                    />
                    {errors.department?.message ? (
                      <p className="mt-1.5 text-[11.5px] font-semibold text-red-600">
                        {errors.department.message}
                      </p>
                    ) : null}
                  </div>

                  {teacher ? (
                    <FormField
                      {...register("designation")}
                      label="Designation"
                      placeholder="e.g. Assistant Professor"
                      hint="Required for teachers. Shown to students."
                      error={errors.designation?.message}
                    />
                  ) : (
                    <FormField
                      {...register("studentId")}
                      label="Student ID"
                      placeholder="e.g. 200109"
                      hint="Used for attendance and marks."
                      error={(errors as any).studentId?.message}
                    />
                  )}
                </div>

                <FormField
                  {...register("headline")}
                  label="Headline"
                  optional
                  placeholder={teacher
                    ? "e.g. Researcher in distributed systems and ML"
                    : "e.g. CSE final-year student, interested in AI"}
                  help="One line shown under your name on your profile card."
                  error={errors.headline?.message}
                />
              </FormSection>
            </motion.div>
          ) : null}

          {step === 1 ? (
            <motion.div
              key="step-about"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              <FormSection
                icon={FileText}
                title="About"
                subtitle="Tell others about your background, interests, and what you do. Take your time — students read this."
                tone="stone"
              >
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-foreground">
                    Biography
                    <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
                  </label>
                  <textarea
                    {...register("bio")}
                    rows={12}
                    placeholder={"Hello! I'm... I work on... My research focuses on... Outside of work I enjoy..."}
                    className="w-full resize-y rounded-xl border border-border bg-card px-4 py-3 text-[14px] leading-7 text-foreground placeholder:text-muted-foreground transition-all focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/30"
                  />
                  <div className="mt-1.5 flex items-center justify-between">
                    <p className="text-[11.5px] text-muted-foreground">
                      Markdown not supported. Use plain text and paragraph breaks.
                    </p>
                    <p className="text-[11.5px] text-muted-foreground">
                      {(values.bio?.length ?? 0)} / 1000
                    </p>
                  </div>
                  {errors.bio?.message ? (
                    <p className="mt-1.5 text-[11.5px] font-semibold text-red-600">
                      {errors.bio.message}
                    </p>
                  ) : null}
                </div>
              </FormSection>
            </motion.div>
          ) : null}

          {step === 2 && teacher ? (
            <motion.div
              key="step-research"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              <FormSection
                icon={Microscope}
                title="Office & research"
                subtitle="Where students can find you, and what you study."
                tone="amber"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    {...register("officeLocation")}
                    label="Office location"
                    optional
                    placeholder="e.g. Room 304, CSE Building"
                    error={errors.officeLocation?.message}
                  />
                  <FormField
                    {...register("officeHours")}
                    label="Office hours"
                    optional
                    placeholder="e.g. Sun\u2013Tue, 2\u20134 PM"
                    error={errors.officeHours?.message}
                  />
                </div>

                <FormField
                  {...register("researchInterestsCsv")}
                  label="Research interests"
                  optional
                  placeholder="Machine learning, Distributed systems, NLP"
                  help="Comma-separated. Topics you actively research."
                  error={errors.researchInterestsCsv?.message}
                />

                <FormField
                  {...register("fieldsOfWorkCsv")}
                  label="Fields of work"
                  optional
                  placeholder="Computer Vision, Software Engineering"
                  help="Comma-separated. Broader fields you work in."
                  error={errors.fieldsOfWorkCsv?.message}
                />
              </FormSection>
            </motion.div>
          ) : null}

          {((step === 3 && teacher) || (step === 2 && !teacher)) ? (
            <motion.div
              key="step-links"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              <FormSection
                icon={LinkIcon}
                title="Links & contact"
                subtitle="How people can reach you and where they can find your work."
                tone="teal"
              >
                <FormField
                  {...register("phoneNumber")}
                  label="Phone number"
                  optional
                  placeholder="+880 1X XX XXX XXX"
                  error={errors.phoneNumber?.message}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    {...register("linkedInUrl")}
                    label="LinkedIn"
                    optional
                    placeholder="https://linkedin.com/in/yourname"
                    error={errors.linkedInUrl?.message}
                  />
                  <FormField
                    {...register("gitHubUrl")}
                    label="GitHub"
                    optional
                    placeholder="https://github.com/yourname"
                    error={errors.gitHubUrl?.message}
                  />
                  <FormField
                    {...register("twitterUrl")}
                    label="X (Twitter)"
                    optional
                    placeholder="https://x.com/yourname"
                    error={errors.twitterUrl?.message}
                  />
                  <FormField
                    {...register("facebookUrl")}
                    label="Facebook"
                    optional
                    placeholder="https://facebook.com/yourname"
                    error={errors.facebookUrl?.message}
                  />
                </div>

                <FormField
                  {...register("websiteUrl")}
                  label="Personal website"
                  optional
                  placeholder="https://yoursite.com"
                  error={errors.websiteUrl?.message}
                />
              </FormSection>

              <div className="mt-6 rounded-2xl border border-teal-200 bg-teal-50 dark:border-teal-900/50 dark:bg-teal-950/30/60 p-5 dark:border-teal-900/50 dark:bg-teal-950/20 dark:border-teal-800/50 dark:bg-teal-950/30">
                <p className="text-[12px] font-bold uppercase tracking-widest text-teal-700 dark:text-teal-400">
                  Ready to save
                </p>
                <p className="mt-1.5 text-[13px] text-teal-900/80 dark:text-teal-200/80">
                  Take one last look at the live preview on the right. Changes save immediately to your public profile.
                </p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </form>
    </FormPageLayout>
  )
}