<#
.SYNOPSIS
    Fix-TekalisNext.ps1 — Correction automatique de la migration React -> Next.js
    Projet : tekalis-frontend/apps/tekalis-next
    Usage  : .\Fix-TekalisNext.ps1 [-Root "chemin/vers/tekalis-next"] [-DryRun]
#>

param(
    [string]$Root   = ".",
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

# ─── Helpers ──────────────────────────────────────────────────────────────────

function Write-Step { param([string]$msg) Write-Host "`n=== $msg ===" -ForegroundColor Cyan }
function Write-Fix  { param([string]$msg) Write-Host "  OK $msg"  -ForegroundColor Green }
function Write-Skip { param([string]$msg) Write-Host "  -- $msg"  -ForegroundColor Gray  }
function Write-Warn { param([string]$msg) Write-Host "  !! $msg"  -ForegroundColor Yellow }

function WriteFile {
    param([string]$Path, [string]$Content)
    $dir = Split-Path $Path
    if ($dir -and !(Test-Path $dir)) {
        if (!$DryRun) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    }
    if ($DryRun) {
        Write-Fix "[DryRun] Ecrirait $Path"
    } else {
        [System.IO.File]::WriteAllText($Path, $Content, [System.Text.Encoding]::UTF8)
        Write-Fix "Ecrit : $Path"
    }
}

function PatchFile {
    param([string]$Path, [hashtable[]]$Replacements)
    if (!(Test-Path $Path)) { Write-Skip "Inexistant : $Path"; return }
    if ((Get-Item $Path) -is [System.IO.DirectoryInfo]) { Write-Skip "Dossier ignore : $Path"; return }
    $content  = [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
    $original = $content
    foreach ($r in $Replacements) {
        $content = $content -replace [regex]::Escape($r.From), $r.To
    }
    if ($content -ne $original) {
        if ($DryRun) { Write-Fix "[DryRun] Modifierait $Path" }
        else {
            [System.IO.File]::WriteAllText($Path, $content, [System.Text.Encoding]::UTF8)
            Write-Fix "Patche : $Path"
        }
    } else {
        Write-Skip "Inchange : $Path"
    }
}

# ─── Resolution du chemin racine ──────────────────────────────────────────────

$Root = Resolve-Path $Root | Select-Object -ExpandProperty Path
Write-Host "`nFix-TekalisNext - Racine : $Root" -ForegroundColor White
if ($DryRun) { Write-Host "   Mode : DRY-RUN (aucun fichier modifie)" -ForegroundColor Yellow }

# ════════════════════════════════════════════════════════════════════════════════
# CATEGORIE 1 — react-router-dom -> next/navigation
# ════════════════════════════════════════════════════════════════════════════════
Write-Step "1 - react-router-dom -> next/navigation"

# NOTE: toutes les valeurs From/To utilisent des guillemets doubles uniquement
# pour eviter les conflits avec les guillemets simples PowerShell

$routerReplacements = @(
    @{ From = 'import { useNavigate, Link, useLocation } from "react-router-dom";'
       To   = 'import Link from "next/link"; import { useRouter, usePathname } from "next/navigation";' }
    @{ From = 'import { Link, useNavigate, useLocation } from "react-router-dom";'
       To   = 'import Link from "next/link"; import { useRouter, usePathname } from "next/navigation";' }
    @{ From = 'import { useNavigate, Link } from "react-router-dom";'
       To   = 'import Link from "next/link"; import { useRouter } from "next/navigation";' }
    @{ From = 'import { Link, useNavigate } from "react-router-dom";'
       To   = 'import Link from "next/link"; import { useRouter } from "next/navigation";' }
    @{ From = 'import { useNavigate } from "react-router-dom";'
       To   = 'import { useRouter } from "next/navigation";' }
    @{ From = 'import { Link } from "react-router-dom";'
       To   = 'import Link from "next/link";' }
    @{ From = 'import { useParams } from "react-router-dom";'
       To   = 'import { useParams } from "next/navigation";' }
    @{ From = "import { useNavigate, Link, useLocation } from 'react-router-dom';"
       To   = 'import Link from "next/link"; import { useRouter, usePathname } from "next/navigation";' }
    @{ From = "import { Link, useNavigate } from 'react-router-dom';"
       To   = 'import Link from "next/link"; import { useRouter } from "next/navigation";' }
    @{ From = "import { useNavigate } from 'react-router-dom';"
       To   = 'import { useRouter } from "next/navigation";' }
    @{ From = "import { Link } from 'react-router-dom';"
       To   = 'import Link from "next/link";' }
    @{ From = "import { useParams } from 'react-router-dom';"
       To   = 'import { useParams } from "next/navigation";' }
    @{ From = 'from "react-router-dom"'
       To   = '/* react-router-dom retire */ from "next/navigation"' }
    @{ From = "from 'react-router-dom'"
       To   = '/* react-router-dom retire */ from "next/navigation"' }
    @{ From = '<Link to={'
       To   = '<Link href={' }
    @{ From = '<Link to="'
       To   = '<Link href="' }
    @{ From = "to={`"/"
       To   = "href={`"/" }
    @{ From = 'const location  = useLocation();'
       To   = 'const pathname = usePathname();' }
    @{ From = 'const location = useLocation();'
       To   = 'const pathname = usePathname();' }
    @{ From = 'location.pathname'
       To   = 'pathname' }
    @{ From = 'location.state?.from?.pathname'
       To   = '"/dashboard"' }
)

foreach ($subdir in @("components", "app", "store", "lib")) {
    $path = Join-Path $Root $subdir
    if (Test-Path $path) {
        Get-ChildItem -Path $path -Recurse -Include "*.jsx","*.js","*.ts","*.tsx" |
            Where-Object { !$_.PSIsContainer } | ForEach-Object {
            PatchFile -Path $_.FullName -Replacements $routerReplacements
        }
    }
}

# ════════════════════════════════════════════════════════════════════════════════
# CATEGORIE 2 — Pattern navigate illegal
# ════════════════════════════════════════════════════════════════════════════════
Write-Step "2 - Pattern navigate illegal corrige"

function Fix-NavigatePattern {
    param([string]$FilePath)
    if (!(Test-Path $FilePath)) { return }
    if ((Get-Item $FilePath) -is [System.IO.DirectoryInfo]) { return }

    $content  = [System.IO.File]::ReadAllText($FilePath, [System.Text.Encoding]::UTF8)
    $original = $content

    # Pattern sur deux lignes : const navigate = const router = useRouter() + router.push();
    $content = $content -replace 'const navigate\s*=\s*const router\s*=\s*useRouter\(\)\s*[\r\n]+\s*router\.push\(\);', "const router = useRouter();`r`n  const navigate = (path) => router.push(path);"

    # Variante sur une seule ligne
    $content = $content -replace 'const navigate\s*=\s*const router\s*=\s*useRouter\(\)', "const router = useRouter();`r`n  const navigate = (path) => router.push(path);"

    # Nettoyer les router.push() orphelins sans argument
    $content = $content -replace 'router\.push\(\);', ''

    # Dedupliquer import useRouter double guillemets
    $importDQ  = 'import { useRouter } from "next/navigation";'
    $escapedDQ = [regex]::Escape($importDQ)
    while (([regex]::Matches($content, $escapedDQ)).Count -gt 1) {
        $idx = $content.LastIndexOf($importDQ)
        if ($idx -ge 0) { $content = $content.Remove($idx, $importDQ.Length) }
        $content = $content -replace "(`r`n){3,}", "`r`n`r`n"
    }

    # Dedupliquer import useRouter guillemets simples
    $importSQ  = "import { useRouter } from 'next/navigation';"
    $escapedSQ = [regex]::Escape($importSQ)
    while (([regex]::Matches($content, $escapedSQ)).Count -gt 1) {
        $idx = $content.LastIndexOf($importSQ)
        if ($idx -ge 0) { $content = $content.Remove($idx, $importSQ.Length) }
        $content = $content -replace "(`r`n){3,}", "`r`n`r`n"
    }

    if ($content -ne $original) {
        if ($DryRun) {
            Write-Fix "[DryRun] Modifierait $FilePath"
        } else {
            [System.IO.File]::WriteAllText($FilePath, $content, [System.Text.Encoding]::UTF8)
            Write-Fix "Patche (navigate) : $FilePath"
        }
    } else {
        Write-Skip "Inchange : $FilePath"
    }
}

foreach ($subdir in @("components", "app", "lib")) {
    $path = Join-Path $Root $subdir
    if (Test-Path $path) {
        Get-ChildItem -Path $path -Recurse -Include "*.jsx","*.js" | Where-Object { !$_.PSIsContainer } | ForEach-Object {
            Fix-NavigatePattern -FilePath $_.FullName
        }
    }
}

# ════════════════════════════════════════════════════════════════════════════════
# CATEGORIE 3 — Imports casses vers packages/shared
# ════════════════════════════════════════════════════════════════════════════════
Write-Step "3 - Imports packages/shared -> chemins locaux"

$sharedReplacements = @(
    @{ From = '../../../../packages/shared/api/api'
       To   = '@/lib/api' }
    @{ From = '../../../../../packages/shared/api/api'
       To   = '@/lib/api' }
    @{ From = '../../../../../packages/shared/api/client'
       To   = '@/lib/api' }
    @{ From = '../../../../packages/shared/hooks/useAuth'
       To   = '@/lib/hooks/useAuth' }
    @{ From = '../../../../packages/shared/hooks/useErrorHandler'
       To   = '@/lib/hooks/useErrorHandler' }
    @{ From = '../../../../packages/shared/hooks/useProducts'
       To   = '@/lib/hooks/useProducts' }
    @{ From = '../../../../packages/shared/hooks/useDebounce'
       To   = '@/lib/hooks/useDebounce' }
    @{ From = '../../../../packages/shared/hooks/usePagination'
       To   = '@/lib/hooks/usePagination' }
    @{ From = '../../../../packages/shared/redux/slices/cartSlice'
       To   = '@/store/slices/cartSlice' }
    @{ From = '../../../../packages/shared/redux/slices/wishlistSlice'
       To   = '@/store/slices/wishlistSlice' }
    @{ From = '../../../../packages/shared/redux/slices/authSlice'
       To   = '@/store/slices/authSlice' }
    @{ From = '../../../../packages/shared/redux/slices/productSlice'
       To   = '@/store/slices/productSlice' }
    @{ From = '../../../../../packages/shared/api/endpoints/reviews'
       To   = '@/lib/api' }
    @{ From = '../../../../packages/shared/context/ToastContext'
       To   = '@/components/shared/ToastProvider' }
    @{ From = '../../../../packages/shared/context/ThemeContext'
       To   = '@/components/shared/ThemeProvider' }
    @{ From = '../../../../packages/shared/outils/validators'
       To   = '@/lib/utils/validators' }
)

foreach ($subdir in @("components", "app", "store", "lib")) {
    $path = Join-Path $Root $subdir
    if (Test-Path $path) {
        Get-ChildItem -Path $path -Recurse -Include "*.jsx","*.js" | Where-Object { !$_.PSIsContainer } | ForEach-Object {
            PatchFile -Path $_.FullName -Replacements $sharedReplacements
        }
    }
}

# ════════════════════════════════════════════════════════════════════════════════
# CATEGORIE 4 — Store Redux + Providers
# ════════════════════════════════════════════════════════════════════════════════
Write-Step "4 - Store Redux et Providers"

# 4a. store/index.js
$storeIndex = @'
/**
 * store/index.js - Redux store pour Next.js App Router
 */
"use client";

import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer     from "./slices/authSlice";
import cartReducer     from "./slices/cartSlice";
import wishlistReducer from "./slices/wishlistSlice";
import productReducer  from "./slices/productSlice";
import uiReducer       from "./slices/uiSlice";

const rootReducer = combineReducers({
  auth:     authReducer,
  cart:     cartReducer,
  wishlist: wishlistReducer,
  products: productReducer,
  ui:       uiReducer,
});

export const makeStore = () =>
  configureStore({
    reducer: rootReducer,
    middleware: (get) => get({ serializableCheck: false }),
  });

export const store = makeStore();
'@
WriteFile -Path (Join-Path $Root "store/index.js") -Content $storeIndex

# 4b. Supprimer le doublon productSclice.js
$sclicePath = Join-Path $Root "app/store/slices/productSclice.js"
if (Test-Path $sclicePath) {
    if (!$DryRun) { Remove-Item $sclicePath -Force }
    Write-Fix "Supprime : app/store/slices/productSclice.js"
}

# 4c. Providers.jsx
$providersContent = @'
"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { makeStore } from "@/store";
import ThemeProvider from "./ThemeProvider";
import ToastProvider from "./ToastProvider";

export default function Providers({ children }) {
  const storeRef = useRef(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return (
    <Provider store={storeRef.current}>
      <ThemeProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </ThemeProvider>
    </Provider>
  );
}
'@
WriteFile -Path (Join-Path $Root "components/shared/Providers.jsx") -Content $providersContent

# 4d. Corriger les imports dans les slices app/store/
$storeSlicePath = Join-Path $Root "app/store/slices"
if (Test-Path $storeSlicePath) {
    Get-ChildItem -Path $storeSlicePath -Filter "*.js" | Where-Object { !$_.PSIsContainer } | ForEach-Object {
        PatchFile -Path $_.FullName -Replacements @(
            @{ From = '../../../../packages/shared/api/api'
               To   = '@/lib/api' }
        )
    }
}

# ════════════════════════════════════════════════════════════════════════════════
# CATEGORIE 5 — lib/api.jsx : separer client et server
# ════════════════════════════════════════════════════════════════════════════════
Write-Step "5 - lib/api : separation client / serveur"

$apiClient = @'
"use client";

/**
 * lib/api.jsx - Instance Axios cote CLIENT uniquement.
 */
import axios from "axios";

const API_BASE =
  typeof window === "undefined"
    ? (process.env.NEXT_PUBLIC_API_BASE || "https://tekalis.onrender.com") + "/api/v1"
    : "/api/v1";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

if (typeof window !== "undefined") {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  api.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      return Promise.reject(err);
    }
  );
}

export default api;
'@
WriteFile -Path (Join-Path $Root "lib/api.jsx") -Content $apiClient

$serverFetch = @'
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
WriteFile -Path (Join-Path $Root "lib/serverFetch.js") -Content $serverFetch

$appPages = Join-Path $Root "app"
if (Test-Path $appPages) {
    Get-ChildItem -Path $appPages -Recurse -Include "*.jsx","*.js" | Where-Object { !$_.PSIsContainer } | ForEach-Object {
        PatchFile -Path $_.FullName -Replacements @(
            @{ From = '{ serverFetch } from "@/lib/api"'
               To   = '{ serverFetch } from "@/lib/serverFetch"' }
            @{ From = "{ serverFetch } from '@/lib/api'"
               To   = '{ serverFetch } from "@/lib/serverFetch"' }
            @{ From = '{ serverFetch } from "../../lib/api"'
               To   = '{ serverFetch } from "@/lib/serverFetch"' }
        )
    }
}

# ════════════════════════════════════════════════════════════════════════════════
# CATEGORIE 6 — react-helmet-async -> supprime
# ════════════════════════════════════════════════════════════════════════════════
Write-Step "6 - react-helmet-async supprime"

$helmetRep = @(
    @{ From = 'import { Helmet } from "react-helmet-async";'
       To   = '// Helmet supprime - utiliser metadata export de Next.js' }
    @{ From = "import { Helmet } from 'react-helmet-async';"
       To   = '// Helmet supprime - utiliser metadata export de Next.js' }
    @{ From = 'import { HelmetProvider } from "react-helmet-async";'
       To   = '' }
    @{ From = "import { HelmetProvider } from 'react-helmet-async';"
       To   = '' }
    @{ From = '<HelmetProvider>'
       To   = '' }
    @{ From = '</HelmetProvider>'
       To   = '' }
)

foreach ($subdir in @("components", "app")) {
    $path = Join-Path $Root $subdir
    if (Test-Path $path) {
        Get-ChildItem -Path $path -Recurse -Include "*.jsx","*.js" | Where-Object { !$_.PSIsContainer } | ForEach-Object {
            PatchFile -Path $_.FullName -Replacements $helmetRep
        }
    }
}

$pageMetaNoop = @'
/**
 * PageMeta - NOOP en App Router Next.js.
 * Les metadonnees SEO sont gerees par export const metadata dans chaque page.
 */
const PageMeta = () => null;
export default PageMeta;
'@
WriteFile -Path (Join-Path $Root "components/seo/PageMeta.jsx") -Content $pageMetaNoop

# ════════════════════════════════════════════════════════════════════════════════
# CATEGORIE 7 — Structure de fichiers / dossiers
# ════════════════════════════════════════════════════════════════════════════════
Write-Step "7 - Correction de la structure des fichiers"

# 7a. app/products.jsx/ (dossier malforme)
$badProductsDir  = Join-Path $Root "app/products.jsx"
$goodProductsDir = Join-Path $Root "app/products"

if (Test-Path $badProductsDir -PathType Container) {
    if (!(Test-Path $goodProductsDir)) {
        if (!$DryRun) { New-Item -ItemType Directory -Path $goodProductsDir -Force | Out-Null }
        Write-Fix "Cree : app/products/"
    }
    $pf = Join-Path $badProductsDir "page.jsx"
    if (Test-Path $pf) {
        $dest = Join-Path $goodProductsDir "page.jsx"
        if (!(Test-Path $dest)) {
            if (!$DryRun) { Copy-Item $pf $dest }
            Write-Fix "Copie : app/products/page.jsx"
        }
    }
    $idDir = Join-Path $badProductsDir "[id]"
    if (Test-Path $idDir) {
        $destId = Join-Path $goodProductsDir "[id]"
        if (!(Test-Path $destId)) {
            if (!$DryRun) {
                New-Item -ItemType Directory -Path $destId -Force | Out-Null
                $src = Join-Path $idDir "page.jsx"
                if (Test-Path $src) { Copy-Item $src (Join-Path $destId "page.jsx") }
            }
            Write-Fix "Copie : app/products/[id]/page.jsx"
        }
    }
    if (!$DryRun) { Remove-Item $badProductsDir -Recurse -Force }
    Write-Fix "Supprime : app/products.jsx/ (dossier malforme)"
}

# 7b. loanding.jsx -> loading.jsx
$loanding = Join-Path $Root "app/loanding.jsx"
$loading  = Join-Path $Root "app/loading.jsx"
if ((Test-Path $loanding) -and !(Test-Path $loading)) {
    if (!$DryRun) { Copy-Item $loanding $loading }
    Write-Fix "Renomme : loanding.jsx -> loading.jsx"
}

# 7c. app/error.jsx
$errorPage  = Join-Path $Root "app/error.jsx"
$errorEmpty = $true
if (Test-Path $errorPage) {
    $errorText = [System.IO.File]::ReadAllText($errorPage).Trim()
    if ($errorText -ne '' -and $errorText -ne '"use client";') { $errorEmpty = $false }
}
if ($errorEmpty) {
    $errorContent = @'
"use client";

import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Quelque chose s&apos;est mal passe
        </h2>
        <p className="text-gray-600 mb-6">{error?.message || "Erreur inattendue"}</p>
        <button
          onClick={() => reset()}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Reessayer
        </button>
      </div>
    </div>
  );
}
'@
    WriteFile -Path $errorPage -Content $errorContent
}

