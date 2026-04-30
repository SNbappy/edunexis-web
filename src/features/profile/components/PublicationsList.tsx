import { AnimatePresence } from "framer-motion"
import { FileText, Plus } from "lucide-react"
import type { UserPublicationDto } from "@/types/auth.types"
import PublicationItem from "./PublicationItem"

interface PublicationsListProps {
    publications: UserPublicationDto[]
    editable?: boolean
    onAdd?: () => void
    onEdit?: (p: UserPublicationDto) => void
    onDelete?: (id: string) => void
}

export default function PublicationsList({
    publications, editable = false, onAdd, onEdit, onDelete,
}: PublicationsListProps) {
    if (publications.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-10 text-center">
                <FileText className="mx-auto h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
                <p className="mt-3 text-[13px] font-semibold text-foreground">
                    No publications added yet
                </p>
                {editable ? (
                    <button
                        type="button"
                        onClick={onAdd}
                        className="mt-2 text-[12px] font-bold text-teal-700 hover:underline dark:text-teal-400"
                    >
                        Add your first publication
                    </button>
                ) : (
                    <p className="mt-1 text-[12px] text-muted-foreground">
                        Publications will appear here once added.
                    </p>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-2">
            <AnimatePresence>
                {publications.map(p => (
                    <PublicationItem
                        key={p.id}
                        publication={p}
                        editable={editable}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </AnimatePresence>

            {editable && (
                <button
                    type="button"
                    onClick={onAdd}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-[12px] font-bold text-teal-700 transition-colors hover:bg-teal-100 dark:border-teal-800/50 dark:bg-teal-950/40 dark:text-teal-300 dark:hover:bg-teal-950/60"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Add publication
                </button>
            )}
        </div>
    )
}