import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState, useEffect, useRef } from "react";
import SearchBarLive from '../SearchBarLive';
import { 
  FaSearch, FaShoppingCart, FaHeart, FaUser, FaBars, FaTimes,
  FaBell, FaBox, FaMapMarkerAlt, FaCog, FaSignOutAlt,
  FaChevronDown, FaHome, FaTag, FaNewspaper, FaEnvelope,
  FaTachometerAlt
} from "react-icons/fa";
import { useToast } from "../../../../../packages/shared/context/ToastContext";
import { ThemeToggle } from "../../../../../packages/shared/context/ThemeContext";
import useAuth from "../../../../../packages/shared/hooks/useAuth";

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
  const [isScrolled, setIsScrolled] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const userDropdownRef = useRef(null);
  const categoriesRef = useRef(null);

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

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    toast.success("Déconnexion réussie !");
    navigate("/");
  };

  const isAdmin = user?.role === "admin";

  const categories = [
    { name: "Smartphones", path: "/category/smartphones" },
    { name: "Laptops", path: "/category/laptops" },
    { name: "Gaming", path: "/category/gaming" },
    { name: "TV", path: "/category/tv" },
    { name: "Électroménager", path: "/category/electromenager" },
    { name: "Audio", path: "/category/audio" },
    { name: "Accessoires", path: "/category/accessoires" },
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

              {/* Dropdown Catégories */}
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

                      {/* ─── Mon espace client (lien dashboard) ─── */}
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition font-medium"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <FaTachometerAlt size={16} className="text-blue-600" />
                        Mon espace
                      </Link>

                      <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>

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
                        to="/dashboard/orders"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <FaBox size={16} />
                        Mes commandes
                      </Link>

                      <Link
                        to="/dashboard/addresses"
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
            <SearchBarLive
              placeholder="Rechercher un produit, une marque…"
              className="max-w-2xl w-full"
              maxResults={6}
            />
          </div>
        </div>
      </nav>

      {/* Menu mobile */}
      {mobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl z-50 lg:hidden overflow-y-auto">
            <div className="p-6">
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

              {user && (
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-4 mb-6">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm opacity-90">{user.email}</p>
                </div>
              )}

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

                    {/* Lien dashboard mobile */}
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg transition font-medium"
                    >
                      <FaTachometerAlt />
                      Mon espace
                    </Link>

                    <Link
                      to="/profile"
                      className="flex items-center gap-3 p-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-lg transition"
                    >
                      <FaUser />
                      Mon profil
                    </Link>

                    <Link
                      to="/dashboard/orders"
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

      <div className="h-0"></div>
    </>
  );
};

export default Navbar;