# 7d. app/loading.jsx
$loadingEmpty = $true
if (Test-Path $loading) {
    $loadingText = [System.IO.File]::ReadAllText($loading).Trim()
    if ($loadingText -ne '') { $loadingEmpty = $false }
}
if ($loadingEmpty) {
    $loadingContent = @'
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600" />
    </div>
  );
}
'@
    WriteFile -Path $loading -Content $loadingContent
}

# 7e. app/not-found.jsx
$notFoundContent = @'
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Page introuvable</h2>
        <p className="text-gray-600 mb-8">
          La page que vous recherchez n&apos;existe pas ou a ete deplacee.
        </p>
        <Link
          href="/"
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Retour a l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
'@
WriteFile -Path (Join-Path $Root "app/not-found.jsx") -Content $notFoundContent

# ════════════════════════════════════════════════════════════════════════════════
# CATEGORIE 8 — Pages squelettes + package.json
# ════════════════════════════════════════════════════════════════════════════════
Write-Step "8 - Pages squelettes et package.json"

# Fonction utilitaire : ecrire une page seulement si vide
function WritePageIfEmpty {
    param([string]$RelPath, [string]$Content)
    $fullPath = Join-Path $Root $RelPath
    $existing = ""
    if (Test-Path $fullPath) {
        $existing = [System.IO.File]::ReadAllText($fullPath).Trim()
    }
    $isEmpty = ($existing -eq "" -or
                $existing -match "export default function Page\(\)" -or
                $existing -match "return <div>.*Page.*</div>")
    if ($isEmpty) {
        WriteFile -Path $fullPath -Content $Content
    } else {
        Write-Skip "Conserve (non-vide) : $RelPath"
    }
}

