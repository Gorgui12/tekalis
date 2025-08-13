import { Routes, Route } from "react-router-dom";

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
import Login from "./pages/client/Login";         // 👈 Login unique
import Register from "./pages/client/Register"; // 👈 Register utilisateur uniquement
import AdminRegister from "./pages/admin/Register";

// Composants admin
import Dashboard from "./pages/admin/Dashboard";
import AdminOrders from "./pages/admin/Orders";
import Payments from "./pages/admin/Payments";
import Statistiques from "./pages/admin/Statistiques";
import AddProduct from "./pages/admin/AddProduct";


//import AdminRoute from "./components/admin/AdminRoute"; // 👈 Pour protéger les routes admin

// Fallback facultatif
// import NotFound from "./pages/NotFound";

function App() {
  return (
    <>
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

        {/* 🔐 Admin Routes protégées */}
        <Route
          path="/admin"
          element={
            //<AdminRoute>
              <Dashboard />
            //</AdminRoute>
          }
        />
        <Route 
        path="/admin/register" 
        element={
          //<AdminRoute>
        <AdminRegister />
        //</AdminRoute>
        } />

        <Route
          path="/admin/orders"
          element={
            //<AdminRoute>
              <AdminOrders />
            //</AdminRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            //<AdminRoute>
              <Payments />
            //</AdminRoute>
          }
        />
        <Route
          path="/admin/statistiques"
          element={
            //<AdminRoute>
              <Statistiques />
            //</AdminRoute>
          }
        />
        <Route
          path="/admin/add-product"
          element={
           // <AdminRoute>
              <AddProduct />
           // </AdminRoute>
          }
        />

        {/* Optionnel */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>

      <Footer />
    </>
  );
}

export default App;
