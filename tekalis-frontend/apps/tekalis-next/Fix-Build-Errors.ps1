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

function ReadFile {
    param([string]$Path)
    return [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
}

function WriteFile {
    param([string]$Path, [string]$Content)
    $dir = Split-Path $Path
    if ($dir -and !(Test-Path $dir)) {
        if (!$DryRun) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    }
    if ($DryRun) { Write-Fix "[DryRun] Ecrirait : $Path" }
    else {
        [System.IO.File]::WriteAllText($Path, $Content, [System.Text.Encoding]::UTF8)
        Write-Fix "Ecrit : $Path"
    }
}

function PatchFile {
    param([string]$Path, [scriptblock]$Transform)
    if (!(Test-Path $Path)) { Write-Skip "Absent : $Path"; return }
    $content  = ReadFile $Path
    $original = $content
    $content  = & $Transform $content
    if ($content -ne $original) {
        if ($DryRun) { Write-Fix "[DryRun] Modifierait : $Path" }
        else {
            [System.IO.File]::WriteAllText($Path, $content, [System.Text.Encoding]::UTF8)
            Write-Fix "Patche : $Path"
        }
    } else {
        Write-Skip "Inchange : $Path"
    }
}

$Root = Resolve-Path $Root | Select-Object -ExpandProperty Path
Write-Host "`nFix-Build-Errors - Racine : $Root" -ForegroundColor White
if ($DryRun) { Write-Host "   Mode : DRY-RUN" -ForegroundColor Yellow }

# ============================================================
# ETAPE 1 - package.json : recrire proprement
# ============================================================
Write-Step "1 - Correction package.json"

$pkgPath = Join-Path $Root "package.json"
$pkgContent = @'
{
  "name": "tekalis-next",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^15.3.3",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@reduxjs/toolkit": "^2.3.0",
    "react-redux": "^9.1.0",
    "axios": "^1.7.0",
    "react-icons": "^5.3.0",
    "prop-types": "^15.8.1"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "typescript": "^5"
  }
}
'@
WriteFile -Path $pkgPath -Content $pkgContent

# ============================================================
# ETAPE 2 - Guillemets mixtes : " ouvert ' ferme
# Fichiers : ArticleDetailClient, HomeClient, CategoryClient
# ============================================================
Write-Step "2 - Correction des guillemets mixtes dans les imports"

$filesToFixQuotes = @(
    "components\blog\ArticleDetailClient.jsx",
    "components\home\HomeClient.jsx",
    "components\product\CategoryClient.jsx"
)

foreach ($rel in $filesToFixQuotes) {
    $path = Join-Path $Root $rel
    PatchFile -Path $path -Transform {
        param($c)
        # Remplace toute ligne : import X from "...'; -> import X from "@/...";
        # Pattern : guillemet double ouvrant, contenu, guillemet simple fermant
        $c = $c -replace 'from "(@/[^"'']+)''', 'from "$1"'
        # Cas HomeClient ligne 8 : import X from "@/components/DynamicHero';
        # -> import X from "@/components/home/DynamicHero";
        $c = $c -replace 'from "@/components/DynamicHero[''"]', 'from "@/components/home/DynamicHero"'
        return $c
    }
}

# ============================================================
# ETAPE 3 - useRouter defini deux fois
# LoginClient.jsx et Navbar.jsx
# ============================================================
Write-Step "3 - Suppression des imports useRouter en doublon"

function Remove-DuplicateUseRouter {
    param([string]$Path)
    PatchFile -Path $Path -Transform {
        param($c)
        # On cherche combien de fois useRouter est importe
        $pattern = 'import\s*\{[^}]*useRouter[^}]*\}\s*from\s*[''"]next/navigation[''"]'
        $matches_found = [regex]::Matches($c, $pattern)
        if ($matches_found.Count -le 1) { return $c }

        # Garder la premiere occurrence, supprimer les suivantes
        $first = $true
        $c = [regex]::Replace($c, $pattern, {
            param($m)
            if ($first) { $first = $false; return $m.Value }
            return ''
        })
        # Nettoyer les lignes vides excessives
        $c = $c -replace "(\r?\n){3,}", "`r`n`r`n"
        return $c
    }
}

