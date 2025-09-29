import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import ReactGA from "react-ga4";
import WhatsAppButton from "./components/client/WhatsAppButton";

// Composants client
import Home from "./pages/client/Home";
import Products from "./pages/client/Products";
import ProductDetails from "./pages/client/ProductDetails";
import Cart from "./pages/client/Cart";
import Checkout from "./pages/client/Checkout";
import UserOrders from "./pages/client/Orders";
import Profile from "./pages/client/Profile";
import Navbar from "./components/client/Navbar";
import Footer from "./components/client/Footer";

// Auth
import Login from "./pages/client/Login";
import Register from "./pages/client/Register";
import AdminRegister from "./pages/admin/Register";

// Composants admin
import Dashboard from "./pages/admin/Dashboard";
import AdminOrders from "./pages/admin/Orders";
import Payments from "./pages/admin/Payments";
import Statistiques from "./pages/admin/Statistiques";
import AddProduct from "./pages/admin/AddProduct";
import AdminProducts from "./pages/admin/AdminProducts";
import EditProduct from "./pages/admin/EditProduct";

// ✅ Initialiser GA4 avec ton ID
ReactGA.initialize("G-PJ4RDYQ3EQ");

function App() {
  const location = useLocation();

  // 📌 Suivi des pages à chaque changement de route
  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname });
  }, [location]);

  return (
    <div style={{ paddingTop: '100px' }}>
      <Navbar />

      <Routes>
        {/* 🌐 Frontend Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<UserOrders />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 🔐 Admin Routes */}
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/payments" element={<Payments />} />
        <Route path="/admin/statistiques" element={<Statistiques />} />
        <Route path="/admin/add-product" element={<AddProduct />} />

        {/* ✅ Gestion produits */}
        <Route path="/admin/produits" element={<AdminProducts />} />
        <Route path="/admin/products/edit/:id" element={<EditProduct />} />

        {/* Optionnel */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>

      <Footer />
      {/* Bouton WhatsApp flottant */}
      <WhatsAppButton />
    </div>
  );
}

export default App;


