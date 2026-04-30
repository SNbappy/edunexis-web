import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react"

import Button from "@/components/ui/Button"
import { useChangePassword } from "@/features/auth/hooks/useChangePassword"

const schema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, "Must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Must contain at least one special character"),
  confirmPassword: z.string().min(1, "Confirm your new password"),
})
.refine(d => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})
.refine(d => d.newPassword !== d.currentPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"],
})

type FormData = z.infer<typeof schema>

export default function SecurityPage() {
  const { mutate, isPending } = useChangePassword()

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register, handleSubmit, watch, reset,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  })

  const newPasswordValue = watch("newPassword") ?? ""

  // Strength meter — 4 levels
  const strength = computeStrength(newPasswordValue)

  const submit = (data: FormData) => {
    mutate(
      { currentPassword: data.currentPassword, newPassword: data.newPassword },
      {
        onSuccess: (res) => {
          if (res.success) {
            reset({ currentPassword: "", newPassword: "", confirmPassword: "" })
          }
        },
      },
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm ring-1 ring-stone-200/50 dark:ring-white/5 sm:p-7">
        <header className="mb-5 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-200 bg-teal-50 text-teal-600 dark:border-teal-800/50 dark:bg-teal-950/40 dark:text-teal-400">
            <Lock className="h-4 w-4" strokeWidth={2.25} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-[16px] font-bold text-foreground">
              Change password
            </h2>
            <p className="mt-0.5 text-[12.5px] text-muted-foreground">
              Use a strong password you don{"\u2019"}t reuse anywhere else.
            </p>
          </div>
        </header>

        <form onSubmit={handleSubmit(submit)} className="space-y-4" autoComplete="off">
          <PasswordField
            label="Current password"
            placeholder="Enter your current password"
            visible={showCurrent}
            onToggle={() => setShowCurrent(v => !v)}
            error={errors.currentPassword?.message}
            registerProps={register("currentPassword")}
            autoComplete="current-password"
          />

          <PasswordField
            label="New password"
            placeholder="At least 8 characters"
            visible={showNew}
            onToggle={() => setShowNew(v => !v)}
            error={errors.newPassword?.message}
            registerProps={register("newPassword")}
            autoComplete="new-password"
          />

          {/* Strength meter */}
          {newPasswordValue.length > 0 ? (
            <div className="space-y-2">
              <div className="flex h-1.5 gap-1">
                {[0, 1, 2, 3].map(i => (
                  <div
                    key={i}
                    className={
                      "h-full flex-1 rounded-full transition-colors " +
                      (i < strength.level
                        ? strength.colorClass
                        : "bg-muted")
                    }
                  />
                ))}
              </div>
              <p className={"text-[11.5px] font-semibold " + strength.textClass}>
                {strength.label}
              </p>
            </div>
          ) : null}

          <PasswordField
            label="Confirm new password"
            placeholder="Re-enter your new password"
            visible={showConfirm}
            onToggle={() => setShowConfirm(v => !v)}
            error={errors.confirmPassword?.message}
            registerProps={register("confirmPassword")}
            autoComplete="new-password"
          />

          {/* Tip card */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-900/40 dark:bg-amber-950/20">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <p className="text-[12px] leading-relaxed text-amber-900 dark:text-amber-200">
                <span className="font-semibold">Heads up:</span>{" "}
                Changing your password will sign you out of other devices. You{"\u2019"}ll stay signed in here.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="submit" loading={isPending} disabled={!isValid}>
              <ShieldCheck className="h-3.5 w-3.5" />
              Update password
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}

/* ── Reusable password field ─────────────────── */

interface PasswordFieldProps {
  label: string
  placeholder: string
  visible: boolean
  onToggle: () => void
  error?: string
  autoComplete?: string
  registerProps: ReturnType<ReturnType<typeof useForm>["register"]>
}

function PasswordField({
  label, placeholder, visible, onToggle, error, autoComplete, registerProps,
}: PasswordFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-semibold text-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          {...registerProps}
          className={
            "h-11 w-full rounded-xl border bg-card px-4 pr-11 text-[14px] text-foreground placeholder:text-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-teal-600/30 " +
            (error ? "border-red-300 focus:border-red-500" : "border-border focus:border-teal-600")
          }
        />
        <button
          type="button"
          onClick={onToggle}
          tabIndex={-1}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <AnimatePresence mode="wait">
        {error ? (
          <motion.p
            key="error"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="mt-1.5 text-[11.5px] font-semibold text-red-600"
          >
            {error}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

/* ── Strength helpers ────────────────────────── */

interface Strength {
  level: number       // 0..4
  label: string
  colorClass: string
  textClass: string
}

function computeStrength(password: string): Strength {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  if (password.length >= 12) score = Math.min(score + 1, 4)

  switch (score) {
    case 0:
    case 1:
      return {
        level: 1,
        label: "Weak",
        colorClass: "bg-red-500",
        textClass: "text-red-600 dark:text-red-400",
      }
    case 2:
      return {
        level: 2,
        label: "Fair",
        colorClass: "bg-amber-500",
        textClass: "text-amber-600 dark:text-amber-400",
      }
    case 3:
      return {
        level: 3,
        label: "Good",
        colorClass: "bg-blue-500",
        textClass: "text-blue-600 dark:text-blue-400",
      }
    default:
      return {
        level: 4,
        label: "Strong",
        colorClass: "bg-emerald-500",
        textClass: "text-emerald-600 dark:text-emerald-400",
      }
  }
}