"use client";

import Link from "next/link";
import Script from "next/script";
import { useState } from "react";
import { 
  FaFacebook, FaInstagram, FaLinkedin, FaTwitter,
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock,
  FaArrowUp, FaHeart, FaShieldAlt, FaTruck
} from "react-icons/fa";
import { useToast } from "@/components/shared/ToastProvider";
import { validateEmail } from "@/lib/utils/validators";
import Button from "../shared/Button";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      toast.error(emailValidation.errors[0]);
      return;
    }
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Merci ! Vous êtes inscrit à notre newsletter", 4000, {
        title: "Inscription réussie"
      });
      setEmail("");
    } catch (error) {
      toast.error("Erreur lors de l'inscription. Réessayez plus tard.");
    } finally {
      setLoading(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface-950 dark:bg-black text-white mt-20">
      
      {/* Section principale - 4 colonnes */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Colonne 1 : À propos */}
          <div>
            <h3 className="text-2xl font-bold font-display mb-4 text-brand-400">
              Tekalis
            </h3>
            <p className="text-surface-400 mb-4 leading-relaxed text-sm">
              Votre boutique en ligne de confiance au Sénégal, située à <strong className="text-surface-200">Fann, Dakar</strong>. 
              Produits de qualité, livraison rapide dans toute la région de Dakar et service client exceptionnel.
              Spécialiste en électronique, informatique et high-tech depuis 2024.
            </p>
            
            {/* Badges de confiance */}
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-sm">
                <FaShieldAlt className="text-emerald-400" />
                <span className="text-surface-300">Paiement sécurisé</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-sm">
                <FaTruck className="text-brand-400" />
                <span className="text-surface-300">Livraison rapide</span>
              </div>
            </div>

            {/* Contact rapide */}
            <div className="space-y-2 text-sm">
              <a 
                href="mailto:contact@tekalis.com" 
                className="flex items-center gap-2 text-surface-400 hover:text-brand-400 transition"
              >
                <FaEnvelope className="text-brand-400" />
                contact@tekalis.com
              </a>
              <a 
                href="tel:+221786346946" 
                className="flex items-center gap-2 text-surface-400 hover:text-brand-400 transition"
              >
                <FaPhone className="text-emerald-400" />
                +221 78 634 69 46
              </a>
              <div className="flex items-start gap-2 text-surface-400">
                <FaMapMarkerAlt className="text-rose-400 mt-1 flex-shrink-0" />
                <span>Fann, Rue 14<br/>Dakar, Sénégal<br/>BP 12345</span>
              </div>
            </div>
          </div>

          {/* Colonne 2 : Catégories populaires */}
          <div>
            <h4 className="text-lg font-bold font-display mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-brand-500 rounded-full"></span>
              Catégories
            </h4>
            <ul className="space-y-2.5">
              {[
                { name: "Smartphones Dakar", path: "/category/smartphones" },
                { name: "Ordinateurs portables", path: "/category/ordinateurs" },
                { name: "Gaming & Consoles", path: "/category/gaming" },
                { name: "Téléviseurs", path: "/category/tv" },
                { name: "Électroménager", path: "/category/electromenager" },
                { name: "Climatiseurs", path: "/category/climatiseurs" },
              ].map((item) => (
                <li key={item.path}>
                  <Link href={item.path} 
                    className="text-surface-400 hover:text-brand-400 transition hover:translate-x-1 inline-block text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 3 : Zones de livraison */}
          <div>
            <h4 className="text-lg font-bold font-display mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-brand-500 rounded-full"></span>
              Zones de livraison
            </h4>
            <ul className="space-y-2.5 text-sm">
              {["Dakar Centre", "Dakar Plateau", "Fann - Mermoz", "SICAP - Liberté", "Almadies - Yoff", "Parcelles Assainies", "Toute la région de Dakar"].map((zone) => (
                <li key={zone}>
                  <span className="text-surface-400">{zone}</span>
                </li>
              ))}
            </ul>

            {/* Horaires */}
            <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FaClock className="text-amber-400" />
                <h5 className="font-semibold text-sm">Horaires Fann</h5>
              </div>
              <p className="text-sm text-surface-400">
                Lun - Ven: 8h - 19h<br/>
                Sam: 9h - 17h<br/>
                Dim: Fermé
              </p>
            </div>
          </div>

          {/* Colonne 4 : Newsletter & Réseaux */}
          <div>
            <h4 className="text-lg font-bold font-display mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-brand-500 rounded-full"></span>
              Newsletter
            </h4>
            <p className="text-surface-400 mb-4 text-sm">
              Inscrivez-vous pour recevoir nos offres exclusives et nouveautés !
            </p>

            {/* Formulaire newsletter */}
            <form onSubmit={handleNewsletterSubmit} className="mb-6">
              <div className="flex flex-col gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre email"
                  className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-white placeholder-surface-500 transition"
                  required
                />
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={loading}
                  icon={<FaEnvelope />}
                >
                  S'inscrire
                </Button>
              </div>
            </form>

            {/* Réseaux sociaux */}
            <div>
              <h5 className="font-semibold mb-3 text-sm">Suivez-nous</h5>
              <div className="flex gap-3">
                {[
                  { icon: <FaFacebook size={18} />, href: "https://www.facebook.com/share/14MikMhjFhA/?mibextid=wwXIfr", label: "Facebook", hover: "hover:bg-blue-600" },
                  { icon: <FaInstagram size={18} />, href: "https://www.instagram.com/_tekalis_?igsh=MWY0am12dDlyNGRpYQ==", label: "Instagram", hover: "hover:bg-pink-600" },
                  { icon: <FaTwitter size={18} />, href: "https://twitter.com/tekalis", label: "Twitter", hover: "hover:bg-sky-500" },
                  { icon: <FaLinkedin size={18} />, href: "https://linkedin.com/company/tekalis", label: "LinkedIn", hover: "hover:bg-blue-700" },
                ].map((social) => (
                  <a 
                    key={social.label}
                    href={social.href}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={`w-10 h-10 bg-white/5 border border-white/10 ${social.hover} rounded-full flex items-center justify-center transition transform hover:scale-110`}
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Moyens de paiement */}
            <div className="mt-6">
              <h5 className="font-semibold mb-3 text-sm">Moyens de paiement</h5>
              <div className="flex flex-wrap gap-2">
                <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-semibold text-surface-300">
                  VISA
                </div>
                <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-semibold text-surface-300">
                  Mastercard
                </div>
                <div className="bg-brand-600/80 px-3 py-1.5 rounded-lg text-xs font-semibold text-white">
                  Wave
                </div>
                <div className="bg-orange-600/80 px-3 py-1.5 rounded-lg text-xs font-semibold text-white">
                  Orange Money
                </div>
                <div className="bg-blue-600/80 px-3 py-1.5 rounded-lg text-xs font-semibold text-white">
                  Free Money
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Séparateur */}
      <div className="h-px bg-gradient-to-r from-transparent via-surface-700 to-transparent"></div>

      {/* Bas du footer - Légal */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-surface-500">
          
          {/* Copyright */}
          <div className="flex items-center gap-2">
            <span>© {currentYear} Tekalis.</span>
            <span className="hidden sm:inline">Tous droits réservés.</span>
            <span className="text-rose-400">Fait avec <FaHeart className="inline" size={12} /> au Sénégal</span>
          </div>

          {/* Liens légaux */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/mentions-legales" 
              className="hover:text-brand-400 transition"
            >
              Mentions légales
            </Link>
            <span className="text-surface-700">•</span>
            <Link href="/politique" 
              className="hover:text-brand-400 transition"
            >
              Confidentialité
            </Link>
            <span className="text-surface-700">•</span>
            <Link href="/cgv" 
              className="hover:text-brand-400 transition"
            >
              CGV
            </Link>
            <span className="text-surface-700">•</span>
            <Link href="/cookies" 
              className="hover:text-brand-400 transition"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>

      {/* Bouton Scroll to Top */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-12 h-12 bg-brand-500 hover:bg-brand-600 text-white rounded-full shadow-glow hover:shadow-glow-lg transition transform hover:scale-110 flex items-center justify-center z-40"
        aria-label="Retour en haut"
      >
        <FaArrowUp size={20} />
      </button>

      <Script
        id="footer-organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Tekalis",
          "url": "https://tekalis.com",
          "logo": "https://tekalis.com/og-image.png",
          "description": "Boutique en ligne au Sénégal - Produits de qualité, livraison rapide",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Fann, Rue 14",
            "addressLocality": "Dakar",
            "addressCountry": "SN"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+221-78-634-69-46",
            "contactType": "Customer Service",
            "email": "contact@tekalis.com",
            "availableLanguage": ["fr", "wo"]
          },
          "sameAs": [
            "https://www.facebook.com/share/14MikMhjFhA",
            "https://www.instagram.com/_tekalis_",
            "https://twitter.com/tekalis",
            "https://linkedin.com/company/tekalis"
          ]
        }) }}
      />
    </footer>
  );
};

export default Footer;
