import type { PublicProfileDto, UserPublicationDto } from "@/types/auth.types"
import ChipList from "./ChipList"
import PublicationsList from "./PublicationsList"

interface ResearchTabProps {
    profile: PublicProfileDto
    isSelf: boolean
    /** edit handlers (self only) */
    onChangeResearchInterests?: (csv: string) => void
    onChangeFieldsOfWork?: (csv: string) => void
    onAddPublication?: () => void
    onEditPublication?: (p: UserPublicationDto) => void
    onDeletePublication?: (id: string) => void
}

export default function ResearchTab({
    profile: p, isSelf,
    onChangeResearchInterests, onChangeFieldsOfWork,
    onAddPublication, onEditPublication, onDeletePublication,
}: ResearchTabProps) {
    return (
        <div className="space-y-6">
            <section className="rounded-2xl border border-border bg-card shadow-sm ring-1 ring-stone-200/50 dark:ring-white/5 p-6">
                <h2 className="mb-4 font-display text-[15px] font-bold text-foreground">
                    Research interests
                </h2>
                <ChipList
                    csv={p.researchInterestsCsv}
                    variant="teal"
                    editable={isSelf}
                    onChange={onChangeResearchInterests}
                    placeholder="e.g. Machine learning"
                    emptyText={isSelf ? "Add the topics you study or care about." : "No research interests added yet."}
                />
            </section>

            <section className="rounded-2xl border border-border bg-card shadow-sm ring-1 ring-stone-200/50 dark:ring-white/5 p-6">
                <h2 className="mb-4 font-display text-[15px] font-bold text-foreground">
                    Fields of work
                </h2>
                <ChipList
                    csv={p.fieldsOfWorkCsv}
                    variant="violet"
                    editable={isSelf}
                    onChange={onChangeFieldsOfWork}
                    placeholder="e.g. Computer Vision"
                    emptyText={isSelf ? "Add the broader fields you work in." : "No fields added yet."}
                />
            </section>

            <section className="rounded-2xl border border-border bg-card shadow-sm ring-1 ring-stone-200/50 dark:ring-white/5 p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-display text-[15px] font-bold text-foreground">
                        Publications
                    </h2>
                    {p.publications.length > 0 && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                            {p.publications.length}
                        </span>
                    )}
                </div>
                <PublicationsList
                    publications={p.publications}
                    editable={isSelf}
                    onAdd={onAddPublication}
                    onEdit={onEditPublication}
                    onDelete={onDeletePublication}
                />
            </section>
        </div>
    )
}