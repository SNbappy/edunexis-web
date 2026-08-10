$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$path = "src\features\ct\components\UploadKhataModal.tsx"
$raw = [IO.File]::ReadAllText((Join-Path $PWD $path), [System.Text.Encoding]::UTF8)
$nl = if ($raw.Contains("`r`n")) { "`r`n" } else { "`n" }
$lines = [System.Collections.Generic.List[string]]::new()
$lines.AddRange([string[]]($raw -split "`r?`n"))

Write-Host "Line 273 before: [$($lines[272])]" -ForegroundColor Yellow
Write-Host "Line 274 before: [$($lines[273])]" -ForegroundColor Yellow

# Replace line 273 (the opening <p>) with sizeError block + updated <p>
$replacement = @(
  '        {sizeError && ('
  '          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[11.5px] font-semibold text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">'
  '            {sizeError}'
  '          </p>'
  '        )}'
  ''
  '        <p className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-[11.5px] text-muted-foreground">'
)
# line 274 becomes the new hint text (0-indexed 273)
$lines[273] = '          Accepted: PDF, JPG, PNG, DOC, DOCX. Max 10MB each. All 3 files required before entering marks.'

# Remove old line 273 (0-indexed 272) and insert replacement block in its place
$lines.RemoveAt(272)
for ($j = $replacement.Count - 1; $j -ge 0; $j--) {
  $lines.Insert(272, $replacement[$j])
}

[IO.File]::WriteAllText((Join-Path $PWD $path), ($lines -join $nl), $utf8NoBom)
Write-Host "Patched" -ForegroundColor Green

Write-Host "`n=== VERIFY ===" -ForegroundColor Cyan
Select-String -Path $path -Pattern "sizeError|Accepted:|Â" | Select-Object LineNumber, Line

npm run build 2>&1 | Select-String -Pattern "error|built in"