Remove-DuplicateUseRouter -Path (Join-Path $Root "components\auth\LoginClient.jsx")
Remove-DuplicateUseRouter -Path (Join-Path $Root "components\layout\Navbar.jsx")

# ============================================================
# ETAPE 4 - Navbar : import SearchBarLive chemin relatif casse
# '../SearchBarLive' -> '@/components/shared/SearchBarLive'
# ============================================================
Write-Step "4 - Navbar : correction import SearchBarLive"

$navbarPath = Join-Path $Root "components\layout\Navbar.jsx"
PatchFile -Path $navbarPath -Transform {
    param($c)
    $c = $c -replace [regex]::Escape("import SearchBarLive from '../SearchBarLive';"), 'import SearchBarLive from "@/components/shared/SearchBarLive";'
    $c = $c -replace [regex]::Escape('import SearchBarLive from "../SearchBarLive";'), 'import SearchBarLive from "@/components/shared/SearchBarLive";'
    $c = $c -replace [regex]::Escape("import SearchBarLive from '../SearchBarLive'"), 'import SearchBarLive from "@/components/shared/SearchBarLive"'
    return $c
}

# ============================================================
# ETAPE 5 - CheckoutForm : import api casse '../@/lib/api'
# ============================================================
Write-Step "5 - CheckoutForm : correction import api"

$checkoutFormPath = Join-Path $Root "components\checkout\CheckoutForm.jsx"
PatchFile -Path $checkoutFormPath -Transform {
    param($c)
    $c = $c -replace [regex]::Escape('import api from "../@/lib/api";'), 'import api from "@/lib/api";'
    $c = $c -replace [regex]::Escape("import api from '../@/lib/api';"), 'import api from "@/lib/api";'
    $c = $c -replace [regex]::Escape('import api from "../@/lib/api"'), 'import api from "@/lib/api"'
    return $c
}

# ============================================================
# ETAPE 6 - lib/hooks/useProducts.js : '../api/api' -> '@/lib/api'
# ============================================================
Write-Step "6 - useProducts : correction import api"

$useProductsPath = Join-Path $Root "lib\hooks\useProducts.js"
PatchFile -Path $useProductsPath -Transform {
    param($c)
    $c = $c -replace [regex]::Escape('import api from "../api/api";'), 'import api from "@/lib/api";'
    $c = $c -replace [regex]::Escape("import api from '../api/api';"), 'import api from "@/lib/api";'
    $c = $c -replace [regex]::Escape('import api from "../api/api"'), 'import api from "@/lib/api"'
    return $c
}

# ============================================================
# ETAPE 7 - lib/hooks/useAuth.js : '../redux/slices/authSlice' -> '@/store/slices/authSlice'
# ============================================================
Write-Step "7 - useAuth : correction import authSlice"

$useAuthPath = Join-Path $Root "lib\hooks\useAuth.js"
PatchFile -Path $useAuthPath -Transform {
    param($c)
    $c = $c -replace [regex]::Escape('from "../redux/slices/authSlice"'), 'from "@/store/slices/authSlice"'
    $c = $c -replace [regex]::Escape("from '../redux/slices/authSlice'"), 'from "@/store/slices/authSlice"'
    return $c
}

# ============================================================
# ETAPE 8 - store/slices/ manquants : verifier et creer les slices vides si absents
# ============================================================
Write-Step "8 - Verification et creation des slices Redux manquants"

$slicesDir = Join-Path $Root "store\slices"

# authSlice
$authSlicePath = Join-Path $slicesDir "authSlice.js"
if (!(Test-Path $authSlicePath)) {
    WriteFile -Path $authSlicePath -Content @'
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";

export const loginUser = createAsyncThunk("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/login", credentials);
    if (typeof window !== "undefined") {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    return data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Erreur de connexion");
  }
});

export const registerUser = createAsyncThunk("auth/register", async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/register", userData);
    if (typeof window !== "undefined") {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    return data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Erreur d inscription");
  }
});

export const updateProfile = createAsyncThunk("auth/updateProfile", async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.put("/auth/profile", userData);
    return data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Erreur de mise a jour");
  }
});

