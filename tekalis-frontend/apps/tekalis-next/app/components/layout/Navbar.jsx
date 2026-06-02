"use client";

import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import SearchBarLive from '../SearchBarLive';
import {
  FaSearch, FaShoppingCart, FaHeart, FaUser, FaBars, FaTimes,
  FaBox, FaMapMarkerAlt, FaCog, FaSignOutAlt,
  FaChevronDown, FaChevronRight, FaHome, FaNewspaper, FaEnvelope,
  FaTachometerAlt, FaMobileAlt, FaLaptop, FaGamepad, FaTv,
  FaThermometerHalf, FaHeadphones, FaWrench, FaSun, FaTag,
  FaChevronUp
} from "react-icons/fa";
import { useToast } from "../../../../../packages/shared/context/ToastContext";
import { ThemeToggle } from "../../../../../packages/shared/context/ThemeContext";
import useAuth from "../../../../../packages/shared/hooks/useAuth";

/* ── Catégories avec icônes et couleurs ────────────────────────────────── */
const CATEGORIES = [
  {
    name: "Smartphones",
    path: "/category/smartphones",
    icon: <FaMobileAlt />,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    name: "Laptops",
    path: "/category/laptops",
    icon: <FaLaptop />,
    color: "text-indigo-500",
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
  },
  {
    name: "Gaming",
    path: "/category/gaming",
    icon: <FaGamepad />,
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-900/20",
  },
  {
    name: "TV & Audio",
    path: "/category/tv",
    icon: <FaTv />,
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-900/20",
  },
  {
    name: "Électroménager",
    path: "/category/electromenager",
    icon: <FaThermometerHalf />,
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-900/20",
  },
  {
    name: "Audio",
    path: "/category/audio",
    icon: <FaHeadphones />,
    color: "text-pink-500",
    bg: "bg-pink-50 dark:bg-pink-900/20",
  },
  {
    name: "Énergie Solaire",
    path: "/category/energie-solaire",
    icon: <FaSun />,
    color: "text-yellow-500",
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
  },
  {
    name: "Accessoires",
    path: "/category/accessoires",
    icon: <FaWrench />,
    color: "text-teal-500",
    bg: "bg-teal-50 dark:bg-teal-900/20",
  },
  {
    name: "Climatiseurs",
    path: "/category/climatiseurs",
    icon: <FaThermometerHalf />,
    color: "text-cyan-500",
    bg: "bg-cyan-50 dark:bg-cyan-900/20",
  },
];

