import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { FaMapMarkerAlt, FaPlus, FaTruck, FaMotorcycle } from "react-icons/fa";
import AddressForm from "../shared/AdressForm";
import AddressCard from "../account/AddressCard";
import Button from "../shared/Button";

/**
 * DeliveryForm — Étape livraison du checkout
 * Props:
 *   onNext: (data: { address, deliveryMode }) => void
 *   savedAddresses: Array<Address>
 *   loading: boolean
 */

const DELIVERY_MODES = [
  {
    id: "standard",
    label: "Livraison standard",
    description: "Dakar & banlieue — 2 à 3 jours ouvrés",
    price: 0,
    priceLabel: "Gratuit",
    icon: <FaTruck />,
    color: "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
  },
  {
    id: "express",
    label: "Livraison express",
    description: "Dakar uniquement — Aujourd'hui ou demain",
    price: 2500,
    priceLabel: "2 500 FCFA",
    icon: <FaMotorcycle />,
    color: "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
  }
];

const EMPTY_ADDRESS = {
  label: "Adresse de livraison",
  fullName: "",
  phone: "",
  city: "Dakar",
  region: "Dakar",
  address: "",
  isDefault: false
};

const DeliveryForm = ({ onNext, savedAddresses = [], loading = false }) => {
  const { user } = useSelector(state => state.auth);

  const [mode, setMode] = useState("select"); // "select" | "new"
  const [selectedAddressId, setSelectedAddressId] = useState(
    savedAddresses.find(a => a.isDefault)?._id || savedAddresses[0]?._id || null
  );
  const [newAddress, setNewAddress] = useState(EMPTY_ADDRESS);
  const [addressErrors, setAddressErrors] = useState({});
  const [deliveryMode, setDeliveryMode] = useState("standard");
  const [submitting, setSubmitting] = useState(false);

  // Pré-remplir avec l'adresse sélectionnée si on bascule en mode nouveau
  useEffect(() => {
    if (savedAddresses.length === 0) setMode("new");
  }, [savedAddresses]);

  // ─── Validation ────────────────────────────────────────────────────────────
  const validateNewAddress = () => {
    const errors = {};
    if (!newAddress.fullName?.trim()) errors.fullName = "Nom requis";
    if (!newAddress.phone?.trim()) errors.phone = "Téléphone requis";
    if (!newAddress.address?.trim()) errors.address = "Adresse requise";
    return errors;
  };

  // ─── Soumission ────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    let deliveryAddress;

    if (mode === "new") {
      const errors = validateNewAddress();
      if (Object.keys(errors).length > 0) {
        setAddressErrors(errors);
        return;
      }
      deliveryAddress = newAddress;
    } else {
      deliveryAddress = savedAddresses.find(a => a._id === selectedAddressId);
      if (!deliveryAddress) return;
    }

    const selectedMode = DELIVERY_MODES.find(m => m.id === deliveryMode);
    onNext({ address: deliveryAddress, deliveryMode: selectedMode });
  };

  return (
    <div className="space-y-8">

      {/* ─── Adresse de livraison ────────────────────────────────────────── */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FaMapMarkerAlt className="text-blue-600" />
          Adresse de livraison
        </h3>

        {/* Adresses sauvegardées */}
        {savedAddresses.length > 0 && (
          <>
            <div className="space-y-3 mb-4">
              {savedAddresses.map(address => (
                <AddressCard
                  key={address._id}
                  address={address}
                  isDefault={address.isDefault}
                  selectable
                  selected={selectedAddressId === address._id && mode === "select"}
                  onSelect={() => {
                    setSelectedAddressId(address._id);
                    setMode("select");
                  }}
                />
              ))}
            </div>

            {/* Bouton nouvelle adresse */}
            <button
              onClick={() => setMode("new")}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 border-dashed transition ${
                mode === "new"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
              }`}
            >
              <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                <FaPlus className="text-blue-600" />
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Utiliser une nouvelle adresse
              </span>
            </button>
          </>
        )}

        {/* Formulaire nouvelle adresse */}
        {mode === "new" && (
          <div className="mt-5 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <AddressForm
              formData={newAddress}
              onChange={setNewAddress}
              errors={addressErrors}
              showLabel={false}
              showDefaultCheckbox={false}
            />
          </div>
        )}
      </div>

      {/* ─── Mode de livraison ───────────────────────────────────────────── */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FaTruck className="text-blue-600" />
          Mode de livraison
        </h3>
        <div className="space-y-3">
          {DELIVERY_MODES.map(dm => (
            <button
              key={dm.id}
              onClick={() => setDeliveryMode(dm.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                deliveryMode === dm.id
                  ? dm.color + " border-opacity-100 shadow-sm"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300"
              }`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl ${
                deliveryMode === dm.id ? "bg-white dark:bg-gray-800 shadow" : "bg-gray-100 dark:bg-gray-700 text-gray-500"
              } ${deliveryMode === dm.id && dm.id === "express" ? "text-orange-600" : ""}
                ${deliveryMode === dm.id && dm.id === "standard" ? "text-blue-600" : ""}
              `}>
                {dm.icon}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                  {dm.label}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {dm.description}
                </p>
              </div>
              <p className={`font-bold text-sm flex-shrink-0 ${
                dm.price === 0 ? "text-green-600" : "text-gray-900 dark:text-white"
              }`}>
                {dm.priceLabel}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Bouton continuer ────────────────────────────────────────────── */}
      <Button
        onClick={handleSubmit}
        variant="primary"
        fullWidth
        size="lg"
        isLoading={submitting || loading}
        icon={<FaTruck />}
      >
        Continuer vers le paiement
      </Button>
    </div>
  );
};

export default DeliveryForm;