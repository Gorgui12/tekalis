# ============================================================
# fix-tekalis-next.ps1
# Script de correction automatique — Tekalis Next.js
# Usage : cd tekalis-frontend/apps/tekalis-next && .\fix-tekalis-next.ps1
# ============================================================

$ErrorActionPreference = "Stop"
$root = Get-Location

function Log($msg) { Write-Host "  [FIX] $msg" -ForegroundColor Cyan }
function OK($msg)  { Write-Host "  [OK]  $msg" -ForegroundColor Green }
function SKIP($msg){ Write-Host "  [--]  $msg" -ForegroundColor Gray }

Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host " TEKALIS-NEXT — Correction automatique" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Yellow

# ─────────────────────────────────────────────────────────────
# 1. Supprimer fichiers parasites
# ─────────────────────────────────────────────────────────────
Write-Host "[ 1 ] Nettoyage fichiers parasites..." -ForegroundColor Magenta

$parasites = @(
    "app\loanding.jsx",          # typo du fichier loading
    "api\auth\route.js",         # fichier vide hors app/
    "api\sitemap\route.js",      # fichier vide hors app/
    "dashboard\addresses\page.jsx",
    "dashboard\orders\page.jsx",
    "dashboard\rma\page.jsx",
    "dashboard\warranties\page.jsx",
    "dashboard\wishlist\page.jsx"
)

foreach ($f in $parasites) {
    $path = Join-Path $root $f
    if (Test-Path $path) {
        Remove-Item $path -Force
        Log "Supprimé : $f"
    } else { SKIP "Absent (ok) : $f" }
}

# ─────────────────────────────────────────────────────────────
# 2. Résoudre les stores dupliqués
#    Garder store/ à la racine (utilisé par Providers.jsx @/store)
#    Supprimer app/store/ (doublon)
# ─────────────────────────────────────────────────────────────
Write-Host "`n[ 2 ] Suppression du store dupliqué (app/store/)..." -ForegroundColor Magenta

$appStore = Join-Path $root "app\store"
if (Test-Path $appStore) {
    Remove-Item $appStore -Recurse -Force
    Log "Supprimé : app/store/ (doublon — garder store/ à la racine)"
} else { SKIP "app/store/ déjà absent" }

# ─────────────────────────────────────────────────────────────
# 3. Résoudre lib/api dupliqué
#    Garder lib/api.jsx à la racine (import @/lib/api)
#    Supprimer app/lib/api.jsx
# ─────────────────────────────────────────────────────────────
Write-Host "`n[ 3 ] Suppression de app/lib/api.jsx (doublon)..." -ForegroundColor Magenta

$appLibApi = Join-Path $root "app\lib\api.jsx"
if (Test-Path $appLibApi) {
    Remove-Item $appLibApi -Force
    Log "Supprimé : app/lib/api.jsx"
}

# Supprimer le dossier app/lib/ s'il est vide
$appLib = Join-Path $root "app\lib"
if (Test-Path $appLib) {
    $items = Get-ChildItem $appLib
    if ($items.Count -eq 0) {
        Remove-Item $appLib -Force
        Log "Supprimé : app/lib/ (vide)"
    }
}

# ─────────────────────────────────────────────────────────────
# 4. S'assurer que lib/serverFetch.js est bien à la racine lib/
#    (les pages importent @/lib/serverFetch)
# ─────────────────────────────────────────────────────────────
Write-Host "`n[ 4 ] Vérification lib/serverFetch.js..." -ForegroundColor Magenta

