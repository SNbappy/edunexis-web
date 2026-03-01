import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns'

export function formatDate(date: string | Date | null | undefined, fmt = 'dd MMM yyyy'): string {
    if (!date) return '—'
    const d = typeof date === 'string' ? parseISO(date) : date
    return isValid(d) ? format(d, fmt) : '—'
}

export function formatDateTime(date: string | Date | null | undefined): string {
    return formatDate(date, 'dd MMM yyyy, hh:mm a')
}

export function formatRelative(date: string | Date | null | undefined): string {
    if (!date) return '—'
    const d = typeof date === 'string' ? parseISO(date) : date
    return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : '—'
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
    const d = typeof date === 'string' ? parseISO(date) : date
    return format(d, 'EEEE')
}
