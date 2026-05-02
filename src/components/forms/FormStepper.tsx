import { motion } from "framer-motion"
import { Check } from "lucide-react"

export interface FormStepItem {
  label: string
}

interface FormStepperProps {
  steps:        FormStepItem[]
  /** 0-based index of the current step. */
  currentStep:  number
  /** Steps 0..currentStep are navigable via click; steps ahead of current are locked. */
  onStepClick?: (index: number) => void
}

export default function FormStepper({ steps, currentStep, onStepClick }: FormStepperProps) {
  return (
    <nav aria-label="Form progress" className="flex items-center gap-0">
      {steps.map((s, i) => {
        const state: "done" | "current" | "upcoming" =
          i < currentStep ? "done" : i === currentStep ? "current" : "upcoming"
        const clickable = state !== "upcoming" && !!onStepClick
        const isLast = i === steps.length - 1

        const dotClasses =
          state === "done"
            ? "bg-teal-600 text-white border-teal-600"
            : state === "current"
            ? "border-teal-600 text-teal-600 bg-white"
            : "border-border text-muted-foreground bg-muted"

        const labelClasses =
          state === "done"
            ? "text-teal-700"
            : state === "current"
            ? "text-foreground font-semibold"
            : "text-muted-foreground"

        return (
          <div key={s.label} className={"flex items-center " + (isLast ? "" : "flex-1")}>
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onStepClick(i)}
              className={
                "group inline-flex shrink-0 items-center gap-2 " +
                (clickable ? "cursor-pointer" : "cursor-default")
              }
            >
              <motion.span
                initial={false}
                animate={{ scale: state === "current" ? 1.05 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={
                  "inline-flex h-8 w-8 items-center justify-center rounded-full border-2 text-[12px] font-bold " +
                  dotClasses
                }
              >
                {state === "done" ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
              </motion.span>
              <span className={"hidden text-[12px] sm:inline " + labelClasses}>
                {s.label}
              </span>
            </button>

            {!isLast && (
              <div className="relative mx-2 h-0.5 flex-1 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
                <motion.div
                  initial={false}
                  animate={{ scaleX: i < currentStep ? 1 : 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={{ transformOrigin: "left" }}
                  className="h-full w-full bg-teal-600"
                />
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}
