"use client";

import { useEffect, useState } from "react";
import Link from "next/link"; import { useRouter } from "next/navigation";
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
import api from "@/lib/api";
import { useToast } from '@/components/shared/ToastProvider';

const MyWarranties = () => {
  const toast = useToast();
  const router = useRouter();
  const navigate = (path) => router.push(path);
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
      <div className={`bg-white dark:bg-surface-800 rounded-xl shadow-card hover:shadow-elevated transition overflow-hidden border-l-4 ${
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
                className="w-20 h-20 object-contain rounded border border-surface-200 dark:border-surface-700"
              />
              <div>
                <Link href={`/products/${warranty.product?._id}`}
                  className="font-bold text-surface-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 block mb-1"
                >
                  {warranty.product?.name || "Produit"}
                </Link>
                <p className="text-sm text-surface-600 dark:text-surface-400">
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
          <div className="bg-surface-50 dark:bg-surface-700/50 rounded-xl p-4 mb-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-surface-600 dark:text-surface-400 mb-1">Type de garantie</p>
                <p className="font-semibold text-surface-900 dark:text-white">
                  {warranty.warrantyType === "manufacturer" ? "Constructeur" :
                   warranty.warrantyType === "extended" ? "Extension" :
                   "Standard"}
                </p>
              </div>
              <div>
                <p className="text-surface-600 dark:text-surface-400 mb-1">Durée</p>
                <p className="font-semibold text-surface-900 dark:text-white">
                  {warranty.duration} mois
                </p>
              </div>
              <div>
                <p className="text-surface-600 dark:text-surface-400 mb-1">Date de début</p>
                <p className="font-semibold text-surface-900 dark:text-white">
                  {new Date(warranty.startDate).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div>
                <p className="text-surface-600 dark:text-surface-400 mb-1">Date de fin</p>
                <p className="font-semibold text-surface-900 dark:text-white">
                  {new Date(warranty.endDate).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-surface-600 dark:text-surface-400">Temps restant</span>
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
            <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-2">
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
              className="flex-1 sm:flex-none bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl font-semibold flex items-center justify-center gap-2 transition text-sm"
            >
              <FaDownload />
              Certificat
            </button>

            {!isExpired && (
              <Link href={`/dashboard/rma/create?productId=${warranty.product?._id}&warrantyId=${warranty._id}`}
                className="flex-1 sm:flex-none bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl font-semibold flex items-center justify-center gap-2 transition text-sm"
              >
                Demande SAV
              </Link>
            )}

            {isExpiring && warranty.warrantyType !== "extended" && (
              <button
                onClick={() => navigate(`/warranties/extend/${warranty._id}`)}
                className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-semibold flex items-center justify-center gap-2 transition text-sm"
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
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 py-8 mt-20">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* En-tête */}
        <div className="mb-8">
          <Link href="/dashboard"
            className="text-brand-600 hover:text-brand-700 dark:text-brand-400 font-semibold mb-4 inline-block"
          >
            ← Retour au dashboard
          </Link>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-2 font-display">
            🛡️ Mes Garanties
          </h1>
          <p className="text-surface-600 dark:text-surface-400">
            Gérez et suivez toutes vos garanties produits
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-surface-800 rounded-xl shadow-card p-4 text-center">
            <p className="text-2xl font-bold text-surface-900 dark:text-white">{stats.total}</p>
            <p className="text-xs text-surface-600 dark:text-surface-400">Total</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl shadow-card p-4 text-center">
            <p className="text-2xl font-bold text-green-700">{stats.active}</p>
            <p className="text-xs text-surface-600 dark:text-surface-400">Actives</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl shadow-card p-4 text-center">
            <p className="text-2xl font-bold text-yellow-700">{stats.expiring}</p>
            <p className="text-xs text-surface-600 dark:text-surface-400">Expirent bientôt</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl shadow-card p-4 text-center">
            <p className="text-2xl font-bold text-red-700">{stats.expired}</p>
            <p className="text-xs text-surface-600 dark:text-surface-400">Expirées</p>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white dark:bg-surface-800 rounded-xl shadow-card p-4 mb-6">
          <div className="flex items-center gap-3">
            <FaFilter className="text-surface-600 dark:text-surface-400" />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition ${
                  filter === "all"
                    ? "bg-brand-500 text-white"
                    : "bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600"
                }`}
              >
                Toutes ({stats.total})
              </button>
              <button
                onClick={() => setFilter("active")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition ${
                  filter === "active"
                    ? "bg-green-600 text-white"
                    : "bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600"
                }`}
              >
                Actives ({stats.active})
              </button>
              <button
                onClick={() => setFilter("expiring")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition ${
                  filter === "expiring"
                    ? "bg-yellow-600 text-white"
                    : "bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600"
                }`}
              >
                Expirent bientôt ({stats.expiring})
              </button>
              <button
                onClick={() => setFilter("expired")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition ${
                  filter === "expired"
                    ? "bg-red-600 text-white"
                    : "bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600"
                }`}
              >
                Expirées ({stats.expired})
              </button>
            </div>
          </div>
        </div>

        {/* Liste des garanties */}
        {filteredWarranties.length === 0 ? (
          <div className="bg-white dark:bg-surface-800 rounded-xl shadow-card p-12 text-center">
            <FaShieldAlt className="text-6xl text-surface-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-2">
              {filter === "all" 
                ? "Aucune garantie enregistrée"
                : `Aucune garantie ${
                    filter === "active" ? "active" :
                    filter === "expiring" ? "expirant bientôt" :
                    "expirée"
                  }`
              }
            </h3>
            <p className="text-surface-600 dark:text-surface-400 mb-6">
              {filter === "all"
                ? "Vos garanties apparaîtront ici après vos achats"
                : "Essayez un autre filtre"}
            </p>
            {filter === "all" && (
              <Link href="/products"
                className="inline-block bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold"
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
        <div className="mt-8 bg-gradient-to-br from-brand-500 via-amber-600 to-orange-800 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-4">
            ℹ️ Informations sur les garanties
          </h3>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-2">Garantie constructeur</p>
              <p className="text-amber-100">
                Incluse automatiquement avec chaque produit. Durée variable selon le fabricant.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-2">Extension de garantie</p>
              <p className="text-amber-100">
                Prolongez votre couverture jusqu'à 3 ans supplémentaires pour plus de tranquillité.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-2">Couverture</p>
              <p className="text-amber-100">
                Pannes matérielles, défauts de fabrication, support technique inclus.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-2">Besoin d'aide ?</p>
              <p className="text-amber-100">
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
