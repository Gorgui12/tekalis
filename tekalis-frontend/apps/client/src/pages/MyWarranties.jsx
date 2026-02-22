import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { 
  FaShieldAlt, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaClock,
  FaDownload,
  FaPlus,
  FaFilter
} from "react-icons/fa";
import api from "../../../../packages/shared/api/api";
import { useToast } from '../../../../packages/shared/context/ToastContext';

const MyWarranties = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, active, expiring, expired

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchWarranties = async () => {
      try {
        const { data } = await api.get("/warranties");
        setWarranties(data.warranties || []);
      } catch (error) {
        console.error("Erreur chargement garanties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWarranties();
  }, [user, navigate]);

  // Calculer le nombre de jours restants
  const getDaysRemaining = (endDate) => {
    return Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
  };

  // Filtrer les garanties
  const filteredWarranties = warranties.filter(w => {
    const daysRemaining = getDaysRemaining(w.endDate);
    
    if (filter === "active") return daysRemaining > 30;
    if (filter === "expiring") return daysRemaining > 0 && daysRemaining <= 30;
    if (filter === "expired") return daysRemaining <= 0;
    return true;
  });

  // Stats
  const stats = {
    total: warranties.length,
    active: warranties.filter(w => getDaysRemaining(w.endDate) > 30).length,
    expiring: warranties.filter(w => {
      const days = getDaysRemaining(w.endDate);
      return days > 0 && days <= 30;
    }).length,
    expired: warranties.filter(w => getDaysRemaining(w.endDate) <= 0).length
  };

  // Carte de garantie
  const WarrantyCard = ({ warranty }) => {
    const daysRemaining = getDaysRemaining(warranty.endDate);
    const isExpired = daysRemaining <= 0;
    const isExpiring = daysRemaining > 0 && daysRemaining <= 30;
    const isActive = daysRemaining > 30;

    return (
      <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden border-l-4 ${
        isExpired ? "border-red-500" :
        isExpiring ? "border-yellow-500" :
        "border-green-500"
      }`}>
        <div className="p-6">
          {/* En-tête */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex gap-3">
              <img
                src={warranty.product?.image || "/placeholder.png"}
                alt={warranty.product?.name}
                className="w-20 h-20 object-contain rounded border"
              />
              <div>
                <Link
                  to={`/product/${warranty.product?._id}`}
                  className="font-bold text-gray-900 hover:text-blue-600 block mb-1"
                >
                  {warranty.product?.name || "Produit"}
                </Link>
                <p className="text-sm text-gray-600">
                  {warranty.product?.brand && `${warranty.product.brand} • `}
                  Acheté le {new Date(warranty.purchaseDate).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>
            
            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
              isExpired ? "bg-red-100 text-red-700" :
              isExpiring ? "bg-yellow-100 text-yellow-700" :
              "bg-green-100 text-green-700"
            }`}>
              {isExpired ? <FaExclamationTriangle /> :
               isExpiring ? <FaClock /> :
               <FaCheckCircle />}
              {isExpired ? "Expirée" :
               isExpiring ? "Expire bientôt" :
               "Active"}
            </span>
          </div>

          {/* Infos garantie */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-600 mb-1">Type de garantie</p>
                <p className="font-semibold text-gray-900">
                  {warranty.warrantyType === "manufacturer" ? "Constructeur" :
                   warranty.warrantyType === "extended" ? "Extension" :
                   "Standard"}
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Durée</p>
                <p className="font-semibold text-gray-900">
                  {warranty.duration} mois
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Date de début</p>
                <p className="font-semibold text-gray-900">
                  {new Date(warranty.startDate).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Date de fin</p>
                <p className="font-semibold text-gray-900">
                  {new Date(warranty.endDate).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Temps restant</span>
              <span className={`font-semibold ${
                isExpired ? "text-red-600" :
                isExpiring ? "text-yellow-600" :
                "text-green-600"
              }`}>
                {isExpired 
                  ? "Expirée"
                  : `${daysRemaining} jour${daysRemaining > 1 ? "s" : ""}`
                }
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-full rounded-full transition-all ${
                  isExpired ? "bg-red-500" :
                  isExpiring ? "bg-yellow-500" :
                  "bg-green-500"
                }`}
                style={{ 
                  width: `${Math.max(0, Math.min(100, (daysRemaining / (warranty.duration * 30)) * 100))}%` 
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => toast.error("Téléchargement du certificat à implémenter")}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition text-sm"
            >
              <FaDownload />
              Certificat
            </button>

            {!isExpired && (
              <Link
                to={`/rma/create?productId=${warranty.product?._id}&warrantyId=${warranty._id}`}
                className="flex-1 sm:flex-none bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition text-sm"
              >
                Demande SAV
              </Link>
            )}

            {isExpiring && warranty.warrantyType !== "extended" && (
              <button
                onClick={() => navigate(`/warranties/extend/${warranty._id}`)}
                className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition text-sm"
              >
                <FaPlus />
                Prolonger
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center mt-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-20">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* En-tête */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="text-blue-600 hover:text-blue-700 font-semibold mb-4 inline-block"
          >
            ← Retour au dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🛡️ Mes Garanties
          </h1>
          <p className="text-gray-600">
            Gérez et suivez toutes vos garanties produits
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-600">Total</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-green-700">{stats.active}</p>
            <p className="text-xs text-gray-600">Actives</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-yellow-700">{stats.expiring}</p>
            <p className="text-xs text-gray-600">Expirent bientôt</p>
          </div>
          <div className="bg-red-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-red-700">{stats.expired}</p>
            <p className="text-xs text-gray-600">Expirées</p>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center gap-3">
            <FaFilter className="text-gray-600" />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                  filter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Toutes ({stats.total})
              </button>
              <button
                onClick={() => setFilter("active")}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                  filter === "active"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Actives ({stats.active})
              </button>
              <button
                onClick={() => setFilter("expiring")}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                  filter === "expiring"
                    ? "bg-yellow-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Expirent bientôt ({stats.expiring})
              </button>
              <button
                onClick={() => setFilter("expired")}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                  filter === "expired"
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Expirées ({stats.expired})
              </button>
            </div>
          </div>
        </div>

        {/* Liste des garanties */}
        {filteredWarranties.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaShieldAlt className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {filter === "all" 
                ? "Aucune garantie enregistrée"
                : `Aucune garantie ${
                    filter === "active" ? "active" :
                    filter === "expiring" ? "expirant bientôt" :
                    "expirée"
                  }`
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === "all"
                ? "Vos garanties apparaîtront ici après vos achats"
                : "Essayez un autre filtre"}
            </p>
            {filter === "all" && (
              <Link
                to="/products"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Découvrir nos produits
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredWarranties.map((warranty) => (
              <WarrantyCard key={warranty._id} warranty={warranty} />
            ))}
          </div>
        )}

        {/* Info garanties */}
        <div className="mt-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-4">
            ℹ️ Informations sur les garanties
          </h3>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-2">Garantie constructeur</p>
              <p className="text-blue-100">
                Incluse automatiquement avec chaque produit. Durée variable selon le fabricant.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-2">Extension de garantie</p>
              <p className="text-blue-100">
                Prolongez votre couverture jusqu'à 3 ans supplémentaires pour plus de tranquillité.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-2">Couverture</p>
              <p className="text-blue-100">
                Pannes matérielles, défauts de fabrication, support technique inclus.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-2">Besoin d'aide ?</p>
              <p className="text-blue-100">
                Contactez-nous au +221 33 823 45 67 ou via WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyWarranties;