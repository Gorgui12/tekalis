import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import AdminHeader from './AdminHeader';


/**
 * AdminLayout — Wraps toutes les pages admin.
 * Structure : Sidebar fixe gauche + zone contenu principale
 */
const AdminLayout = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  // Fermer le menu mobile à chaque navigation
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  // Guard : pas connecté ou pas admin → redirect
  if (!user || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  // ✅ Gère les deux formats : { role: 'admin' } ET { isAdmin: true }
  const isAdmin = user?.role === 'admin' || user?.isAdmin === true;
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      {/* ── Overlay mobile ──────────────────────────────── */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────── */}
      <Sidebar
        isOpen={sidebarOpen}
        isMobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* ── Zone principale ──────────────────────────────── */}
      <div
        className={`
          flex flex-col flex-1 min-w-0 overflow-hidden
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}
        `}
      >
        {/* Header */}
        <AdminHeader
          onMenuClick={() => setMobileSidebarOpen(true)}
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />

        {/* Contenu scrollable */}
        <main className="flex-1 overflow-y-auto bg-gray-950">
          <div className="p-6 max-w-screen-2xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;