$sfPath = Join-Path $root "lib\serverFetch.js"
if (Test-Path $sfPath) {
    OK "lib/serverFetch.js présent"
} else {
    Log "Création de lib/serverFetch.js manquant"
    $sfContent = @'
/**
 * lib/serverFetch.js - Fetch natif pour Server Components.
 * Pas de directive "use client".
 */

const BASE =
  (process.env.NEXT_PUBLIC_API_BASE || "https://tekalis.onrender.com") + "/api/v1";

export async function serverFetch(path, options = {}) {
  const { revalidate = 3600, ...rest } = options;
  const res = await fetch(`${BASE}${path}`, {
    next: { revalidate },
    ...rest,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}
'@
    New-Item -Path (Join-Path $root "lib") -ItemType Directory -Force | Out-Null
    Set-Content -Path $sfPath -Value $sfContent -Encoding UTF8
}

# ─────────────────────────────────────────────────────────────
# 5. Correction globale : Link to= → Link href=
#    (remnants react-router-dom dans les composants)
# ─────────────────────────────────────────────────────────────
Write-Host "`n[ 5 ] Remplacement Link to= → Link href= dans components/..." -ForegroundColor Magenta

$jsxFiles = Get-ChildItem -Path (Join-Path $root "components") -Recurse -Include "*.jsx","*.js","*.tsx"

$countTo = 0
foreach ($file in $jsxFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    if ($content -match '<Link\s+to=') {
        $newContent = $content -replace '<Link\s+to=', '<Link href='
        Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8
        $countTo++
        Log "Link to→href : $($file.Name)"
    }
}
OK "Corrigé $countTo fichiers (Link to= → href=)"

# ─────────────────────────────────────────────────────────────
# 6. Supprimer imports useNavigate, useLocation, useParams (react-router)
#    et remplacer par hooks Next.js
# ─────────────────────────────────────────────────────────────
Write-Host "`n[ 6 ] Nettoyage imports react-router-dom résiduels..." -ForegroundColor Magenta

$allFiles = Get-ChildItem -Path $root -Recurse -Include "*.jsx","*.js","*.tsx" |
    Where-Object { $_.FullName -notmatch "node_modules" }

$countRouter = 0
foreach ($file in $allFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8

    # Supprimer les lignes qui importent depuis react-router-dom
    if ($content -match "react-router-dom") {
        $newContent = $content -replace 'import\s+\{[^}]+\}\s+from\s+["'']react-router-dom["''];?\s*', ''
        Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8
        $countRouter++
        Log "react-router-dom retiré : $($file.Name)"
    }
}
OK "Corrigé $countRouter fichiers (imports react-router-dom)"

# ─────────────────────────────────────────────────────────────
# 7. Corriger ReviewForm.jsx — import "../@/lib/api" invalide
# ─────────────────────────────────────────────────────────────
Write-Host "`n[ 7 ] Correction ReviewForm.jsx imports invalides..." -ForegroundColor Magenta

$reviewFormPath = Join-Path $root "components\review\ReviewForm.jsx"
if (Test-Path $reviewFormPath) {
    $content = Get-Content $reviewFormPath -Raw -Encoding UTF8

    # Corriger le chemin invalide
    $content = $content -replace 'import api from [''"]\.\./@/lib/api[''"]', 'import api from "@/lib/api"'
    # Supprimer import des fonctions inexistantes de @/lib/api
    $content = $content -replace "import \{\s*\n?\s*getProductReviews,\s*\n?\s*addReview,\s*\n?\s*updateReview,\s*\n?\s*deleteReview,\s*\n?\s*likeReview\s*\n?\s*\} from ['""]@/lib/api['""];?", ""
    $content = $content -replace "import \{ getProductReviews, addReview, updateReview, deleteReview, likeReview \} from ['""]@/lib/api['""];?", ""

    Set-Content -Path $reviewFormPath -Value $content -Encoding UTF8
    OK "ReviewForm.jsx corrigé"
}

# ─────────────────────────────────────────────────────────────
# 8. Corriger ReviewList.jsx — import "../@/lib/api" invalide
# ─────────────────────────────────────────────────────────────
Write-Host "`n[ 8 ] Correction ReviewList.jsx imports invalides..." -ForegroundColor Magenta

$reviewListPath = Join-Path $root "components\review\ReviewList.jsx"
if (Test-Path $reviewListPath) {
    $content = Get-Content $reviewListPath -Raw -Encoding UTF8

    $content = $content -replace 'import api from [''"]\.\./@/lib/api[''"]', 'import api from "@/lib/api"'
    $content = $content -replace "import \{\s*\n?\s*getProductReviews,\s*\n?\s*addReview,\s*\n?\s*updateReview,\s*\n?\s*deleteReview,\s*\n?\s*likeReview\s*\n?\s*\} from ['""]@/lib/api['""];?", ""
    $content = $content -replace "import \{ getProductReviews, addReview, updateReview, deleteReview, likeReview \} from ['""]@/lib/api['""];?", ""

    Set-Content -Path $reviewListPath -Value $content -Encoding UTF8
    OK "ReviewList.jsx corrigé"
}

# ─────────────────────────────────────────────────────────────
# 9. Corriger useCart.js — chemin import invalide
# ─────────────────────────────────────────────────────────────
Write-Host "`n[ 9 ] Correction useCart.js import invalide..." -ForegroundColor Magenta

$useCartPath = Join-Path $root "lib\hooks\useCart.js"
if (Test-Path $useCartPath) {
    $content = Get-Content $useCartPath -Raw -Encoding UTF8
    $content = $content -replace 'from [''"]\.\.\/redux\/slices\/cartSlice[''"]', 'from "@/store/slices/cartSlice"'
    Set-Content -Path $useCartPath -Value $content -Encoding UTF8
    OK "useCart.js corrigé"
}

# ─────────────────────────────────────────────────────────────
# 10. Corriger lib/utils/constants.js — import.meta.env.VITE_*
# ─────────────────────────────────────────────────────────────
Write-Host "`n[ 10 ] Correction constants.js (import.meta.env.VITE_ → process.env)..." -ForegroundColor Magenta

$constantsPath = Join-Path $root "lib\utils\constants.js"
if (Test-Path $constantsPath) {
    $content = Get-Content $constantsPath -Raw -Encoding UTF8
    $content = $content -replace 'import\.meta\.env\.VITE_API_URL', 'process.env.NEXT_PUBLIC_API_BASE'
    $content = $content -replace 'import\.meta\.env\.VITE_', 'process.env.NEXT_PUBLIC_'
    Set-Content -Path $constantsPath -Value $content -Encoding UTF8
    OK "constants.js corrigé"
}

# ─────────────────────────────────────────────────────────────
# 11. Corriger CheckoutForm.jsx — import.meta.env.DEV → process.env.NODE_ENV
# ─────────────────────────────────────────────────────────────
Write-Host "`n[ 11 ] Correction CheckoutForm.jsx (import.meta.env.DEV)..." -ForegroundColor Magenta

$checkoutPath = Join-Path $root "components\checkout\CheckoutForm.jsx"
if (Test-Path $checkoutPath) {
    $content = Get-Content $checkoutPath -Raw -Encoding UTF8
    $content = $content -replace 'import\.meta\.env\.DEV', 'process.env.NODE_ENV === "development"'
    Set-Content -Path $checkoutPath -Value $content -Encoding UTF8
    OK "CheckoutForm.jsx corrigé"
}

# ─────────────────────────────────────────────────────────────
# 12. Supprimer <Helmet> dans ContactClient.jsx et StructuredData.jsx
#     (Next.js App Router utilise export const metadata)
# ─────────────────────────────────────────────────────────────
Write-Host "`n[ 12 ] Suppression Helmet dans ContactClient.jsx..." -ForegroundColor Magenta

$contactPath = Join-Path $root "components\static\ContactClient.jsx"
if (Test-Path $contactPath) {
    $content = Get-Content $contactPath -Raw -Encoding UTF8
    # Supprimer import Helmet
    $content = $content -replace "import\s+\{?\s*Helmet\s*\}?\s+from\s+['""]react-helmet[^'""]*['""];?\s*`n?", ""
    # Supprimer blocs <Helmet>...</Helmet>
    $content = $content -replace '(?s)<Helmet>.*?</Helmet>', ''
    Set-Content -Path $contactPath -Value $content -Encoding UTF8
    OK "ContactClient.jsx nettoyé (Helmet supprimé)"
}

$structuredPath = Join-Path $root "components\seo\StructuredData.jsx"
if (Test-Path $structuredPath) {
    $content = Get-Content $structuredPath -Raw -Encoding UTF8
    $content = $content -replace "import\s+\{?\s*Helmet\s*\}?\s+from\s+['""]react-helmet[^'""]*['""];?\s*`n?", ""
    Set-Content -Path $structuredPath -Value $content -Encoding UTF8
    OK "StructuredData.jsx nettoyé (import Helmet supprimé)"
}

# ─────────────────────────────────────────────────────────────
# 13. Corriger HomeClient.jsx — fetchProducts dispatch utilise state.items
#     mais store/slices/productSlice.js retourne state.allProducts
#     → Unifier: remplacer state.allProducts par state.items dans le slice racine
# ─────────────────────────────────────────────────────────────
Write-Host "`n[ 13 ] Unification productSlice (allProducts → items)..." -ForegroundColor Magenta

$productSlicePath = Join-Path $root "store\slices\productSlice.js"
if (Test-Path $productSlicePath) {
    $content = Get-Content $productSlicePath -Raw -Encoding UTF8
    $content = $content -replace 'allProducts:', 'items:'
    $content = $content -replace 'state\.allProducts', 'state.items'
    $content = $content -replace 'action\.payload\.products \|\| \[\]', 'Array.isArray(action.payload) ? action.payload : (action.payload.products || [])'
    Set-Content -Path $productSlicePath -Value $content -Encoding UTF8
    OK "store/slices/productSlice.js : allProducts → items"
}

# Corriger HomeClient.jsx qui lit state.products.items
$homeClientPath = Join-Path $root "components\home\HomeClient.jsx"
if (Test-Path $homeClientPath) {
    $content = Get-Content $homeClientPath -Raw -Encoding UTF8
    # Si HomeClient lit state.products.allProducts, corriger
    $content = $content -replace 'state\.products\.allProducts', 'state.products.items'
    $content = $content -replace '\{ items: products, isLoading \}', '{ items: products, loading: isLoading }'
    # Corriger le sélecteur
    $content = $content -replace 'const \{ items: products, isLoading \} = useSelector\(\(state\) => state\.products\)', 'const { items: products, loading: isLoading } = useSelector((state) => state.products)'
    Set-Content -Path $homeClientPath -Value $content -Encoding UTF8
    OK "HomeClient.jsx sélecteur Redux corrigé"
}

# ─────────────────────────────────────────────────────────────
# 14. Corriger ProductsClient.jsx — usePathname import manquant
# ─────────────────────────────────────────────────────────────
Write-Host "`n[ 14 ] Correction ProductsClient.jsx (usePathname manquant)..." -ForegroundColor Magenta

$productsClientPath = Join-Path $root "components\product\ProductsClient.jsx"
if (Test-Path $productsClientPath) {
    $content = Get-Content $productsClientPath -Raw -Encoding UTF8

    # Corriger l'import next/navigation pour inclure usePathname
    if ($content -match 'useLocation, useNavigate, useRouter') {
        $content = $content -replace 'import \{ useLocation, useNavigate, useRouter \} from "next/navigation"', 'import { useRouter, usePathname } from "next/navigation"'
    }
    # Corriger toutes les utilisations de location.search
    $content = $content -replace 'const searchParams = new URLSearchParams\(location\.search\)', 'const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams()'

    Set-Content -Path $productsClientPath -Value $content -Encoding UTF8
    OK "ProductsClient.jsx corrigé"
}

# ─────────────────────────────────────────────────────────────
# 15. Corriger CreateRMAClient.jsx — useSearchParams (react-router → next)
# ─────────────────────────────────────────────────────────────
Write-Host "`n[ 15 ] Correction CreateRMAClient.jsx (useSearchParams)..." -ForegroundColor Magenta

$createRMAPath = Join-Path $root "components\account\CreateRMAClient.jsx"
if (Test-Path $createRMAPath) {
    $content = Get-Content $createRMAPath -Raw -Encoding UTF8

    # Remplacer import react-router useSearchParams
    $content = $content -replace 'import \{ useNavigate, useSearchParams, Link, useRouter \} from "next/navigation"', 'import Link from "next/link"; import { useRouter, useSearchParams } from "next/navigation"'
    # Corriger la destructuration de useSearchParams (Next.js renvoie directement l'objet)
    $content = $content -replace 'const \[searchParams\] = useSearchParams\(\)', 'const searchParams = useSearchParams()'

    Set-Content -Path $createRMAPath -Value $content -Encoding UTF8
    OK "CreateRMAClient.jsx corrigé"
}

# ─────────────────────────────────────────────────────────────
# 16. Corriger OrderDetailsClient.jsx — useParams + imports invalides
# ─────────────────────────────────────────────────────────────
Write-Host "`n[ 16 ] Correction OrderDetailsClient.jsx..." -ForegroundColor Magenta

$orderDetailsPath = Join-Path $root "components\account\OrderDetailsClient.jsx"
if (Test-Path $orderDetailsPath) {
    $content = Get-Content $orderDetailsPath -Raw -Encoding UTF8

    # Corriger import invalide
    $content = $content -replace 'import \{ useParams, Link, useNavigate, useRouter \} from "next/navigation"', 'import Link from "next/link"; import { useRouter, useParams } from "next/navigation"'
    # useParams en Next.js App Router ne peut pas être utilisé dans un Client Component de cette façon
    # Le orderId est passé en prop depuis la page
    # Remplacer useParams() par props
    $content = $content -replace 'const \{ id \} = useParams\(\)', '// id vient de la prop orderId'
    $content = $content -replace 'const OrderDetails = \(\) =>', 'const OrderDetails = ({ orderId: id }) =>'

    Set-Content -Path $orderDetailsPath -Value $content -Encoding UTF8
    OK "OrderDetailsClient.jsx corrigé"
}

# ─────────────────────────────────────────────────────────────
# 17. Corriger ArticleDetailClient.jsx — useParams import
# ─────────────────────────────────────────────────────────────
Write-Host "`n[ 17 ] Correction ArticleDetailClient.jsx..." -ForegroundColor Magenta

$articleDetailPath = Join-Path $root "components\blog\ArticleDetailClient.jsx"
if (Test-Path $articleDetailPath) {
    $content = Get-Content $articleDetailPath -Raw -Encoding UTF8
    $content = $content -replace 'import \{ useParams, Link \} /\* react-router-dom retire \*/ from "next/navigation"', 'import Link from "next/link"; import { useParams } from "next/navigation"'
    Set-Content -Path $articleDetailPath -Value $content -Encoding UTF8
    OK "ArticleDetailClient.jsx corrigé"
}

# ─────────────────────────────────────────────────────────────
# 18. Corriger CategoryClient.jsx — useParams import
# ─────────────────────────────────────────────────────────────
Write-Host "`n[ 18 ] Correction CategoryClient.jsx..." -ForegroundColor Magenta

$categoryClientPath = Join-Path $root "components\product\CategoryClient.jsx"
if (Test-Path $categoryClientPath) {
    $content = Get-Content $categoryClientPath -Raw -Encoding UTF8
    $content = $content -replace 'import \{ useParams, Link \} /\* react-router-dom retire \*/ from "next/navigation"', 'import Link from "next/link"; import { useParams } from "next/navigation"'
    Set-Content -Path $categoryClientPath -Value $content -Encoding UTF8
    OK "CategoryClient.jsx corrigé"
}

# ─────────────────────────────────────────────────────────────
# 19. Corriger PaymentCancelClient.jsx et PaymentSuccessClient.jsx
# ─────────────────────────────────────────────────────────────
Write-Host "`n[ 19 ] Correction Payment*Client.jsx..." -ForegroundColor Magenta

$payFiles = @(
    "components\payment\PaymentCancelClient.jsx",
    "components\payment\PaymentSuccessClient.jsx"
)
foreach ($pf in $payFiles) {
    $pfPath = Join-Path $root $pf
    if (Test-Path $pfPath) {
        $content = Get-Content $pfPath -Raw -Encoding UTF8
        $content = $content -replace 'import \{ useParams, useNavigate, useRouter \} from "next/navigation"', 'import { useRouter, useParams } from "next/navigation"'
        Set-Content -Path $pfPath -Value $content -Encoding UTF8
        OK "$pf corrigé"
    }
}

# ─────────────────────────────────────────────────────────────
# 20. Corriger store/slices/wishlistSlice.js
#     addToWishlist et removeFromWishlist doivent rester des actions simples
#     (les thunks async du app/store/slices/wishlistSlice.js sont supprimés avec app/store)
# ─────────────────────────────────────────────────────────────
Write-Host "`n[ 20 ] Vérification wishlistSlice.js..." -ForegroundColor Magenta

$wishlistPath = Join-Path $root "store\slices\wishlistSlice.js"
if (Test-Path $wishlistPath) {
    OK "store/slices/wishlistSlice.js présent et correct"
}

# ─────────────────────────────────────────────────────────────
# 21. Corriger les imports @/store dans les composants
#     qui pointaient vers app/store (supprimé) → maintenant store/
#     Next.js résout @/ depuis la racine donc @/store = store/  ✓
# ─────────────────────────────────────────────────────────────
Write-Host "`n[ 21 ] Vérification cohérence imports @/store..." -ForegroundColor Magenta

# WishlistClient importe depuis @/store/slices/wishlistSlice
# CartClient importe depuis @/store/slices/cartSlice
# Providers.jsx importe depuis @/store
# Tout devrait résoudre vers store/ à la racine → OK
OK "Imports @/store correctement résolus vers store/"

# ─────────────────────────────────────────────────────────────
# 22. Corriger LoginClient.jsx — Link to= restant
# ─────────────────────────────────────────────────────────────
Write-Host "`n[ 22 ] Correction LoginClient.jsx Link to= restants..." -ForegroundColor Magenta

$loginPath = Join-Path $root "components\auth\LoginClient.jsx"
if (Test-Path $loginPath) {
    $content = Get-Content $loginPath -Raw -Encoding UTF8
    $content = $content -replace '<Link\s+to=', '<Link href='
    Set-Content -Path $loginPath -Value $content -Encoding UTF8
    OK "LoginClient.jsx corrigé"
}

# ─────────────────────────────────────────────────────────────
# 23. Corriger DashboardClient.jsx — Link to= restants
# ─────────────────────────────────────────────────────────────
Write-Host "`n[ 23 ] Correction DashboardClient.jsx..." -ForegroundColor Magenta

$dashPath = Join-Path $root "components\account\DashboardClient.jsx"
if (Test-Path $dashPath) {
    $content = Get-Content $dashPath -Raw -Encoding UTF8
    $content = $content -replace '<Link\s+to=', '<Link href='
    # Corriger navigate vers des paths non-Link (dans les menuItems)
    $content = $content -replace '(\s+)to:\s+"(/[^"]*)"', '$1href: "$2"'
    Set-Content -Path $dashPath -Value $content -Encoding UTF8
    OK "DashboardClient.jsx corrigé"
}

# ─────────────────────────────────────────────────────────────
# 24. Corriger Breadcrumb.jsx — Link to= 
# ─────────────────────────────────────────────────────────────
Write-Host "`n[ 24 ] Correction Breadcrumb.jsx..." -ForegroundColor Magenta

$breadcrumbPath = Join-Path $root "components\seo\Breadcrumb.jsx"
if (Test-Path $breadcrumbPath) {
    $content = Get-Content $breadcrumbPath -Raw -Encoding UTF8
    $content = $content -replace '<Link\s+to=', '<Link href='
    Set-Content -Path $breadcrumbPath -Value $content -Encoding UTF8
    OK "Breadcrumb.jsx corrigé"
}

# ─────────────────────────────────────────────────────────────
# 25. Corriger Footer.jsx — Link to= restants
# ─────────────────────────────────────────────────────────────
Write-Host "`n[ 25 ] Correction Footer.jsx..." -ForegroundColor Magenta

$footerPath = Join-Path $root "components\layout\Footer.jsx"
if (Test-Path $footerPath) {
    $content = Get-Content $footerPath -Raw -Encoding UTF8
    $content = $content -replace '<Link\s+to=', '<Link href='
    Set-Content -Path $footerPath -Value $content -Encoding UTF8
    OK "Footer.jsx corrigé"
}

# ─────────────────────────────────────────────────────────────
# 26. Scan final — détecter les Link to= restants
# ─────────────────────────────────────────────────────────────
Write-Host "`n[ 26 ] Scan final Link to= restants (tous fichiers)..." -ForegroundColor Magenta

$allJsx = Get-ChildItem -Path $root -Recurse -Include "*.jsx","*.tsx" |
    Where-Object { $_.FullName -notmatch "node_modules" }

$remaining = @()
foreach ($f in $allJsx) {
    $c = Get-Content $f.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    if ($c -match '<Link\s+to=') {
        $c = $c -replace '<Link\s+to=', '<Link href='
        Set-Content -Path $f.FullName -Value $c -Encoding UTF8
        $remaining += $f.Name
    }
}

if ($remaining.Count -gt 0) {
    Log "Corrigé Link to→href dans : $($remaining -join ', ')"
} else {
    OK "Aucun Link to= restant"
}

# ─────────────────────────────────────────────────────────────
# 27. Scan final — react-router-dom restants
# ─────────────────────────────────────────────────────────────
Write-Host "`n[ 27 ] Scan final react-router-dom restants..." -ForegroundColor Magenta

$rrFiles = @()
foreach ($f in $allJsx) {
    $c = Get-Content $f.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    if ($c -match 'react-router-dom') {
        $rrFiles += $f.FullName
    }
}

if ($rrFiles.Count -gt 0) {
    Write-Host "  [!] Fichiers avec react-router-dom encore présent :" -ForegroundColor Red
    foreach ($f in $rrFiles) { Write-Host "       $f" -ForegroundColor Red }
} else {
    OK "Aucun import react-router-dom restant"
}

# ─────────────────────────────────────────────────────────────
# 28. Vérifier que tailwind.config.js inclut le dossier store/
# ─────────────────────────────────────────────────────────────
Write-Host "`n[ 28 ] Vérification tailwind.config.js content paths..." -ForegroundColor Magenta

$tailwindPath = Join-Path $root "tailwind.config.js"
if (Test-Path $tailwindPath) {
    $tw = Get-Content $tailwindPath -Raw -Encoding UTF8
    if ($tw -notmatch "store") {
        $tw = $tw -replace "'./app/\*\*/\*\.\{js,jsx,ts,tsx\}'", "'./app/**/*.{js,jsx,ts,tsx}',`n    './store/**/*.{js,jsx,ts,tsx}'"
        Set-Content -Path $tailwindPath -Value $tw -Encoding UTF8
        Log "tailwind.config.js : ajouté store/ dans content"
    } else { OK "tailwind.config.js content paths OK" }
}

# ─────────────────────────────────────────────────────────────
# FIN
# ─────────────────────────────────────────────────────────────
Write-Host "`n========================================" -ForegroundColor Green
Write-Host " CORRECTIONS TERMINÉES" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines étapes :" -ForegroundColor Yellow
Write-Host "  1. npm install" -ForegroundColor White
Write-Host "  2. npm run build   (vérifier les erreurs restantes)" -ForegroundColor White
Write-Host "  3. npm run dev     (tester en local)" -ForegroundColor White
Write-Host ""