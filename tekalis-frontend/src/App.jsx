import axios from "axios";

// 🔥 CORRECTION PRODUCTION : Configuration avec fallback
// Remplacez l'URL ci-dessous par votre VRAIE URL backend
const FALLBACK_API_URL = "https://api.tekalis.com/api/v1"; // ⚠️ MODIFIEZ CETTE URL !

const API_BASE_URL = import.meta.env.VITE_API_URL || FALLBACK_API_URL;

// 🐛 DEBUG : Logs pour identifier le problème
console.log("🌍 Mode:", import.meta.env.MODE);
console.log("🌍 VITE_API_URL:", import.meta.env.VITE_API_URL);
console.log("🌍 API_BASE_URL utilisé:", API_BASE_URL);

// ⚠️ ALERTE si undefined
if (API_BASE_URL.includes("undefined")) {
  console.error("🚨 ERREUR: API_BASE_URL contient 'undefined'!");
  console.error("🔧 Solution: Définissez VITE_API_URL dans vos variables d'environnement");
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 secondes
  withCredentials: false, // Changez en true si vous utilisez des cookies
});

// 📡 Request Interceptor (avant l'envoi)
api.interceptors.request.use(
  (config) => {
    // Log détaillé pour debug
    console.log("📡 API Request:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      data: config.data,
      headers: config.headers
    });

    // Ajouter le token si disponible
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error("🚨 Request Error:", error);
    return Promise.reject(error);
  }
);

