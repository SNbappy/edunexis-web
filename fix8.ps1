$utf8NoBom = New-Object System.Text.UTF8Encoding $false

# 1. Fix FileDropzone default + mojibake
$fdPath = "src\components\ui\FileDropzone.tsx"
$fdRaw = [IO.File]::ReadAllText((Join-Path $PWD $fdPath), [System.Text.Encoding]::UTF8)
$fdRaw = $fdRaw.Replace("maxSizeMB = 50,", "maxSizeMB = 10,")
$fdRaw = $fdRaw.Replace("PDF, DOC, PPT, images, videos, archives Â· Max", "PDF, DOC, PPT, images, videos, archives - Max")
[IO.File]::WriteAllText((Join-Path $PWD $fdPath), $fdRaw, $utf8NoBom)
Write-Host "Fixed FileDropzone default (50->10) and mojibake" -ForegroundColor Green

# 2. Explicitly pass maxSizeMB in UploadMaterialModal
$ummPath = "src\features\materials\components\UploadMaterialModal.tsx"
$ummRaw = [IO.File]::ReadAllText((Join-Path $PWD $ummPath), [System.Text.Encoding]::UTF8)
$old = "<FileDropzone onFilesSelected={setFiles} />"
$new = "<FileDropzone onFilesSelected={setFiles} maxSizeMB={10} />"
if ($ummRaw.Contains($old)) {
  $ummRaw = $ummRaw.Replace($old, $new)
  [IO.File]::WriteAllText((Join-Path $PWD $ummPath), $ummRaw, $utf8NoBom)
  Write-Host "Explicitly set maxSizeMB=10 in UploadMaterialModal" -ForegroundColor Green
} else {
  Write-Host "UploadMaterialModal anchor not found" -ForegroundColor Red
}

# 3. Remove diagnostic logs from materialService.ts
$msPath = "src\features\materials\services\materialService.ts"
$msRaw = [IO.File]::ReadAllText((Join-Path $PWD $msPath), [System.Text.Encoding]::UTF8)
$msOld = @'
form.append('file', payload.file)
        console.log('[uploadFile] courseId:', payload.courseId, 'title:', payload.title, 'fileName:', payload.file.name)
'@
$msNew = "form.append('file', payload.file)"
if ($msRaw.Contains($msOld)) {
  $msRaw = $msRaw.Replace($msOld, $msNew)
  [IO.File]::WriteAllText((Join-Path $PWD $msPath), $msRaw, $utf8NoBom)
  Write-Host "Removed diagnostic log from materialService" -ForegroundColor Green
} else {
  Write-Host "materialService diagnostic log not found (may already be clean)" -ForegroundColor DarkGray
}

# 4. Remove diagnostic logs from useMaterials.ts
$umPath = "src\features\materials\hooks\useMaterials.ts"
$umRaw = [IO.File]::ReadAllText((Join-Path $PWD $umPath), [System.Text.Encoding]::UTF8)
$umOld = @'
onError: (err: any) => {
            console.log('[uploadFile ERROR] response data:', err?.response?.data)
            console.log('[uploadFile ERROR] status:', err?.response?.status)
            toast.error('Upload failed.')
        },
'@
$umNew = "onError: () => toast.error('Upload failed.'),"
if ($umRaw.Contains($umOld)) {
  $umRaw = $umRaw.Replace($umOld, $umNew)
  [IO.File]::WriteAllText((Join-Path $PWD $umPath), $umRaw, $utf8NoBom)
  Write-Host "Removed diagnostic log from useMaterials" -ForegroundColor Green
} else {
  Write-Host "useMaterials diagnostic log not found (may already be clean)" -ForegroundColor DarkGray
}

Write-Host "`n=== BUILD ===" -ForegroundColor Cyan
npm run build 2>&1 | Select-String -Pattern "error|built in"