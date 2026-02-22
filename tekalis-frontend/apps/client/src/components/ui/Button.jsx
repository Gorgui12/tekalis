import { Link } from "react-router-dom";

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary", // primary, secondary, outline, ghost, danger, success
  size = "medium", // small, medium, large
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  href,
  to,
  className = "",
  ...props
}) => {
  // Variantes de couleurs
  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white shadow-md hover:shadow-lg",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
    ghost: "text-blue-600 hover:bg-blue-50",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg",
    success: "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg",
    warning: "bg-yellow-500 hover:bg-yellow-600 text-white shadow-md hover:shadow-lg"
  };

  // Tailles
  const sizeClasses = {
    small: "px-3 py-1.5 text-sm",
    medium: "px-5 py-2.5 text-base",
    large: "px-7 py-3.5 text-lg"
  };

  // Classes de base
  const baseClasses = `
    inline-flex items-center justify-center gap-2 
    font-semibold rounded-lg transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? "w-full" : ""}
    ${disabled || loading ? "opacity-60 cursor-not-allowed" : ""}
    ${className}
  `;

  // Contenu du bouton
  const content = (
    <>
      {loading && (
        <svg
          className="animate-spin h-5 w-5"
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
      )}
      {!loading && leftIcon && <span>{leftIcon}</span>}
      <span>{children}</span>
      {!loading && rightIcon && <span>{rightIcon}</span>}
    </>
  );

  // Si c'est un lien externe
  if (href) {
    return (
      <a
        href={href}
        className={baseClasses}
        onClick={disabled || loading ? (e) => e.preventDefault() : undefined}
        {...props}
      >
        {content}
      </a>
    );
  }

  // Si c'est un lien interne (React Router)
  if (to) {
    return (
      <Link
        to={to}
        className={baseClasses}
        onClick={disabled || loading ? (e) => e.preventDefault() : undefined}
        {...props}
      >
        {content}
      </Link>
    );
  }

  // Bouton normal
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={baseClasses}
      {...props}
    >
      {content}
    </button>
  );
};

// Groupe de boutons
export const ButtonGroup = ({ children, className = "", vertical = false }) => {
  return (
    <div
      className={`inline-flex ${
        vertical ? "flex-col" : "flex-row"
      } ${className}`}
    >
      {children}
    </div>
  );
};

// Boutons pré-configurés
export const PrimaryButton = (props) => <Button variant="primary" {...props} />;
export const SecondaryButton = (props) => <Button variant="secondary" {...props} />;
export const OutlineButton = (props) => <Button variant="outline" {...props} />;
export const DangerButton = (props) => <Button variant="danger" {...props} />;
export const SuccessButton = (props) => <Button variant="success" {...props} />;

// Bouton icône seul
export const IconButton = ({
  icon,
  onClick,
  variant = "ghost",
  size = "medium",
  disabled = false,
  className = "",
  ariaLabel,
  ...props
}) => {
  const sizeClasses = {
    small: "p-1.5 text-sm",
    medium: "p-2.5 text-base",
    large: "p-3.5 text-lg"
  };

  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white",
    outline: "border-2 border-gray-300 hover:border-gray-400 text-gray-700",
    ghost: "text-gray-600 hover:bg-gray-100",
    danger: "bg-red-600 hover:bg-red-700 text-white"
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`
        inline-flex items-center justify-center rounded-lg
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled ? "opacity-60 cursor-not-allowed" : ""}
        ${className}
      `}
      {...props}
    >
      {icon}
    </button>
  );
};

export default Button;