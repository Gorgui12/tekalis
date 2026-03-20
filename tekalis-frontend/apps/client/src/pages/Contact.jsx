import { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock,
  FaWhatsapp, FaFacebook, FaInstagram, FaLinkedin,
  FaPaperPlane, FaCheckCircle, FaExclamationCircle
} from "react-icons/fa";
import { useToast } from "../../../../packages/shared/context/ToastContext";
import Button from "../components/shared/Button";
import { Breadcrumb } from "../components/seo/Breadcrumb";

// ─── Données de contact ────────────────────────────────────────────────────────
const CONTACT_INFO = [
  {
    icon: <FaPhone />,
    label: "Téléphone",
    value: "+221 77 123 45 67",
    href: "tel:+221771234567",
    color: "bg-green-100 text-green-600"
  },
  {
    icon: <FaWhatsapp />,
    label: "WhatsApp",
    value: "+221 78 634 69 46",
    href: "https://wa.me/221786346946",
    external: true,
    color: "bg-emerald-100 text-emerald-600"
  },
  {
    icon: <FaEnvelope />,
    label: "Email",
    value: "contact@tekalis.com",
    href: "mailto:contact@tekalis.com",
    color: "bg-blue-100 text-blue-600"
  },
  {
    icon: <FaMapMarkerAlt />,
    label: "Adresse",
    value: "Plateau, Dakar, Sénégal",
    href: "https://maps.google.com/?q=Dakar+Plateau+Senegal",
    external: true,
    color: "bg-red-100 text-red-600"
  }
];

const HORAIRES = [
  { jour: "Lundi — Vendredi", heures: "09h00 – 18h00" },
  { jour: "Samedi", heures: "09h00 – 13h00" },
  { jour: "Dimanche", heures: "Fermé" }
];

const SUBJECTS = [
  "Question sur un produit",
  "Suivi de commande",
  "Demande de devis",
  "SAV / Garantie",
  "Partenariat",
  "Autre"
];

// ─── Formulaire de contact ─────────────────────────────────────────────────────
const ContactForm = () => {
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Votre nom est requis";
    if (!formData.email.trim()) {
      newErrors.email = "Votre email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email invalide";
    }
    if (!formData.subject) newErrors.subject = "Veuillez choisir un sujet";
    if (!formData.message.trim()) {
      newErrors.message = "Votre message est requis";
    } else if (formData.message.trim().length < 20) {
      newErrors.message = "Message trop court (20 caractères minimum)";
    }
    return newErrors;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      // TODO: remplacer par appel API réel
      // await api.post('/contact', formData);
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSent(true);
      toast.success("Message envoyé ! Nous vous répondrons sous 24h.");
    } catch (err) {
      toast.error("Erreur lors de l'envoi. Réessayez ou contactez-nous par WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = (field) =>
    `w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 transition text-gray-900 dark:text-white dark:bg-gray-800 ${
      errors[field]
        ? "border-red-400 focus:ring-red-400 bg-red-50 dark:bg-red-900/20"
        : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 bg-white dark:bg-gray-800"
    }`;

  // ─ État succès ─────────────────────────────────────────────────────────────
  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <FaCheckCircle className="text-green-600 text-4xl" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Message envoyé !
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-2 max-w-md">
          Merci <strong>{formData.name}</strong>, nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
          Réponse attendue sous <strong>24h ouvrées</strong>
        </p>
        <Button
          onClick={() => {
            setSent(false);
            setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
          }}
          variant="outline"
        >
          Envoyer un autre message
        </Button>
      </div>
    );
  }

  // ─ Formulaire ─────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Nom + Email */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1.5">
            Nom complet <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={e => handleChange("name", e.target.value)}
            placeholder="Ousmane Diallo"
            className={inputClasses("name")}
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <FaExclamationCircle size={12} /> {errors.name}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1.5">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={e => handleChange("email", e.target.value)}
            placeholder="ousmane@email.com"
            className={inputClasses("email")}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <FaExclamationCircle size={12} /> {errors.email}
            </p>
          )}
        </div>
      </div>

      {/* Téléphone + Sujet */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1.5">
            Téléphone <span className="text-gray-400 font-normal">(optionnel)</span>
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={e => handleChange("phone", e.target.value)}
            placeholder="77 123 45 67"
            className={inputClasses("phone")}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1.5">
            Sujet <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.subject}
            onChange={e => handleChange("subject", e.target.value)}
            className={inputClasses("subject")}
            aria-invalid={!!errors.subject}
          >
            <option value="">Choisir un sujet...</option>
            {SUBJECTS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.subject && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <FaExclamationCircle size={12} /> {errors.subject}
            </p>
          )}
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1.5">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.message}
          onChange={e => handleChange("message", e.target.value)}
          placeholder="Décrivez votre demande en détail..."
          rows={5}
          className={inputClasses("message")}
          aria-invalid={!!errors.message}
        />
        <div className="flex items-center justify-between mt-1">
          {errors.message ? (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <FaExclamationCircle size={12} /> {errors.message}
            </p>
          ) : (
            <span />
          )}
          <span className={`text-xs ${formData.message.length < 20 ? "text-gray-400" : "text-green-600"}`}>
            {formData.message.length} / 20 min
          </span>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        fullWidth
        isLoading={loading}
        icon={<FaPaperPlane />}
        size="lg"
      >
        {loading ? "Envoi en cours..." : "Envoyer le message"}
      </Button>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Vos données sont utilisées uniquement pour répondre à votre demande.
      </p>
    </form>
  );
};

