$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$path = "src\features\ct\components\UploadKhataModal.tsx"
$raw = [IO.File]::ReadAllText((Join-Path $PWD $path), [System.Text.Encoding]::UTF8)

# Add a MAX_SIZE constant near the top, after the imports
$oldConst = 'interface Member { userId: string; fullName: string; studentId?: string }'
$newConst = @'
interface Member { userId: string; fullName: string; studentId?: string }

const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB, matches Cloudinary raw-upload cap
'@
if ($raw.Contains($oldConst) -and -not $raw.Contains("MAX_SIZE_BYTES")) {
  $raw = $raw.Replace($oldConst, $newConst)
}

# Add an error message state
$oldState = '  const [students, setStudents] = useState<Partial<Record<KhataSlot["studentKey"], string>>>({})'
$newState = @'
  const [students, setStudents] = useState<Partial<Record<KhataSlot["studentKey"], string>>>({})
  const [sizeError, setSizeError] = useState<string | null>(null)
'@
if ($raw.Contains($oldState) -and -not $raw.Contains("sizeError")) {
  $raw = $raw.Replace($oldState, $newState)
}

# Update setFile to validate size before accepting
$oldSetFile = @'
  const setFile = (key: KhataSlot["fileKey"], file: File | undefined) =>
    setFiles(prev => {
      const n = { ...prev }
      if (file) n[key] = file
      else delete n[key]
      return n
    })
'@
$newSetFile = @'
  const setFile = (key: KhataSlot["fileKey"], file: File | undefined) => {
    if (file && file.size > MAX_SIZE_BYTES) {
      setSizeError(`"${file.name}" is ${(file.size / (1024 * 1024)).toFixed(1)}MB, which exceeds the 10MB limit.`)
      return
    }
    setSizeError(null)
    setFiles(prev => {
      const n = { ...prev }
      if (file) n[key] = file
      else delete n[key]
      return n
    })
  }
'@
if ($raw.Contains($oldSetFile)) {
  $raw = $raw.Replace($oldSetFile, $newSetFile)
  Write-Host "Patched setFile with size validation" -ForegroundColor Green
} else {
  Write-Host "setFile anchor not found" -ForegroundColor Red
}

# Reset sizeError on modal close
$oldClose = '  const handleClose = () => { setFiles({}); setStudents({}); onClose() }'
$newClose = '  const handleClose = () => { setFiles({}); setStudents({}); setSizeError(null); onClose() }'
if ($raw.Contains($oldClose)) {
  $raw = $raw.Replace($oldClose, $newClose)
}

# Show the error + update the accepted-types hint text to mention 10MB
$oldHint = @'
        <p className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-[11.5px] text-muted-foreground">
          Accepted: PDF, JPG, PNG, DOC, DOCX. All 3 files required before entering marks.
        </p>
'@
$newHint = @'
        {sizeError && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[11.5px] font-semibold text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
            {sizeError}
          </p>
        )}

        <p className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-[11.5px] text-muted-foreground">
          Accepted: PDF, JPG, PNG, DOC, DOCX. Max 10MB each. All 3 files required before entering marks.
        </p>
'@
if ($raw.Contains($oldHint)) {
  $raw = $raw.Replace($oldHint, $newHint)
  Write-Host "Added size error display + updated hint text" -ForegroundColor Green
} else {
  Write-Host "Hint text anchor not found" -ForegroundColor Red
}

[IO.File]::WriteAllText((Join-Path $PWD $path), $raw, $utf8NoBom)

npm run build 2>&1 | Select-String -Pattern "error|built in"