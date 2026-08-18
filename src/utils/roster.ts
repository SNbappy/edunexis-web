/**
 * Roster ordering.
 *
 * Every list of students in the app — mark entry, script upload, the
 * not-submitted list — is read against a printed class list, and that list is
 * always in roll order. Ordering by name instead means the teacher scans the
 * whole column for each student. Roll numbers are strings ("200109", "20-CSE-9")
 * but compare numerically, so `numeric: true` keeps 9 before 10.
 */
export interface RosterLike {
    fullName: string
    studentId?: string | null
}

export function byRoll(a: RosterLike, b: RosterLike): number {
    const ra = a.studentId ?? ""
    const rb = b.studentId ?? ""

    /* Someone with no roll number recorded — a teacher, or a student whose
       profile is incomplete — sorts last rather than first, so a missing value
       never pushes the real list down the page. */
    if (ra && !rb) return -1
    if (!ra && rb) return 1

    return ra.localeCompare(rb, undefined, { numeric: true, sensitivity: "base" })
        || a.fullName.localeCompare(b.fullName)
}

/** Non-mutating sort, since query data must never be reordered in place. */
export function sortByRoll<T extends RosterLike>(list: readonly T[]): T[] {
    return [...list].sort(byRoll)
}
