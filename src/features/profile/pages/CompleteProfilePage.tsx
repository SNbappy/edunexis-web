import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import {
  User, MessageSquareQuote, Link2,
  ChevronRight, ChevronLeft, LogOut, Sparkles,
} from "lucide-react"
import { FaLinkedinIn, FaGithub, FaXTwitter, FaFacebookF, FaGlobe } from "react-icons/fa6"

import Button from "@/components/ui/Button"
import Select from "@/components/ui/Select"
import FormPageLayout from "@/components/forms/FormPageLayout"
import FormSection from "@/components/forms/FormSection"
import FormField from "@/components/forms/FormField"
import FormStepper from "@/components/forms/FormStepper"

import { useProfile } from "../hooks/useProfile"
import { useAuthStore } from "@/store/authStore"
import { DEPARTMENT_GROUPS, ROUTES } from "@/config/constants"
import { isTeacher } from "@/utils/roleGuard"

function buildSchema(teacher: boolean) {
  return z.object({
    fullName: z.string().trim().min(2, "Full name is required"),
    department: z.string().min(1, "Department is required"),
    designation: teacher
      ? z.string().trim().min(2, "Designation is required for teachers")
      : z.string().optional(),
    studentId: !teacher
      ? z.string().trim().min(2, "Student ID is required for students")
      : z.string().optional(),
    phoneNumber: z.string().optional(),
    bio: z.string().max(500, "Bio must be under 500 characters").optional(),
    linkedInUrl: z.string().optional(),
    gitHubUrl: z.string().optional(),
    twitterUrl: z.string().optional(),
    facebookUrl: z.string().optional(),
    websiteUrl: z.string().optional(),
  })
}

type FormData = {
  fullName:     string
  department:   string
  designation?: string
  studentId?:   string
  phoneNumber?: string
  bio?:         string
  linkedInUrl?: string
  gitHubUrl?:   string
  twitterUrl?:  string
  facebookUrl?: string
  websiteUrl?:  string
}

const STEPS = [
  { label: "About you" },
  { label: "Your story" },
  { label: "Connect" },
]

const SOCIAL_FIELDS = [
  {
    key: "linkedInUrl" as const,
    icon: FaLinkedinIn,
    placeholder: "linkedin.com/in/yourname",
    label: "LinkedIn",
    bgClass: "bg-[#0A66C2] text-white",
  },
  {
    key: "gitHubUrl" as const,
    icon: FaGithub,
    placeholder: "github.com/yourname",
    label: "GitHub",
    bgClass: "bg-[#181717] text-white dark:bg-[#2a2a2a]",
  },
  {
    key: "twitterUrl" as const,
    icon: FaXTwitter,
    placeholder: "x.com/yourname",
    label: "X",
    bgClass: "bg-black text-white dark:bg-white dark:text-black",
  },
  {
    key: "facebookUrl" as const,
    icon: FaFacebookF,
    placeholder: "facebook.com/yourname",
    label: "Facebook",
    bgClass: "bg-[#1877F2] text-white",
  },
  {
    key: "websiteUrl" as const,
    icon: FaGlobe,
    placeholder: "yourwebsite.com",
    label: "Website",
    bgClass: "bg-teal-600 text-white",
  },
]

