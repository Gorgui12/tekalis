# ============================================================================
# Fix-TekalisNext-Complete.ps1
# Corrige en masse les problemes identifies dans l'audit de migration
# React -> Next.js 15 du projet Tekalis.
#
# Compatible PowerShell 5.1 (Windows). Pur ASCII, pas de Set-StrictMode,
# pas de caracteres accentues dans le code (uniquement dans les commentaires
# si necessaire, mais on reste prudent).
#
# USAGE :
#   cd C:\Users\hp\projets\tekalis\tekalis-frontend
#   powershell -ExecutionPolicy Bypass -File .\Fix-TekalisNext-Complete.ps1
#
# Le script est IDEMPOTENT : on peut le relancer plusieurs fois sans danger.
# Il fait une sauvegarde de chaque fichier modifie (.bak) avant de le toucher,
# sauf si -NoBackup est passe. 
# ============================================================================

param(
    [string]$ProjectRoot = ".\apps\tekalis-next",
    [switch]$NoBackup,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

# ----------------------------------------------------------------------------
# Helpers
# ----------------------------------------------------------------------------

$Global:FilesChanged = New-Object System.Collections.Generic.List[string]
$Global:FilesSkipped  = New-Object System.Collections.Generic.List[string]
$Global:Warnings      = New-Object System.Collections.Generic.List[string]

function Write-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host $Title -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
}

function Write-Ok {
    param([string]$Msg)
    Write-Host "  [OK] $Msg" -ForegroundColor Green
}

function Write-Skip {
    param([string]$Msg)
    Write-Host "  [SKIP] $Msg" -ForegroundColor DarkYellow
}

function Write-Warn2 {
    param([string]$Msg)
    Write-Host "  [WARN] $Msg" -ForegroundColor Yellow
    $Global:Warnings.Add($Msg)
}

function Write-Err2 {
    param([string]$Msg)
    Write-Host "  [ERROR] $Msg" -ForegroundColor Red
}

function Test-ProjectRoot {
    if (-not (Test-Path $ProjectRoot)) {
        Write-Err2 "Le dossier '$ProjectRoot' n'existe pas. Lance ce script depuis tekalis-frontend, ou passe -ProjectRoot."
        exit 1
    }
    $pkgJson = Join-Path $ProjectRoot "package.json"
    if (-not (Test-Path $pkgJson)) {
        Write-Err2 "Pas de package.json trouve dans '$ProjectRoot'. Verifie le chemin."
        exit 1
    }
}

