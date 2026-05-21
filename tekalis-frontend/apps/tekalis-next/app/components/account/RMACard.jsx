import { Link } from "react-router-dom";
import {
  FaTools, FaCalendarAlt, FaTag, FaArrowRight,
  FaBoxOpen, FaCheckCircle, FaTimesCircle, FaClock, FaWrench
} from "react-icons/fa";
import StatusBadge from "../shared/StatusBadge";

/**
 * RMACard — Carte d'une demande SAV (Retour / Réparation)
 * Props:
 *   rma: Object
 *   compact: boolean
 */
const RMACard = ({ rma, compact = false }) => {
  if (!rma) return null;

  // Icône selon le type de demande
  const typeConfig = {
    return: { label: "Retour produit", icon: <FaBoxOpen />, color: "text-purple-600 bg-purple-100" },
    repair: { label: "Réparation", icon: <FaWrench />, color: "text-orange-600 bg-orange-100" },
    exchange: { label: "Échange", icon: <FaTools />, color: "text-blue-600 bg-blue-100" }
  };

  const typeInfo = typeConfig[rma.type] || typeConfig.repair;

  // ─── Version compacte ─────────────────────────────────────────────────────
  if (compact) {
    return (
      <Link
        to={`/dashboard/rma/${rma._id}`}
        className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all group"
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeInfo.color}`}>
          {typeInfo.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
            {rma.productName || "Produit"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {typeInfo.label} · {rma.createdAt
              ? new Date(rma.createdAt).toLocaleDateString("fr-FR")
              : "—"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={rma.status || "pending"} size="sm" />
          <FaArrowRight className="text-gray-400 group-hover:text-blue-500 transition" size={12} />
        </div>
      </Link>
    );
  }

  // ─── Version complète ─────────────────────────────────────────────────────
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${typeInfo.color} text-lg`}>
              {typeInfo.icon}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                {rma.productName || "Produit"}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {typeInfo.label}
                {rma.rmaNumber && <span> · RMA #{rma.rmaNumber}</span>}
              </p>
            </div>
          </div>
          <StatusBadge status={rma.status || "pending"} />
        </div>
      </div>

      {/* Corps */}
      <div className="p-6 space-y-4">
        {/* Motif */}
        {rma.reason && (
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1">
              <FaTag size={10} />
              Motif de la demande
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{rma.reason}</p>
          </div>
        )}

        {/* Description */}
        {rma.description && (
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Description
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
              {rma.description}
            </p>
          </div>
        )}

        {/* Dates + numéro commande */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-2">
            <FaCalendarAlt className="text-gray-400 mt-0.5" size={13} />
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">
                Soumis le
              </p>
              <p className="text-sm text-gray-900 dark:text-white">
                {rma.createdAt
                  ? new Date(rma.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit", month: "short", year: "numeric"
                    })
                  : "—"}
              </p>
            </div>
          </div>

          {rma.updatedAt && rma.updatedAt !== rma.createdAt && (
            <div className="flex items-start gap-2">
              <FaClock className="text-gray-400 mt-0.5" size={13} />
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">
                  Mis à jour
                </p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {new Date(rma.updatedAt).toLocaleDateString("fr-FR", {
                    day: "2-digit", month: "short", year: "numeric"
                  })}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Message de statut */}
        {rma.adminNote && (
          <div className={`flex items-start gap-3 p-3 rounded-lg ${
            rma.status === "rejected"
              ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
              : "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
          }`}>
            {rma.status === "rejected"
              ? <FaTimesCircle className="text-red-500 flex-shrink-0 mt-0.5" />
              : <FaCheckCircle className="text-blue-500 flex-shrink-0 mt-0.5" />
            }
            <div>
              <p className={`text-xs font-semibold mb-0.5 ${
                rma.status === "rejected" ? "text-red-700 dark:text-red-400" : "text-blue-700 dark:text-blue-400"
              }`}>
                Message de l'équipe Tekalis
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{rma.adminNote}</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700">
        <Link
          to={`/dashboard/rma/${rma._id}`}
          className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline font-semibold"
        >
          <FaTools size={12} />
          Voir le détail de la demande
          <FaArrowRight size={11} />
        </Link>
      </div>
    </div>
  );
};

export default RMACard;