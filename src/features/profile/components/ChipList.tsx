import { useState, useRef, type KeyboardEvent } from "react"
import { X, Plus } from "lucide-react"

function csvToList(csv: string | null | undefined): string[] {
    if (!csv) return []
    return csv
        .split(",")
        .map(s => s.trim())
        .filter(Boolean)
}

interface ChipListProps {
    csv: string | null | undefined
    editable?: boolean
    onChange?: (csv: string) => void
    placeholder?: string
    emptyText?: string
    variant?: "teal" | "violet" | "amber"
    className?: string
}

const VARIANT_STYLES = {
    teal: "border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-800/50 dark:bg-teal-950/40 dark:text-teal-300",
    violet: "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-800/50 dark:bg-violet-950/40 dark:text-violet-300",
    amber: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-300",
}

export default function ChipList({
    csv, editable = false, onChange,
    placeholder = "Add and press Enter",
    emptyText = "Nothing added yet.",
    variant = "teal",
    className = "",
}: ChipListProps) {
    const items = csvToList(csv)
    const [input, setInput] = useState("")
    const inputRef = useRef<HTMLInputElement>(null)
    const styles = VARIANT_STYLES[variant]

    const commit = (next: string[]) => {
        onChange?.(next.join(", "))
    }

    const addChip = () => {
        const v = input.trim()
        if (!v) return
        if (items.some(i => i.toLowerCase() === v.toLowerCase())) {
            setInput("")
            return
        }
        commit([...items, v])
        setInput("")
    }

    const removeChip = (idx: number) => {
        commit(items.filter((_, i) => i !== idx))
    }

    const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault()
            addChip()
        } else if (e.key === "Backspace" && !input && items.length > 0) {
            removeChip(items.length - 1)
        }
    }

    if (!editable && items.length === 0) {
        return (
            <p className={"text-[13px] text-muted-foreground " + className}>
                {emptyText}
            </p>
        )
    }

    return (
        <div className={"flex flex-wrap items-center gap-2 " + className}>
            {items.map((item, idx) => (
                <span
                    key={item + "-" + idx}
                    className={"inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-semibold " + styles}
                >
                    {item}
                    {editable && (
                        <button
                            type="button"
                            onClick={() => removeChip(idx)}
                            className="-mr-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full opacity-70 transition-opacity hover:opacity-100"
                            aria-label={"Remove " + item}
                        >
                            <X className="h-3 w-3" />
                        </button>
                    )}
                </span>
            ))}

            {editable && (
                <div className="inline-flex items-center gap-1">
                    <input
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={onKey}
                        onBlur={addChip}
                        placeholder={items.length === 0 ? placeholder : ""}
                        className="h-7 min-w-[120px] rounded-full border border-dashed border-border bg-transparent px-3 text-[12px] font-medium text-foreground outline-none placeholder:text-muted-foreground focus:border-teal-400"
                    />
                    {input.trim() && (
                        <button
                            type="button"
                            onClick={addChip}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-white transition-colors hover:bg-teal-700"
                            aria-label="Add"
                        >
                            <Plus className="h-3 w-3" />
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}