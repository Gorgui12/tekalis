
"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { useState, useEffect, useRef } from "react";
import SearchBarLive from "@/components/shared/SearchBarLive";
import {
  FaSearch, FaShoppingCart, FaHeart, FaUser, FaBars, FaTimes,
  FaBox, FaMapMarkerAlt, FaCog, FaSignOutAlt,
  FaChevronDown, FaChevronRight, FaHome, FaNewspaper, FaEnvelope,
  FaTachometerAlt, FaMobileAlt, FaLaptop, FaGamepad, FaTv,
  FaThermometerHalf, FaHeadphones, FaWrench, FaSun, FaTag,
  FaChevronUp
} from "react-icons/fa";
import { useToast } from "@/components/shared/ToastProvider";
import { ThemeToggle } from "@/components/shared/ThemeProvider";
import useAuth from "@/lib/hooks/useAuth";

const CATEGORIES = [
  { name: "Smartphones",     path: "/category/smartphones",     icon: <FaMobileAlt />,      color: "text-amber-500",   bg: "bg-amber-50 dark:bg-amber-900/20" },
  { name: "Laptops",         path: "/category/ordinateurs",     icon: <FaLaptop />,          color: "text-orange-500",  bg: "bg-orange-50 dark:bg-orange-900/20" },
  { name: "Gaming",          path: "/category/gaming",          icon: <FaGamepad />,         color: "text-rose-500",    bg: "bg-rose-50 dark:bg-rose-900/20" },
  { name: "TV & Audio",      path: "/category/tv",              icon: <FaTv />,              color: "text-red-500",     bg: "bg-red-50 dark:bg-red-900/20" },
  { name: "Electromenager",  path: "/category/electromenager",  icon: <FaThermometerHalf />, color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-900/20" },
  { name: "Audio",           path: "/category/audio",           icon: <FaHeadphones />,      color: "text-orange-400",  bg: "bg-orange-50 dark:bg-orange-900/20" },
  { name: "Energie Solaire", path: "/category/energie-solaire", icon: <FaSun />,             color: "text-yellow-500",  bg: "bg-yellow-50 dark:bg-yellow-900/20" },
  { name: "Accessoires",     path: "/category/accessoires",     icon: <FaWrench />,          color: "text-amber-700",   bg: "bg-amber-50 dark:bg-amber-900/20" },
  { name: "Climatiseurs",    path: "/category/climatiseurs",    icon: <FaThermometerHalf />, color: "text-orange-500",  bg: "bg-orange-50 dark:bg-orange-900/20" },
];

const Navbar = () => {
  const { user }      = useSelector((state) => state.auth);
  const cartItems     = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);

  const router   = useRouter();
  const pathname = usePathname();
  const toast    = useToast();
  const { logout } = useAuth();

  const [mobileMenuOpen,   setMobileMenuOpen]   = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isScrolled,       setIsScrolled]       = useState(false);
  const [categoriesOpen,   setCategoriesOpen]   = useState(false);
  const [mobileCatOpen,    setMobileCatOpen]    = useState(false);
  const [mounted,          setMounted]          = useState(false);

  const userDropdownRef = useRef(null);
  const categoriesRef   = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) setUserDropdownOpen(false);
      if (categoriesRef.current   && !categoriesRef.current.contains(e.target))   setCategoriesOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileCatOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    toast.success("Deconnexion reussie !");
    router.push("/");
  };

  const isAdmin = user?.role === "admin";

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 dark:bg-surface-950/95 backdrop-blur-md shadow-card-hover"
          : "bg-white dark:bg-surface-950 shadow-card"
      }`}>
        <div className="container mx-auto px-4">

          {/* Ligne principale */}
          <div className="flex items-center justify-between py-3">

            {/* Logo + burger */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden text-surface-700 dark:text-surface-300 hover:text-brand-600 dark:hover:text-brand-400 transition p-2"
                aria-label="Menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
              </button>

              <Link href="/" className="text-2xl font-bold font-display text-brand-500 hover:text-brand-600 transition-colors tracking-tight">
                Tekalis
              </Link>
            </div>

            {/* Navigation desktop */}
            <div className="hidden lg:flex items-center gap-5">
              <Link href="/" className="flex items-center gap-1.5 text-surface-700 dark:text-surface-300 hover:text-brand-600 dark:hover:text-brand-400 transition font-medium text-sm">
                <FaHome size={14} /> Accueil
              </Link>

              {/* Dropdown Categories */}
              <div className="relative" ref={categoriesRef}>
                <button
                  onClick={() => setCategoriesOpen(!categoriesOpen)}
                  className="flex items-center gap-1.5 text-surface-700 dark:text-surface-300 hover:text-brand-600 dark:hover:text-brand-400 transition font-medium text-sm"
                  aria-expanded={categoriesOpen}
                >
                  <FaTag size={14} />
                  Produits
                  <FaChevronDown size={10} className={`transition-transform ${categoriesOpen ? "rotate-180" : ""}`} />
                </button>

                {categoriesOpen && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-surface-800 rounded-2xl shadow-elevated border border-surface-200 dark:border-surface-700 py-2 z-50">
                    <Link href="/products" className="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-brand-50 dark:hover:bg-surface-700 font-semibold transition rounded-lg mx-2" onClick={() => setCategoriesOpen(false)}>
                      <FaTag className="text-brand-500" size={13} /> Tous les produits
                    </Link>
                    <div className="border-t border-surface-100 dark:border-surface-700 my-1" />
                    {CATEGORIES.map((cat) => (
                      <Link key={cat.name} href={cat.path} className="flex items-center gap-3 px-4 py-2 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 transition rounded-lg mx-2" onClick={() => setCategoriesOpen(false)}>
                        <span className={`${cat.color} text-sm`}>{cat.icon}</span>
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link href="/blog"    className="flex items-center gap-1.5 text-surface-700 dark:text-surface-300 hover:text-brand-600 dark:hover:text-brand-400 transition font-medium text-sm"><FaNewspaper size={14} /> Blog</Link>
              <Link href="/apropos" className="text-surface-700 dark:text-surface-300 hover:text-brand-600 dark:hover:text-brand-400 transition font-medium text-sm">A propos</Link>
              <Link href="/contact" className="flex items-center gap-1.5 text-surface-700 dark:text-surface-300 hover:text-brand-600 dark:hover:text-brand-400 transition font-medium text-sm"><FaEnvelope size={14} /> Contact</Link>
            </div>

            {/* Actions utilisateur */}
            <div className="flex items-center gap-2">
              <ThemeToggle />

              <Link href="/wishlist" className="relative p-2 text-surface-700 dark:text-surface-300 hover:text-rose-500 dark:hover:text-rose-400 transition" aria-label="Favoris">
                <FaHeart size={19} />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              <Link href="/cart" className="relative p-2 text-surface-700 dark:text-surface-300 hover:text-brand-600 dark:hover:text-brand-400 transition" aria-label="Panier">
                <FaShoppingCart size={19} />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </Link>

              {!mounted || !user ? (
                <Link href="/login" className="hidden sm:flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl font-semibold transition text-sm shadow-sm hover:shadow-md">
                  <FaUser size={13} /> Connexion
                </Link>
              ) : (
                <div className="relative" ref={userDropdownRef}>
                  <button onClick={() => setUserDropdownOpen(!userDropdownOpen)} className="flex items-center gap-2 p-1.5 text-surface-700 dark:text-surface-300 hover:text-brand-600 dark:hover:text-brand-400 transition" aria-expanded={userDropdownOpen}>
                    <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <FaChevronDown size={10} className={`hidden sm:block transition-transform ${userDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-60 bg-white dark:bg-surface-800 rounded-2xl shadow-elevated border border-surface-200 dark:border-surface-700 py-2 z-50">
                      <div className="px-4 py-3 border-b border-surface-100 dark:border-surface-700">
                        <p className="font-semibold text-surface-900 dark:text-white text-sm">{user.name}</p>
                        <p className="text-xs text-surface-500 dark:text-surface-400 truncate">{user.email}</p>
                        {isAdmin && <span className="inline-block mt-1.5 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold rounded-lg">Administrateur</span>}
                      </div>
                      <Link href="/dashboard"          onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-surface-700 dark:text-surface-300 hover:bg-brand-50 dark:hover:bg-surface-700 transition font-semibold rounded-lg mx-2"><FaTachometerAlt size={13} className="text-brand-500" /> Mon espace</Link>
                      <div className="border-t border-surface-100 dark:border-surface-700 my-1" />
                      {isAdmin && <Link href="/admin" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-surface-700 dark:text-surface-300 hover:bg-brand-50 dark:hover:bg-surface-700 transition rounded-lg mx-2"><FaCog size={13} /> Dashboard Admin</Link>}
                      <Link href="/profile"             onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-surface-700 dark:text-surface-300 hover:bg-brand-50 dark:hover:bg-surface-700 transition rounded-lg mx-2"><FaUser size={13} /> Mon profil</Link>
                      <Link href="/dashboard/orders"    onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-surface-700 dark:text-surface-300 hover:bg-brand-50 dark:hover:bg-surface-700 transition rounded-lg mx-2"><FaBox size={13} /> Mes commandes</Link>
                      <Link href="/dashboard/addresses" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-surface-700 dark:text-surface-300 hover:bg-brand-50 dark:hover:bg-surface-700 transition rounded-lg mx-2"><FaMapMarkerAlt size={13} /> Mes adresses</Link>
                      <div className="border-t border-surface-100 dark:border-surface-700 my-1" />
                      <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition rounded-lg mx-2"><FaSignOutAlt size={13} /> Deconnexion</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="pb-3">
            <SearchBarLive placeholder="Rechercher un produit, une marque..." className="max-w-2xl w-full" maxResults={6} />
          </div>
        </div>
      </nav>

      {/* MENU MOBILE */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />
      )}

      <div className={`fixed top-0 left-0 h-full w-80 bg-white dark:bg-surface-950 shadow-2xl z-50 lg:hidden overflow-y-auto transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`} aria-label="Menu principal mobile">

        <div className="sticky top-0 z-10 bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-4 flex items-center justify-between shadow-md">
          <Link href="/" className="text-xl font-extrabold font-display text-white tracking-tight" onClick={() => setMobileMenuOpen(false)}>Tekalis</Link>
          <button onClick={() => setMobileMenuOpen(false)} className="text-white/80 hover:text-white transition p-1" aria-label="Fermer"><FaTimes size={20} /></button>
        </div>

        <div className="px-4 py-4 space-y-1">

          {mounted && user && (
            <div className="bg-brand-50 dark:bg-brand-900/20 rounded-2xl p-4 mb-4 flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-sm">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-surface-900 dark:text-white text-sm truncate">{user.name}</p>
                <p className="text-xs text-surface-500 dark:text-surface-400 truncate">{user.email}</p>
              </div>
            </div>
          )}

          <nav className="space-y-0.5">
            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition font-medium text-sm"><FaHome className="text-brand-500 w-4" /> Accueil</Link>

            <div>
              <button onClick={() => setMobileCatOpen(!mobileCatOpen)} className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition font-medium text-sm" aria-expanded={mobileCatOpen}>
                <span className="flex items-center gap-3"><FaTag className="text-brand-500 w-4" /> Categories</span>
                {mobileCatOpen ? <FaChevronUp size={11} className="text-surface-400" /> : <FaChevronDown size={11} className="text-surface-400" />}
              </button>

              {mobileCatOpen && (
                <div className="mt-1 mb-2 bg-surface-50 dark:bg-surface-800/60 rounded-2xl overflow-hidden border border-surface-100 dark:border-surface-700">
                  <Link href="/products" className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition border-b border-surface-100 dark:border-surface-700">
                    <FaTag size={13} /> Tous les produits <FaChevronRight size={10} className="ml-auto" />
                  </Link>
                  <div className="grid grid-cols-2 gap-0">
                    {CATEGORIES.map((cat, idx) => (
                      <Link key={cat.name} href={cat.path} className={`flex flex-col items-center gap-1.5 px-3 py-3 text-center hover:bg-white dark:hover:bg-surface-700 transition group ${idx % 2 === 0 ? "border-r border-surface-100 dark:border-surface-700" : ""} ${idx < CATEGORIES.length - 2 ? "border-b border-surface-100 dark:border-surface-700" : ""}`}>
                        <span className={`text-xl ${cat.color} group-hover:scale-110 transition-transform`}>{cat.icon}</span>
                        <span className="text-xs font-medium text-surface-700 dark:text-surface-300 leading-tight">{cat.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link href="/blog"         className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition font-medium text-sm"><FaNewspaper className="text-brand-600 w-4" /> Blog & Guides</Link>
            <Link href="/apropos"      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition font-medium text-sm"><FaHome className="text-brand-500 w-4" /> A propos</Link>
            <Link href="/contact"      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition font-medium text-sm"><FaEnvelope className="text-brand-500 w-4" /> Contact</Link>
          </nav>

          <div className="border-t border-surface-200 dark:border-surface-700 pt-3 mt-1">
            {mounted && user ? (
              <nav className="space-y-0.5">
                <p className="px-3 py-1 text-[11px] font-bold text-surface-400 uppercase tracking-wider">Mon compte</p>
                <Link href="/dashboard"          className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 font-semibold text-sm transition hover:bg-brand-100 dark:hover:bg-brand-900/40"><FaTachometerAlt className="w-4" /> Mon espace</Link>
                <Link href="/profile"             className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition text-sm"><FaUser className="text-surface-400 w-4" /> Mon profil</Link>
                <Link href="/dashboard/orders"    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition text-sm"><FaBox className="text-surface-400 w-4" /> Mes commandes</Link>
                <Link href="/wishlist"            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition text-sm">
                  <FaHeart className="text-rose-400 w-4" /> Mes favoris
                  {wishlistItems.length > 0 && <span className="ml-auto bg-rose-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{wishlistItems.length}</span>}
                </Link>
                <Link href="/cart"                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition text-sm">
                  <FaShoppingCart className="text-brand-400 w-4" /> Mon panier
                  {cartItems.length > 0 && <span className="ml-auto bg-brand-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{cartItems.length}</span>}
                </Link>
                <Link href="/dashboard/addresses" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition text-sm"><FaMapMarkerAlt className="text-surface-400 w-4" /> Mes adresses</Link>
                {isAdmin && <Link href="/admin"   className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition text-sm font-semibold"><FaCog className="w-4" /> Dashboard Admin</Link>}
                <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition text-sm font-semibold mt-1"><FaSignOutAlt className="w-4" /> Deconnexion</button>
              </nav>
            ) : (
              <div className="space-y-2 pt-1">
                <Link href="/login"    className="flex items-center justify-center gap-2 w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold text-sm transition shadow-sm"><FaUser size={13} /> Se connecter</Link>
                <Link href="/register" className="flex items-center justify-center gap-2 w-full py-3 border-2 border-brand-500 text-brand-600 dark:text-brand-400 rounded-xl font-bold text-sm hover:bg-brand-50 dark:hover:bg-brand-900/20 transition">Creer un compte</Link>
              </div>
            )}
          </div>

          <div className="mt-4 pt-1">
            <a href="https://wa.me/221786346946" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-sm transition shadow-sm">
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
