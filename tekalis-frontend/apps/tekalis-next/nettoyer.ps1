$path = ".\components", ".\store", ".\app"
$files = Get-ChildItem -Path $path -Recurse -Filter *.jsx
$files += Get-ChildItem -Path ".\store" -Recurse -Filter *.js

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Nettoyage des préfixes incorrects ../@/
    $newContent = $content -replace "\.\./@/", "@/"
    
    # Correction des anciens chemins vers le store local
    $newContent = $newContent -replace "\.\./\.\./\.\./\.\./packages/shared/redux/slices/", "@/store/slices/"
    
    # Correction spécifique pour le store/index.js qui cherche dans ./slices/
    $newContent = $newContent -replace "\./slices/", "./slices/"
    
    if ($content -ne $newContent) {
        Set-Content -Path $file.FullName -Value $newContent
        Write-Host "Nettoyé : $($file.Name)" -ForegroundColor Green
    }
}