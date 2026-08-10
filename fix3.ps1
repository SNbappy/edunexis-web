$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$modalPath = "src\features\ct\components\UploadKhataModal.tsx"
$raw = [IO.File]::ReadAllText((Join-Path $PWD $modalPath), [System.Text.Encoding]::UTF8)
$nl = if ($raw.Contains("`r`n")) { "`r`n" } else { "`n" }
$lines = [System.Collections.Generic.List[string]]::new()
$lines.AddRange([string[]]($raw -split "`r?`n"))

Write-Host "Line 127 before: [$($lines[126])]" -ForegroundColor Yellow

# Replace line 127 entirely (0-indexed 126) with a clean version
$lines[126] = '      title={"Upload scripts - CT " + ct.ctNumber}'

Write-Host "Line 127 after:  [$($lines[126])]" -ForegroundColor Green

[IO.File]::WriteAllText((Join-Path $PWD $modalPath), ($lines -join $nl), $utf8NoBom)

Write-Host "`n=== Also fix any other mojibake by line search (regex on unicode ranges) ===" -ForegroundColor Cyan
$raw2 = [IO.File]::ReadAllText((Join-Path $PWD $modalPath), [System.Text.Encoding]::UTF8)
# Match the mojibake pattern generically: sequences of 'â', '€', and one more char
$raw2 = [regex]::Replace($raw2, "â€.", "...")
[IO.File]::WriteAllText((Join-Path $PWD $modalPath), $raw2, $utf8NoBom)

Write-Host "`n=== VERIFY ===" -ForegroundColor Cyan
Select-String -Path $modalPath -Pattern "Upload scripts|Select student|Â" | Select-Object LineNumber, Line