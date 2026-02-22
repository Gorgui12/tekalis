import { Routes, Route, Navigate } from "react-router-dom";

// Guard admin (vérifie le rôle)
import AdminGuard from "./routes/AdminGuard";

// Layout admin
import AdminLayout from "./components/layout/AdminLayout";

// Pages admin
import AdminLogin from "./pages/Login";
import AdminDashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Statistiques from "./pages/Statistiques";

// Commandes
import AdminOrders from "./pages/Orders";
import AdminOrderDetails from "./pages/OrderDetails";
import Payments from "./pages/Payments";

// Produits
import AdminProducts from "./pages/AdminProducts";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import Categories from "./pages/Categories";

// Utilisateurs & avis
import Users from "./pages/Users";
import Reviews from "./pages/Reviews";

// SAV
import Warranties from "./pages/Warranties";
import RMA from "./pages/RMA";

// Blog
import Articles from "./pages/Articles";
import AddArticle from "./pages/AddArticle";
import EditArticle from "./pages/EditArticle";

// Divers
import PromoCodes from "./pages/PromoCodes";
import Settings from "./pages/Settings";

function App() {
  return (
    <Routes>
      {/* ─────────────────────────────────────────
          PAGE PUBLIQUE : Login admin
          Accessible sans être connecté
      ───────────────────────────────────────── */}
      <Route path="/login" element={<AdminLogin />} />

      {/* ─────────────────────────────────────────
          ROUTES PROTÉGÉES : admin seulement
          AdminGuard vérifie token + role === 'admin'
      ───────────────────────────────────────── */}
      <Route element={<AdminGuard />}>
        {/* AdminLayout = sidebar + header communs */}
        <Route element={<AdminLayout />}>

          {/* Redirect racine → dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/analytics" element={<Analytics />} />
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

          {/* Paramètres */}
          <Route path="/settings" element={<Settings />} />

        </Route>
      </Route>

      {/* 404 admin */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;