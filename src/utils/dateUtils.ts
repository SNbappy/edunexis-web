import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns'

// Force UTC by appending Z if not present
function parseUTC(date: string | Date): Date {
    if (date instanceof Date) return date
    const s = date.endsWith('Z') || date.includes('+') ? date : date + 'Z'
    return parseISO(s)
}

export function formatDate(date: string | Date | null | undefined, fmt = 'dd MMM yyyy'): string {
    if (!date) return '-'
    const d = parseUTC(date)
    return isValid(d) ? format(d, fmt) : '-'
}

export function formatDateTime(date: string | Date | null | undefined): string {
    return formatDate(date, 'dd MMM yyyy, hh:mm a')
}

export function formatRelative(date: string | Date | null | undefined): string {
    if (!date) return '-'
    const d = parseUTC(date)
    return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : '-'
}

export function formatShortDate(date: string | Date | null | undefined): string {
    return formatDate(date, 'dd MMM')
}

export function formatMonthYear(date: string | Date | null | undefined): string {
    return formatDate(date, 'MMMM yyyy')
}

export function todayISO(): string {
    return format(new Date(), 'yyyy-MM-dd')
}

export function formatInputDate(date: string | Date | null | undefined): string {
    return formatDate(date, 'yyyy-MM-dd')
}

export function getDayName(date: string | Date): string {
    const d = parseUTC(date)
    return format(d, 'EEEE')
}
