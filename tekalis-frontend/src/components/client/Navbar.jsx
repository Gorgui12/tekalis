import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState } from "react";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items); // ✅ récupérer le panier
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleProfileClick = () => {
    if (user?.isAdmin) {
      navigate("/admin");
    } else {
      navigate("/profile");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
      setMenuOpen(false);
    }
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold">Tekalis</Link>

        {/* Champ de recherche (desktop) */}
        <form
          onSubmit={handleSearch}
          className="hidden sm:flex flex-1 mx-4"
        >
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un produit..."
            className="w-full rounded px-3 py-1 text-black text-sm"
          />
        </form>

        {/* Icônes à droite */}
        <div className="flex items-center space-x-4">
          {/* Recherche (mobile seulement) */}
          <form onSubmit={handleSearch} className="sm:hidden">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍"
              className="w-20 rounded px-2 py-1 text-black text-sm"
            />
          </form>

          {/* Panier avec badge */}
          <Link to="/cart" className="relative text-lg">
            🛒
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {cartItems.length}
              </span>
            )}
          </Link>

          {/* Profil / Connexion */}
          {!user ? (
            <Link to="/login" className="text-lg">🔑</Link>
          ) : (
            <button onClick={handleProfileClick} className="text-lg" title={user.name}>
              👤
            </button>
          )}

          {/* Menu Burger (mobile seulement) */}
          <button
            className="sm:hidden text-2xl"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Menu mobile déroulant */}
      {menuOpen && (
        <div className="sm:hidden bg-blue-700 px-4 py-3 space-y-2">
          <Link to="/" className="block hover:underline">Accueil</Link>
          <Link to="/products" className="block hover:underline">Produits</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