WritePageIfEmpty "app/cart/page.jsx" @'
import CartClient from "@/components/cart/CartClient";
export const metadata = { title: "Mon Panier | Tekalis" };
export default function CartPage() { return <CartClient />; }
'@

WritePageIfEmpty "app/checkout/page.jsx" @'
import CheckoutClient from "@/components/checkout/CheckoutClient";
export const metadata = { title: "Finaliser la commande | Tekalis", robots: { index: false } };
export default function CheckoutPage() { return <CheckoutClient />; }
'@

WritePageIfEmpty "app/login/page.jsx" @'
import LoginClient from "@/components/auth/LoginClient";
export const metadata = { title: "Connexion | Tekalis" };
export default function LoginPage() { return <LoginClient />; }
'@

WritePageIfEmpty "app/register/page.jsx" @'
import RegisterClient from "@/components/auth/RegisterClient";
export const metadata = { title: "Creer un compte | Tekalis" };
export default function RegisterPage() { return <RegisterClient />; }
'@

WritePageIfEmpty "app/wishlist/page.jsx" @'
import WishlistClient from "@/components/account/WishlistClient";
export const metadata = { title: "Mes Favoris | Tekalis", robots: { index: false } };
export default function WishlistPage() { return <WishlistClient />; }
'@

WritePageIfEmpty "app/dashboard/page.jsx" @'
import DashboardClient from "@/components/account/DashboardClient";
export const metadata = { title: "Mon Espace | Tekalis", robots: { index: false } };
export default function DashboardPage() { return <DashboardClient />; }
'@

