import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { courseService } from '../services/courseService'
import toast from 'react-hot-toast'
import { ArrowLeft, LogIn, Loader2, Hash, Sparkles } from 'lucide-react'

const CODE_LENGTH = 8

export default function JoinCoursePage() {
  const navigate = useNavigate()
  const [code,    setCode]    = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [loading, setLoading] = useState(false)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const fullCode = code.join('').toUpperCase()

  const handleChange = (i: number, val: string) => {
    const char = val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-1)
    const next  = [...code]
    next[i] = char
    setCode(next)
    if (char && i < CODE_LENGTH - 1) inputs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) {
      inputs.current[i - 1]?.focus()
    }
    if (e.key === 'Enter' && fullCode.length === CODE_LENGTH) handleJoin()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData
      .getData('text')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .slice(0, CODE_LENGTH)
    const next = [...code]
    pasted.split('').forEach((c, i) => { next[i] = c })
    setCode(next)
    inputs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus()
  }

  const handleJoin = async () => {
    if (fullCode.length < CODE_LENGTH) return toast.error(`Enter the full ${CODE_LENGTH}-character code`)
    setLoading(true)
    try {
      const res = await courseService.joinByCode(fullCode)
      if (res.success) {
        toast.success('Join request sent! Awaiting teacher approval.')
        navigate('/courses', { replace: true })
      } else {
        toast.error(res.message ?? 'Invalid code or request failed.')
      }
    } catch {
      toast.error('Invalid joining code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(180deg,#0d1b35 0%,#070e21 100%)' }}>

      {/* Top nav */}
      <div className="sticky top-0 z-20 h-16 px-6 flex items-center"
        style={{ background: 'rgba(7,14,33,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(99,102,241,0.12)' }}>
        <button onClick={() => navigate('/courses')}
          className="flex items-center gap-2 text-[13px] font-semibold transition-colors"
          style={{ color: '#475569' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#818cf8')}
          onMouseLeave={e => (e.currentTarget.style.color = '#475569')}>
          <ArrowLeft className="w-4 h-4" /> Back to Courses
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-lg">

          {/* Heading */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
              style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.25),rgba(124,58,237,0.15))', border: '1px solid rgba(99,102,241,0.3)', boxShadow: '0 8px 32px rgba(99,102,241,0.2)' }}>
              <LogIn className="w-9 h-9" style={{ color: '#818cf8' }} strokeWidth={1.8} />
            </motion.div>
            <h1 className="text-[28px] font-extrabold mb-2" style={{ color: '#e2e8f0' }}>Join a Course</h1>
            <p className="text-[14px] leading-relaxed" style={{ color: '#475569' }}>
              Enter the 8-character joining code<br />provided by your teacher
            </p>
          </div>

          {/* Card */}
          <div className="rounded-3xl p-8 space-y-7"
            style={{ background: 'rgba(10,18,38,0.8)', border: '1px solid rgba(99,102,241,0.15)', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>

            <div>
              <div className="flex items-center gap-2 mb-5">
                <Hash className="w-4 h-4" style={{ color: '#4f46e5' }} />
                <span className="text-[12px] font-bold uppercase tracking-widest" style={{ color: '#475569' }}>
                  Joining Code ({CODE_LENGTH} characters)
                </span>
              </div>

              {/* 8 input boxes — split 4+4 with a dash divider */}
              <div className="flex items-center justify-center gap-2" onPaste={handlePaste}>
                {code.slice(0, 4).map((c, i) => (
                  <motion.input key={i}
                    ref={el => { inputs.current[i] = el }}
                    type="text" inputMode="text" maxLength={1} value={c}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    onFocus={e => e.target.select()}
                    whileFocus={{ scale: 1.08 }}
                    className="w-11 h-14 rounded-xl text-center text-[18px] font-extrabold outline-none transition-all"
                    style={{
                      background:  c ? 'rgba(99,102,241,0.15)' : 'rgba(7,14,33,0.8)',
                      border:      `2px solid ${c ? 'rgba(99,102,241,0.5)' : 'rgba(99,102,241,0.15)'}`,
                      color:       '#a5b4fc',
                      caretColor:  '#818cf8',
                      boxShadow:   c ? '0 4px 16px rgba(99,102,241,0.2)' : 'none',
                    }}
                  />
                ))}

                {/* Dash divider */}
                <span className="text-[20px] font-bold mx-1" style={{ color: '#1e3a5f' }}>—</span>

                {code.slice(4).map((c, j) => {
                  const i = j + 4
                  return (
                    <motion.input key={i}
                      ref={el => { inputs.current[i] = el }}
                      type="text" inputMode="text" maxLength={1} value={c}
                      onChange={e => handleChange(i, e.target.value)}
                      onKeyDown={e => handleKeyDown(i, e)}
                      onFocus={e => e.target.select()}
                      whileFocus={{ scale: 1.08 }}
                      className="w-11 h-14 rounded-xl text-center text-[18px] font-extrabold outline-none transition-all"
                      style={{
                        background:  c ? 'rgba(99,102,241,0.15)' : 'rgba(7,14,33,0.8)',
                        border:      `2px solid ${c ? 'rgba(99,102,241,0.5)' : 'rgba(99,102,241,0.15)'}`,
                        color:       '#a5b4fc',
                        caretColor:  '#818cf8',
                        boxShadow:   c ? '0 4px 16px rgba(99,102,241,0.2)' : 'none',
                      }}
                    />
                  )
                })}
              </div>

              {/* Progress dots */}
              <div className="flex justify-center gap-1.5 mt-4">
                {code.map((c, i) => (
                  <div key={i} className="rounded-full transition-all duration-200"
                    style={{
                      width:      c ? 8 : 6,
                      height:     c ? 8 : 6,
                      background: c ? '#818cf8' : 'rgba(99,102,241,0.15)',
                    }} />
                ))}
              </div>
            </div>

            {/* Live code preview */}
            {fullCode.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.12)' }}>
                <span className="text-[12px]" style={{ color: '#475569' }}>Code entered</span>
                <span className="text-[15px] font-extrabold tracking-[0.18em]" style={{ color: '#818cf8' }}>
                  {fullCode.slice(0, 4)}-{fullCode.slice(4)}
                </span>
              </motion.div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: 'rgba(99,102,241,0.1)' }} />
              <span className="text-[11px] font-semibold" style={{ color: '#1e3a5f' }}>ready to join?</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(99,102,241,0.1)' }} />
            </div>

            <div className="flex gap-3">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/courses')}
                className="flex-1 h-12 rounded-xl font-bold text-[13px]"
                style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)', color: '#818cf8' }}>
                Cancel
              </motion.button>

              <motion.button
                whileHover={{ scale: fullCode.length < CODE_LENGTH ? 1 : 1.02 }}
                whileTap={{   scale: fullCode.length < CODE_LENGTH ? 1 : 0.97 }}
                onClick={handleJoin}
                disabled={loading || fullCode.length < CODE_LENGTH}
                className="flex-[2] h-12 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2"
                style={{
                  background: fullCode.length === CODE_LENGTH ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : 'rgba(99,102,241,0.1)',
                  border:     fullCode.length === CODE_LENGTH ? 'none' : '1px solid rgba(99,102,241,0.15)',
                  color:      fullCode.length === CODE_LENGTH ? '#fff' : '#334155',
                  boxShadow:  fullCode.length === CODE_LENGTH ? '0 4px 20px rgba(79,70,229,0.4)' : 'none',
                  opacity:    loading ? 0.7 : 1,
                  transition: 'all 0.2s',
                }}>
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Joining...</>
                  : <><Sparkles className="w-4 h-4" /> Join Course</>}
              </motion.button>
            </div>

            <p className="text-center text-[11px]" style={{ color: '#1e3a5f' }}>
              Your request will be reviewed by the teacher
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
