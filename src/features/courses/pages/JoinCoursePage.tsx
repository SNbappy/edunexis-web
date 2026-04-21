import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { courseService } from "../services/courseService"
import toast from "react-hot-toast"
import { ArrowLeft, LogIn, Loader2, Hash, Sparkles, CheckCircle2 } from "lucide-react"
import { useThemeStore } from "@/store/themeStore"

const CODE_LENGTH = 8

export default function JoinCoursePage() {
  const navigate  = useNavigate()
  const { dark }  = useThemeStore()
  const [code,    setCode]    = useState<string[]>(Array(CODE_LENGTH).fill(""))
  const [loading, setLoading] = useState(false)
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
    if (e.key === "Enter" && fullCode.length === CODE_LENGTH) handleJoin()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, CODE_LENGTH)
    const next = [...code]
    pasted.split("").forEach((c, i) => { next[i] = c })
    setCode(next)
    inputs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus()
  }

  const handleJoin = async () => {
    if (fullCode.length < CODE_LENGTH) return toast.error(`Enter the full ${CODE_LENGTH}-character code`)
    setLoading(true)
    try {
      const res = await courseService.joinByCode(fullCode)
      if (res.success) {
        toast.success("Join request sent! Awaiting teacher approval.")
        navigate("/courses", { replace: true })
      } else {
        toast.error(res.message ?? "Invalid code or request failed.")
      }
    } catch {
      toast.error("Invalid joining code. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Theme
  const bg        = dark ? "rgb(11,17,32)"            : "rgb(248,249,255)"
  const cardBg    = dark ? "rgba(16,24,44,0.85)"      : "rgba(255,255,255,0.95)"
  const blur      = "blur(20px)"
  const border    = dark ? "rgba(99,102,241,0.15)"    : "#e5e7eb"
  const topbarBg  = dark ? "rgba(11,17,32,0.85)"      : "rgba(255,255,255,0.85)"
  const textMain  = dark ? "#e2e8f8"                  : "#111827"
  const textSub   = dark ? "#8896c8"                  : "#6b7280"
  const textMuted = dark ? "#5a6a9a"                  : "#9ca3af"
  const divider   = dark ? "rgba(99,102,241,0.1)"     : "#f3f4f6"
  const inputIdle = dark ? "rgba(255,255,255,0.04)"   : "#f9fafb"
  const inputBorderIdle = dark ? "rgba(99,102,241,0.15)" : "#e5e7eb"
  const inputFilled     = dark ? "rgba(99,102,241,0.15)" : "#eef2ff"
  const inputBorderFilled = dark ? "rgba(99,102,241,0.45)" : "#6366f1"
  const previewBg = dark ? "rgba(99,102,241,0.08)" : "#eef2ff"
  const previewBorder = dark ? "rgba(99,102,241,0.15)" : "#c7d2fe"

  return (
    <div className="min-h-screen" style={{ background: bg }}>

      {/* -- Topbar -- */}
      <div className="sticky top-0 z-20 h-14 px-6 flex items-center"
        style={{ background: topbarBg, backdropFilter: blur, WebkitBackdropFilter: blur, borderBottom: `1px solid ${border}` }}>
        <motion.button whileHover={{ x: -2 }} onClick={() => navigate("/courses")}
          className="flex items-center gap-2 text-[13px] font-semibold transition-colors"
          style={{ color: textMuted }}
          onMouseEnter={e => (e.currentTarget.style.color = "#6366f1")}
          onMouseLeave={e => (e.currentTarget.style.color = textMuted)}>
          <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Courses
        </motion.button>
      </div>

      {/* -- Content -- */}
      <div className="flex items-center justify-center px-4 py-16 min-h-[calc(100vh-56px)]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, type: "spring", damping: 24 }}
          className="w-full max-w-md">

          {/* Heading */}
          <div className="text-center mb-8">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 220, delay: 0.1 }}
              className="w-18 h-18 rounded-2xl flex items-center justify-center mx-auto mb-5 w-[72px] h-[72px]"
              style={{ background: dark ? "rgba(99,102,241,0.15)" : "#eef2ff", border: dark ? "1px solid rgba(99,102,241,0.3)" : "1px solid #c7d2fe", boxShadow: "0 8px 28px rgba(99,102,241,0.2)" }}>
              <LogIn style={{ width: 32, height: 32, color: "#6366f1" }} strokeWidth={2} />
            </motion.div>
            <h1 className="text-[26px] font-extrabold mb-2" style={{ color: textMain }}>Join a Course</h1>
            <p className="text-[14px] leading-relaxed" style={{ color: textSub }}>
              Enter the 8-character code provided by your teacher
            </p>
          </div>

          {/* Card */}
          <div className="rounded-3xl p-7 space-y-6"
            style={{ background: cardBg, backdropFilter: blur, WebkitBackdropFilter: blur, border: `1px solid ${border}`, boxShadow: dark ? "0 24px 64px rgba(0,0,0,0.4)" : "0 8px 32px rgba(99,102,241,0.08)" }}>

            {/* Label */}
            <div className="flex items-center gap-2">
              <Hash style={{ width: 14, height: 14, color: "#6366f1" }} />
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: textMuted }}>
                Joining Code ({CODE_LENGTH} characters)
              </span>
            </div>

            {/* Code inputs */}
            <div className="flex items-center justify-center gap-2" onPaste={handlePaste}>
              {code.slice(0, 4).map((c, i) => (
                <motion.input key={i}
                  ref={el => { inputs.current[i] = el }}
                  type="text" inputMode="text" maxLength={1} value={c}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  onFocus={e => e.target.select()}
                  whileFocus={{ scale: 1.06, y: -2 }}
                  className="w-11 h-13 rounded-xl text-center text-[18px] font-extrabold outline-none transition-all"
                  style={{
                    width: 44, height: 52,
                    background:  c ? inputFilled : inputIdle,
                    border:      `2px solid ${c ? inputBorderFilled : inputBorderIdle}`,
                    color:       c ? "#6366f1" : textSub,
                    boxShadow:   c ? (dark ? "0 4px 16px rgba(99,102,241,0.25)" : "0 4px 12px rgba(99,102,241,0.15)") : "none",
                  }} />
              ))}

              <span className="text-[18px] font-bold mx-0.5" style={{ color: textMuted }}>-</span>

              {code.slice(4).map((c, j) => {
                const i = j + 4
                return (
                  <motion.input key={i}
                    ref={el => { inputs.current[i] = el }}
                    type="text" inputMode="text" maxLength={1} value={c}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    onFocus={e => e.target.select()}
                    whileFocus={{ scale: 1.06, y: -2 }}
                    className="w-11 h-13 rounded-xl text-center text-[18px] font-extrabold outline-none transition-all"
                    style={{
                      width: 44, height: 52,
                      background:  c ? inputFilled : inputIdle,
                      border:      `2px solid ${c ? inputBorderFilled : inputBorderIdle}`,
                      color:       c ? "#6366f1" : textSub,
                      boxShadow:   c ? (dark ? "0 4px 16px rgba(99,102,241,0.25)" : "0 4px 12px rgba(99,102,241,0.15)") : "none",
                    }} />
                )
              })}
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-1.5">
              {code.map((c, i) => (
                <motion.div key={i}
                  animate={{ scale: c ? 1.2 : 1, background: c ? "#6366f1" : (dark ? "rgba(99,102,241,0.15)" : "#e5e7eb") }}
                  className="rounded-full"
                  style={{ width: 7, height: 7 }} />
              ))}
            </div>

            {/* Live preview */}
            {fullCode.length > 0 && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ background: previewBg, border: `1px solid ${previewBorder}` }}>
                <span className="text-[12px] font-medium" style={{ color: textMuted }}>Code entered</span>
                <span className="text-[15px] font-extrabold tracking-[0.15em]" style={{ color: "#6366f1" }}>
                  {fullCode.slice(0, 4)}{fullCode.length > 4 ? "-" + fullCode.slice(4) : ""}
                </span>
              </motion.div>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: divider }} />
              <span className="text-[11px] font-semibold" style={{ color: textMuted }}>
                {filled === CODE_LENGTH ? "ready to join!" : `${filled}/${CODE_LENGTH} entered`}
              </span>
              <div className="flex-1 h-px" style={{ background: divider }} />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/courses")}
                className="flex-1 h-11 rounded-xl font-semibold text-[13px] transition-all"
                style={{ background: dark ? "rgba(255,255,255,0.06)" : "#f3f4f6", border: `1px solid ${border}`, color: textSub }}
                onMouseEnter={e => (e.currentTarget.style.background = dark ? "rgba(255,255,255,0.09)" : "#e5e7eb")}
                onMouseLeave={e => (e.currentTarget.style.background = dark ? "rgba(255,255,255,0.06)" : "#f3f4f6")}>
                Cancel
              </motion.button>

              <motion.button
                whileHover={{ scale: filled < CODE_LENGTH ? 1 : 1.02 }}
                whileTap={{   scale: filled < CODE_LENGTH ? 1 : 0.97 }}
                onClick={handleJoin}
                disabled={loading || filled < CODE_LENGTH}
                className="flex-[2] h-11 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 text-white transition-all disabled:opacity-40"
                style={{
                  background: filled === CODE_LENGTH
                    ? "linear-gradient(135deg,#6366f1,#0891b2)"
                    : dark ? "rgba(99,102,241,0.15)" : "#eef2ff",
                  color:      filled === CODE_LENGTH ? "white" : textMuted,
                  boxShadow:  filled === CODE_LENGTH ? "0 4px 16px rgba(99,102,241,0.4)" : "none",
                }}>
                {loading
                  ? <><Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> Joining...</>
                  : filled === CODE_LENGTH
                    ? <><CheckCircle2 style={{ width: 16, height: 16 }} /> Join Course</>
                    : <><Sparkles style={{ width: 16, height: 16 }} /> Join Course</>
                }
              </motion.button>
            </div>

            <p className="text-center text-[11px]" style={{ color: textMuted }}>
              Your request will be reviewed by the teacher before approval
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
