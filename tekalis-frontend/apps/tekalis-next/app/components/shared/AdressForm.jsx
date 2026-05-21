import React from 'react';
import PropTypes from 'prop-types';

/**
 * Composant Formulaire d'adresse réutilisable
 * Utilisé dans : Profile, Checkout, AddressManager
 */

const SENEGAL_CITIES = [
  "Dakar",
  "Pikine", 
  "Guédiawaye",
  "Rufisque",
  "Thiès",
  "Saint-Louis",
  "Kaolack",
  "Mbour",
  "Ziguinchor",
  "Louga",
  "Diourbel",
  "Tambacounda",
  "Kolda",
  "Matam",
  "Kédougou",
  "Sédhiou"
];

const SENEGAL_REGIONS = [
  "Dakar",
  "Thiès",
  "Saint-Louis",
  "Diourbel",
  "Kaolack",
  "Fatick",
  "Kaffrine",
  "Kolda",
  "Louga",
  "Matam",
  "Sédhiou",
  "Tambacounda",
  "Kédougou",
  "Ziguinchor"
];

const AddressForm = ({ 
  formData, 
  onChange, 
  errors = {},
  disabled = false,
  showDefaultCheckbox = true,
  showLabel = true 
}) => {
  
  const handleChange = (field, value) => {
    onChange({ ...formData, [field]: value });
  };

  const inputBaseClasses = "w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 transition";
  const inputClasses = (field) => `
    ${inputBaseClasses}
    ${errors[field] 
      ? 'border-red-500 focus:ring-red-500 bg-red-50' 
      : 'border-gray-300 focus:ring-blue-500 bg-white'
    }
    ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-100' : ''}
  `;

  return (
    <div className="space-y-4">
      {/* Libellé de l'adresse */}
      {showLabel && (
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Libellé de l'adresse *
          </label>
          <input
            type="text"
            value={formData.label || ''}
            onChange={(e) => handleChange('label', e.target.value)}
            placeholder="Ex: Maison, Bureau, Chez mes parents..."
            className={inputClasses('label')}
            disabled={disabled}
            required
            aria-invalid={!!errors.label}
            aria-describedby={errors.label ? "label-error" : undefined}
          />
          {errors.label && (
            <p id="label-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.label}
            </p>
          )}
        </div>
      )}

      {/* Nom complet du destinataire */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Nom complet du destinataire *
        </label>
        <input
          type="text"
          value={formData.fullName || ''}
          onChange={(e) => handleChange('fullName', e.target.value)}
          placeholder="Ex: Ousmane Diallo"
          className={inputClasses('fullName')}
          disabled={disabled}
          required
          aria-invalid={!!errors.fullName}
          aria-describedby={errors.fullName ? "fullName-error" : undefined}
        />
        {errors.fullName && (
          <p id="fullName-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.fullName}
          </p>
        )}
      </div>

      {/* Téléphone */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Téléphone *
        </label>
        <input
          type="tel"
          value={formData.phone || ''}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder="Ex: 77 123 45 67"
          pattern="[0-9\s]+"
          className={inputClasses('phone')}
          disabled={disabled}
          required
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? "phone-error" : undefined}
        />
        {errors.phone && (
          <p id="phone-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.phone}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Format: XX XXX XX XX (9 chiffres)
        </p>
      </div>

      {/* Ville et Région */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Ville *
          </label>
          <select
            value={formData.city || 'Dakar'}
            onChange={(e) => handleChange('city', e.target.value)}
            className={inputClasses('city')}
            disabled={disabled}
            required
            aria-invalid={!!errors.city}
          >
            {SENEGAL_CITIES.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          {errors.city && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.city}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Région *
          </label>
          <select
            value={formData.region || 'Dakar'}
            onChange={(e) => handleChange('region', e.target.value)}
            className={inputClasses('region')}
            disabled={disabled}
            required
            aria-invalid={!!errors.region}
          >
            {SENEGAL_REGIONS.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
          {errors.region && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.region}
            </p>
          )}
        </div>
      </div>

      {/* Adresse complète */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Adresse complète *
        </label>
        <textarea
          value={formData.address || ''}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="Ex: Cité Keur Gorgui, Villa n°123, près de la pharmacie Plateau"
          rows={3}
          className={inputClasses('address')}
          disabled={disabled}
          required
          aria-invalid={!!errors.address}
          aria-describedby={errors.address ? "address-error" : undefined}
        />
        {errors.address && (
          <p id="address-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.address}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Soyez précis: nom de quartier, numéro de villa, points de repère
        </p>
      </div>

      {/* Adresse par défaut */}
      {showDefaultCheckbox && (
        <div className="flex items-start">
          <input
            type="checkbox"
            id="isDefault"
            checked={formData.isDefault || false}
            onChange={(e) => handleChange('isDefault', e.target.checked)}
            className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            disabled={disabled}
          />
          <label htmlFor="isDefault" className="ml-3 cursor-pointer">
            <span className="text-sm font-medium text-gray-900">
              Définir comme adresse par défaut
            </span>
            <p className="text-xs text-gray-500 mt-0.5">
              Cette adresse sera utilisée automatiquement lors de vos prochaines commandes
            </p>
          </label>
        </div>
      )}
    </div>
  );
};

AddressForm.propTypes = {
  formData: PropTypes.shape({
    label: PropTypes.string,
    fullName: PropTypes.string,
    phone: PropTypes.string,
    city: PropTypes.string,
    region: PropTypes.string,
    address: PropTypes.string,
    isDefault: PropTypes.bool
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  errors: PropTypes.object,
  disabled: PropTypes.bool,
  showDefaultCheckbox: PropTypes.bool,
  showLabel: PropTypes.bool
};

export default AddressForm;

/**
 * EXEMPLE D'UTILISATION :
 * 
 * const [addressData, setAddressData] = useState({
 *   label: '',
 *   fullName: '',
 *   phone: '',
 *   city: 'Dakar',
 *   region: 'Dakar',
 *   address: '',
 *   isDefault: false
 * });
 * 
 * const [errors, setErrors] = useState({});
 * 
 * const handleSubmit = () => {
 *   const validation = validateAddress(addressData);
 *   if (!validation.isValid) {
 *     setErrors(validation.errors);
 *     return;
 *   }
 *   // Sauvegarder l'adresse
 * };
 * 
 * <AddressForm
 *   formData={addressData}
 *   onChange={setAddressData}
 *   errors={errors}
 * />
 */

export { SENEGAL_CITIES, SENEGAL_REGIONS };