// 📥 Response Interceptor (après réception)
api.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    
    // 🔥 VÉRIFICATION: Si la réponse est du HTML au lieu de JSON
    if (typeof response.data === "string" && response.data.includes("<!doctype html>")) {
      console.error("⚠️ ERREUR: L'API a retourné du HTML au lieu de JSON!");
      console.error("🔧 Vérifiez que votre backend est bien configuré");
      console.error("🔧 URL appelée:", `${response.config.baseURL}${response.config.url}`);
      
      throw new Error("L'API a retourné du HTML au lieu de JSON. Vérifiez votre configuration backend.");
    }
    
    return response;
  },
  (error) => {
    console.error("🚨 API Error:", {
      url: error.config?.url,
      fullURL: error.config ? `${error.config.baseURL}${error.config.url}` : "N/A",
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });

    // Gestion des erreurs spécifiques
    if (error.response) {
      const { status } = error.response;
      
      // 401 - Non authentifié
      if (status === 401) {
        console.warn("🔐 Session expirée, redirection vers login...");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        
        // Éviter la redirection infinie si on est déjà sur /login
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
      
      // 403 - Non autorisé
      if (status === 403) {
        console.warn("🚫 Accès refusé");
      }
      
      // 404 - Non trouvé
      if (status === 404) {
        console.warn("❌ Ressource non trouvée");
      }
      
      // 405 - Méthode non autorisée
      if (status === 405) {
        console.error("❌ Méthode HTTP non autorisée pour cette route");
        console.error("🔧 Vérifiez que la route existe côté backend");
      }
      
      // 500+ - Erreur serveur
      if (status >= 500) {
        console.error("💥 Erreur serveur");
      }
    } else if (error.request) {
      // La requête a été faite mais aucune réponse reçue
      console.error("📡 Aucune réponse du serveur");
      console.error("🔧 Vérifiez que votre backend est accessible");
      console.error("🔧 Vérifiez les CORS si backend sur un autre domaine");
    } else {
      // Erreur lors de la configuration de la requête
      console.error("⚙️ Erreur de configuration:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;

// 🔧 Helper pour tester la connexion API
export const testAPIConnection = async () => {
  console.log("🧪 Test de connexion API...");
  console.log("🌍 URL testée:", API_BASE_URL);
  
  try {
    const response = await api.get("/products");
    console.log("✅ API accessible:", response.data);
    return true;
  } catch (error) {
    console.error("❌ API non accessible:", error.message);
    return false;
  }
};



import { useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import ReactGA from "react-ga4";
import WhatsAppButton from "./components/client/WhatsAppButton";

// Layout Components
import Navbar from "./components/client/layout/Navbar";
import Footer from "./components/client/layout/Footer";

// Client Pages
import Home from "./pages/client/Home";
import Products from "./pages/client/Products";
import ProductDetails from "./pages/client/ProductDetails";
import CategoryPage from "./pages/client/CategoryPage";
import Cart from "./pages/client/Cart";
import Checkout from "./pages/client/Checkout";
import UserOrders from "./pages/client/Orders";
import OrderDetails from "./pages/client/OrderDetails";
import Profile from "./pages/client/Profile";
import ClientDashboard from "./pages/client/Dashboard";
import MyOrders from "./pages/client/MyOrders";
import MyWarranties from "./pages/client/MyWarranties";
import MyRMA from "./pages/client/MyRMA";
import CreateRMA from "./pages/client/CreateRMA";

// ⚠️ Correct car fichier = WishList.jsx
import Wishlist from "./pages/client/WishList";

// OK
import Addresses from "./pages/client/Addresses";
import Blog from "./pages/client/Blog";
import ArticleDetails from "./pages/client/ArticleDetails";
import Configurator from "./pages/client/Configurator";

import PaymentSuccess from "./pages/client/PaymentSuccess";
import PaymentCancel from "./pages/client/PaymentCancel";

// ⚠️ Correct car fichier = apropos.jsx (minuscule)
import Apropos from "./pages/client/apropos";

// Login/Register
import Login from "./pages/client/Login";
import Register from "./pages/client/Register";


// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminOrders from "./pages/admin/Orders";
import AdminOrderDetails from "./pages/admin/OrderDetails";
import AdminProducts from "./pages/admin/AdminProducts";
import AddProduct from "./pages/admin/AddProduct";
import EditProduct from "./pages/admin/EditProduct";
import Categories from "./pages/admin/Categories";
import Reviews from "./pages/admin/Reviews";
import Warranties from "./pages/admin/Warranties";
import RMA from "./pages/admin/RMA";
import Users from "./pages/admin/Users";
import Articles from "./pages/admin/Articles";
import AddArticle from "./pages/admin/AddArticle";
import EditArticle from "./pages/admin/EditArticle";
import PromoCodes from "./pages/admin/PromoCodes";
import Settings from "./pages/admin/Settings";
import Analytics from "./pages/admin/Analytics";
import Payments from "./pages/admin/Payments";
import Statistiques from "./pages/admin/Statistiques";
import AdminLogin from "./pages/admin/Login";

// Protected Routes (à créer si nécessaire)
// import ProtectedRoute from "./routes/ProtectedRoute";
// import AdminRoute from "./routes/AdminRoute";

// ✅ Initialiser GA4
ReactGA.initialize("G-PJ4RDYQ3EQ");

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  // 📌 Suivi des pages à chaque changement de route
  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname });
  }, [location]);

  return (
    <div style={{ paddingTop: isAdminRoute ? '0' : '100px' }}>
      {/* Afficher Navbar uniquement sur les pages client */}
      {!isAdminRoute && <Navbar />}

      <Routes>
        {/* ═══════════════════════════════════════════════════════════════
            🌐 ROUTES CLIENT
        ═══════════════════════════════════════════════════════════════ */}
        
        {/* Pages principales */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/category/:categoryName" element={<CategoryPage />} />
        {/*<Route path="/search" element={<SearchResults />} /> */}
        
        {/* Panier & Commande */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<UserOrders />} />
        <Route path="/orders/:id" element={<OrderDetails />} />

        <Route path="/payment/success/:orderId" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />
        
        {/* Espace Client - Dashboard */}
        <Route path="/dashboard" element={<ClientDashboard />} />
        <Route path="/dashboard/orders" element={<MyOrders />} />
        <Route path="/dashboard/warranties" element={<MyWarranties />} />
        <Route path="/dashboard/rma" element={<MyRMA />} />
        <Route path="/dashboard/rma/create" element={<CreateRMA />} />
        <Route path="/dashboard/wishlist" element={<Wishlist />} />
        <Route path="/dashboard/addresses" element={<Addresses />} />
        <Route path="/profile" element={<Profile />} />
        
        {/* Blog */}
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<ArticleDetails />} />
        
        {/* Configurateur PC */}
        <Route path="/configurator" element={<Configurator />} />
        
        {/* Pages statiques */}
        <Route path="/apropos" element={<Apropos />} />
        {/* <Route path="/politique" element={<Politique />} />*/}
        
        {/* Authentification */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ═══════════════════════════════════════════════════════════════
            🔐 ROUTES ADMIN
        ═══════════════════════════════════════════════════════════════ */}
        
        {/* s */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        <Route path="/admin/statistiques" element={<Statistiques />} />
        
        {/* Gestion Commandes */}
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/orders/:id" element={<AdminOrderDetails />} />
        <Route path="/admin/payments" element={<Payments />} />
        
        {/* Gestion Produits */}
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/produits" element={<AdminProducts />} /> {/* Alias */}
        <Route path="/admin/add-product" element={<AddProduct />} />
        <Route path="/admin/products/edit/:id" element={<EditProduct />} />
        <Route path="/admin/categories" element={<Categories />} />
        
        {/* Gestion Avis */}
        <Route path="/admin/reviews" element={<Reviews />} />
        
        {/* Garanties & SAV */}
        <Route path="/admin/warranties" element={<Warranties />} />
        <Route path="/admin/rma" element={<RMA />} />
        
        {/* Gestion Blog */}
        <Route path="/admin/articles" element={<Articles />} />
        <Route path="/admin/articles/add" element={<AddArticle />} />
        <Route path="/admin/articles/edit/:id" element={<EditArticle />} />
        
        {/* Codes Promo */}
        <Route path="/admin/promo-codes" element={<PromoCodes />} />
        
        {/* Gestion Utilisateurs */}
        <Route path="/admin/users" element={<Users />} />
        
        {/* Paramètres */}
        <Route path="/admin/settings" element={<Settings />} />

        {/* ═══════════════════════════════════════════════════════════════
            🚫 404 - Redirection
        ═══════════════════════════════════════════════════════════════ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Footer uniquement sur les pages client */}
      {!isAdminRoute && <Footer />}
      
      {/* Bouton WhatsApp flottant (client uniquement) */}
      {!isAdminRoute && <WhatsAppButton />}
    </div>
  );
}

export default App;