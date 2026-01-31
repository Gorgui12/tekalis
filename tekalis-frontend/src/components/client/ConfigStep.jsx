import { FaCheckCircle } from "react-icons/fa";

const ConfigStep = ({ 
  currentStep, 
  totalSteps = 3, 
  steps = [],
  variant = "horizontal" // horizontal, vertical
}) => {
  // Steps par défaut si non fournis
  const defaultSteps = [
    { number: 1, label: "Usage", description: "Définissez votre besoin" },
    { number: 2, label: "Budget", description: "Choisissez votre prix" },
    { number: 3, label: "Préférences", description: "Affinez votre choix" }
  ];

  const displaySteps = steps.length > 0 ? steps : defaultSteps.slice(0, totalSteps);

  if (variant === "vertical") {
    return (
      <div className="space-y-4">
        {displaySteps.map((step, index) => (
          <div key={step.number} className="flex items-start gap-4">
            {/* Circle */}
            <div className={`relative flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition ${
              currentStep > step.number
                ? "bg-green-500 text-white"
                : currentStep === step.number
                ? "bg-blue-600 text-white"
                : "bg-gray-300 text-gray-600"
            }`}>
              {currentStep > step.number ? <FaCheckCircle /> : step.number}
              
              {/* Connector Line */}
              {index < displaySteps.length - 1 && (
                <div className={`absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-8 ${
                  currentStep > step.number ? "bg-green-500" : "bg-gray-300"
                }`}></div>
              )}
            </div>

            {/* Label */}
            <div className={`flex-1 ${currentStep >= step.number ? "opacity-100" : "opacity-50"}`}>
              <p className={`font-bold ${
                currentStep >= step.number ? "text-gray-900" : "text-gray-500"
              }`}>
                {step.label}
              </p>
              {step.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Horizontal variant (default)
  return (
    <div className="flex items-center justify-center">
      {displaySteps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          {/* Step Item */}
          <div className="flex flex-col items-center">
            {/* Circle */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition ${
              currentStep > step.number
                ? "bg-green-500 text-white"
                : currentStep === step.number
                ? "bg-blue-600 text-white animate-pulse"
                : "bg-gray-300 text-gray-600"
            }`}>
              {currentStep > step.number ? <FaCheckCircle /> : step.number}
            </div>
            
            {/* Label */}
            <div className="mt-2 text-center">
              <p className={`text-sm font-semibold ${
                currentStep >= step.number ? "text-gray-900" : "text-gray-500"
              }`}>
                {step.label}
              </p>
              {step.description && (
                <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                  {step.description}
                </p>
              )}
            </div>
          </div>

          {/* Connector Line */}
          {index < displaySteps.length - 1 && (
            <div className={`w-16 sm:w-24 h-1 mx-2 transition ${
              currentStep > step.number ? "bg-green-500" : "bg-gray-300"
            }`}></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ConfigStep;