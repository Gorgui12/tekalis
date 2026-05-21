import { Link } from "react-router-dom";
import { FaShieldAlt, FaCalendarAlt, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaTools } from "react-icons/fa";
import StatusBadge from "../shared/StatusBadge";

/**
 * WarrantyCard — Carte affichant une garantie produit
 * Props:
 *   warranty: Object
 *   compact: boolean — version réduite pour dashboard
 */
const WarrantyCard = ({ warranty, compact = false }) => {
  if (!warranty) return null;

  // ─── Calcul de l'état de la garantie ─────────────────────────────────────
  const getWarrantyStatus = () => {
    if (!warranty.expiresAt) return { status: "active", label: "Active", daysLeft: null };

    const now = new Date();
    const expiry = new Date(warranty.expiresAt);
    const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return { status: "expired", label: "Expirée", daysLeft: 0 };
    if (daysLeft <= 30) return { status: "expiring", label: "Expire bientôt", daysLeft };
    return { status: "active", label: "Active", daysLeft };
  };

  const { status, label, daysLeft } = getWarrantyStatus();

  const statusConfig = {
    active: {
      icon: <FaCheckCircle />,
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-200 dark:border-green-800"
    },
    expiring: {
      icon: <FaExclamationTriangle />,
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-900/20",
      border: "border-orange-200 dark:border-orange-800"
    },
    expired: {
      icon: <FaTimesCircle />,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-200 dark:border-red-800"
    }
  };

  const config = statusConfig[status] || statusConfig.active;

  // ─── Calcul barre de progression ─────────────────────────────────────────
  const getProgressPercent = () => {
    if (!warranty.startDate || !warranty.expiresAt) return 100;
    const start = new Date(warranty.startDate).getTime();
    const end = new Date(warranty.expiresAt).getTime();
    const now = Date.now();
    const elapsed = now - start;
    const total = end - start;
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  };

  const progress = getProgressPercent();

  // ─── Version compacte (dashboard) ────────────────────────────────────────
  if (compact) {
    return (
      <div className={`flex items-center gap-4 p-4 rounded-xl border ${config.border} ${config.bg}`}>
        <div className={`text-2xl ${config.color} flex-shrink-0`}>
          <FaShieldAlt />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
            {warranty.productName || "Produit"}
          </p>
          <p className={`text-xs font-medium ${config.color}`}>
            {label}
            {daysLeft !== null && status !== "expired" && (
              <span className="text-gray-500 dark:text-gray-400 font-normal ml-1">
                — {daysLeft}j restants
              </span>
            )}
          </p>
        </div>
        <StatusBadge status={status} size="sm" />
      </div>
    );
  }

  // ─── Version complète ─────────────────────────────────────────────────────
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border-2 ${config.border} shadow-sm hover:shadow-md transition-all`}>
      {/* Header */}
      <div className={`${config.bg} px-6 py-4 rounded-t-xl border-b ${config.border}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`text-2xl ${config.color}`}>
              <FaShieldAlt />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                {warranty.productName || "Produit garanti"}
              </h3>
              {warranty.orderNumber && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Commande #{warranty.orderNumber}
                </p>
              )}
            </div>
          </div>
          <StatusBadge status={status} />
        </div>
      </div>

      {/* Corps */}
      <div className="p-6 space-y-4">
        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <FaCalendarAlt className="text-gray-400 mt-0.5 flex-shrink-0" size={14} />
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">
                Début
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {warranty.startDate
                  ? new Date(warranty.startDate).toLocaleDateString("fr-FR")
                  : "—"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FaCalendarAlt className="text-gray-400 mt-0.5 flex-shrink-0" size={14} />
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">
                Expiration
              </p>
              <p className={`text-sm font-semibold ${config.color}`}>
                {warranty.expiresAt
                  ? new Date(warranty.expiresAt).toLocaleDateString("fr-FR")
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Barre de progression */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              Durée consommée
            </span>
            <span className={`text-xs font-bold ${config.color}`}>
              {status === "expired"
                ? "Expirée"
                : daysLeft !== null
                ? `${daysLeft} jour${daysLeft > 1 ? "s" : ""} restant${daysLeft > 1 ? "s" : ""}`
                : "Active"}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                status === "expired"
                  ? "bg-red-500"
                  : status === "expiring"
                  ? "bg-orange-400"
                  : "bg-green-500"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Durée totale */}
        {warranty.durationMonths && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Garantie {warranty.durationMonths} mois{warranty.type ? ` — ${warranty.type}` : ""}
          </p>
        )}
      </div>

      {/* Footer actions */}
      <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center gap-3">
        <Link
          to={`/dashboard/warranties/${warranty._id}`}
          className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline font-semibold"
        >
          <FaShieldAlt size={12} />
          Voir les détails
        </Link>

        {status !== "expired" && (
          <Link
            to={`/dashboard/rma/create?warrantyId=${warranty._id}`}
            className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400 hover:underline font-semibold ml-auto"
          >
            <FaTools size={12} />
            Demander un SAV
          </Link>
        )}
      </div>
    </div>
  );
};

export default WarrantyCard;