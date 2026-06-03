# Définition du chemin de base
$basePath = "."

Write-Host "--- Nettoyage des erreurs et doublons ---" -ForegroundColor Cyan

# 1. Suppression des fichiers/dossiers erronés
$toRemove = @(
    "$basePath\loanding.jsx",
    "$basePath\index.source.css",
    "$basePath\products.jsx",
    "$basePath\dashboard\orders[id]"
)

foreach ($item in $toRemove) {
    if (Test-Path $item) {
        Remove-Item -Path $item -Recurse -Force
        Write-Host "Supprimé: $item" -ForegroundColor Yellow
    }
}

Write-Host "--- Création des dossiers manquants ---" -ForegroundColor Cyan

# 2. Création de la structure manquante
$missingDirs = @(
    "$basePath\api\auth",
    "$basePath\api\sitemap",
    "$basePath\dashboard\orders\[id]",
    "$basePath\dashboard\addresses",
    "$basePath\dashboard\wishlist",
    "$basePath\dashboard\warranties",
    "$basePath\dashboard\rma"
)

foreach ($dir in $missingDirs) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "Créé: $dir" -ForegroundColor Green
    }
}

# 3. Création des fichiers page.jsx manquants dans les nouveaux dossiers
$filesToCreate = @(
    "$basePath\api\auth\route.js",
    "$basePath\api\sitemap\route.js",
    "$basePath\dashboard\orders\[id]\page.jsx",
    "$basePath\dashboard\addresses\page.jsx",
    "$basePath\dashboard\wishlist\page.jsx",
    "$basePath\dashboard\warranties\page.jsx",
    "$basePath\dashboard\rma\page.jsx"
)

foreach ($file in $filesToCreate) {
    if (!(Test-Path $file)) {
        New-Item -ItemType File -Path $file -Force | Out-Null
        Write-Host "Créé: $file" -ForegroundColor Green
    }
}

Write-Host "--- Terminé ! Votre structure est maintenant alignée avec la cible. ---" -ForegroundColor Cyan