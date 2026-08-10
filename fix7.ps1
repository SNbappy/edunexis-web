$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$path = "src\features\materials\hooks\useMaterials.ts"
$raw = [IO.File]::ReadAllText((Join-Path $PWD $path), [System.Text.Encoding]::UTF8)

$old = "onError: () => toast.error('Upload failed.'),"
$new = @'
onError: (err: any) => {
            console.log('[uploadFile ERROR] response data:', err?.response?.data)
            console.log('[uploadFile ERROR] status:', err?.response?.status)
            toast.error('Upload failed.')
        },
'@
if ($raw.Contains($old)) {
  $raw = $raw.Replace($old, $new)
  [IO.File]::WriteAllText((Join-Path $PWD $path), $raw, $utf8NoBom)
  Write-Host "Added error diagnostic log" -ForegroundColor Green
} else {
  Write-Host "Anchor not found" -ForegroundColor Red
}