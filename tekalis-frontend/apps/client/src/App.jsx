import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ReactGA from "react-ga4";

// Layout
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import WhatsAppButton from "./components/WhatsAppButton";

// Route guards
import ProtectedRoute from "./routes/protectedRoute";

// Pages publiques
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import CategoryPage from "./pages/CategoryPage";
import Blog from "./pages/Blog";
import ArticleDetails from "./pages/ArticleDetails";
import Configurator from "./pages/Configurator";
import Apropos from "./pages/Apropos";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";

// Pages protégées (client connecté)
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import UserOrders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Profile from "./pages/Profile";
import ClientDashboard from "./pages/Dashboard";
import MyOrders from "./pages/MyOrders";
import MyWarranties from "./pages/MyWarranties";
import MyRMA from "./pages/MyRMA";
import CreateRMA from "./pages/CreateRMA";
import Wishlist from "./pages/WishList";
import Addresses from "./pages/Addresses";

// GA4
ReactGA.initialize("G-PJ4RDYQ3EQ");

function App() {
  // Suivi des pages GA4 via hook dédié
  useEffect(() => {
    const handleRouteChange = () => {
      ReactGA.send({ hitType: "pageview", page: window.location.pathname });
    };

    // Écouter les changements de navigation
    window.addEventListener("popstate", handleRouteChange);
    handleRouteChange(); // Track la page initiale

    return () => window.removeEventListener("popstate", handleRouteChange);
  }, []);

  return (
    <div className="pt-[100px]">
      <Navbar />

      <Routes>
        {/* ─────────────────────────────────────────
            PAGES PUBLIQUES (sans authentification)
        ───────────────────────────────────────── */}

        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/category/:categoryName" element={<CategoryPage />} />

        {/* Blog */}
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<ArticleDetails />} />

        {/* Configurateur */}
        <Route path="/configurator" element={<Configurator />} />

        {/* Pages statiques */}
        <Route path="/apropos" element={<Apropos />} />

        {/* Paiement */}
        <Route path="/payment/success/:orderId" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ─────────────────────────────────────────
            PAGES PROTÉGÉES (client connecté requis)
        ───────────────────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          {/* Panier & Commandes */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<UserOrders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />

          {/* Profil */}
          <Route path="/profile" element={<Profile />} />

          {/* Dashboard client */}
          <Route path="/dashboard" element={<ClientDashboard />} />
          <Route path="/dashboard/orders" element={<MyOrders />} />
          <Route path="/dashboard/warranties" element={<MyWarranties />} />
          <Route path="/dashboard/rma" element={<MyRMA />} />
          <Route path="/dashboard/rma/create" element={<CreateRMA />} />
          <Route path="/dashboard/wishlist" element={<Wishlist />} />
          <Route path="/dashboard/addresses" element={<Addresses />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default App;