import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns'

export function formatDate(date: string | Date): string {
    return format(new Date(date), 'MMM dd, yyyy')
}
export function formatDateTime(date: string | Date): string {
    return format(new Date(date), 'MMM dd, yyyy · hh:mm a')
}
export function formatRelative(date: string | Date): string {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
}
export function formatDeadline(date: string | Date): string {
    const d = new Date(date)
    if (isPast(d)) return `Closed · ${format(d, 'MMM dd, yyyy')}`
    if (isToday(d)) return `Due Today · ${format(d, 'hh:mm a')}`
    if (isTomorrow(d)) return `Due Tomorrow · ${format(d, 'hh:mm a')}`
    return `Due ${format(d, 'MMM dd, yyyy')}`
}
export function isDeadlinePassed(date: string | Date): boolean {
    return isPast(new Date(date))
}
export function formatDateOnly(date: string): string {
    return format(new Date(date), 'EEEE, MMM dd, yyyy')
}