const getUserFromStorage = () => {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
};

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: getUserFromStorage(),
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    const pending  = (state) => { state.loading = true;  state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };
    builder
      .addCase(loginUser.pending, pending)
      .addCase(loginUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(loginUser.rejected, rejected)
      .addCase(registerUser.pending, pending)
      .addCase(registerUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(registerUser.rejected, rejected)
      .addCase(updateProfile.pending, pending)
      .addCase(updateProfile.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(updateProfile.rejected, rejected);
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
'@
} else { Write-Skip "Deja present : store/slices/authSlice.js" }

# cartSlice
$cartSlicePath = Join-Path $slicesDir "cartSlice.js"
if (!(Test-Path $cartSlicePath)) {
    WriteFile -Path $cartSlicePath -Content @'
import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [], total: 0 },
  reducers: {
    addToCart: (state, action) => {
      const existing = state.items.find((i) => i._id === action.payload._id);
      if (existing) { existing.quantity += 1; }
      else { state.items.push({ ...action.payload, quantity: 1 }); }
      state.total = state.items.reduce((s, i) => s + i.price * i.quantity, 0);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((i) => i._id !== action.payload);
      state.total = state.items.reduce((s, i) => s + i.price * i.quantity, 0);
    },
    increaseQuantity: (state, action) => {
      const item = state.items.find((i) => i._id === action.payload);
      if (item) item.quantity += 1;
      state.total = state.items.reduce((s, i) => s + i.price * i.quantity, 0);
    },
    decreaseQuantity: (state, action) => {
      const item = state.items.find((i) => i._id === action.payload);
      if (item && item.quantity > 1) item.quantity -= 1;
      state.total = state.items.reduce((s, i) => s + i.price * i.quantity, 0);
    },
    clearCart: (state) => { state.items = []; state.total = 0; },
  },
});

export const { addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
'@
} else { Write-Skip "Deja present : store/slices/cartSlice.js" }

# wishlistSlice
$wishlistSlicePath = Join-Path $slicesDir "wishlistSlice.js"
if (!(Test-Path $wishlistSlicePath)) {
    WriteFile -Path $wishlistSlicePath -Content @'
import { createSlice } from "@reduxjs/toolkit";

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: { items: [] },
  reducers: {
    addToWishlist: (state, action) => {
      if (!state.items.find((i) => i._id === action.payload._id)) {
        state.items.push(action.payload);
      }
    },
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter((i) => i._id !== action.payload);
    },
    addToWishlistLocal: (state, action) => {
      if (!state.items.find((i) => i._id === action.payload._id)) {
        state.items.push(action.payload);
      }
    },
    removeFromWishlistLocal: (state, action) => {
      state.items = state.items.filter((i) => i._id !== action.payload);
    },
    clearWishlist: (state) => { state.items = []; },
  },
});

export const { addToWishlist, removeFromWishlist, addToWishlistLocal, removeFromWishlistLocal, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
'@
} else { Write-Skip "Deja present : store/slices/wishlistSlice.js" }

