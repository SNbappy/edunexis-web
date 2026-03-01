export type FormulaComponentType = 'BestCTs' | 'AllAssignments' | 'BestPresentation' | 'Attendance'

export interface FormulaComponentRequest {
    componentType: FormulaComponentType
    selectionRule: string
    weightPercent: number
    maxMarks: number
}

export interface SaveGradingFormulaRequest {
    totalMarks: number
    components: FormulaComponentRequest[]
}

export interface FinalMarksDto {
    studentId: string
    studentName: string
    breakdownJson: string
    finalMark: number
    isPublished: boolean
    publishedAt: string | null
}
