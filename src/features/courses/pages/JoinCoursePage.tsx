import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, LogIn, Loader2, Hash, Sparkles, Search } from "lucide-react"
import toast from "react-hot-toast"
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

  const handleChange = (i: number, val: string) => {
    const char = val.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(-1)
    const next = [...code]; next[i] = char; setCode(next)
    if (char && i < CODE_LENGTH - 1) inputs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[i] && i > 0) inputs.current[i - 1]?.focus()
    if (e.key === "Enter" && filled === CODE_LENGTH) handleLookup()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text")
      .replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, CODE_LENGTH)
    const next = [...code]
    pasted.split("").forEach((c, i) => { next[i] = c })
    setCode(next)
    inputs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus()
  }

  const handleLookup = async () => {
    if (filled < CODE_LENGTH) {
      toast.error(`Enter the full ${CODE_LENGTH}-character code`)
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

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Topbar */}
      <div className="sticky top-0 z-20 flex h-14 items-center border-b border-border bg-white/85 px-6 backdrop-blur">
        <button
          onClick={() => navigate("/courses")}
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-muted-foreground transition-colors hover:text-teal-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to courses
        </button>
      </div>

      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center px-4 py-16">
        {step === "entry" ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-md"
          >
            {/* Heading */}
            <div className="mb-8 text-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 220, delay: 0.1 }}
                className="mx-auto mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-2xl border border-teal-200 bg-teal-50"
              >
                <LogIn className="h-8 w-8 text-teal-600" strokeWidth={2} />
              </motion.div>
              <h1 className="font-display text-[26px] font-extrabold text-foreground">
                Join a course
              </h1>
              <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                Enter the 8-character code provided by your teacher.
              </p>
            </div>

            {/* Card */}
            <div className="rounded-3xl border border-border bg-card p-7 shadow-sm">
              {/* Label */}
              <div className="mb-5 flex items-center gap-2">
                <Hash className="h-3.5 w-3.5 text-teal-600" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Joining code
                </span>
              </div>

              {/* Code inputs */}
              <div className="flex items-center justify-center gap-1.5" onPaste={handlePaste}>
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
                <span className="mx-1 text-[16px] font-bold text-muted-foreground">—</span>
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

              {/* Progress dots */}
              <div className="mt-5 flex justify-center gap-1.5">
                {code.map((c, i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: c ? 1.2 : 1 }}
                    className={`h-1.5 w-1.5 rounded-full ${
                      c ? "bg-teal-600" : "bg-stone-300"
                    }`}
                  />
                ))}
              </div>

              {/* Divider + status */}
              <div className="mt-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {filled === CODE_LENGTH
                    ? "ready to look up"
                    : `${filled}/${CODE_LENGTH} entered`}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Buttons */}
              <div className="mt-6 flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/courses")}
                  className="flex-1 rounded-xl border border-border bg-stone-50 py-2.5 text-[13px] font-semibold text-stone-700 transition-colors hover:bg-stone-100"
                >
                  Cancel
                </motion.button>

                <motion.button
                  whileHover={{ scale: filled === CODE_LENGTH ? 1.02 : 1 }}
                  whileTap={{   scale: filled === CODE_LENGTH ? 0.97 : 1 }}
                  onClick={handleLookup}
                  disabled={lookingUp || filled < CODE_LENGTH}
                  className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-teal-600 py-2.5 text-[14px] font-bold text-white shadow-sm transition-all disabled:bg-stone-200 disabled:text-stone-500 disabled:shadow-none"
                >
                  {lookingUp ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Looking up...
                    </>
                  ) : filled === CODE_LENGTH ? (
                    <>
                      <Search className="h-4 w-4" />
                      Find course
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Find course
                    </>
                  )}
                </motion.button>
              </div>

              <p className="mt-4 text-center text-[11px] text-muted-foreground">
                We'll show you the course before sending the request.
              </p>
            </div>
          </motion.div>
        ) : (
          lookup && (
            <JoinCoursePreview
              course={lookup}
              onConfirm={handleConfirmJoin}
              onBack={handleBack}
              isJoining={isJoining}
            />
          )
        )}
      </div>
    </div>
  )
}

/* ─── Code input box ─────────────────────────────────────────────── */

function CodeBox({
  i, value, refCb, onChange, onKeyDown,
}: {
  i:          number
  value:      string
  refCb:      (el: HTMLInputElement | null) => void
  onChange:   (i: number, v: string) => void
  onKeyDown:  (i: number, e: React.KeyboardEvent) => void
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
      whileFocus={{ scale: 1.06, y: -2 }}
      className={`h-[52px] w-11 rounded-xl text-center text-[18px] font-extrabold outline-none transition-all ${
        value
          ? "border-2 border-teal-600 bg-teal-50 text-teal-700 shadow-sm"
          : "border-2 border-border bg-stone-50 text-muted-foreground"
      }`}
    />
  )
}