const Navbar = () => {
  const { user }         = useSelector((state) => state.auth);
  const cartItems        = useSelector((state) => state.cart.items);
  const wishlistItems    = useSelector((state) => state.wishlist?.items || []);

  const router = useRouter();
// Si vous vouliez juste utiliser router pour naviguer :
const navigate = (path) => router.push(path);
  const location  = useLocation();
  const toast     = useToast();
  const { logout } = useAuth();

  const [mobileMenuOpen,   setMobileMenuOpen]   = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isScrolled,       setIsScrolled]       = useState(false);
  const [categoriesOpen,   setCategoriesOpen]   = useState(false);
  const [mobileCatOpen,    setMobileCatOpen]    = useState(false); // accordion mobile

  const userDropdownRef  = useRef(null);
  const categoriesRef    = useRef(null);

  /* fermer les dropdowns au clic extérieur */
  useEffect(() => {
    const handler = (e) => {
      if (userDropdownRef.current  && !userDropdownRef.current.contains(e.target))  setUserDropdownOpen(false);
      if (categoriesRef.current    && !categoriesRef.current.contains(e.target))    setCategoriesOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* fermer menu mobile à chaque navigation */
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileCatOpen(false);
  }, [location]);

  /* bloquer scroll body quand menu mobile ouvert */
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    toast.success("Déconnexion réussie !");
    navigate("/");
  };

  const isAdmin = user?.role === "admin";

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
          {/* ── Ligne principale ──────────────────────────────────────── */}
          <div className="flex items-center justify-between py-3">

            {/* Logo + burger */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition p-2"
                aria-label="Menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
              </button>

              <Link
                to="/"
                className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:scale-105 transition-transform"
              >
                Tekalis
              </Link>
            </div>

            {/* Navigation desktop */}
            <div className="hidden lg:flex items-center gap-5">
              <Link to="/" className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium text-sm">
                <FaHome size={14} /> Accueil
              </Link>

              {/* Dropdown Catégories */}
              <div className="relative" ref={categoriesRef}>
                <button
                  onClick={() => setCategoriesOpen(!categoriesOpen)}
                  className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium text-sm"
                  aria-expanded={categoriesOpen}
                >
                  <FaTag size={14} />
                  Produits
                  <FaChevronDown size={10} className={`transition-transform ${categoriesOpen ? "rotate-180" : ""}`} />
                </button>

                {categoriesOpen && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                    <Link
                      to="/products"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 font-semibold transition"
                      onClick={() => setCategoriesOpen(false)}
                    >
                      <FaTag className="text-blue-500" size={13} />
                      Tous les produits
                    </Link>
                    <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                    {CATEGORIES.map((cat) => (
                      <Link
                        key={cat.name}
                        to={cat.path}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        onClick={() => setCategoriesOpen(false)}
                      >
                        <span className={`${cat.color} text-sm`}>{cat.icon}</span>
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link to="/blog"    className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium text-sm">
                <FaNewspaper size={14} /> Blog
              </Link>
              <Link to="/apropos" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium text-sm">
                À propos
              </Link>
              <Link to="/contact" className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium text-sm">
                <FaEnvelope size={14} /> Contact
              </Link>
            </div>

            {/* Actions utilisateur */}
            <div className="flex items-center gap-2">
              <ThemeToggle />

              {/* Wishlist */}
              <Link to="/wishlist" className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition" aria-label="Favoris">
                <FaHeart size={19} />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* Panier */}
              <Link to="/cart" className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition" aria-label="Panier">
                <FaShoppingCart size={19} />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </Link>

              {/* User menu */}
              {!user ? (
                <Link to="/login" className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition text-sm">
                  <FaUser size={13} /> Connexion
                </Link>
              ) : (
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                    aria-expanded={userDropdownOpen}
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <FaChevronDown size={10} className={`hidden sm:block transition-transform ${userDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-60 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                        {isAdmin && (
                          <span className="inline-block mt-1.5 px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded">
                            👑 Administrateur
                          </span>
                        )}
                      </div>

                      <Link to="/dashboard" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition font-semibold">
                        <FaTachometerAlt size={13} className="text-blue-600" /> Mon espace
                      </Link>
                      <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition">
                          <FaCog size={13} /> Dashboard Admin
                        </Link>
                      )}
                      <Link to="/profile"             onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition">
                        <FaUser size={13} /> Mon profil
                      </Link>
                      <Link to="/dashboard/orders"    onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition">
                        <FaBox size={13} /> Mes commandes
                      </Link>
                      <Link to="/dashboard/addresses" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition">
                        <FaMapMarkerAlt size={13} /> Mes adresses
                      </Link>
                      <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                      <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                        <FaSignOutAlt size={13} /> Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Barre de recherche ─────────────────────────────────────── */}
          <div className="pb-3">
            <SearchBarLive
              placeholder="Rechercher un produit, une marque…"
              className="max-w-2xl w-full"
              maxResults={6}
            />
          </div>
        </div>
      </nav>

      {/* ════════════════════════════════════════════════════════════════
          MENU MOBILE — panneau latéral gauche complet
      ════════════════════════════════════════════════════════════════ */}

      {/* Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl z-50 lg:hidden overflow-y-auto transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Menu principal mobile"
      >
        {/* Header panel */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-4 flex items-center justify-between shadow-md">
          <Link to="/" className="text-xl font-extrabold text-white tracking-tight" onClick={() => setMobileMenuOpen(false)}>
            Tekalis
          </Link>
          <button onClick={() => setMobileMenuOpen(false)} className="text-white/80 hover:text-white transition p-1" aria-label="Fermer">
            <FaTimes size={20} />
          </button>
        </div>

        <div className="px-4 py-4 space-y-1">

          {/* Profil utilisateur connecté */}
          {user && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-4 flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
          )}

          {/* Nav principale */}
          <nav className="space-y-0.5">
            <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition font-medium text-sm">
              <FaHome className="text-blue-500 w-4" /> Accueil
            </Link>

            {/* ── Accordéon Catégories ── */}
            <div>
              <button
                onClick={() => setMobileCatOpen(!mobileCatOpen)}
                className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition font-medium text-sm"
                aria-expanded={mobileCatOpen}
              >
                <span className="flex items-center gap-3">
                  <FaTag className="text-blue-500 w-4" />
                  Catégories
                </span>
                {mobileCatOpen ? <FaChevronUp size={11} className="text-gray-400" /> : <FaChevronDown size={11} className="text-gray-400" />}
              </button>

              {mobileCatOpen && (
                <div className="mt-1 mb-2 bg-gray-50 dark:bg-gray-800/60 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                  {/* Tous les produits */}
                  <Link
                    to="/products"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition border-b border-gray-100 dark:border-gray-700"
                  >
                    <FaTag size={13} />
                    Tous les produits
                    <FaChevronRight size={10} className="ml-auto" />
                  </Link>

                  {/* Grille 2 colonnes pour les catégories */}
                  <div className="grid grid-cols-2 gap-0">
                    {CATEGORIES.map((cat, idx) => (
                      <Link
                        key={cat.name}
                        to={cat.path}
                        className={`flex flex-col items-center gap-1.5 px-3 py-3 text-center hover:bg-white dark:hover:bg-gray-700 transition group ${
                          idx % 2 === 0 ? "border-r border-gray-100 dark:border-gray-700" : ""
                        } ${idx < CATEGORIES.length - 2 ? "border-b border-gray-100 dark:border-gray-700" : ""}`}
                      >
                        <span className={`text-xl ${cat.color} group-hover:scale-110 transition-transform`}>
                          {cat.icon}
                        </span>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-tight">
                          {cat.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link to="/configurator" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition font-medium text-sm">
              <FaCog className="text-purple-500 w-4" /> Configurateur PC
            </Link>
            <Link to="/blog" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition font-medium text-sm">
              <FaNewspaper className="text-orange-500 w-4" /> Blog & Guides
            </Link>
            <Link to="/apropos" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition font-medium text-sm">
              <FaHome className="text-teal-500 w-4" /> À propos
            </Link>
            <Link to="/contact" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition font-medium text-sm">
              <FaEnvelope className="text-green-500 w-4" /> Contact
            </Link>
          </nav>

          {/* Séparateur */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-1">
            {user ? (
              <nav className="space-y-0.5">
                <p className="px-3 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Mon compte</p>

                <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-semibold text-sm transition hover:bg-blue-100 dark:hover:bg-blue-900/40">
                  <FaTachometerAlt className="w-4" /> Mon espace
                </Link>
                <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm">
                  <FaUser className="text-gray-400 w-4" /> Mon profil
                </Link>
                <Link to="/dashboard/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm">
                  <FaBox className="text-gray-400 w-4" /> Mes commandes
                </Link>
                <Link to="/wishlist" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm">
                  <FaHeart className="text-red-400 w-4" />
                  Mes favoris
                  {wishlistItems.length > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>
                <Link to="/cart" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm">
                  <FaShoppingCart className="text-blue-400 w-4" />
                  Mon panier
                  {cartItems.length > 0 && (
                    <span className="ml-auto bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                      {cartItems.length}
                    </span>
                  )}
                </Link>
                <Link to="/dashboard/addresses" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm">
                  <FaMapMarkerAlt className="text-gray-400 w-4" /> Mes adresses
                </Link>

                {isAdmin && (
                  <Link to="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition text-sm font-semibold">
                    <FaCog className="w-4" /> Dashboard Admin
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition text-sm font-semibold mt-1"
                >
                  <FaSignOutAlt className="w-4" /> Déconnexion
                </button>
              </nav>
            ) : (
              <div className="space-y-2 pt-1">
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition"
                >
                  <FaUser size={13} /> Se connecter
                </Link>
                <Link
                  to="/register"
                  className="flex items-center justify-center gap-2 w-full py-3 border-2 border-blue-600 text-blue-600 dark:text-blue-400 rounded-xl font-bold text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                >
                  Créer un compte
                </Link>
              </div>
            )}
          </div>

          {/* WhatsApp CTA */}
          <div className="mt-4 pt-1">
            <a
              href="https://wa.me/221786346946"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold text-sm transition"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white flex-shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Aide & support WhatsApp
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
