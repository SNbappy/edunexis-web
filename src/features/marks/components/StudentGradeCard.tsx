import { FileText, ClipboardList, Mic, CalendarDays } from "lucide-react"
import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import { cn } from '@/utils/cn'
import type { GradebookRowDto, GradebookDto } from '@/types/marks.types'

interface Props { gradebook: GradebookDto }

type SortField = 'name' | 'percentage' | 'attendance'
type SortDir = 'asc' | 'desc'

function GradeBadge({ grade }: { grade: string }) {
    const map: Record<string, 'success' | 'default' | 'warning' | 'danger' | 'muted'> = {
        'A+': 'success', 'A': 'success', 'A-': 'success',
        'B+': 'default', 'B': 'default', 'B-': 'default',
        'C+': 'warning', 'C': 'warning',
        'D': 'danger', 'F': 'danger',
    }
    return <Badge variant={map[grade] ?? 'muted'}>{grade}</Badge>
}

function MarkCell({ obtained, total, isAbsent }: { obtained: number | null; total: number; isAbsent?: boolean }) {
    if (isAbsent) return <span className="text-xs text-destructive font-medium">ABS</span>
    if (obtained === null) return <span className="text-xs text-muted-foreground">—</span>
    const pct = (obtained / total) * 100
    return (
        <span className={cn(
            'text-xs font-semibold tabular-nums',
            pct >= 80 ? 'text-emerald-500' : pct >= 60 ? 'text-blue-500' : pct >= 40 ? 'text-amber-500' : 'text-destructive'
        )}>
            {obtained}/{total}
        </span>
    )
}

function SortIcon({ field, active, dir }: { field: string; active: boolean; dir: SortDir }) {
    if (!active) return <ChevronsUpDown className="w-3 h-3 text-muted-foreground" />
    return dir === 'asc'
        ? <ChevronUp className="w-3 h-3 text-primary" />
        : <ChevronDown className="w-3 h-3 text-primary" />
}

