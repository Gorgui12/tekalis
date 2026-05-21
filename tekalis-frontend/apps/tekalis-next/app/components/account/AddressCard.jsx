import { useState } from "react";
import {
  FaMapMarkerAlt, FaPhone, FaUser, FaEdit, FaTrash,
  FaStar, FaEllipsisV, FaCheckCircle
} from "react-icons/fa";

/**
 * AddressCard — Carte d'affichage d'une adresse utilisateur
 * Props:
 *   address: Object
 *   onEdit: (address) => void
 *   onDelete: (addressId) => void
 *   onSetDefault: (addressId) => void
 *   isDefault: boolean
 *   selectable: boolean       — mode sélection (checkout)
 *   selected: boolean
 *   onSelect: (address) => void
 */
const AddressCard = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  isDefault = false,
  selectable = false,
  selected = false,
  onSelect
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!address) return null;

  const handleDelete = async () => {
    if (!window.confirm("Supprimer cette adresse ?")) return;
    setDeleting(true);
    try {
      await onDelete?.(address._id);
    } finally {
      setDeleting(false);
      setMenuOpen(false);
    }
  };

  const handleSetDefault = () => {
    onSetDefault?.(address._id);
    setMenuOpen(false);
  };

  const cardClasses = `
    relative bg-white dark:bg-gray-800 rounded-xl border-2 transition-all
    ${selectable ? "cursor-pointer" : ""}
    ${selected
      ? "border-blue-500 shadow-md shadow-blue-100 dark:shadow-blue-900/20"
      : isDefault
      ? "border-green-400"
      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
    }
  `;

  return (
    <div className={cardClasses} onClick={selectable ? () => onSelect?.(address) : undefined}>
      {/* Badge défaut */}
      {isDefault && (
        <div className="absolute -top-2.5 left-4 bg-green-500 text-white text-xs font-bold px-3 py-0.5 rounded-full flex items-center gap-1">
          <FaStar size={10} />
          Adresse par défaut
        </div>
      )}

      {/* Badge sélectionné (mode checkout) */}
      {selectable && selected && (
        <div className="absolute top-3 right-3 text-blue-500">
          <FaCheckCircle size={20} />
        </div>
      )}

      <div className="p-5">
        {/* Header : label + actions */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-base">
              {address.label || "Adresse"}
            </h4>
          </div>

          {/* Menu actions (si pas en mode sélection) */}
          {!selectable && (onEdit || onDelete || onSetDefault) && (
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                aria-label="Options"
              >
                <FaEllipsisV size={14} />
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20 py-1">
                    {onEdit && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onEdit(address); setMenuOpen(false); }}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                      >
                        <FaEdit className="text-blue-500" />
                        Modifier
                      </button>
                    )}
                    {!isDefault && onSetDefault && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSetDefault(); }}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                      >
                        <FaStar className="text-yellow-500" />
                        Définir par défaut
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                        disabled={deleting || isDefault}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <FaTrash />
                        {deleting ? "Suppression..." : isDefault ? "Adresse par défaut" : "Supprimer"}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Détails */}
        <div className="space-y-2.5">
          <div className="flex items-start gap-3">
            <FaUser className="text-gray-400 mt-0.5 flex-shrink-0" size={14} />
            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              {address.fullName}
            </span>
          </div>

          <div className="flex items-start gap-3">
            <FaPhone className="text-gray-400 mt-0.5 flex-shrink-0" size={14} />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {address.phone}
            </span>
          </div>

          <div className="flex items-start gap-3">
            <FaMapMarkerAlt className="text-gray-400 mt-0.5 flex-shrink-0" size={14} />
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <p>{address.address}</p>
              <p className="text-gray-500 dark:text-gray-400">
                {address.city}{address.region && address.region !== address.city ? `, ${address.region}` : ""} — Sénégal
              </p>
            </div>
          </div>
        </div>

        {/* Actions rapides (mode non-sélection) */}
        {!selectable && (onEdit || onDelete) && (
          <div className="flex gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
            {onEdit && (
              <button
                onClick={() => onEdit(address)}
                className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                <FaEdit size={12} />
                Modifier
              </button>
            )}
            {!isDefault && onDelete && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 text-sm text-red-500 hover:underline font-semibold ml-auto"
              >
                <FaTrash size={12} />
                {deleting ? "..." : "Supprimer"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressCard;