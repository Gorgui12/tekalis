import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Guard admin (vérifie le rôle)
import AdminGuard from "./routes/AdminGuard";

// Layout admin
import AdminLayout from "./components/layout/AdminLayout";

// Pages admin — chargées à la demande (code-splitting, réduction du bundle initial)
const AdminLogin = lazy(() => import("./pages/Login"));
const AdminDashboard = lazy(() => import("./pages/Dashboard"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Statistiques = lazy(() => import("./pages/Statistiques"));
const Trends = lazy(() => import("./pages/Trends"));

// Commandes
const AdminOrders = lazy(() => import("./pages/Orders"));
const AdminOrderDetails = lazy(() => import("./pages/OrderDetails"));
const Payments = lazy(() => import("./pages/Payments"));

// Produits
const AdminProducts = lazy(() => import("./pages/AdminProducts"));
const AddProduct = lazy(() => import("./pages/AddProduct"));
const EditProduct = lazy(() => import("./pages/EditProduct"));
const Categories = lazy(() => import("./pages/Categories"));

// Utilisateurs & avis
const Users = lazy(() => import("./pages/Users"));
const Reviews = lazy(() => import("./pages/Reviews"));

// SAV
const Warranties = lazy(() => import("./pages/Warranties"));
const RMA = lazy(() => import("./pages/RMA"));

// Blog
const Articles = lazy(() => import("./pages/Articles"));
const AddArticle = lazy(() => import("./pages/AddArticle"));
const EditArticle = lazy(() => import("./pages/EditArticle"));

// Divers
const PromoCodes = lazy(() => import("./pages/PromoCodes"));
const Settings = lazy(() => import("./pages/Settings"));
const HeroSlides = lazy(() => import("./pages/HeroSlides"));
const Database = lazy(() => import("./pages/Database"));

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
      <p className="mt-4 text-gray-500 text-sm">Chargement…</p>
    </div>
  </div>
);

function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* ─────────────────────────────────────────
            PAGE PUBLIQUE : Login admin
            Accessible sans être connecté
        ───────────────────────────────────────── */}
        <Route path="/login" element={<AdminLogin />} />

        {/* ─────────────────────────────────────────
            ROUTES PROTÉGÉES : admin seulement
            AdminGuard vérifie token + rôle === 'admin'
        ───────────────────────────────────────── */}
        <Route element={<AdminGuard />}>
          {/* AdminLayout = sidebar + header communs */}
          <Route element={<AdminLayout />}>

            {/* Hero slides */}
            <Route path="/hero-slides" element={<HeroSlides />} />

            {/* Redirect racine → dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Dashboard */}
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/trends" element={<Trends />} />
            <Route path="/statistiques" element={<Statistiques />} />

            {/* Commandes */}
            <Route path="/orders" element={<AdminOrders />} />
            <Route path="/orders/:id" element={<AdminOrderDetails />} />
            <Route path="/payments" element={<Payments />} />

            {/* Produits */}
            <Route path="/products" element={<AdminProducts />} />
            <Route path="/products/add" element={<AddProduct />} />
            <Route path="/products/edit/:id" element={<EditProduct />} />
            <Route path="/categories" element={<Categories />} />

            {/* Utilisateurs */}
            <Route path="/users" element={<Users />} />

            {/* Avis */}
            <Route path="/reviews" element={<Reviews />} />

            {/* SAV */}
            <Route path="/warranties" element={<Warranties />} />
            <Route path="/rma" element={<RMA />} />

            {/* Blog */}
            <Route path="/articles" element={<Articles />} />
            <Route path="/articles/add" element={<AddArticle />} />
            <Route path="/articles/edit/:id" element={<EditArticle />} />

            {/* Promo */}
            <Route path="/promo-codes" element={<PromoCodes />} />

            {/* Base de données */}
            <Route path="/database" element={<Database />} />

            {/* Paramètres */}
            <Route path="/settings" element={<Settings />} />

          </Route>
        </Route>

        {/* 404 admin */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;