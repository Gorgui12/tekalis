import { Link } from "react-router-dom";
import { FaArrowRight, FaWhatsapp } from "react-icons/fa";

const CTASection = ({ 
  title,
  subtitle,
  description,
  primaryButton,
  secondaryButton,
  gradient = "from-blue-600 to-indigo-600",
  icon,
  size = "large",
  layout = "center"
}) => {
  // Tailles prédéfinies
  const sizeClasses = {
    small: "py-8",
    medium: "py-12",
    large: "py-16"
  };

  // Layouts prédéfinies
  const layoutClasses = {
    center: "text-center items-center",
    left: "text-left items-start",
    right: "text-right items-end"
  };

  return (
    <section className={`${sizeClasses[size] || sizeClasses.large}`}>
      <div className="container mx-auto px-4">
        <div className={`bg-gradient-to-r ${gradient} rounded-2xl shadow-2xl p-8 md:p-12 text-white relative overflow-hidden`}>
          {/* Pattern Background (optionnel) */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '30px 30px'
            }}></div>
          </div>

          {/* Content */}
          <div className={`relative z-10 flex flex-col ${layoutClasses[layout] || layoutClasses.center} max-w-4xl ${layout === "center" ? "mx-auto" : ""}`}>
            {/* Icon (optionnel) */}
            {icon && (
              <div className="text-5xl md:text-6xl mb-6">
                {icon}
              </div>
            )}

            {/* Title */}
            {title && (
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                {title}
              </h2>
            )}

            {/* Subtitle */}
            {subtitle && (
              <p className="text-xl md:text-2xl mb-4 text-white/90">
                {subtitle}
              </p>
            )}

            {/* Description */}
            {description && (
              <p className="text-base md:text-lg mb-8 text-white/80 max-w-2xl">
                {description}
              </p>
            )}

            {/* Buttons */}
            {(primaryButton || secondaryButton) && (
              <div className={`flex flex-col sm:flex-row gap-4 ${layout === "center" ? "justify-center" : layout === "right" ? "justify-end" : "justify-start"}`}>
                {/* Primary Button */}
                {primaryButton && (
                  primaryButton.external ? (
                    <a
                      href={primaryButton.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold text-base md:text-lg hover:bg-gray-100 transition shadow-xl transform hover:scale-105 ${primaryButton.className || ""}`}
                    >
                      {primaryButton.icon}
                      {primaryButton.text}
                      {!primaryButton.icon && <FaArrowRight />}
                    </a>
                  ) : (
                    <Link
                      to={primaryButton.link}
                      className={`inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold text-base md:text-lg hover:bg-gray-100 transition shadow-xl transform hover:scale-105 ${primaryButton.className || ""}`}
                    >
                      {primaryButton.icon}
                      {primaryButton.text}
                      {!primaryButton.icon && <FaArrowRight />}
                    </Link>
                  )
                )}

                {/* Secondary Button */}
                {secondaryButton && (
                  secondaryButton.external ? (
                    <a
                      href={secondaryButton.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm text-white px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold text-base md:text-lg hover:bg-white/30 transition border-2 border-white/50 ${secondaryButton.className || ""}`}
                    >
                      {secondaryButton.icon}
                      {secondaryButton.text}
                    </a>
                  ) : (
                    <Link
                      to={secondaryButton.link}
                      className={`inline-flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm text-white px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold text-base md:text-lg hover:bg-white/30 transition border-2 border-white/50 ${secondaryButton.className || ""}`}
                    >
                      {secondaryButton.icon}
                      {secondaryButton.text}
                    </Link>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

// Exemples de CTAs prédéfinis
export const PresetCTAs = {
  configurator: {
    title: "Besoin d'aide pour choisir ?",
    subtitle: "Notre équipe d'experts est là pour vous conseiller",
    primaryButton: {
      text: "Configurer mon PC",
      link: "/configurator"
    },
    secondaryButton: {
      text: "Contacter sur WhatsApp",
      link: "https://wa.me/221776543210",
      external: true,
      icon: <FaWhatsapp />
    },
    gradient: "from-blue-600 to-indigo-600"
  },
  
  newsletter: {
    title: "Restez informé des nouveautés",
    subtitle: "Recevez nos offres exclusives et les dernières actualités tech",
    description: "Inscrivez-vous à notre newsletter et bénéficiez de 10% de réduction sur votre première commande",
    primaryButton: {
      text: "S'inscrire maintenant",
      link: "/newsletter"
    },
    gradient: "from-purple-600 to-pink-600",
    icon: "📧"
  },

  support: {
    title: "Une question ? Besoin d'aide ?",
    subtitle: "Notre équipe support est disponible 24/7",
    primaryButton: {
      text: "Contacter le support",
      link: "/contact"
    },
    secondaryButton: {
      text: "FAQ",
      link: "/faq"
    },
    gradient: "from-green-600 to-teal-600",
    icon: "💬"
  },

  deals: {
    title: "Ne manquez pas nos offres flash !",
    subtitle: "Profitez de réductions jusqu'à -50% sur une sélection de produits",
    primaryButton: {
      text: "Voir les offres",
      link: "/deals"
    },
    gradient: "from-red-600 to-orange-600",
    icon: "🔥"
  }
};

export default CTASection;