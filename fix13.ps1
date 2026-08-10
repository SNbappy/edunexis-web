$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$path = "src\features\ct\components\UploadKhataModal.tsx"
$raw = [IO.File]::ReadAllText((Join-Path $PWD $path), [System.Text.Encoding]::UTF8)

# Remove the failed contentRef plumbing (harmless leftover, clean it up)
$raw = $raw.Replace('  const contentRef = useRef<HTMLDivElement>(null)' + "`r`n", '')
$raw = $raw.Replace('      contentRef.current?.scrollTo({ top: 0, behavior: "smooth" })' + "`r`n", '')

# Make the sizeError box sticky at the top of the scrollable modal body
$old = @'
        {sizeError && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[11.5px] font-semibold text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
            {sizeError}
          </p>
        )}
'@
$new = @'
        {sizeError && (
          <p className="sticky top-0 z-10 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[11.5px] font-semibold text-red-700 shadow-md dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
            {sizeError}
          </p>
        )}
'@
if ($raw.Contains($old)) {
  $raw = $raw.Replace($old, $new)
  Write-Host "Made sizeError sticky" -ForegroundColor Green
} else {
  Write-Host "sizeError block not found for sticky patch" -ForegroundColor Red
}

[IO.File]::WriteAllText((Join-Path $PWD $path), $raw, $utf8NoBom)

Write-Host "`n=== VERIFY ===" -ForegroundColor Cyan
Select-String -Path $path -Pattern "sticky|contentRef" | Select-Object LineNumber, Line

npm run build 2>&1 | Select-String -Pattern "error|built in"