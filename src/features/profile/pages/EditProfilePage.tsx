import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate } from "react-router-dom"
import {
    User, MessageSquareQuote, Link2,
    Linkedin, Github, Twitter, Facebook, Globe,
    Building2, Shield, Camera,
} from "lucide-react"
import toast from "react-hot-toast"

import Avatar from "@/components/ui/Avatar"
import Button from "@/components/ui/Button"
import Select from "@/components/ui/Select"
import Skeleton from "@/components/ui/Skeleton"
import FormPageLayout from "@/components/forms/FormPageLayout"
import FormSection from "@/components/forms/FormSection"
import FormField from "@/components/forms/FormField"
import LivePreviewPanel from "@/components/forms/LivePreviewPanel"

import { useProfile } from "../hooks/useProfile"
import { usePublicProfile } from "../hooks/usePublicProfile"
import { useAuthStore } from "@/store/authStore"
import { DEPARTMENTS } from "@/config/constants"
import { isTeacher } from "@/utils/roleGuard"
import type { UpdateProfileRequest } from "../services/profileService"

const schema = z.object({
    fullName: z.string().min(2, "Full name is required"),
    department: z.string().min(1, "Department is required"),
    designation: z.string().optional(),
    studentId: z.string().optional(),
    phoneNumber: z.string().optional(),
    bio: z.string().max(500, "Bio must be under 500 characters").optional(),
    linkedInUrl: z.string().optional(),
    gitHubUrl: z.string().optional(),
    twitterUrl: z.string().optional(),
    facebookUrl: z.string().optional(),
    websiteUrl: z.string().optional(),
})
type FormData = z.infer<typeof schema>

const SOCIAL_FIELDS = [
    { key: "linkedInUrl" as const, icon: Linkedin, placeholder: "linkedin.com/in/yourname", label: "LinkedIn" },
    { key: "gitHubUrl" as const, icon: Github, placeholder: "github.com/yourname", label: "GitHub" },
    { key: "twitterUrl" as const, icon: Twitter, placeholder: "x.com/yourname", label: "X" },
    { key: "facebookUrl" as const, icon: Facebook, placeholder: "facebook.com/yourname", label: "Facebook" },
    { key: "websiteUrl" as const, icon: Globe, placeholder: "yourwebsite.com", label: "Website" },
]