export default function GradebookTable({ gradebook }: Props) {
    const { rows, summary } = gradebook
    const [search, setSearch] = useState('')
    const [sortField, setSortField] = useState<SortField>('percentage')
    const [sortDir, setSortDir] = useState<SortDir>('desc')

    const toggleSort = (field: SortField) => {
        if (sortField === field) setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
        else { setSortField(field); setSortDir('desc') }
    }

    const sorted = useMemo(() => {
        const filtered = rows.filter((r) =>
            r.studentName.toLowerCase().includes(search.toLowerCase()) ||
            r.studentEmail.toLowerCase().includes(search.toLowerCase()) ||
            (r.rollNumber ?? '').toLowerCase().includes(search.toLowerCase())
        )
        return filtered.sort((a, b) => {
            let cmp = 0
            if (sortField === 'name') cmp = a.studentName.localeCompare(b.studentName)
            else if (sortField === 'percentage') cmp = a.percentage - b.percentage
            else if (sortField === 'attendance') cmp = a.attendancePercent - b.attendancePercent
            return sortDir === 'asc' ? cmp : -cmp
        })
    }, [rows, search, sortField, sortDir])

    const allAssignments = summary.columnTotals.assignments
    const allCTs = summary.columnTotals.ctEvents
    const allPresentations = summary.columnTotals.presentations

    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search students by name, email or roll..."
                    className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
            </div>

            {/* Table wrapper */}
            <div className="glass-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        {/* Header */}
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                {/* Fixed: Student */}
                                <th className="sticky left-0 bg-muted/80 backdrop-blur-sm z-10 text-left px-4 py-3 font-semibold text-foreground min-w-[200px]">
                                    <button className="flex items-center gap-1.5 hover:text-primary transition-colors" onClick={() => toggleSort('name')}>
                                        Student <SortIcon field="name" active={sortField === 'name'} dir={sortDir} />
                                    </button>
                                </th>

                                {/* Assignments */}
                                {allAssignments.map((a) => (
                                    <th key={a.id} className="text-center px-3 py-3 font-medium text-muted-foreground min-w-[80px] whitespace-nowrap" title={a.title}>
                                        <FileText className="mx-auto h-3.5 w-3.5 text-muted-foreground" />
                                        <div className="text-xs truncate max-w-[72px]">{a.title.split(' ').slice(0, 2).join(' ')}</div>
                                        <div className="text-xs text-muted-foreground/70">/{a.totalMarks}</div>
                                    </th>
                                ))}

                                {/* CTs */}
                                {allCTs.map((ct) => (
                                    <th key={ct.id} className="text-center px-3 py-3 font-medium text-muted-foreground min-w-[80px] whitespace-nowrap" title={ct.title}>
                                        <ClipboardList className="mx-auto h-3.5 w-3.5 text-muted-foreground" />
                                        <div className="text-xs truncate max-w-[72px]">{ct.title.split(' ').slice(0, 2).join(' ')}</div>
                                        <div className="text-xs text-muted-foreground/70">/{ct.totalMarks}</div>
                                    </th>
                                ))}

                                {/* Presentations */}
                                {allPresentations.map((p) => (
                                    <th key={p.id} className="text-center px-3 py-3 font-medium text-muted-foreground min-w-[80px] whitespace-nowrap" title={p.title}>
                                        <Mic className="mx-auto h-3.5 w-3.5 text-muted-foreground" />
                                        <div className="text-xs truncate max-w-[72px]">{p.title.split(' ').slice(0, 2).join(' ')}</div>
                                        <div className="text-xs text-muted-foreground/70">/{p.totalMarks}</div>
                                    </th>
                                ))}

                                {/* Attendance */}
                                <th className="text-center px-3 py-3 font-medium text-muted-foreground min-w-[90px]">
                                    <button className="flex items-center gap-1.5 mx-auto hover:text-primary transition-colors" onClick={() => toggleSort('attendance')}>
                                        <CalendarDays className="h-3.5 w-3.5" /><span className="text-xs">Att.</span>
                                        <SortIcon field="attendance" active={sortField === 'attendance'} dir={sortDir} />
                                    </button>
                                </th>

                                {/* Total */}
                                <th className="text-center px-3 py-3 font-semibold text-foreground min-w-[90px]">
                                    <button className="flex items-center gap-1.5 mx-auto hover:text-primary transition-colors" onClick={() => toggleSort('percentage')}>
                                        <span className="text-xs">Total %</span>
                                        <SortIcon field="percentage" active={sortField === 'percentage'} dir={sortDir} />
                                    </button>
                                </th>

                                {/* Grade */}
                                <th className="text-center px-4 py-3 font-semibold text-foreground min-w-[70px]">Grade</th>
                            </tr>

                            {/* Column averages row */}
                            <tr className="border-b border-border bg-primary/5">
                                <td className="sticky left-0 bg-primary/5 backdrop-blur-sm z-10 px-4 py-2 text-xs font-semibold text-primary">
                                    Class Avg.
                                </td>
                                {allAssignments.map((a) => (
                                    <td key={a.id} className="text-center px-3 py-2 text-xs text-muted-foreground">
                                        {a.average > 0 ? a.average.toFixed(1) : '—'}
                                    </td>
                                ))}
                                {allCTs.map((ct) => (
                                    <td key={ct.id} className="text-center px-3 py-2 text-xs text-muted-foreground">
                                        {ct.average > 0 ? ct.average.toFixed(1) : '—'}
                                    </td>
                                ))}
                                {allPresentations.map((p) => (
                                    <td key={p.id} className="text-center px-3 py-2 text-xs text-muted-foreground">
                                        {p.average > 0 ? p.average.toFixed(1) : '—'}
                                    </td>
                                ))}
                                <td className="text-center px-3 py-2 text-xs font-semibold text-primary">
                                    {summary.averagePercentage.toFixed(1)}%
                                </td>
                                <td className="text-center px-3 py-2 text-xs font-semibold text-primary">
                                    {summary.averagePercentage.toFixed(1)}%
                                </td>
                                <td />
                            </tr>
                        </thead>

                        {/* Body */}
                        <tbody className="divide-y divide-border">
                            {sorted.map((row, i) => (
                                <motion.tr
                                    key={row.studentId}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.02 }}
                                    className="hover:bg-muted/30 transition-colors"
                                >
                                    {/* Student info */}
                                    <td className="sticky left-0 bg-card hover:bg-muted/30 backdrop-blur-sm z-10 px-4 py-3">
                                        <div className="flex items-center gap-2.5">
                                            <Avatar src={row.studentPhoto} name={row.studentName} size="sm" />
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate max-w-[140px]">{row.studentName}</p>
                                                {row.rollNumber && (
                                                    <p className="text-xs text-muted-foreground font-mono">{row.rollNumber}</p>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Assignment marks */}
                                    {allAssignments.map((a) => {
                                        const found = row.assignments.find((x) => x.id === a.id)
                                        return (
                                            <td key={a.id} className="text-center px-3 py-3">
                                                {found
                                                    ? <MarkCell obtained={found.obtainedMarks} total={found.totalMarks} />
                                                    : <span className="text-xs text-muted-foreground/50">—</span>}
                                            </td>
                                        )
                                    })}

                                    {/* CT marks */}
                                    {allCTs.map((ct) => {
                                        const found = row.ctEvents.find((x) => x.id === ct.id)
                                        return (
                                            <td key={ct.id} className="text-center px-3 py-3">
                                                {found
                                                    ? <MarkCell obtained={found.obtainedMarks} total={found.totalMarks} isAbsent={found.isAbsent} />
                                                    : <span className="text-xs text-muted-foreground/50">—</span>}
                                            </td>
                                        )
                                    })}

                                    {/* Presentation marks */}
                                    {allPresentations.map((p) => {
                                        const found = row.presentations.find((x) => x.id === p.id)
                                        return (
                                            <td key={p.id} className="text-center px-3 py-3">
                                                {found
                                                    ? <MarkCell obtained={found.obtainedMarks} total={found.totalMarks} isAbsent={found.isAbsent} />
                                                    : <span className="text-xs text-muted-foreground/50">—</span>}
                                            </td>
                                        )
                                    })}

                                    {/* Attendance */}
                                    <td className="text-center px-3 py-3">
                                        <span className={cn(
                                            'text-xs font-semibold',
                                            row.attendancePercent >= 75 ? 'text-emerald-500' :
                                                row.attendancePercent >= 60 ? 'text-amber-500' : 'text-destructive'
                                        )}>
                                            {row.attendancePercent.toFixed(0)}%
                                        </span>
                                    </td>

                                    {/* Total % */}
                                    <td className="text-center px-3 py-3">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className={cn(
                                                'text-sm font-bold tabular-nums',
                                                row.percentage >= 80 ? 'text-emerald-500' :
                                                    row.percentage >= 70 ? 'text-blue-500' :
                                                        row.percentage >= 60 ? 'text-amber-500' : 'text-destructive'
                                            )}>
                                                {row.percentage.toFixed(1)}%
                                            </span>
                                            <span className="text-xs text-muted-foreground tabular-nums">
                                                {row.totalObtained}/{row.totalPossible}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Grade */}
                                    <td className="text-center px-4 py-3">
                                        <GradeBadge grade={row.grade} />
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {sorted.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground text-sm">
                        No students found matching your search.
                    </div>
                )}
            </div>

            <p className="text-xs text-muted-foreground text-right">
                Showing {sorted.length} of {rows.length} students
            </p>
        </div>
    )
}
