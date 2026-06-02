# fix_tekalis.ps1

# Corrige la structure tekalis-next sous Windows

$ErrorActionPreference = "Stop"

$ROOT = "."

Write-Host "=== 1. Normalisation store ==="

New-Item -ItemType Directory -Force -Path "$ROOT\store\slices" | Out-Null

if (Test-Path "$ROOT\app\store\slices") {
Get-ChildItem "$ROOT\app\store\slices*.js" | ForEach-Object {
$dest = "$ROOT\store\slices$($*.Name)"
if (!(Test-Path $dest)) {
Copy-Item $*.FullName $dest
Write-Host "  Copié $($_.Name)"
}
}
}

if (Test-Path "$ROOT\app\store\index.js") {
Copy-Item "$ROOT\app\store\index.js" "$ROOT\store\index.js" -Force
}

Write-Host "=== 2. Normalisation lib ==="

New-Item -ItemType Directory -Force -Path "$ROOT\lib\hooks" | Out-Null
New-Item -ItemType Directory -Force -Path "$ROOT\lib\utils" | Out-Null

if (Test-Path "$ROOT\app\lib\hooks") {
Get-ChildItem "$ROOT\app\lib\hooks*.js" | ForEach-Object {
$dest = "$ROOT\lib\hooks$($*.Name)"
if (!(Test-Path $dest)) {
Copy-Item $*.FullName $dest
Write-Host "  Copié $($_.Name)"
}
}
}

Write-Host "=== 3. Déplacement des composants ==="

$dirs = @(
"layout",
"shared",
"home",
"product",
"blog",
"cart",
"checkout",
"account",
"review",
"seo"
)

foreach ($dir in $dirs) {


$src = "$ROOT\app\components\$dir"
$dst = "$ROOT\components\$dir"

if (Test-Path $src) {

    New-Item -ItemType Directory -Force -Path $dst | Out-Null

    Get-ChildItem $src -File | ForEach-Object {

        $dest = "$dst\$($_.Name)"

        if (!(Test-Path $dest)) {
            Copy-Item $_.FullName $dest
            Write-Host "  Copié $dir\$($_.Name)"
        }
    }
}


}

Write-Host "=== 4. Correction products.jsx ==="

if (Test-Path "$ROOT\app\products.jsx") {


$item = Get-Item "$ROOT\app\products.jsx"

if ($item.PSIsContainer) {

    New-Item -ItemType Directory -Force -Path "$ROOT\app\products" | Out-Null

    if (Test-Path "$ROOT\app\products.jsx\page.jsx") {
        Copy-Item "$ROOT\app\products.jsx\page.jsx" "$ROOT\app\products\page.jsx" -Force
    }

    New-Item -ItemType Directory -Force -Path "$ROOT\app\products\[id]" | Out-Null

    if (Test-Path "$ROOT\app\products.jsx\[id]\page.jsx") {
        Copy-Item "$ROOT\app\products.jsx\[id]\page.jsx" "$ROOT\app\products\[id]\page.jsx" -Force
    }

    Write-Host "  products.jsx corrigé"
}


}

Write-Host "=== 5. Correction loading ==="

if (
(Test-Path "$ROOT\app\loanding.jsx") -and
!(Test-Path "$ROOT\app\loading.jsx")
) {
Copy-Item "$ROOT\app\loanding.jsx" "$ROOT\app\loading.jsx"
}

Write-Host "=== 6. Création robots.js ==="

@'
export default function robots() {
return {
rules: [
{
userAgent: '*',
allow: ['/', '/products', '/products/*', '/blog', '/blog/*', '/category/*'],
disallow: ['/admin', '/api/', '/cart', '/checkout', '/dashboard', '/login', '/register'],
},
{
userAgent: ['AhrefsBot', 'SemrushBot', 'MJ12bot'],
disallow: '/',
},
],
sitemap: 'https://tekalis.com/sitemap.xml',
};
}
'@ | Set-Content "$ROOT\app\robots.js"

Write-Host "=== 7. Création des pages manquantes ==="

$pages = @(
"app\configurator\page.jsx",
"app\apropos\page.jsx",
"app\contact\page.jsx",
"app\politique\page.jsx",
"app\login\page.jsx",
"app\register\page.jsx",
"app\cart\page.jsx",
"app\checkout\page.jsx",
"app\wishlist\page.jsx",
"app\dashboard\page.jsx",
"app\dashboard\orders\page.jsx",
"app\dashboard\orders[id]\page.jsx",
"app\dashboard\addresses\page.jsx",
"app\dashboard\wishlist\page.jsx",
"app\dashboard\warranties\page.jsx",
"app\dashboard\rma\page.jsx",
"app\api\auth\route.js"
)

foreach ($p in $pages) {


$full = Join-Path $ROOT $p

$directory = Split-Path $full

if (!(Test-Path $directory)) {
    New-Item -ItemType Directory -Force -Path $directory | Out-Null
}

if (!(Test-Path $full)) {

    if ($p -like "*route.js") {


@'
export async function GET() {
return Response.json({ ok: true });
}
'@ | Set-Content $full


    } else {


@'
export default function Page() {
return <div>Page à implémenter</div>;
}
'@ | Set-Content $full


    }

    Write-Host "  Créé : $p"
}


}

Write-Host "=== 8. lib/api.jsx ==="

if (
!(Test-Path "$ROOT\lib\api.jsx") -and
(Test-Path "$ROOT\app\lib\api.jsx")
) {
Copy-Item "$ROOT\app\lib\api.jsx" "$ROOT\lib\api.jsx"
}

Write-Host "=== 9. Public ==="

New-Item -ItemType Directory -Force -Path "$ROOT\public" | Out-Null

$publicFiles = @(
"robots.txt",
"og-image.png",
"hero-fallback.webp"
)

foreach ($f in $publicFiles) {


$path = "$ROOT\public\$f"

if (!(Test-Path $path)) {
    New-Item -ItemType File -Path $path | Out-Null
}


}

Write-Host "=== 10. .env.local ==="

if (!(Test-Path "$ROOT.env.local")) {

@'
NEXT_PUBLIC_API_BASE=https://tekalis.onrender.com
'@ | Set-Content "$ROOT.env.local"

}

Write-Host ""
Write-Host "====================================="
Write-Host " Corrections terminées"
Write-Host "====================================="
Write-Host ""
Write-Host "Actions manuelles restantes :"
Write-Host "1. Remplacer react-router-dom par next/link"
Write-Host "2. Remplacer useNavigate par useRouter"
Write-Host "3. Vérifier les alias @/"
Write-Host "4. Vérifier les imports packages/shared"
Write-Host ""
Write-Host "Nettoyage final après vérification :"
Write-Host "Remove-Item '$ROOT\app\components' -Recurse -Force"
Write-Host "Remove-Item '$ROOT\app\store' -Recurse -Force"
Write-Host "Remove-Item '$ROOT\app\lib' -Recurse -Force"
Write-Host "Remove-Item '$ROOT\app\products.jsx' -Recurse -Force"
Write-Host "Remove-Item '$ROOT\app\loanding.jsx' -Force"