# productSlice
$productSlicePath = Join-Path $slicesDir "productSlice.js"
if (!(Test-Path $productSlicePath)) {
    WriteFile -Path $productSlicePath -Content @'
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";

export const fetchProducts = createAsyncThunk("products/fetchAll", async (params = {}, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString();
    const { data } = await api.get(`/products?${query}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Erreur chargement produits");
  }
});

export const fetchProductBySlug = createAsyncThunk("products/fetchBySlug", async (slug, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/products/slug/${slug}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Produit introuvable");
  }
});

const productSlice = createSlice({
  name: "products",
  initialState: {
    allProducts: [],
    currentProduct: null,
    loading: false,
    error: null,
    pagination: { page: 1, pages: 1, total: 0 },
  },
  reducers: {
    clearCurrentProduct: (state) => { state.currentProduct = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.allProducts = Array.isArray(action.payload) ? action.payload : (action.payload.products || []);
        if (action.payload.pagination) state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchProductBySlug.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => { state.loading = false; state.currentProduct = action.payload; })
      .addCase(fetchProductBySlug.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;
'@
} else { Write-Skip "Deja present : store/slices/productSlice.js" }

# uiSlice
$uiSlicePath = Join-Path $slicesDir "uiSlice.js"
if (!(Test-Path $uiSlicePath)) {
    WriteFile -Path $uiSlicePath -Content @'
import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: { theme: "light", sidebarOpen: false, modalOpen: false, modalContent: null },
  reducers: {
    toggleTheme: (state) => { state.theme = state.theme === "light" ? "dark" : "light"; },
    setTheme: (state, action) => { state.theme = action.payload; },
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    openModal: (state, action) => { state.modalOpen = true; state.modalContent = action.payload; },
    closeModal: (state) => { state.modalOpen = false; state.modalContent = null; },
  },
});

export const { toggleTheme, setTheme, toggleSidebar, openModal, closeModal } = uiSlice.actions;
export default uiSlice.reducer;
'@
} else { Write-Skip "Deja present : store/slices/uiSlice.js" }

# ============================================================
# ETAPE 9 - Scan global : tous les imports @/store/slices/* qui echouent
# Le probleme est que next.config.js mappe @ vers la racine du monorepo
# mais les slices sont dans apps/tekalis-next/store/slices/
# On verifie que next.config.js a le bon alias
# ============================================================
Write-Step "9 - Verification next.config.js (alias @)"

$nextConfigPath = Join-Path $Root "next.config.js"
if (!(Test-Path $nextConfigPath)) {
    $nextConfigPath = Join-Path $Root "next.config.mjs"
}
if (Test-Path $nextConfigPath) {
    $cfg = ReadFile $nextConfigPath
    Write-Host "  Contenu next.config : " -NoNewline
    Write-Host $cfg.Substring(0, [Math]::Min(300, $cfg.Length)) -ForegroundColor Gray
} else {
    Write-Warn "next.config.js absent - creation avec alias @"
    WriteFile -Path (Join-Path $Root "next.config.js") -Content @'
/** @type {import("next").NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

module.exports = nextConfig;
'@
}

# Verifier le tsconfig.json / jsconfig.json pour l'alias @
$jsconfigPath = Join-Path $Root "jsconfig.json"
$tsconfigPath = Join-Path $Root "tsconfig.json"

if (!(Test-Path $jsconfigPath) -and !(Test-Path $tsconfigPath)) {
    WriteFile -Path $jsconfigPath -Content @'
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
'@
} else {
    Write-Skip "jsconfig.json/tsconfig.json deja present"
}

# ============================================================
# ETAPE 10 - Verification residuelle globale
# ============================================================
Write-Step "10 - Scan des erreurs residuelles"

$patterns = @{
    "Guillemets mixtes"           = 'from "[^"]+'''
    "Chemin ../api/api"           = '\.\./api/api'
    "Chemin ../redux/slices"      = '\.\./redux/slices'
    "Chemin ../@/lib"             = '\.\./\@/lib'
    "Chemin ../SearchBarLive"     = '\.\./SearchBarLive'
    "packages/shared"             = 'packages/shared'
    "react-router-dom"            = 'react-router-dom'
}

$found = $false
$scanDirs = @("app", "components", "lib", "store")
foreach ($dir in $scanDirs) {
    $dirPath = Join-Path $Root $dir
    if (!(Test-Path $dirPath)) { continue }
    Get-ChildItem -Path $dirPath -Recurse -Include "*.jsx","*.js","*.ts","*.tsx" |
        Where-Object { !$_.PSIsContainer } | ForEach-Object {
            $content  = ReadFile $_.FullName
            $fileName = $_.FullName -replace [regex]::Escape($Root), ""
            foreach ($label in $patterns.Keys) {
                if ($content -match $patterns[$label]) {
                    Write-Warn "$label | $fileName"
                    $found = $true
                }
            }
        }
}
if (!$found) { Write-Fix "Aucune erreur residuelle detectee." }

# ============================================================
# BILAN
# ============================================================
Write-Host ""
Write-Host "======================================================" -ForegroundColor White
Write-Host " TERMINE : Fix-Build-Errors" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor White
Write-Host ""
Write-Host "Etapes suivantes :" -ForegroundColor Cyan
Write-Host "  1. npm install"
Write-Host "  2. npx next build"
Write-Host ""