WritePageIfEmpty "app/dashboard/orders/page.jsx" @'
import MyOrdersClient from "@/components/account/MyOrdersClient";
export const metadata = { title: "Mes Commandes | Tekalis", robots: { index: false } };
export default function OrdersPage() { return <MyOrdersClient />; }
'@

WritePageIfEmpty "app/dashboard/orders/[id]/page.jsx" @'
import OrderDetailsClient from "@/components/account/OrderDetailsClient";
export default function OrderDetailPage({ params }) {
  return <OrderDetailsClient orderId={params.id} />;
}
'@

WritePageIfEmpty "app/apropos/page.jsx" @'
import AproposClient from "@/components/static/AproposClient";
export const metadata = { title: "A propos | Tekalis" };
export default function AproposPage() { return <AproposClient />; }
'@

WritePageIfEmpty "app/contact/page.jsx" @'
import ContactClient from "@/components/static/ContactClient";
export const metadata = { title: "Contact | Tekalis" };
export default function ContactPage() { return <ContactClient />; }
'@

WritePageIfEmpty "app/politique/page.jsx" @'
import PolitiqueClient from "@/components/static/PolitiqueClient";
export const metadata = { title: "Confidentialite | Tekalis" };
export default function PolitiquePage() { return <PolitiqueClient />; }
'@