// ─── Page Contact principale ───────────────────────────────────────────────────
const Contact = () => {
  return (
    <>
      <Helmet>
        <title>Contact — Tekalis | Boutique Tech Sénégal</title>
        <meta
          name="description"
          content="Contactez Tekalis — support, devis, questions produits. Disponibles par téléphone, WhatsApp, email ou en boutique à Dakar."
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-28 pb-16">
        <div className="container mx-auto px-4">

          {/* Breadcrumb */}
          <Breadcrumb items={[{ name: "Contact", path: "/contact" }]} />

          {/* Hero */}
          <div className="text-center mb-12 mt-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Contactez-nous
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              Une question, un problème, ou envie de discuter d'un projet ?
              Notre équipe vous répond rapidement.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-10 max-w-6xl mx-auto">

            {/* ─── Colonne gauche : infos ──────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Infos de contact */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">
                  Nos coordonnées
                </h2>
                <div className="space-y-4">
                  {CONTACT_INFO.map((item, idx) => (
                    <a
                      key={idx}
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noopener noreferrer" : undefined}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition group"
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          {item.label}
                        </p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                          {item.value}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Horaires */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
                    <FaClock className="text-purple-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Horaires d'ouverture
                  </h2>
                </div>
                <div className="space-y-3">
                  {HORAIRES.map((h, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                    >
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {h.jour}
                      </span>
                      <span className={`text-sm font-semibold ${
                        h.heures === "Fermé"
                          ? "text-red-500"
                          : "text-gray-900 dark:text-white"
                      }`}>
                        {h.heures}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Réseaux sociaux */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Réseaux sociaux
                </h2>
                <div className="flex gap-3">
                  {[
                    { icon: <FaFacebook size={18} />, href: "https://www.facebook.com/share/14MikMhjFhA/", color: "hover:bg-blue-600" },
                    { icon: <FaInstagram size={18} />, href: "https://www.instagram.com/_tekalis_", color: "hover:bg-pink-600" },
                    { icon: <FaWhatsapp size={18} />, href: "https://wa.me/221786346946", color: "hover:bg-green-500" },
                    { icon: <FaLinkedin size={18} />, href: "https://linkedin.com/company/tekalis", color: "hover:bg-blue-700" }
                  ].map((social, idx) => (
                    <a
                      key={idx}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-11 h-11 bg-gray-100 dark:bg-gray-700 ${social.color} hover:text-white text-gray-600 dark:text-gray-300 rounded-xl flex items-center justify-center transition`}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* ─── Colonne droite : formulaire ─────────────────────────────── */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Envoyer un message
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
                  Réponse garantie sous <strong>24h ouvrées</strong>
                </p>
                <ContactForm />
              </div>
            </div>
          </div>

          {/* WhatsApp CTA */}
          <div className="mt-12 max-w-3xl mx-auto bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white text-center shadow-xl">
            <FaWhatsapp className="text-5xl mx-auto mb-4 opacity-90" />
            <h3 className="text-2xl font-bold mb-2">Besoin d'une réponse rapide ?</h3>
            <p className="text-white/80 mb-6">
              Contactez-nous directement sur WhatsApp — réponse en quelques minutes pendant nos horaires d'ouverture.
            </p>
            <a
              href="https://wa.me/221786346946"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-white text-green-700 font-bold px-8 py-3 rounded-xl hover:bg-green-50 transition shadow-lg"
            >
              <FaWhatsapp size={20} />
              Démarrer une conversation
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;