import { FaCheckCircle, FaTruck, FaCreditCard, FaShoppingCart } from "react-icons/fa";

/**
 * CheckoutSteps — Barre de progression du tunnel d'achat
 * Props:
 *   currentStep: number (1 = Panier, 2 = Livraison, 3 = Paiement)
 */
const STEPS = [
  { number: 1, label: "Panier",    description: "Vérifiez vos articles", icon: <FaShoppingCart /> },
  { number: 2, label: "Livraison", description: "Adresse & mode de livraison", icon: <FaTruck /> },
  { number: 3, label: "Paiement",  description: "Finalisez votre commande", icon: <FaCreditCard /> }
];

const CheckoutSteps = ({ currentStep = 1 }) => {
  return (
    <div className="w-full">
      {/* Desktop */}
      <div className="hidden sm:flex items-center justify-center">
        {STEPS.map((step, index) => {
          const isDone    = currentStep > step.number;
          const isActive  = currentStep === step.number;
          const isPending = currentStep < step.number;

          return (
            <div key={step.number} className="flex items-center">
              {/* Step item */}
              <div className="flex flex-col items-center">
                {/* Circle */}
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all
                    ${isDone    ? "bg-green-500 text-white shadow-md shadow-green-200"  : ""}
                    ${isActive  ? "bg-blue-600 text-white shadow-md shadow-blue-200 ring-4 ring-blue-100" : ""}
                    ${isPending ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400" : ""}
                  `}
                >
                  {isDone ? <FaCheckCircle /> : step.icon}
                </div>

                {/* Labels */}
                <div className="mt-2 text-center">
                  <p className={`text-sm font-semibold transition ${
                    isActive  ? "text-blue-600 dark:text-blue-400" :
                    isDone    ? "text-green-600 dark:text-green-400" :
                    "text-gray-500 dark:text-gray-400"
                  }`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 hidden lg:block">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connecteur */}
              {index < STEPS.length - 1 && (
                <div className={`w-24 lg:w-32 h-1 mx-3 rounded-full transition-all ${
                  currentStep > step.number
                    ? "bg-green-400"
                    : "bg-gray-200 dark:bg-gray-700"
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile — version simplifiée */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            Étape {currentStep} sur {STEPS.length}
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
            {STEPS[currentStep - 1]?.label}
          </p>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${((currentStep) / STEPS.length) * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {STEPS[currentStep - 1]?.description}
        </p>
      </div>
    </div>
  );
};

export default CheckoutSteps;