WritePageIfEmpty "app/configurator/page.jsx" @'
import ConfiguratorClient from "@/components/configurator/ConfiguratorClient";
export const metadata = { title: "Configurateur PC | Tekalis" };
export default function ConfiguratorPage() { return <ConfiguratorClient />; }
'@

WritePageIfEmpty "app/dashboard/addresses/page.jsx" @'
import AddressesClient from "@/components/account/AddressesClient";
export default function AddressesPage() { return <AddressesClient />; }
'@

WritePageIfEmpty "app/dashboard/wishlist/page.jsx" @'
import WishlistClient from "@/components/account/WishlistClient";
export default function DashboardWishlistPage() { return <WishlistClient />; }
'@

WritePageIfEmpty "app/dashboard/warranties/page.jsx" @'
import MyWarrantiesClient from "@/components/account/MyWarrantiesClient";
export default function WarrantiesPage() { return <MyWarrantiesClient />; }
'@

WritePageIfEmpty "app/dashboard/rma/page.jsx" @'
import MyRMAClient from "@/components/account/MyRMAClient";
export default function RMAPage() { return <MyRMAClient />; }
'@

# 8b. package.json
$pkgPath = Join-Path $Root "package.json"
if (Test-Path $pkgPath) {
    $pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json

    $deps = @{
        "next"             = "^15.3.3"
        "react"            = "^19.0.0"
        "react-dom"        = "^19.0.0"
        "@reduxjs/toolkit" = "^2.3.0"
        "react-redux"      = "^9.1.0"
        "axios"            = "^1.7.0"
        "react-icons"      = "^5.3.0"
        "prop-types"       = "^15.8.1"
    }

    $devDeps = @{
        "@tailwindcss/postcss" = "^4.0.0"
        "tailwindcss"          = "^4.0.0"
        "@types/node"          = "^20"
        "@types/react"         = "^19"
        "@types/react-dom"     = "^19"
        "typescript"           = "^5"
    }

    if (!$pkg.PSObject.Properties['dependencies']) {
        $pkg | Add-Member -MemberType NoteProperty -Name 'dependencies' -Value ([PSCustomObject]@{})
    }
    if (!$pkg.PSObject.Properties['devDependencies']) {
        $pkg | Add-Member -MemberType NoteProperty -Name 'devDependencies' -Value ([PSCustomObject]@{})
    }

    foreach ($k in $deps.Keys) {
        if (!$pkg.dependencies.PSObject.Properties[$k]) {
            $pkg.dependencies | Add-Member -MemberType NoteProperty -Name $k -Value $deps[$k]
        }
    }
    foreach ($k in $devDeps.Keys) {
        if (!$pkg.devDependencies.PSObject.Properties[$k]) {
            $pkg.devDependencies | Add-Member -MemberType NoteProperty -Name $k -Value $devDeps[$k]
        }
    }

    if ($pkg.dependencies.PSObject.Properties['react-helmet-async']) {
        $pkg.dependencies.PSObject.Properties.Remove('react-helmet-async')
    }

    if (!$DryRun) {
        $pkg | ConvertTo-Json -Depth 10 | Set-Content $pkgPath -Encoding UTF8
    }
    Write-Fix "package.json mis a jour"
}

