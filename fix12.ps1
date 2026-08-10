$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$path = "src\features\ct\components\UploadKhataModal.tsx"
$raw = [IO.File]::ReadAllText((Join-Path $PWD $path), [System.Text.Encoding]::UTF8)

# 1. Add a ref for the scrollable content div
$oldImport = 'import { useState, useRef } from "react"'
if (-not $raw.Contains($oldImport)) { Write-Host "Import line not found - checking alt form" -ForegroundColor Yellow }

# 2. Add a contentRef alongside the existing file input refs
$oldRefs = @'
  const refs = {
    bestCopy: useRef<HTMLInputElement>(null),
    worstCopy: useRef<HTMLInputElement>(null),
    avgCopy: useRef<HTMLInputElement>(null),
  }
'@
$newRefs = @'
  const refs = {
    bestCopy: useRef<HTMLInputElement>(null),
    worstCopy: useRef<HTMLInputElement>(null),
    avgCopy: useRef<HTMLInputElement>(null),
  }
  const contentRef = useRef<HTMLDivElement>(null)
'@
if ($raw.Contains($oldRefs) -and -not $raw.Contains("contentRef")) {
  $raw = $raw.Replace($oldRefs, $newRefs)
  Write-Host "Added contentRef" -ForegroundColor Green
} else {
  Write-Host "refs block anchor not found or already patched" -ForegroundColor Yellow
}

# 3. Update setFile to scroll to top when error is set
$oldSetFile = @'
  const setFile = (key: KhataSlot["fileKey"], file: File | undefined) => {
    if (file && file.size > MAX_SIZE_BYTES) {
      setSizeError(`"${file.name}" is ${(file.size / (1024 * 1024)).toFixed(1)}MB, which exceeds the 10MB limit.`)
      return
    }
    setSizeError(null)
'@
$newSetFile = @'
  const setFile = (key: KhataSlot["fileKey"], file: File | undefined) => {
    if (file && file.size > MAX_SIZE_BYTES) {
      setSizeError(`"${file.name}" is ${(file.size / (1024 * 1024)).toFixed(1)}MB, which exceeds the 10MB limit.`)
      contentRef.current?.scrollTo({ top: 0, behavior: "smooth" })
      return
    }
    setSizeError(null)
'@
if ($raw.Contains($oldSetFile)) {
  $raw = $raw.Replace($oldSetFile, $newSetFile)
  Write-Host "Patched setFile to auto-scroll on error" -ForegroundColor Green
} else {
  Write-Host "setFile anchor not found" -ForegroundColor Red
}

[IO.File]::WriteAllText((Join-Path $PWD $path), $raw, $utf8NoBom)

Write-Host "`n=== VERIFY ===" -ForegroundColor Cyan
Select-String -Path $path -Pattern "contentRef" | Select-Object LineNumber, Line

npm run build 2>&1 | Select-String -Pattern "error|built in"