export default function EditProfilePage() {
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const own = useProfile()
    const pub = usePublicProfile(user?.id)
    const [saving, setSaving] = useState(false)

    const p = pub.data
    const teacher = isTeacher(user?.role ?? "Student")

    const {
        register, handleSubmit, reset, watch,
        formState: { errors, isValid },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onBlur",
    })

    useEffect(() => {
        if (p) {
            reset({
                fullName: p.fullName ?? "",
                department: p.department ?? "",
                designation: p.designation ?? "",
                studentId: p.studentId ?? "",
                phoneNumber: p.phoneNumber ?? "",
                bio: p.bio ?? "",
                linkedInUrl: p.linkedInUrl ?? "",
                gitHubUrl: p.gitHubUrl ?? "",
                twitterUrl: p.twitterUrl ?? "",
                facebookUrl: p.facebookUrl ?? "",
                websiteUrl: p.websiteUrl ?? "",
            })
        }
    }, [p, reset])

    const values = watch()

    const submit = async (data: FormData) => {
        setSaving(true)
        try {
            const payload: UpdateProfileRequest = {
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
            own.updateProfile(payload, {
                onSuccess: (res: any) => {
                    if (res?.success) {
                        toast.success("Profile updated.")
                        navigate("/profile")
                    }
                    setSaving(false)
                },
                onError: () => {
                    toast.error("Failed to update profile.")
                    setSaving(false)
                },
            } as any)
        } catch {
            setSaving(false)
        }
    }

    if (pub.isLoading || !p) {
        return (
            <div className="mx-auto max-w-6xl px-5 py-8 lg:px-8">
                <Skeleton className="mb-6 h-5 w-32" />
                <Skeleton className="mb-4 h-10 w-80" />
                <Skeleton className="mb-8 h-5 w-96" />
                <Skeleton className="h-96 w-full rounded-2xl" />
            </div>
        )
    }

    /* ─── Preview: a minimal profile hero that updates as they type ─── */

    const preview = (
        <LivePreviewPanel caption="This is what others see when they visit your profile.">
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="h-20 bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700" />
                <div className="-mt-10 px-5 pb-5">
                    <div className="flex items-end gap-3">
                        <div className="h-16 w-16 overflow-hidden rounded-2xl border-4 border-card">
                            <Avatar
                                src={p.profilePhotoUrl}
                                name={values.fullName || p.fullName}
                                size="lg"
                                className="h-full w-full rounded-none"
                            />
                        </div>
                    </div>

                    <div className="mt-3">
                        <h3 className="font-display text-[17px] font-bold leading-tight text-foreground">
                            {values.fullName?.trim() || "Your name"}
                        </h3>
                        <span
                            className={
                                "mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider " +
                                (teacher
                                    ? "border border-teal-200 bg-teal-50 text-teal-700"
                                    : "border border-blue-200 bg-blue-50 text-blue-700")
                            }
                        >
                            {teacher ? "Teacher" : "Student"}
                        </span>
                        {teacher && values.designation && (
                            <p className="mt-1.5 text-[12px] font-semibold text-teal-700">
                                {values.designation}
                            </p>
                        )}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-muted-foreground">
                        {values.department && (
                            <span className="inline-flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {values.department}
                            </span>
                        )}
                        {!teacher && values.studentId && (
                            <span className="inline-flex items-center gap-1 font-mono">
                                <Shield className="h-3 w-3" />
                                {values.studentId}
                            </span>
                        )}
                    </div>

                    {values.bio && values.bio.trim().length > 0 && (
                        <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground line-clamp-3">
                            {values.bio}
                        </p>
                    )}
                </div>
            </div>
        </LivePreviewPanel>
    )

    const footer = (
        <>
            <Button
                type="button"
                variant="secondary"
                onClick={() => navigate("/profile")}
                disabled={saving || own.isUpdating}
            >
                Cancel
            </Button>
            <Button
                type="button"
                onClick={handleSubmit(submit)}
                loading={saving || own.isUpdating}
                disabled={!isValid}
            >
                Save changes
            </Button>
        </>
    )

    return (
        <FormPageLayout
            backLabel="Back to profile"
            backTo="/profile"
            title="Edit your profile"
            subtitle="Make yourself discoverable. A complete profile helps students and teachers know who they're working with."
            preview={preview}
            footer={footer}
        >
            <form onSubmit={handleSubmit(submit)} className="space-y-6">
                {/* Avatar panel — uses ProfilePage's existing photo controls.
            Kept as a reminder card here; full avatar management stays on /profile. */}
                <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
                    <Avatar
                        src={p.profilePhotoUrl}
                        name={p.fullName}
                        size="lg"
                    />
                    <div className="min-w-0 flex-1">
                        <p className="font-display text-[14px] font-bold text-foreground">
                            Profile photo
                        </p>
                        <p className="mt-0.5 text-[12px] text-muted-foreground">
                            Manage your photo from the{" "}
                            <button
                                type="button"
                                onClick={() => navigate("/profile")}
                                className="font-semibold text-teal-700 underline-offset-2 hover:underline"
                            >
                                profile page
                            </button>
                            .
                        </p>
                    </div>
                    <Camera className="h-4 w-4 text-muted-foreground" />
                </div>

                <FormSection
                    icon={User}
                    title="Basics"
                    subtitle="Your name and academic details."
                    tone="teal"
                >
                    <FormField
                        {...register("fullName")}
                        label="Full name"
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
                                options={DEPARTMENTS.map(d => ({ value: d, label: d }))}
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
                                label="Designation"
                                placeholder="e.g. Assistant Professor"
                                hint="This appears on your profile and in member lists."
                            />
                        ) : (
                            <FormField
                                {...register("studentId")}
                                label="Student ID"
                                placeholder="e.g. 200109"
                                hint="Used for attendance and marks tracking."
                            />
                        )}
                    </div>

                    <FormField
                        {...register("phoneNumber")}
                        label="Phone number"
                        optional
                        placeholder="+880 1X XX XXX XXX"
                        help="Only visible to coursemates and teachers you share a course with."
                    />
                </FormSection>

                <FormSection
                    icon={MessageSquareQuote}
                    title="Bio"
                    subtitle="A few sentences about yourself, your research, or what you're studying."
                    tone="amber"
                >
                    <div>
                        <label className="mb-1.5 block text-[13px] font-semibold text-foreground">
                            About you
                            <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
                        </label>
                        <textarea
                            {...register("bio")}
                            rows={5}
                            placeholder="Tell others what you teach, research, or hope to learn."
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

                <FormSection
                    icon={Link2}
                    title="Social links"
                    subtitle="Where people can find you online. All optional."
                    tone="stone"
                >
                    <div className="space-y-2.5">
                        {SOCIAL_FIELDS.map(({ key, icon: Icon, placeholder, label }) => (
                            <div key={key} className="flex items-center gap-2">
                                <div
                                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-stone-50 text-stone-600"
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
            </form>
        </FormPageLayout>
    )
}