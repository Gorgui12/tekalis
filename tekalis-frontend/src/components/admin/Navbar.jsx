import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // ✅ supprime le token
    navigate("/login"); // ✅ redirection vers login
  };

  return (
    <nav className="p-4 bg-blue-500 text-white flex justify-between items-center">
      <h1 className="text-xl font-bold">Tekalis Admin</h1>
      <div className="flex space-x-4">
        <Link to="/admin" className="px-3 hover:underline">
          Dashboard
        </Link>
        <Link to="/admin/orders" className="px-3 hover:underline">
          Commandes
        </Link>
        <Link to="/admin/payments" className="px-3 hover:underline">
          Paiements
        </Link>
        <Link to="/admin/statistiques" className="px-3 hover:underline">
          Statistiques
        </Link>

        {/* ✅ Gestion Produits */}
        <Link to="/admin/produits" className="px-3 hover:underline">
          Produits
        </Link>
        <Link to="/admin/add-product" className="px-3 hover:underline">
          ➕ Ajouter
        </Link>

        {/* 🔴 Déconnexion */}
        <button
          onClick={handleLogout}
          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
        >
          Déconnexion
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
