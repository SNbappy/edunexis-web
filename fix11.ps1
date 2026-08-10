$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$path = "src\features\ct\components\UploadKhataModal.tsx"
$raw = [IO.File]::ReadAllText((Join-Path $PWD $path), [System.Text.Encoding]::UTF8)
$nl = if ($raw.Contains("`r`n")) { "`r`n" } else { "`n" }
$lines = [System.Collections.Generic.List[string]]::new()
$lines.AddRange([string[]]($raw -split "`r?`n"))

# Remove the sizeError block from its current location (lines 273-277, 0-indexed 272-276)
Write-Host "Removing old block at lines 273-277:" -ForegroundColor Yellow
for ($i = 272; $i -le 276; $i++) { Write-Host "  $($i+1): [$($lines[$i])]" }

$lines.RemoveRange(272, 5)  # removes the {sizeError && ( ... )} block + trailing blank line

# Find the "<div className="space-y-3">" opening line (the modal's content wrapper) to insert error right after it
$insertIdx = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
  if ($lines[$i] -match '<div className="space-y-3">') { $insertIdx = $i; break }
}
if ($insertIdx -lt 0) { Write-Host "Content wrapper not found" -ForegroundColor Red; return }

$errorBlock = @(
  '        {sizeError && ('
  '          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[11.5px] font-semibold text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">'
  '            {sizeError}'
  '          </p>'
  '        )}'
)
for ($j = $errorBlock.Count - 1; $j -ge 0; $j--) {
  $lines.Insert($insertIdx + 1, $errorBlock[$j])
}

[IO.File]::WriteAllText((Join-Path $PWD $path), ($lines -join $nl), $utf8NoBom)
Write-Host "`nMoved sizeError to top of modal content" -ForegroundColor Green

Write-Host "`n=== VERIFY ===" -ForegroundColor Cyan
Select-String -Path $path -Pattern "sizeError|space-y-3" | Select-Object LineNumber, Line

npm run build 2>&1 | Select-String -Pattern "error|built in"