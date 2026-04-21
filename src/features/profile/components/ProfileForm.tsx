import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"
import { useAuthStore } from "@/store/authStore"
import { useThemeStore } from "@/store/themeStore"
import { DEPARTMENTS } from "@/config/constants"
import { isTeacher, isStudent } from "@/utils/roleGuard"

// Role-aware schema
function buildSchema(teacher: boolean) {
  return z.object({
    fullName:    z.string().min(2, "Full name is required"),
    department:  z.string().min(1, "Department is required"),
    designation: teacher
      ? z.string().min(2, "Designation is required for teachers")
      : z.string().optional(),
    studentId: !teacher
      ? z.string().min(2, "Student ID is required for students")
      : z.string().optional(),
    bio:          z.string().max(300, "Bio must be under 300 characters").optional(),
    phoneNumber:  z.string().optional(),
    linkedInUrl:  z.string().url("Enter a valid URL").optional().or(z.literal("")),
  })
}

type FormData = {
  fullName:    string
  department:  string
  designation?: string
  studentId?:  string
  bio?:        string
  phoneNumber?: string
  linkedInUrl?: string
}

interface Props {
  defaultValues?: Partial<FormData>
  onSubmit:       (data: FormData) => void
  isLoading?:     boolean
  submitLabel?:   string
}

export default function ProfileForm({ defaultValues, onSubmit, isLoading, submitLabel = "Save Profile" }: Props) {
  const { user }  = useAuthStore()
  const { dark }  = useThemeStore()
  const role      = user?.role ?? "Student"
  const teacher   = isTeacher(role)

  const schema = buildSchema(teacher)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  useEffect(() => {
    if (defaultValues) reset(defaultValues)
  }, [defaultValues, reset])

  // Theme
  const textMain    = dark ? "#e2e8f8" : "#111827"
  const labelColor  = dark ? "#9ca3af" : "#374151"
  const inputBg     = dark ? "rgba(255,255,255,0.05)" : "#f9fafb"
  const inputBorder = dark ? "rgba(255,255,255,0.1)"  : "#e5e7eb"
  const selectStyle: React.CSSProperties = {
    width: "100%", height: 40, borderRadius: 12,
    background: inputBg, border: `1px solid ${inputBorder}`,
    color: textMain, fontSize: 13, paddingLeft: 16, paddingRight: 16,
    outline: "none", appearance: "none" as any,
    transition: "border-color 0.2s, box-shadow 0.2s",
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* Full Name + Department */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Input {...register("fullName")} label="Full Name"
            placeholder="Your full name" error={errors.fullName?.message} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <label className="block text-[13px] font-semibold mb-1.5" style={{ color: labelColor }}>
            Department <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <select {...register("department")} style={selectStyle}
            onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)" }}
            onBlur={e => { e.target.style.borderColor = inputBorder; e.target.style.boxShadow = "none" }}>
            <option value="">Select department</option>
            {DEPARTMENTS.map(d => (
              <option key={d} value={d} style={{ background: dark ? "rgb(16,24,44)" : "white" }}>{d}</option>
            ))}
          </select>
          {errors.department && <p className="text-[11px] font-semibold mt-1" style={{ color: "#ef4444" }}>{errors.department.message}</p>}
        </motion.div>
      </div>

      {/* Role-specific required field */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.11 }}>
        {teacher ? (
          <Input {...register("designation")} label="Designation"
            placeholder="e.g. Assistant Professor, Lecturer"
            error={errors.designation?.message}
            hint="Required — shown to students"
          />
        ) : (
          <Input {...register("studentId")} label="Student ID"
            placeholder="e.g. 200109CSE"
            error={(errors as any).studentId?.message}
            hint="Required — used for attendance and marks"
          />
        )}
      </motion.div>

      {/* Phone */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
        <Input {...register("phoneNumber")} label="Phone Number"
          placeholder="+880 1X XX XXX XXX" error={errors.phoneNumber?.message} />
      </motion.div>

      {/* LinkedIn */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.17 }}>
        <Input {...register("linkedInUrl")} label="LinkedIn URL"
          placeholder="https://linkedin.com/in/yourname" error={errors.linkedInUrl?.message} />
      </motion.div>

      {/* Bio */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <label className="block text-[13px] font-semibold mb-1.5" style={{ color: labelColor }}>
          Bio <span className="font-normal" style={{ color: dark ? "#6b7280" : "#9ca3af" }}>(optional)</span>
        </label>
        <textarea {...register("bio")} rows={3}
          placeholder="Tell others a bit about yourself..."
          className="w-full rounded-xl text-[13px] px-4 py-3 outline-none transition-all resize-none"
          style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textMain }}
          onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)" }}
          onBlur={e => { e.target.style.borderColor = inputBorder; e.target.style.boxShadow = "none" }}
        />
        {errors.bio && <p className="text-[11px] font-semibold mt-1" style={{ color: "#ef4444" }}>{errors.bio.message}</p>}
      </motion.div>

      <Button type="submit" loading={isLoading} className="w-full">
        {submitLabel}
      </Button>
    </form>
  )
}
