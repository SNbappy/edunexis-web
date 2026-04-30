import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Modal from "@/components/ui/Modal"
import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"
import type { UserPublicationDto, PublicationType } from "@/types/auth.types"
import type { PublicationRequest } from "../services/profileService"

const TYPES: PublicationType[] = [
    "Journal", "Conference", "Thesis", "Workshop", "BookChapter", "Other",
]

const TYPE_LABEL: Record<PublicationType, string> = {
    Journal: "Journal article",
    Conference: "Conference paper",
    Thesis: "Thesis / dissertation",
    Workshop: "Workshop paper",
    BookChapter: "Book chapter",
    Other: "Other",
}

const schema = z.object({
    type: z.enum(["Journal", "Conference", "Thesis", "Workshop", "BookChapter", "Other"]),
    title: z.string().min(2, "Title is required").max(300),
    authors: z.string().min(2, "Authors are required").max(500),
    venue: z.string().max(300).optional().or(z.literal("")),
    year: z.coerce.number()
        .int()
        .min(1900, "Invalid year")
        .max(new Date().getFullYear() + 1, "Invalid year"),
    url: z.string().url("Enter a valid URL").optional().or(z.literal("")),
})

type FormData = z.infer<typeof schema>

interface PublicationModalProps {
    isOpen: boolean
    onClose: () => void
    initial?: UserPublicationDto | null
    onSubmit: (data: PublicationRequest) => void
    isLoading?: boolean
}

export default function PublicationModal({
    isOpen, onClose, initial, onSubmit, isLoading,
}: PublicationModalProps) {
    const isEdit = !!initial
    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            type: initial?.type ?? "Journal",
            title: initial?.title ?? "",
            authors: initial?.authors ?? "",
            venue: initial?.venue ?? "",
            year: initial?.year ?? new Date().getFullYear(),
            url: initial?.url ?? "",
        },
    })

    useEffect(() => {
        if (isOpen) {
            reset({
                type: initial?.type ?? "Journal",
                title: initial?.title ?? "",
                authors: initial?.authors ?? "",
                venue: initial?.venue ?? "",
                year: initial?.year ?? new Date().getFullYear(),
                url: initial?.url ?? "",
            })
        }
    }, [isOpen, initial, reset])

    const submit = (data: FormData) => {
        onSubmit({
            type: data.type,
            title: data.title.trim(),
            authors: data.authors.trim(),
            venue: data.venue?.trim() || undefined,
            year: data.year,
            url: data.url?.trim() || undefined,
        })
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? "Edit publication" : "Add publication"}
            size="md"
        >
            <form onSubmit={handleSubmit(submit)} className="space-y-4">
                {/* Type */}
                <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-foreground">
                        Type <span className="text-red-500">*</span>
                    </label>
                    <select
                        {...register("type")}
                        className="h-10 w-full rounded-xl border border-border bg-card px-3 text-[13px] text-foreground outline-none transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    >
                        {TYPES.map(t => (
                            <option key={t} value={t}>{TYPE_LABEL[t]}</option>
                        ))}
                    </select>
                </div>

                <Input
                    {...register("title")}
                    label="Title"
                    placeholder="Title of the paper or work"
                    error={errors.title?.message}
                    required
                />

                <Input
                    {...register("authors")}
                    label="Authors"
                    placeholder="Last, First; Last, First; ..."
                    hint="Separate authors with commas or semicolons"
                    error={errors.authors?.message}
                    required
                />

                <Input
                    {...register("venue")}
                    label="Venue"
                    placeholder="Journal, conference, or publisher"
                    error={errors.venue?.message}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                        {...register("year", { valueAsNumber: true })}
                        type="number"
                        label="Year"
                        placeholder={String(new Date().getFullYear())}
                        error={errors.year?.message}
                        required
                    />
                    <Input
                        {...register("url")}
                        label="Link"
                        placeholder="https://doi.org/..."
                        error={errors.url?.message}
                    />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" loading={isLoading}>
                        {isEdit ? "Save changes" : "Add publication"}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}