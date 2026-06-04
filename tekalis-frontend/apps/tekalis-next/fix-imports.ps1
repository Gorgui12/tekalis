$path = "C:\Users\hp\projets\tekalis\tekalis-frontend\apps\tekalis-next\components"
$files = Get-ChildItem -Path $path -Recurse -Filter *.jsx

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Remplacement des imports cassés vers shared
    $newContent = $content -replace "\.\./\.\./\.\./\.\./packages/shared/context/ToastContext", "@/components/shared/ToastProvider"
    $newContent = $newContent -replace "\.\./\.\./\.\./\.\./packages/shared/context/ThemeContext", "@/components/shared/ThemeProvider"
    $newContent = $newContent -replace "\.\./\.\./\.\./\.\./packages/shared/hooks/useAuth", "@/lib/hooks/useAuth"
    $newContent = $newContent -replace "\.\./\.\./\.\./\.\./packages/shared/outils/validators", "@/lib/utils/validators"
    $newContent = $newContent -replace "\.\./\.\./\.\./\.\./packages/shared/redux/slices/cartSlice", "@/store/slices/cartSlice"
$newContent = $newContent -replace "\.\./\.\./\.\./\.\./packages/shared/redux/slices/wishlistSlice", "@/store/slices/wishlistSlice"
$newContent = $newContent -replace "\.\./\.\./\.\./\.\./packages/shared/redux/slices/authSlice", "@/store/slices/authSlice"
    # Correction des imports src/
    $newContent = $newContent -replace "\.\./\.\./src/components/", "@/components/"
    
    if ($content -ne $newContent) {
        Set-Content -Path $file.FullName -Value $newContent
        Write-Host "Corrigé : $($file.Name)" -ForegroundColor Green
    }
}
