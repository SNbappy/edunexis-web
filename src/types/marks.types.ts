export type FormulaComponentType = 'CT' | 'Assignment' | 'Presentation' | 'Attendance'
export type SelectionRule = 'Best1' | 'Best2' | 'Best3' | 'All'

export interface FormulaComponentRequest {
    componentType: FormulaComponentType
    selectionRule: SelectionRule
    weightPercent: number
    maxMarks: number
}

export interface GradingFormulaRequest {
    totalMarks: number
    components: FormulaComponentRequest[]
}

export interface GradingFormulaComponentDto {
    componentType: FormulaComponentType
    selectionRule: SelectionRule
    weightPercent: number
    maxMarks: number
}

export interface GradingFormulaDto {
    id: string
    totalMarks: number
    components: GradingFormulaComponentDto[]
}

export interface FinalMarkDto {
    studentId: string
    studentName: string
    breakdownJson: string
    finalMark: number
    isPublished: boolean
}

export type MarksDto = FinalMarkDto[]

// Legacy gradebook types (kept for existing components)
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