# 8c. .env.local
$envPath = Join-Path $Root ".env.local"
if (!(Test-Path $envPath)) {
    WriteFile -Path $envPath -Content "NEXT_PUBLIC_API_BASE=https://tekalis.onrender.com`n"
}

# ════════════════════════════════════════════════════════════════════════════════
# BILAN FINAL
# ════════════════════════════════════════════════════════════════════════════════
Write-Host "`n$('=' * 70)" -ForegroundColor White
Write-Host " TERMINE : Fix-TekalisNext" -ForegroundColor Green
Write-Host "$('=' * 70)" -ForegroundColor White

Write-Host ""
Write-Host "Etapes manuelles restantes :" -ForegroundColor Cyan
Write-Host "  1. npm install"
Write-Host "  2. Chercher les <Link to=`"/ residuels :"
Write-Host '     Select-String -Path (Get-ChildItem -Recurse -Include *.jsx,*.js) -Pattern "to=`"/"'
Write-Host "  3. next build"
Write-Host "  4. npm run dev"
Write-Host ""
Write-Host "Verification rapide des imports restants :" -ForegroundColor Cyan
Write-Host '  Select-String -Path (Get-ChildItem -Recurse -Include *.jsx,*.js) -Pattern "react-router-dom|packages/shared" | Select-Object Filename,LineNumber,Line'