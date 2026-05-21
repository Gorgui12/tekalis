const Loader = ({
  type = "spinner", // spinner, dots, bars, pulse, ring
  size = "medium", // small, medium, large
  color = "blue", // blue, white, gray, green, red
  fullScreen = false,
  overlay = false,
  text,
  className = ""
}) => {
  // Tailles
  const sizeClasses = {
    small: "w-6 h-6",
    medium: "w-10 h-10",
    large: "w-16 h-16"
  };

  const textSizes = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg"
  };

  // Couleurs
  const colorClasses = {
    blue: "text-blue-600 border-blue-600",
    white: "text-white border-white",
    gray: "text-gray-600 border-gray-600",
    green: "text-green-600 border-green-600",
    red: "text-red-600 border-red-600"
  };

  // Types de loaders
  const renderLoader = () => {
    switch (type) {
      case "spinner":
        return (
          <svg
            className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        );

      case "dots":
        return (
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`${
                  size === "small" ? "w-2 h-2" : size === "large" ? "w-4 h-4" : "w-3 h-3"
                } bg-current rounded-full animate-bounce ${colorClasses[color]}`}
                style={{ animationDelay: `${i * 0.15}s` }}
              ></div>
            ))}
          </div>
        );

      case "bars":
        return (
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`${
                  size === "small" ? "w-1 h-6" : size === "large" ? "w-2 h-12" : "w-1.5 h-8"
                } bg-current rounded-full animate-pulse ${colorClasses[color]}`}
                style={{ animationDelay: `${i * 0.15}s` }}
              ></div>
            ))}
          </div>
        );

      case "pulse":
        return (
          <div
            className={`${sizeClasses[size]} bg-current rounded-full animate-ping ${colorClasses[color]}`}
          ></div>
        );

      case "ring":
        return (
          <div
            className={`${sizeClasses[size]} border-4 border-t-transparent rounded-full animate-spin ${colorClasses[color]}`}
          ></div>
        );

      default:
        return null;
    }
  };

  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      {renderLoader()}
      {text && (
        <p className={`font-semibold ${textSizes[size]} ${colorClasses[color]}`}>
          {text}
        </p>
      )}
    </div>
  );

  // Full screen loader
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        {content}
      </div>
    );
  }

  // Loader avec overlay
  if (overlay) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        {content}
      </div>
    );
  }

  // Loader simple
  return content;
};

// Loader de page (full screen avec overlay)
export const PageLoader = ({ text = "Chargement..." }) => {
  return (
    <Loader
      type="spinner"
      size="large"
      color="blue"
      overlay
      text={text}
    />
  );
};

// Loader de contenu (dans une section)
export const ContentLoader = ({ text, className = "" }) => {
  return (
    <div className={`py-12 ${className}`}>
      <Loader
        type="spinner"
        size="medium"
        color="blue"
        text={text}
      />
    </div>
  );
};

// Loader de bouton (petit spinner)
export const ButtonLoader = () => {
  return (
    <Loader
      type="spinner"
      size="small"
      color="white"
    />
  );
};

// Skeleton Loader (comme vu précédemment)
export const SkeletonLoader = ({ className = "" }) => {
  return (
    <div className={`animate-pulse space-y-4 ${className}`}>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  );
};

// Loader avec progression
export const ProgressLoader = ({ progress = 0, text }) => {
  return (
    <div className="w-full max-w-md space-y-3">
      {text && (
        <p className="text-center text-gray-700 font-semibold">{text}</p>
      )}
      
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-blue-600 h-full rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <p className="text-center text-sm text-gray-600">{progress}%</p>
    </div>
  );
};

// Loader circulaire avec pourcentage
export const CircularProgress = ({ 
  progress = 0, 
  size = 120, 
  strokeWidth = 8,
  color = "blue"
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const colors = {
    blue: "#2563eb",
    green: "#16a34a",
    red: "#dc2626",
    yellow: "#ca8a04"
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors[color]}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      </svg>
      <span className="absolute text-xl font-bold text-gray-900">
        {Math.round(progress)}%
      </span>
    </div>
  );
};

export default Loader;