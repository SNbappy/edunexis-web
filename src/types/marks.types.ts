export interface GradebookRowDto {
    studentId: string
    studentName: string
    studentEmail: string
    studentPhoto?: string
    rollNumber?: string
    assignments: { id: string; title: string; obtainedMarks: number | null; totalMarks: number; submitted: boolean }[]
    ctEvents: { id: string; title: string; obtainedMarks: number | null; totalMarks: number; isAbsent: boolean }[]
    presentations: { id: string; title: string; obtainedMarks: number | null; totalMarks: number; isAbsent: boolean }[]
    totalObtained: number
    totalPossible: number
    percentage: number
    grade: string
    attendancePercent: number
}

export interface GradebookSummaryDto {
    totalStudents: number
    averagePercentage: number
    highestPercentage: number
    lowestPercentage: number
    gradeDistribution: { grade: string; count: number; color: string }[]
    columnTotals: {
        assignments: { id: string; title: string; totalMarks: number; average: number }[]
        ctEvents: { id: string; title: string; totalMarks: number; average: number }[]
        presentations: { id: string; title: string; totalMarks: number; average: number }[]
    }
}

export interface GradebookDto {
    rows: GradebookRowDto[]
    summary: GradebookSummaryDto
}

export interface MyGradeDto {
    assignments: { id: string; title: string; obtainedMarks: number | null; totalMarks: number; status: string }[]
    ctEvents: { id: string; title: string; obtainedMarks: number | null; totalMarks: number; isAbsent: boolean; date: string }[]
    presentations: { id: string; title: string; obtainedMarks: number | null; totalMarks: number; isAbsent: boolean; date: string }[]
    totalObtained: number
    totalPossible: number
    percentage: number
    grade: string
    attendancePercent: number
    rank?: number
    totalStudents?: number
}
