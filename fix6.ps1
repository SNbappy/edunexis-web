$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$path = "src\features\materials\services\materialService.ts"
$raw = [IO.File]::ReadAllText((Join-Path $PWD $path), [System.Text.Encoding]::UTF8)

$old = "form.append('file', payload.file)"
$new = @'
form.append('file', payload.file)
        console.log('[uploadFile] courseId:', payload.courseId, 'title:', payload.title, 'fileName:', payload.file.name)
'@
if ($raw.Contains($old)) {
  $raw = $raw.Replace($old, $new)
  [IO.File]::WriteAllText((Join-Path $PWD $path), $raw, $utf8NoBom)
  Write-Host "Added diagnostic log" -ForegroundColor Green
} else {
  Write-Host "Anchor not found" -ForegroundColor Red
}