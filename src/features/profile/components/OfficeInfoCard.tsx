import { MapPin, Clock } from "lucide-react"

interface OfficeInfoCardProps {
    location: string | null | undefined
    hours: string | null | undefined
    className?: string
}

export default function OfficeInfoCard({
    location, hours, className = "",
}: OfficeInfoCardProps) {
    const hasLocation = !!location?.trim()
    const hasHours = !!hours?.trim()
    if (!hasLocation && !hasHours) return null

    return (
        <div className={`rounded-2xl border border-border bg-card p-5 ${className}`}>
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Office
            </h3>
            <dl className="space-y-2.5">
                {hasLocation && (
                    <div className="flex items-start gap-2.5">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" strokeWidth={2} />
                        <div>
                            <dt className="sr-only">Location</dt>
                            <dd className="text-[13px] font-medium text-foreground">{location}</dd>
                        </div>
                    </div>
                )}
                {hasHours && (
                    <div className="flex items-start gap-2.5">
                        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" strokeWidth={2} />
                        <div>
                            <dt className="sr-only">Hours</dt>
                            <dd className="text-[13px] font-medium text-foreground">{hours}</dd>
                        </div>
                    </div>
                )}
            </dl>
        </div>
    )
}