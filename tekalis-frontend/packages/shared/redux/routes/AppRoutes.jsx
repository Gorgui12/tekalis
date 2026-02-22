import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Layouts
import ClientLayout from "../layouts/ClientLayout";
import AdminLayout from "../layouts/AdminLayout";

// Routes
import ClientRoutes from "./ClientRoutes";
import AdminRoutes from "./AdminRoutes";

// Pages d'authentification
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

// Page 404
import NotFound from "../pages/NotFound";

const AppRoutes = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <Routes>
      {/* Routes d'authentification */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Routes client avec layout */}
      <Route path="/*" element={<ClientLayout />}>
        <Route path="*" element={<ClientRoutes />} />
      </Route>

      {/* Routes admin avec layout */}
      <Route
        path="/admin/*"
        element={
          user?.isAdmin ? (
            <AdminLayout />
          ) : (
            <Navigate to="/" replace />
          )
        }
      >
        <Route path="*" element={<AdminRoutes />} />
      </Route>

      {/* Page 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;