# Lit un fichier en UTF8 (avec detection BOM), renvoie le contenu en string.
function Read-FileText {
    param([string]$Path)
    return [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
}

# Ecrit un fichier en UTF8 SANS BOM (pour eviter les soucis d'encodage Next.js).
function Write-FileText {
    param([string]$Path, [string]$Content)
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

# Applique une ou plusieurs transformations regex a un fichier.
# $Transforms est un tableau de hashtables: @{ Pattern = '...'; Replacement = '...' }
# Retourne $true si le fichier a ete modifie.
function Apply-Transforms {
    param(
        [string]$FilePath,
        [array]$Transforms
    )

    if (-not (Test-Path $FilePath)) {
        Write-Skip "Fichier introuvable: $FilePath"
        return $false
    }

    $original = Read-FileText -Path $FilePath
    $content = $original

    foreach ($t in $Transforms) {
        $content = [System.Text.RegularExpressions.Regex]::Replace(
            $content,
            $t.Pattern,
            $t.Replacement
        )
    }

    if ($content -ne $original) {
        if (-not $DryRun) {
            if (-not $NoBackup) {
                $bakPath = "$FilePath.bak"
                if (-not (Test-Path $bakPath)) {
                    Copy-Item -Path $FilePath -Destination $bakPath -Force
                }
            }
            Write-FileText -Path $FilePath -Content $content
        }
        $Global:FilesChanged.Add($FilePath)
        return $true
    }
    else {
        return $false
    }
}

# ----------------------------------------------------------------------------
# DEBUT
# ----------------------------------------------------------------------------

Test-ProjectRoot
$ProjectRoot = (Resolve-Path $ProjectRoot).Path

Write-Host ""
Write-Host "Tekalis Next.js - Script de correction complete" -ForegroundColor Magenta
Write-Host "Racine du projet : $ProjectRoot"
if ($DryRun) {
    Write-Host "MODE DRY-RUN : aucun fichier ne sera modifie, juste un rapport." -ForegroundColor Yellow
}

# ============================================================================
# FIX 1 : globals.css -> syntaxe Tailwind v4 + fusion de index.source.css
# ============================================================================
Write-Section "FIX 1/9 - CSS global (Tailwind v4 + fusion index.source.css)"

$globalsCssPath = Join-Path $ProjectRoot "app\globals.css"
$sourceCssPath  = Join-Path $ProjectRoot "app\index.source.css"

if ((Test-Path $globalsCssPath) -and (Test-Path $sourceCssPath)) {

    $newGlobalsCss = @'
@import "tailwindcss";

:root {
  --navbar-h: 64px;
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-surface: #f8fafc;
}

@media (min-width: 768px) {
  :root { --navbar-h: 72px; }
}

html, body {
  overflow-x: hidden;
  max-width: 100vw;
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

button, a, [role="button"], input[type="checkbox"], input[type="radio"] {
  min-height: 44px;
  min-width: 44px;
}

.touch-target-exempt {
  min-height: unset;
  min-width: unset;
}

img {
  max-width: 100%;
  height: auto;
}

.hero-image {
  contain: paint layout;
  will-change: opacity;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

.product-card-image {
  aspect-ratio: 1 / 1;
  contain: layout paint;
}

@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.skeleton {
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
}

.dark .skeleton {
  background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%);
  background-size: 200% 100%;
}

@keyframes hero-progress {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}

.hero-progress-bar {
  transform-origin: left center;
  animation: hero-progress var(--hero-duration, 5500ms) linear forwards;
}

:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 4px;
}

:focus:not(:focus-visible) { outline: none; }

*,
*::before,
*::after {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-duration: 150ms;
  transition-timing-function: ease;
}

*:hover, *:active {
  transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow;
}

.safe-top    { padding-top:    env(safe-area-inset-top, 0px); }
.safe-bottom { padding-bottom: env(safe-area-inset-bottom, 0px); }

.text-balance { text-wrap: balance; }

.line-clamp-1 { overflow: hidden; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; }
.line-clamp-2 { overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.line-clamp-3 { overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; }

@media print {
  nav, .navbar, footer, .footer, .whatsapp-btn, .cookie-banner {
    display: none !important;
  }
}
'@

    if (-not $DryRun) {
        if (-not $NoBackup) {
            Copy-Item -Path $globalsCssPath -Destination "$globalsCssPath.bak" -Force -ErrorAction SilentlyContinue
            Copy-Item -Path $sourceCssPath -Destination "$sourceCssPath.bak" -Force -ErrorAction SilentlyContinue
        }
        Write-FileText -Path $globalsCssPath -Content $newGlobalsCss
        Remove-Item -Path $sourceCssPath -Force
    }
    $Global:FilesChanged.Add($globalsCssPath)
    $Global:FilesChanged.Add("$sourceCssPath (supprime)")
    Write-Ok "globals.css reecrit avec @import 'tailwindcss' + fusion des regles de index.source.css"
    Write-Ok "index.source.css supprime (fusionne)"
}
elseif (Test-Path $globalsCssPath) {
    Write-Skip "index.source.css absent, on corrige juste la syntaxe @tailwind de globals.css"
    $content = Read-FileText -Path $globalsCssPath
    if ($content -match '@tailwind\s+base;') {
        $content = $content -replace '@tailwind\s+base;\s*\r?\n@tailwind\s+components;\s*\r?\n@tailwind\s+utilities;', '@import "tailwindcss";'
        if (-not $DryRun) {
            if (-not $NoBackup) { Copy-Item -Path $globalsCssPath -Destination "$globalsCssPath.bak" -Force }
            Write-FileText -Path $globalsCssPath -Content $content
        }
        $Global:FilesChanged.Add($globalsCssPath)
        Write-Ok "Directives @tailwind remplacees par @import 'tailwindcss'"
    }
}
else {
    Write-Warn2 "globals.css introuvable a $globalsCssPath - verifie -ProjectRoot"
}

# ============================================================================
# FIX 2 : tailwind.config.js -> compatible v4 (ajout @config dans le CSS)
# ============================================================================
Write-Section "FIX 2/9 - Lien tailwind.config.js (mode v4)"

$tailwindConfigPath = Join-Path $ProjectRoot "tailwind.config.js"
if ((Test-Path $tailwindConfigPath) -and (Test-Path $globalsCssPath)) {
    $cssContent = Read-FileText -Path $globalsCssPath
    if ($cssContent -notmatch '@config') {
        $configLine = '@import "tailwindcss";' + [Environment]::NewLine + '@config "../tailwind.config.js";'
        $cssContent = $cssContent.Replace('@import "tailwindcss";', $configLine)
        if (-not $DryRun) {
            Write-FileText -Path $globalsCssPath -Content $cssContent
        }
        $Global:FilesChanged.Add($globalsCssPath)
        Write-Ok "Ajout de @config pour tailwind.config.js dans globals.css (garde darkMode: class)"
    }
    else {
        Write-Skip "@config deja present dans globals.css"
    }
}
else {
    Write-Warn2 "tailwind.config.js ou globals.css introuvable, etape ignoree"
}

# ============================================================================
# FIX 3 : remplacer tous les <Link ... to={...}> par href={...}
# ============================================================================
Write-Section "FIX 3/9 - Link 'to=' -> 'href=' (react-router vers next/link)"

$jsxFiles = Get-ChildItem -Path $ProjectRoot -Recurse -Include "*.jsx","*.js" -File |
    Where-Object { $_.FullName -notmatch '\\node_modules\\' -and $_.FullName -notmatch '\.bak$' }

$linkToTransforms = @(
    # <Link to="..."   ou <Link to={...}
    @{ Pattern = '(<Link\s[^>]*?)\bto=(["{])'; Replacement = '$1href=$2' }
    # <Link key={x} to={y}> avec key avant to
    @{ Pattern = '(<Link\b(?:\s+\w+=\{[^}]*\})*\s+)to=(["{])'; Replacement = '$1href=$2' }
)

$linkFixCount = 0
foreach ($file in $jsxFiles) {
    $changed = Apply-Transforms -FilePath $file.FullName -Transforms $linkToTransforms
    if ($changed) {
        $linkFixCount++
        Write-Ok "Corrige: $($file.FullName.Substring($ProjectRoot.Length + 1))"
    }
}
if ($linkFixCount -eq 0) {
    Write-Skip "Aucune occurrence de 'Link ... to=' trouvee (deja propre)"
}

# ============================================================================
# FIX 4 : imports casses depuis next/navigation (useNavigate, useLocation, Link)
# ============================================================================
Write-Section "FIX 4/9 - Imports next/navigation casses (useNavigate, useLocation, Link)"

# 4a. Retirer Link des imports next/navigation et l'ajouter via next/link si manquant
function Fix-NavigationImports {
    param([string]$FilePath)

    if (-not (Test-Path $FilePath)) { return $false }
    $original = Read-FileText -Path $FilePath
    $content = $original

    # Cas: import { useParams, Link } /* commentaire */ from "next/navigation";
    # Cas: import { useNavigate, useSearchParams, Link, useRouter } from "next/navigation";
    # On capture le contenu entre { } et le "from next/navigation"
    $pattern = 'import\s*\{([^}]*)\}\s*(?:/\*[^*]*\*/\s*)?from\s*["'']next/navigation["''];?'
    $matches = [System.Text.RegularExpressions.Regex]::Matches($content, $pattern)

    if ($matches.Count -eq 0) { return $false }

    foreach ($m in $matches) {
        $fullMatch = $m.Value
        $importsRaw = $m.Groups[1].Value
        $names = $importsRaw -split ',' | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' }

        $hasLink = $names -contains 'Link'
        $hasUseNavigate = $names -contains 'useNavigate'
        $hasUseLocation = $names -contains 'useLocation'

        # Retire Link, useNavigate, useLocation de la liste (invalides dans next/navigation)
        $cleanNames = $names | Where-Object { $_ -notin @('Link', 'useNavigate', 'useLocation') }

        # S'assure que useRouter et usePathname/useParams/useSearchParams utiles restent
        if ($hasUseNavigate -and ($cleanNames -notcontains 'useRouter')) {
            $cleanNames += 'useRouter'
        }

        $newImportLine = ''
        if ($cleanNames.Count -gt 0) {
            $newImportLine = 'import { ' + ($cleanNames -join ', ') + ' } from "next/navigation";'
        }

        if ($hasLink) {
            $newImportLine = 'import Link from "next/link";' + "`n" + $newImportLine
        }

        $content = $content.Replace($fullMatch, $newImportLine)
    }

    # Si useNavigate etait importe, on injecte une const navigate = (path) => router.push(path)
    # juste apres la 1ere ligne "const router = useRouter();" si elle existe, sinon on avertit.
    if ($content -match 'useNavigate' -and $content -notmatch 'const\s+navigate\s*=') {
        # securite: rien a faire ici, gere par Fix-UseNavigateUsage plus bas
    }

    if ($content -ne $original) {
        if (-not $DryRun) {
            if (-not $NoBackup) {
                $bak = "$FilePath.bak"
                if (-not (Test-Path $bak)) { Copy-Item -Path $FilePath -Destination $bak -Force }
            }
            Write-FileText -Path $FilePath -Content $content
        }
        return $true
    }
    return $false
}

$navImportFixCount = 0
foreach ($file in $jsxFiles) {
    $changed = Fix-NavigationImports -FilePath $file.FullName
    if ($changed) {
        $navImportFixCount++
        $Global:FilesChanged.Add($file.FullName)
        Write-Ok "Imports next/navigation nettoyes: $($file.FullName.Substring($ProjectRoot.Length + 1))"
    }
}
if ($navImportFixCount -eq 0) {
    Write-Skip "Aucun import casse depuis next/navigation trouve"
}

# 4b. Remplacer useNavigate() / navigate(...) par router.push(...)
#     et s'assurer qu'une const router existe.
function Fix-UseNavigateCalls {
    param([string]$FilePath)

    if (-not (Test-Path $FilePath)) { return $false }
    $content = Read-FileText -Path $FilePath
    $original = $content

    if ($content -notmatch 'useNavigate\s*\(') { return $false }

    # Remplace "const navigate = useNavigate();" par rien (on va le regenerer proprement)
    $content = $content -replace 'const\s+navigate\s*=\s*useNavigate\(\)\s*;?', ''

    # S'assure qu'il y a "const router = useRouter();" si useRouter est importe
    if ($content -match 'useRouter' -and $content -notmatch 'const\s+router\s*=\s*useRouter\(\)') {
        # insere juste apres la premiere ligne de fonction composant (heuristique simple:
        # apres la 1ere accolade ouvrante de "function X(" ou "const X = (...) => {")
        $content = $content -replace '(\bfunction\s+\w+\s*\([^)]*\)\s*\{)', "`$1`n  const router = useRouter();`n  const navigate = (path) => router.push(path);"
        $content = $content -replace '(const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{)(?!\s*\n\s*const router)', "`$1`n  const router = useRouter();`n  const navigate = (path) => router.push(path);"
    }

    if ($content -ne $original) {
        if (-not $DryRun) {
            if (-not $NoBackup) {
                $bak = "$FilePath.bak"
                if (-not (Test-Path $bak)) { Copy-Item -Path $FilePath -Destination $bak -Force }
            }
            Write-FileText -Path $FilePath -Content $content
        }
        return $true
    }
    return $false
}

$useNavFixCount = 0
foreach ($file in $jsxFiles) {
    $changed = Fix-UseNavigateCalls -FilePath $file.FullName
    if ($changed) {
        $useNavFixCount++
        $Global:FilesChanged.Add($file.FullName)
        Write-Ok "useNavigate() neutralise, navigate(path) redirige vers router.push: $($file.FullName.Substring($ProjectRoot.Length + 1))"
        Write-Warn2 "Verifie manuellement $($file.Name) - l'insertion automatique de 'const router' est heuristique"
    }
}
if ($useNavFixCount -eq 0) {
    Write-Skip "Aucun appel useNavigate() trouve"
}

# 4c. useSearchParams() destructure en tableau (pattern react-router) -> objet direct
function Fix-UseSearchParamsDestructure {
    param([string]$FilePath)

    if (-not (Test-Path $FilePath)) { return $false }
    $content = Read-FileText -Path $FilePath
    $original = $content

    # const [searchParams] = useSearchParams();  ->  const searchParams = useSearchParams();
    $content = $content -replace 'const\s*\[\s*(\w+)\s*\]\s*=\s*useSearchParams\(\)\s*;', 'const $1 = useSearchParams();'

    if ($content -ne $original) {
        if (-not $DryRun) {
            if (-not $NoBackup) {
                $bak = "$FilePath.bak"
                if (-not (Test-Path $bak)) { Copy-Item -Path $FilePath -Destination $bak -Force }
            }
            Write-FileText -Path $FilePath -Content $content
        }
        return $true
    }
    return $false
}

$searchParamsFixCount = 0
foreach ($file in $jsxFiles) {
    $changed = Fix-UseSearchParamsDestructure -FilePath $file.FullName
    if ($changed) {
        $searchParamsFixCount++
        $Global:FilesChanged.Add($file.FullName)
        Write-Ok "useSearchParams() destructuring corrige: $($file.FullName.Substring($ProjectRoot.Length + 1))"
    }
}
if ($searchParamsFixCount -eq 0) {
    Write-Skip "Aucun destructuring errone de useSearchParams() trouve"
}

# ============================================================================
# FIX 5 : import.meta.env.DEV -> process.env.NODE_ENV === "development"
# ============================================================================
Write-Section "FIX 5/9 - import.meta.env (Vite) -> process.env.NODE_ENV (Next.js)"

$importMetaTransforms = @(
    @{ Pattern = 'import\.meta\.env\.DEV'; Replacement = '(process.env.NODE_ENV === "development")' }
    @{ Pattern = 'import\.meta\.env\.PROD'; Replacement = '(process.env.NODE_ENV === "production")' }
    @{ Pattern = 'import\.meta\.env\.VITE_(\w+)'; Replacement = 'process.env.NEXT_PUBLIC_$1' }
)

$importMetaFixCount = 0
foreach ($file in $jsxFiles) {
    $changed = Apply-Transforms -FilePath $file.FullName -Transforms $importMetaTransforms
    if ($changed) {
        $importMetaFixCount++
        Write-Ok "Corrige: $($file.FullName.Substring($ProjectRoot.Length + 1))"
    }
}
if ($importMetaFixCount -eq 0) {
    Write-Skip "Aucune occurrence de import.meta.env trouvee"
}

# ============================================================================
# FIX 6 : <Helmet> orphelin -> suppression du wrapper (garde le contenu visible)
# ============================================================================
Write-Section "FIX 6/9 - Composants <Helmet> orphelins (react-helmet supprime)"

function Fix-HelmetUsage {
    param([string]$FilePath)

    if (-not (Test-Path $FilePath)) { return $false }
    $content = Read-FileText -Path $FilePath
    $original = $content

    if ($content -notmatch '<Helmet>') { return $false }

    # Supprime le bloc <Helmet>...</Helmet> en entier (titre/meta geres par metadata export)
    $content = [System.Text.RegularExpressions.Regex]::Replace(
        $content,
        '<Helmet>[\s\S]*?</Helmet>\s*',
        ''
    )

    if ($content -ne $original) {
        if (-not $DryRun) {
            if (-not $NoBackup) {
                $bak = "$FilePath.bak"
                if (-not (Test-Path $bak)) { Copy-Item -Path $FilePath -Destination $bak -Force }
            }
            Write-FileText -Path $FilePath -Content $content
        }
        return $true
    }
    return $false
}

$helmetFixCount = 0
foreach ($file in $jsxFiles) {
    $changed = Fix-HelmetUsage -FilePath $file.FullName
    if ($changed) {
        $helmetFixCount++
        $Global:FilesChanged.Add($file.FullName)
        Write-Ok "Bloc <Helmet> retire: $($file.FullName.Substring($ProjectRoot.Length + 1))"
        Write-Warn2 "$($file.Name): le titre/description du <Helmet> retire doit etre ajoute dans le 'export const metadata' de la page.jsx correspondante"
    }
}
if ($helmetFixCount -eq 0) {
    Write-Skip "Aucun <Helmet> trouve"
}

# ============================================================================
# FIX 7 : import { serverFetch } from '@/lib/api' -> '@/lib/serverFetch'
# ============================================================================
Write-Section "FIX 7/9 - serverFetch importe depuis le mauvais module"

$serverFetchTransforms = @(
    @{ Pattern = 'import\s*\{\s*serverFetch\s*\}\s*from\s*[''"]@/lib/api[''"];?'; Replacement = 'import { serverFetch } from "@/lib/serverFetch";' }
)

$serverFetchFixCount = 0
foreach ($file in $jsxFiles) {
    $changed = Apply-Transforms -FilePath $file.FullName -Transforms $serverFetchTransforms
    if ($changed) {
        $serverFetchFixCount++
        Write-Ok "Corrige: $($file.FullName.Substring($ProjectRoot.Length + 1))"
    }
}
if ($serverFetchFixCount -eq 0) {
    Write-Skip "Aucun import errone de serverFetch trouve"
}

# ============================================================================
# FIX 8 : import api depuis '../@/lib/api' (chemin invalide) -> '@/lib/api'
# ============================================================================
Write-Section "FIX 8/9 - Chemin d'import invalide '../@/lib/api'"

$badApiPathTransforms = @(
    @{ Pattern = 'from\s*[''"]\.\./@/lib/api[''"]'; Replacement = 'from "@/lib/api"' }
)

# Et on retire les imports de fonctions qui n'existent pas reellement dans lib/api.jsx
# (getProductReviews, addReview, updateReview, deleteReview, likeReview)
function Fix-NonExistentApiImports {
    param([string]$FilePath)
    if (-not (Test-Path $FilePath)) { return $false }
    $content = Read-FileText -Path $FilePath
    $original = $content

    $pattern = 'import\s*\{\s*getProductReviews,\s*addReview,\s*updateReview,\s*deleteReview,\s*likeReview\s*\}\s*from\s*[''"]@/lib/api[''"];?\s*\r?\n?'
    $content = [System.Text.RegularExpressions.Regex]::Replace($content, $pattern, '')

    if ($content -ne $original) {
        if (-not $DryRun) {
            if (-not $NoBackup) {
                $bak = "$FilePath.bak"
                if (-not (Test-Path $bak)) { Copy-Item -Path $FilePath -Destination $bak -Force }
            }
            Write-FileText -Path $FilePath -Content $content
        }
        return $true
    }
    return $false
}

$badApiPathFixCount = 0
foreach ($file in $jsxFiles) {
    $c1 = Apply-Transforms -FilePath $file.FullName -Transforms $badApiPathTransforms
    $c2 = Fix-NonExistentApiImports -FilePath $file.FullName
    if ($c1 -or $c2) {
        $badApiPathFixCount++
        Write-Ok "Corrige: $($file.FullName.Substring($ProjectRoot.Length + 1))"
        if ($c2) {
            Write-Warn2 "$($file.Name): import de fonctions inexistantes (getProductReviews etc.) retire - implemente-les dans lib/api.jsx si besoin"
        }
    }
}
if ($badApiPathFixCount -eq 0) {
    Write-Skip "Aucun chemin d'import invalide trouve"
}

# ============================================================================
# FIX 9 : verification .env.local (NEXT_PUBLIC_API_BASE)
# ============================================================================
Write-Section "FIX 9/9 - Verification .env.local"

$envLocalPath = Join-Path $ProjectRoot ".env.local"
$envPath = Join-Path $ProjectRoot ".env"

$envFileFound = $null
if (Test-Path $envLocalPath) { $envFileFound = $envLocalPath }
elseif (Test-Path $envPath) { $envFileFound = $envPath }

if ($envFileFound) {
    $envContent = Read-FileText -Path $envFileFound
    if ($envContent -notmatch 'NEXT_PUBLIC_API_BASE\s*=') {
        Write-Warn2 "NEXT_PUBLIC_API_BASE n'est pas defini dans $envFileFound - ajoute: NEXT_PUBLIC_API_BASE=https://tekalis.onrender.com"
    }
    else {
        Write-Ok "NEXT_PUBLIC_API_BASE trouve dans $envFileFound"
    }
}
else {
    Write-Warn2 "Aucun fichier .env / .env.local trouve dans $ProjectRoot"
    Write-Warn2 "Cree un fichier .env.local avec: NEXT_PUBLIC_API_BASE=https://tekalis.onrender.com"

    if (-not $DryRun) {
        $newEnvPath = Join-Path $ProjectRoot ".env.local"
        Write-FileText -Path $newEnvPath -Content "NEXT_PUBLIC_API_BASE=https://tekalis.onrender.com`n"
        Write-Ok "Fichier .env.local cree automatiquement avec une valeur par defaut"
        $Global:FilesChanged.Add($newEnvPath)
    }
}

# ============================================================================
# RAPPORT FINAL
# ============================================================================
Write-Section "RAPPORT FINAL"

Write-Host ""
Write-Host "Fichiers modifies : $($Global:FilesChanged.Count)" -ForegroundColor Green
foreach ($f in $Global:FilesChanged) {
    Write-Host "  - $f"
}

if ($Global:Warnings.Count -gt 0) {
    Write-Host ""
    Write-Host "Avertissements necessitant une verification manuelle : $($Global:Warnings.Count)" -ForegroundColor Yellow
    foreach ($w in $Global:Warnings) {
        Write-Host "  ! $w" -ForegroundColor Yellow
    }
}

Write-Host ""
if ($DryRun) {
    Write-Host "DRY-RUN termine. Aucun fichier n'a ete modifie. Relance sans -DryRun pour appliquer." -ForegroundColor Magenta
}
else {
    Write-Host "Corrections appliquees. Etapes suivantes recommandees :" -ForegroundColor Magenta
    Write-Host "  1. cd $ProjectRoot"
    Write-Host "  2. rm -rf .next (ou Remove-Item -Recurse -Force .next)"
    Write-Host "  3. npm install"
    Write-Host "  4. npm run dev"
    Write-Host "  5. Verifie chaque fichier marque [WARN] ci-dessus a la main"
    Write-Host ""
    Write-Host "Pour annuler les changements : restaure les fichiers *.bak generes a cote de chaque fichier modifie."
}

Write-Host ""
Write-Host "Termine." -ForegroundColor Cyan