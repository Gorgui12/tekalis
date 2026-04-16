import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaTimes,
  FaBox,
  FaStar,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock
} from "react-icons/fa";
import api from "../../../../packages/shared/api/api";
import { useToast } from "../../../../packages/shared/context/ToastContext";

const AdminProducts = () => {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetchProducts();
  }, [statusFilter, stockFilter, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (sortBy) params.append("sort", sortBy);

      const { data } = await api.get(`/products?${params.toString()}`);

      const items = Array.isArray(data) ? data
        : Array.isArray(data.data) ? data.data
        : Array.isArray(data.products) ? data.products
        : [];

      setProducts(items);
    } catch (error) {
      console.error("Erreur chargement produits:", error);
      toast.error("Erreur lors du chargement des produits");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce produit ?")) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p._id !== id));
      toast.success("Produit supprimé avec succès");
    } catch (error) {
      console.error("Erreur suppression produit:", error);
      toast.error("Échec de la suppression.");
    }
  };

  // MINEUR 13 : Correction PATCH → PUT
  // La route backend est `router.put("/:id")`, pas PATCH.
  // On passe uniquement le champ isFeatured pour ne pas écraser les autres.
  const toggleFeatured = async (id, currentStatus) => {
    try {
      await api.put(`/products/${id}`, { isFeatured: !currentStatus });
      setProducts(prev =>
        prev.map(p => p._id === id ? { ...p, isFeatured: !currentStatus } : p)
      );
      toast.success(
        !currentStatus ? "Produit mis en vedette" : "Produit retiré de la vedette"
      );
    } catch (error) {
      console.error("Erreur mise à jour produit:", error);
      toast.error("Erreur lors de la mise à jour du produit");
    }
  };

  // Filtrage côté client (recherche)
  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());

    if (stockFilter === "instock") return matchesSearch && product.stock > 0;
    if (stockFilter === "low") return matchesSearch && product.stock > 0 && product.stock < 10;
    if (stockFilter === "out") return matchesSearch && product.stock === 0;

    return matchesSearch;
  });

  const stats = {
    total: products.length,
    available: products.filter(p => p.status === "available").length,
    outOfStock: products.filter(p => p.stock === 0).length,
    lowStock: products.filter(p => p.stock > 0 && p.stock < 10).length,
    featured: products.filter(p => p.isFeatured).length
  };

  const StatusBadge = ({ status }) => {
    const configs = {
      available:    { bg: "bg-green-100",  text: "text-green-700",  label: "Disponible",   icon: <FaCheckCircle /> },
      preorder:     { bg: "bg-blue-100",   text: "text-blue-700",   label: "Précommande",  icon: <FaClock /> },
      outofstock:   { bg: "bg-red-100",    text: "text-red-700",    label: "Rupture",      icon: <FaExclamationTriangle /> },
      discontinued: { bg: "bg-gray-100",   text: "text-gray-700",   label: "Arrêté",       icon: <FaTimes /> }
    };
    const config = configs[status] || configs.available;
    return (
      <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1`}>
        {config.icon} {config.label}
      </span>
    );
  };

  const StockBadge = ({ stock }) => {
    if (stock === 0) return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">Rupture</span>;
    if (stock < 10) return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold">Faible ({stock})</span>;
    return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">En stock ({stock})</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link to="/dashboard" className="text-blue-600 hover:text-blue-700 font-semibold mb-4 inline-block">
            ← Retour au dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">📦 Gestion des produits</h1>
              <p className="text-gray-600">{filteredProducts.length} produit(s) • {stats.available} disponible(s)</p>
            </div>
            <Link
              to="/products/add"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-md"
            >
              <FaPlus /> Nouveau produit
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: "Total",       value: stats.total,      bg: "" },
            { label: "Disponibles", value: stats.available,  bg: "bg-green-50",  text: "text-green-700" },
            { label: "Rupture",     value: stats.outOfStock, bg: "bg-red-50",    text: "text-red-700" },
            { label: "Stock faible",value: stats.lowStock,   bg: "bg-orange-50", text: "text-orange-700" },
            { label: "En vedette",  value: stats.featured,   bg: "bg-yellow-50", text: "text-yellow-700" }
          ].map(s => (
            <div key={s.label} className={`${s.bg || "bg-white"} rounded-lg shadow-md p-4 text-center`}>
              <p className={`text-2xl font-bold ${s.text || "text-gray-900"}`}>{s.value}</p>
              <p className="text-xs text-gray-600">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid md:grid-cols-5 gap-4">
            <div className="md:col-span-2 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <FaTimes />
                </button>
              )}
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">Tous les statuts</option>
              <option value="available">Disponible</option>
              <option value="preorder">Précommande</option>
              <option value="outofstock">Rupture</option>
              <option value="discontinued">Arrêté</option>
            </select>
            <select value={stockFilter} onChange={e => setStockFilter(e.target.value)} className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">Tous les stocks</option>
              <option value="instock">En stock</option>
              <option value="low">Stock faible</option>
              <option value="out">Rupture</option>
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="newest">Plus récents</option>
              <option value="oldest">Plus anciens</option>
              <option value="name_asc">Nom A-Z</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">Aucun produit trouvé</p>
            <Link to="/products/add" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold inline-block">
              Créer le premier produit
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div key={product._id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden">
                {/* Image */}
                <div className="relative">
                  <img
                    src={product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url || "https://via.placeholder.com/300"}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  {product.isFeatured && (
                    <span className="absolute top-2 left-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      ⭐ Vedette
                    </span>
                  )}
                  {product.comparePrice && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      -{Math.round((1 - product.price / product.comparePrice) * 100)}%
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-1">{product.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">{product.brand}</p>

                  {product.rating?.average > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                      <FaStar className="text-yellow-400 text-sm" />
                      <span className="text-sm font-semibold text-gray-700">{product.rating.average.toFixed(1)}</span>
                      <span className="text-xs text-gray-500">({product.rating.count})</span>
                    </div>
                  )}

                  <div className="mb-3">
                    {product.comparePrice && (
                      <p className="text-xs text-gray-500 line-through">{product.comparePrice.toLocaleString()} FCFA</p>
                    )}
                    <p className="text-lg font-bold text-blue-600">{product.price.toLocaleString()} FCFA</p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <StatusBadge status={product.status} />
                    <StockBadge stock={product.stock} />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mb-2">
                    <Link
                      to={`/product/${product._id}`}
                      target="_blank"
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold text-xs text-center flex items-center justify-center gap-1"
                    >
                      <FaEye /> Voir
                    </Link>
                    <Link
                      to={`/products/edit/${product._id}`}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold text-xs text-center flex items-center justify-center gap-1"
                    >
                      <FaEdit /> Modifier
                    </Link>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>

                  {/* MINEUR 13 : PUT au lieu de PATCH */}
                  <button
                    onClick={() => toggleFeatured(product._id, product.isFeatured)}
                    className={`w-full py-2 rounded-lg font-semibold text-xs ${
                      product.isFeatured
                        ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {product.isFeatured ? "⭐ Retirer de la vedette" : "⭐ Mettre en vedette"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
