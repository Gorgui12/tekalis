import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState } from "react";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
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
    <nav className="fixed top-0 w-full z-50 bg-white text-blue-600 shadow-md"  >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Menu Burger + Logo */}
        <div className="flex items-center space-x-3">
          <button
            className="sm:hidden text-2xl"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
          <Link to="/" className="text-xl font-bold">Tekalis</Link>
        </div>

        {/* Icônes à droite */}
        <div className="flex items-center space-x-4">
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
        </div>
      </div>

      {/* Barre de recherche toujours en bas */}
      <div className="bg-gray-100 px-4 py-2">
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un produit..."
            className="flex-1 rounded-l px-3 py-2 border text-sm text-gray-700"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 rounded-r"
          >
            🔍
          </button>
        </form>
      </div>

      {/* Menu mobile déroulant */}
      {menuOpen && (
        <div className="sm:hidden bg-blue-50 px-4 py-3 space-y-2 text-blue-700">
          <Link to="/" className="block hover:underline">Accueil</Link>
          <Link to="/products" className="block hover:underline">Produits</Link>
          <Link to="/apropos" className="block hover:underline">A propos</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
