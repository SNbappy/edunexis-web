import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { LogIn, Search, Sparkles, Hash, Info } from "lucide-react"
import toast from "react-hot-toast"

import Button from "@/components/ui/Button"
import InlineSpinner from "@/components/ui/InlineSpinner"
import FormPageLayout from "@/components/forms/FormPageLayout"
import FormSection from "@/components/forms/FormSection"

import { courseService } from "../services/courseService"
import { useCourses } from "../hooks/useCourses"
import JoinCoursePreview from "../components/JoinCoursePreview"
import type { CourseByCodeDto } from "@/types/course.types"

const CODE_LENGTH = 8

type Step = "entry" | "preview"

export default function JoinCoursePage() {
  const navigate = useNavigate()
  const { requestJoin, isJoining } = useCourses()

  const [step, setStep] = useState<Step>("entry")
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""))
  const [lookup, setLookup] = useState<CourseByCodeDto | null>(null)
  const [lookingUp, setLookingUp] = useState(false)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const fullCode = code.join("").toUpperCase()
  const filled   = code.filter(c => c !== "").length
  const isComplete = filled === CODE_LENGTH

  const handleChange = (i: number, val: string) => {
    const char = val.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(-1)
    const next = [...code]; next[i] = char; setCode(next)
    if (char && i < CODE_LENGTH - 1) inputs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[i] && i > 0) inputs.current[i - 1]?.focus()
    if (e.key === "ArrowLeft" && i > 0) {
      e.preventDefault()
      inputs.current[i - 1]?.focus()
    }
    if (e.key === "ArrowRight" && i < CODE_LENGTH - 1) {
      e.preventDefault()
      inputs.current[i + 1]?.focus()
    }
    if (e.key === "Enter" && isComplete) handleLookup()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text")
      .replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, CODE_LENGTH)
    if (!pasted) return
    const next = Array(CODE_LENGTH).fill("")
    pasted.split("").forEach((c, i) => { next[i] = c })
    setCode(next)
    inputs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus()
  }

  const handleLookup = async () => {
    if (!isComplete) {
      toast.error("Enter the full " + CODE_LENGTH + "-character code")
      return
    }
    setLookingUp(true)
    try {
      const res = await courseService.getByCode(fullCode)
      if (res.success && res.data) {
        setLookup(res.data)
        setStep("preview")
      } else {
        toast.error(res.message ?? "No course found with that code.")
      }
    } catch {
      toast.error("Couldn't look up that code. Try again.")
    } finally {
      setLookingUp(false)
    }
  }

  const handleConfirmJoin = () => {
    if (!lookup) return
    requestJoin(
      { courseId: lookup.id, code: fullCode },
      {
        onSuccess: (res: any) => {
          if (res?.success) navigate("/courses?filter=requests", { replace: true })
        },
      } as any,
    )
  }

  const handleBack = () => {
    setStep("entry")
    setLookup(null)
  }

  /* Preview step */
  if (step === "preview" && lookup) {
    return (
      <FormPageLayout
        backLabel="Back to entry"
        backTo=""
        title="Confirm course"
        subtitle="Review the course details below before sending your join request."
      >
        <JoinCoursePreview
          course={lookup}
          onConfirm={handleConfirmJoin}
          onBack={handleBack}
          isJoining={isJoining}
        />
      </FormPageLayout>
    )
  }

  /* Footer for entry step */
  const footer = (
    <>
      <Button
        type="button"
        variant="secondary"
        onClick={() => navigate("/courses")}
        disabled={lookingUp}
      >
        Cancel
      </Button>
      <Button
        type="button"
        onClick={handleLookup}
        disabled={!isComplete || lookingUp}
        loading={lookingUp}
        rightIcon={!lookingUp ? <Search className="h-3.5 w-3.5" /> : undefined}
      >
        {lookingUp ? "Looking up" : "Find course"}
      </Button>
    </>
  )

  return (
    <FormPageLayout
      backLabel="Back to courses"
      backTo="/courses"
      title="Join a course"
      subtitle="Ask your teacher for the 8-character course code, then enter it below to request access."
      footer={footer}
    >
      <FormSection
        icon={LogIn}
        title="Joining code"
        subtitle={"Enter the " + CODE_LENGTH + "-character code exactly as your teacher shared it. Codes are not case sensitive."}
        tone="teal"
        complete={isComplete}
      >
        <div className="space-y-5">
          {/* Code input row */}
          <div
            className="flex items-center justify-center gap-1.5"
            onPaste={handlePaste}
          >
            {code.slice(0, 4).map((c, i) => (
              <CodeBox
                key={i}
                i={i}
                value={c}
                refCb={el => { inputs.current[i] = el }}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
              />
            ))}
            <span className="mx-1 select-none text-[18px] font-bold text-muted-foreground">
              {"\u2014"}
            </span>
            {code.slice(4).map((c, j) => {
              const i = j + 4
              return (
                <CodeBox
                  key={i}
                  i={i}
                  value={c}
                  refCb={el => { inputs.current[i] = el }}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                />
              )
            })}
          </div>

          {/* Status row */}
          <div className="flex items-center justify-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {lookingUp ? (
                <>
                  <InlineSpinner size={12} />
                  Looking up
                </>
              ) : isComplete ? (
                <>
                  <Sparkles className="h-3 w-3 text-teal-600" />
                  Ready to look up
                </>
              ) : (
                <>
                  <Hash className="h-3 w-3" />
                  {filled} / {CODE_LENGTH} entered
                </>
              )}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Helper note */}
          <div className="flex items-start gap-2.5 rounded-xl border border-border bg-muted/40 p-3.5">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" />
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              We{"\u2019"}ll show you the course details before sending the request. Joining requires your teacher{"\u2019"}s approval.
            </p>
          </div>
        </div>
      </FormSection>
    </FormPageLayout>
  )
}

/* -------- Code input box -------- */
function CodeBox({
  i, value, refCb, onChange, onKeyDown,
}: {
  i:         number
  value:     string
  refCb:     (el: HTMLInputElement | null) => void
  onChange:  (i: number, v: string) => void
  onKeyDown: (i: number, e: React.KeyboardEvent) => void
}) {
  return (
    <motion.input
      ref={refCb}
      type="text"
      inputMode="text"
      maxLength={1}
      value={value}
      onChange={e => onChange(i, e.target.value)}
      onKeyDown={e => onKeyDown(i, e)}
      onFocus={e => e.target.select()}
      whileFocus={{ scale: 1.05, y: -1 }}
      autoComplete="off"
      spellCheck={false}
      className={
        "h-[52px] w-11 rounded-xl border-2 text-center font-display text-[18px] font-bold outline-none transition-colors " +
        (value
          ? "border-teal-600 bg-teal-50 text-teal-700 dark:bg-teal-600/15 dark:text-teal-300"
          : "border-border bg-card text-foreground focus:border-teal-600")
      }
    />
  )
}