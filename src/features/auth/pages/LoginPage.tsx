import { useState } from "react"
import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react"

import { useLogin } from "../hooks/useLogin"
import { ROUTES } from "@/config/constants"
import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"
import BrandLoader from "@/components/ui/BrandLoader"
import AuthShell from "@/components/layout/AuthShell"

const schema = z.object({
  email:    z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { login, loading, showOverlay } = useLogin()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  return (
    <>
      <AuthShell
        title="Welcome back"
        subtitle="Sign in to continue to your courses."
        footer={
          <div className="space-y-3">
            <p className="text-center text-[14px] text-stone-600">
              New to EduNexis?{" "}
              <Link to={ROUTES.REGISTER} className="font-bold text-teal-700 transition-colors hover:text-teal-800">
                Create an account
              </Link>
            </p>
            <p className="text-center text-[11.5px] text-stone-400">
              Access restricted to <span className="font-mono text-stone-500">@just.edu.bd</span> and{" "}
              <span className="font-mono text-stone-500">@student.just.edu.bd</span>
            </p>
          </div>
        }
      >
        <form onSubmit={handleSubmit(d => login(d))} className="space-y-4" noValidate>
          <Input
            {...register("email")}
            type="email"
            autoComplete="email"
            aria-label="University email"
            placeholder="you@just.edu.bd"
            leftIcon={<Mail />}
            error={errors.email?.message}
            sizeVariant="lg"
          />

          <div className="space-y-1.5">
            <Input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              aria-label="Password"
              placeholder="Your password"
              leftIcon={<Lock />}
              rightIcon={
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(p => !p)}
                  className="p-1 transition-colors hover:text-stone-900"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              error={errors.password?.message}
              sizeVariant="lg"
            />
            <div className="flex justify-end">
              <Link
                to={ROUTES.FORGOT_PASSWORD}
                className="text-[12px] font-semibold text-stone-500 transition-colors hover:text-teal-700"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            loading={loading}
            size="lg"
            fullWidth
            className="bg-teal-900 hover:bg-teal-800"
            rightIcon={!loading ? <ArrowRight className="h-4 w-4" /> : undefined}
          >
            Sign in
          </Button>
        </form>
      </AuthShell>

      {/* Slow-auth brand overlay */}
      {showOverlay && <BrandLoader variant="screen" label="Signing you in…" />}
    </>
  )
}
