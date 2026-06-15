param(
    [string]$Root   = ".",
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Write-Step { param([string]$msg) Write-Host "`n=== $msg ===" -ForegroundColor Cyan }
function Write-Fix  { param([string]$msg) Write-Host "  OK  $msg" -ForegroundColor Green  }
function Write-Skip { param([string]$msg) Write-Host "  --  $msg" -ForegroundColor Gray   }
function Write-Warn { param([string]$msg) Write-Host "  !!  $msg" -ForegroundColor Yellow }

function EnsureDir {
    param([string]$Path)
    if (!(Test-Path $Path)) {
        if (!$DryRun) { New-Item -ItemType Directory -Path $Path -Force | Out-Null }
        Write-Fix "Dossier cree : $Path"
    }
}

function CopyIfMissing {
    param([string]$Src, [string]$Dst)
    if (!(Test-Path $Src)) { Write-Skip "Source absente : $Src"; return }
    if (Test-Path $Dst) { Write-Skip "Deja present   : $Dst"; return }
    EnsureDir (Split-Path $Dst)
    if (!$DryRun) { Copy-Item -Path $Src -Destination $Dst -Force }
    Write-Fix "Copie : $Src -> $Dst"
}

function PatchImports {
    param([string]$FilePath, [hashtable[]]$Replacements)
    if (!(Test-Path $FilePath)) { return }
    if ((Get-Item $FilePath) -is [System.IO.DirectoryInfo]) { return }
    $content  = [System.IO.File]::ReadAllText($FilePath, [System.Text.Encoding]::UTF8)
    $original = $content
    foreach ($r in $Replacements) {
        $content = $content -replace [regex]::Escape($r.From), $r.To
    }
    if ($content -ne $original) {
        if (!$DryRun) {
            [System.IO.File]::WriteAllText($FilePath, $content, [System.Text.Encoding]::UTF8)
        }
        Write-Fix "Import patche : $FilePath"
    } else {
        Write-Skip "Inchange      : $FilePath"
    }
}

$Root     = Resolve-Path $Root | Select-Object -ExpandProperty Path
$AppComp  = Join-Path $Root "app\components"
$RootComp = Join-Path $Root "components"

Write-Host "`nMerge-Components - Racine : $Root" -ForegroundColor White
if ($DryRun) { Write-Host "   Mode : DRY-RUN (aucun fichier modifie)" -ForegroundColor Yellow }

if (!(Test-Path $AppComp)) {
    Write-Host "`n  app/components/ introuvable - rien a faire." -ForegroundColor Green
    exit 0
}

# ============================================================
# ETAPE 1 - Copie des fichiers exclusifs
# ============================================================
Write-Step "1 - Copie des fichiers exclusifs de app/components/ vers components/"

$rootFilesMap = @{
    "BudgetSlider.jsx"       = "home\BudgetSlider.jsx"
    "CategoriesGrid.jsx"     = "home\CategoriesGrid.jsx"
    "ConfigStep.jsx"         = "home\ConfigStep.jsx"
    "CTASection.jsx"         = "home\CTASection.jsx"
    "DynamicHero.jsx"        = "home\DynamicHero.jsx"
    "FeaturesSection.jsx"    = "home\FeaturesSection.jsx"
    "RecommendationCard.jsx" = "home\RecommendationCard.jsx"
    "HeroSection.jsx"        = "home\HeroSection.jsx"
    "MobileMoneyPayment.jsx" = "payment\MobileMoneyPayment.jsx"
    "SearchBarLive.jsx"      = "shared\SearchBarLive.jsx"
    "WhatsAppButton.jsx"     = "layout\WhatsAppButton.jsx"
    "Providers.jsx"          = "shared\Providers.jsx"
}

foreach ($file in $rootFilesMap.Keys) {
    $src = Join-Path $AppComp $file
    $dst = Join-Path $RootComp $rootFilesMap[$file]
    CopyIfMissing -Src $src -Dst $dst
}

$subFolders = @("account", "blog", "cart", "checkout", "layout", "product", "review", "seo", "shared", "ui")

foreach ($sub in $subFolders) {
    $srcDir = Join-Path $AppComp $sub
    $dstDir = Join-Path $RootComp $sub
    if (!(Test-Path $srcDir)) { continue }
    Get-ChildItem -Path $srcDir -File | ForEach-Object {
        CopyIfMissing -Src $_.FullName -Dst (Join-Path $dstDir $_.Name)
    }
}

# ============================================================
# ETAPE 2 - Correction des imports
# ============================================================
Write-Step "2 - Correction des imports vers app/components/"

$importReplacements = @(
    @{ From = 'from "../components/';    To = 'from "@/components/' }
    @{ From = "from '../components/";    To = 'from "@/components/' }
    @{ From = 'from "../../components/'; To = 'from "@/components/' }
    @{ From = "from '../../components/"; To = 'from "@/components/' }
    @{ From = 'from "../../../components/'; To = 'from "@/components/' }
    @{ From = "from '../../../components/"; To = 'from "@/components/' }
    @{ From = 'from "app/components/';   To = 'from "@/components/' }
    @{ From = "from 'app/components/";   To = 'from "@/components/' }
    @{ From = 'from "@/components/BudgetSlider"';       To = 'from "@/components/home/BudgetSlider"' }
    @{ From = 'from "@/components/CategoriesGrid"';     To = 'from "@/components/home/CategoriesGrid"' }
    @{ From = 'from "@/components/ConfigStep"';         To = 'from "@/components/home/ConfigStep"' }
    @{ From = 'from "@/components/CTASection"';         To = 'from "@/components/home/CTASection"' }
    @{ From = 'from "@/components/DynamicHero"';        To = 'from "@/components/home/DynamicHero"' }
    @{ From = 'from "@/components/FeaturesSection"';    To = 'from "@/components/home/FeaturesSection"' }
    @{ From = 'from "@/components/RecommendationCard"'; To = 'from "@/components/home/RecommendationCard"' }
    @{ From = 'from "@/components/HeroSection"';        To = 'from "@/components/home/HeroSection"' }
    @{ From = 'from "@/components/MobileMoneyPayment"'; To = 'from "@/components/payment/MobileMoneyPayment"' }
    @{ From = 'from "@/components/SearchBarLive"';      To = 'from "@/components/shared/SearchBarLive"' }
    @{ From = 'from "@/components/WhatsAppButton"';     To = 'from "@/components/layout/WhatsAppButton"' }
    @{ From = 'from "@/components/Providers"';          To = 'from "@/components/shared/Providers"' }
    @{ From = "from '@/components/BudgetSlider'";       To = 'from "@/components/home/BudgetSlider"' }
    @{ From = "from '@/components/CategoriesGrid'";     To = 'from "@/components/home/CategoriesGrid"' }
    @{ From = "from '@/components/ConfigStep'";         To = 'from "@/components/home/ConfigStep"' }
    @{ From = "from '@/components/CTASection'";         To = 'from "@/components/home/CTASection"' }
    @{ From = "from '@/components/DynamicHero'";        To = 'from "@/components/home/DynamicHero"' }
    @{ From = "from '@/components/FeaturesSection'";    To = 'from "@/components/home/FeaturesSection"' }
    @{ From = "from '@/components/RecommendationCard'"; To = 'from "@/components/home/RecommendationCard"' }
    @{ From = "from '@/components/HeroSection'";        To = 'from "@/components/home/HeroSection"' }
    @{ From = "from '@/components/MobileMoneyPayment'"; To = 'from "@/components/payment/MobileMoneyPayment"' }
    @{ From = "from '@/components/SearchBarLive'";      To = 'from "@/components/shared/SearchBarLive"' }
    @{ From = "from '@/components/WhatsAppButton'";     To = 'from "@/components/layout/WhatsAppButton"' }
    @{ From = "from '@/components/Providers'";          To = 'from "@/components/shared/Providers"' }
)

$scanDirs = @("app", "components", "lib", "store")
foreach ($dir in $scanDirs) {
    $dirPath = Join-Path $Root $dir
    if (!(Test-Path $dirPath)) { continue }
    Get-ChildItem -Path $dirPath -Recurse -Include "*.jsx","*.js","*.ts","*.tsx" |
        Where-Object { !$_.PSIsContainer } | ForEach-Object {
            PatchImports -FilePath $_.FullName -Replacements $importReplacements
        }
}

# ============================================================
# ETAPE 3 - Suppression de app/components/
# ============================================================
Write-Step "3 - Suppression de app/components/"

if (Test-Path $AppComp) {
    if ($DryRun) {
        Write-Fix "[DryRun] Supprimerait : $AppComp"
    } else {
        Remove-Item -Path $AppComp -Recurse -Force
        Write-Fix "Supprime : $AppComp"
    }
} else {
    Write-Skip "Deja absent : $AppComp"
}

# ============================================================
# ETAPE 4 - Verification residuelle
# ============================================================
Write-Step "4 - Verification des imports residuels"

$residualPatterns = @("app/components/", "../components/", "../../components/", "../../../components/")
$found = $false

foreach ($dir in $scanDirs) {
    $dirPath = Join-Path $Root $dir
    if (!(Test-Path $dirPath)) { continue }
    Get-ChildItem -Path $dirPath -Recurse -Include "*.jsx","*.js","*.ts","*.tsx" |
        Where-Object { !$_.PSIsContainer } | ForEach-Object {
            $content = [System.IO.File]::ReadAllText($_.FullName, [System.Text.Encoding]::UTF8)
            foreach ($pat in $residualPatterns) {
                if ($content -like "*$pat*") {
                    Write-Warn "Import residuel [$pat] dans : $($_.FullName)"
                    $found = $true
                }
            }
        }
}
if (!$found) { Write-Fix "Aucun import residuel detecte." }

# ============================================================
# BILAN
# ============================================================
Write-Host ""
Write-Host "======================================================" -ForegroundColor White
Write-Host " TERMINE : Merge-Components" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor White
Write-Host ""
Write-Host "Etapes suivantes :" -ForegroundColor Cyan
Write-Host "  1. npm install"
Write-Host "  2. npx next build"
Write-Host ""