export default function CompleteProfilePage() {
  const navigate = useNavigate()
  const { user, clearAuth, setUser } = useAuthStore()
  const { updateProfile, isUpdating } = useProfile()
  const teacher = isTeacher(user?.role ?? "Student")
  const [step, setStep] = useState(0)

  // If already complete for this role's requirements, skip onboarding
  useEffect(() => {
    if (user?.isProfileComplete && user?.profile?.fullName) {
      const ok = teacher
        ? !!user.profile.designation?.trim()
        : !!user.profile.studentId?.trim()
      if (ok) navigate(ROUTES.DASHBOARD, { replace: true })
    }
  }, [user, teacher, navigate])

  const schema = buildSchema(teacher)

  const {
    register, handleSubmit, watch, trigger,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      fullName: user?.profile?.fullName ?? "",
      department: user?.profile?.department ?? "",
      designation: "",
      studentId: "",
      phoneNumber: "",
      bio: "",
      linkedInUrl: "",
      gitHubUrl: "",
      twitterUrl: "",
      facebookUrl: "",
      websiteUrl: "",
    },
  })

  const values = watch()

  /* Fields per step (for validation gating) */
  const STEP_FIELDS: ReadonlyArray<ReadonlyArray<keyof FormData>> = [
    teacher
      ? ["fullName", "department", "designation"]
      : ["fullName", "department", "studentId"],
    [],
    [],
  ]

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

  const submit = (data: FormData) => {
    const payload = {
      fullName: data.fullName,
      department: data.department,
      designation: data.designation || undefined,
      studentId: data.studentId || undefined,
      phoneNumber: data.phoneNumber || undefined,
      bio: data.bio || undefined,
      linkedInUrl: data.linkedInUrl || undefined,
      gitHubUrl: data.gitHubUrl || undefined,
      twitterUrl: data.twitterUrl || undefined,
      facebookUrl: data.facebookUrl || undefined,
      websiteUrl: data.websiteUrl || undefined,
    }
    updateProfile(payload, {
      onSuccess: (res: any) => {
        if (res?.success && user) {
          setUser({
            ...user,
            isProfileComplete: true,
            profile: { ...user.profile, ...res.data, ...payload } as any,
          })
          navigate(ROUTES.DASHBOARD, { replace: true })
        }
      },
    } as any)
  }

  const isLastStep = step === STEPS.length - 1

  /* Completion flags */
  const step1Complete = !!values.fullName && values.fullName.length >= 2
    && !!values.department
    && (teacher ? !!values.designation : !!values.studentId)

  const footer = (
    <>
      <Button
        type="button"
        variant="secondary"
        onClick={() => { clearAuth(); navigate(ROUTES.LOGIN, { replace: true }) }}
        disabled={isUpdating}
      >
        <LogOut className="h-3.5 w-3.5" />
        Log out
      </Button>

      {step > 0 && (
        <Button
          type="button"
          variant="secondary"
          onClick={prevStep}
          disabled={isUpdating}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back
        </Button>
      )}

      {!isLastStep ? (
        <Button type="button" onClick={nextStep} disabled={isUpdating}>
          Next step
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      ) : (
        <Button
          type="button"
          onClick={handleSubmit(submit)}
          loading={isUpdating}
          disabled={!isValid}
        >
          Finish setup
        </Button>
      )}
    </>
  )

  const firstName = user?.profile?.fullName?.split(" ")[0] ?? ""
  const greeting = firstName ? "Welcome, " + firstName : "Welcome to EduNexis"

  return (
    <FormPageLayout
      backLabel=""
      backTo=""
      title={greeting}
      subtitle={
        teacher
          ? "Let's set up your teacher profile. Takes about a minute â€” students will use this to find and trust your courses."
          : "Let's set up your student profile. Takes about a minute â€” you'll need this to join courses, track attendance, and submit assignments."
      }
      topSlot={
        <FormStepper
          steps={STEPS}
          currentStep={step}
          onStepClick={goToStep}
        />
      }
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
                icon={User}
                title="About you"
                subtitle="The essentials. We'll use these to personalize your experience."
                tone="teal"
                complete={step1Complete}
              >
                <FormField
                  {...register("fullName")}
                  label="Full name *"
                  placeholder="Your full name"
                  error={errors.fullName?.message}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-foreground">
                      Department *
                    </label>
                    <Select
                      {...register("department")}
                      placeholder="Select department"
                      optionGroups={DEPARTMENT_GROUPS}
                    />
                    {errors.department?.message && (
                      <p className="mt-1.5 text-[11.5px] font-semibold text-red-600">
                        {errors.department.message}
                      </p>
                    )}
                  </div>

                  {teacher ? (
                    <FormField
                      {...register("designation")}
                      label="Designation *"
                      placeholder="e.g. Assistant Professor"
                      error={errors.designation?.message}
                      hint="Your academic role â€” students will see this."
                    />
                  ) : (
                    <FormField
                      {...register("studentId")}
                      label="Student ID *"
                      placeholder="e.g. 200109"
                      error={errors.studentId?.message}
                      hint="Required â€” used for attendance and marks."
                    />
                  )}
                </div>

                <FormField
                  {...register("phoneNumber")}
                  label="Phone number"
                  optional
                  placeholder="+880 1X XX XXX XXX"
                  help="Only shown to people in your courses."
                />
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
                icon={MessageSquareQuote}
                title="Your story"
                subtitle={teacher
                  ? "Tell students what you teach, research, or care about. Even a sentence helps."
                  : "A few words about what you're studying or hoping to learn. Optional, but it helps classmates know you."
                }
                tone="amber"
              >
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-foreground">
                    Bio
                    <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
                  </label>
                  <textarea
                    {...register("bio")}
                    rows={6}
                    placeholder={teacher
                      ? "e.g. I teach algorithms and work on distributed systems. Interested in graph theory and competitive programming."
                      : "e.g. CSE student interested in ML and backend engineering. Currently building a recipe app in my spare time."
                    }
                    className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground transition-all focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/30"
                  />
                  {errors.bio?.message && (
                    <p className="mt-1.5 text-[11.5px] font-semibold text-red-600">
                      {errors.bio.message}
                    </p>
                  )}
                  <p className="mt-1.5 text-[11.5px] text-muted-foreground">
                    {(values.bio?.length ?? 0)} / 500 characters
                  </p>
                </div>
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
                icon={Link2}
                title="Connect"
                subtitle="Where people can find you online. All optional â€” add what makes sense."
                tone="stone"
              >
                <div className="space-y-2.5">
                  {SOCIAL_FIELDS.map(({ key, icon: Icon, placeholder, label, bgClass }) => (
                    <div key={key} className="flex items-center gap-2">
                      <div
                        className={"flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm " + bgClass}
                        aria-label={label}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <input
                        {...register(key)}
                        type="text"
                        placeholder={placeholder}
                        className="h-11 flex-1 rounded-xl border border-border bg-card px-4 text-[14px] text-foreground placeholder:text-muted-foreground transition-all focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/30"
                      />
                    </div>
                  ))}
                </div>
              </FormSection>

              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-teal-200 bg-teal-50 dark:border-teal-900/50 dark:bg-teal-950/30/60 p-5 dark:border-teal-900/50 dark:bg-teal-950/20">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-widest text-teal-700">
                    You're almost set
                  </p>
                  <p className="mt-1 text-[13px] text-teal-900/80">
                    Click "Finish setup" to start using EduNexis. You can edit any of this later from your profile.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </FormPageLayout>
  )
}