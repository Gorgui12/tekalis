import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaSave,
  FaStore,
  FaTruck,
  FaCreditCard,
  FaShieldAlt,
  FaCog,
  FaChartLine,
  FaTag,
  FaExchangeAlt,
  FaStar,
} from "react-icons/fa";
import api from "@shared/api/api";

// ── Valeurs par défaut = schéma Mongoose du modèle Settings (backend) ──────
const INITIAL = {
  siteName: "Tekalis",
  siteDescription: "",
  logo: "",
  favicon: "",
  contactEmail: "contact@tekalis.com",
  contactPhone: "",
  contactAddress: "",
  socialLinks: {
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    youtube: "",
  },
  shipping: {
    standardCost: 2500,
    freeShippingThreshold: 50000,
    expressAvailable: true,
    expressCost: 5000,
    regions: [],
  },
  tax: { enabled: false, rate: 0, included: true },
  loyalty: {
    enabled: true,
    pointsPerFCFA: 0.001,
    redemptionRate: 1,
    minPointsToRedeem: 100,
  },
  warranty: {
    defaultDuration: 12,
    extensionAvailable: true,
    extensionCost: 5000,
  },
  returns: { enabled: true, periodDays: 14, conditions: "" },
  paymentMethods: {
    cash: true,
    wave: true,
    orangeMoney: true,
    freeMoney: true,
    stripe: false,
  },
  maintenance: { enabled: false, message: "" },
  seo: {
    metaTitle: "",
    metaDescription: "",
    metaKeywords: [],
    googleAnalyticsId: "",
    facebookPixelId: "",
  },
};

// Fusion profonde des defaults + valeurs déjà en base
const mergeSettings = (s = {}) => {
  const result = {};
  Object.keys(INITIAL).forEach((k) => {
    const def = INITIAL[k];
    if (def && typeof def === "object" && !Array.isArray(def)) {
      result[k] = { ...def, ...((s && s[k]) || {}) };
    } else {
      result[k] = (s && s[k]) ?? def;
    }
  });
  return result;
};

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accountSaved, setAccountSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState(mergeSettings());

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get("/admin/settings");
      setSettings(mergeSettings(data.settings));
    } catch (error) {
      console.error("Erreur chargement paramètres:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setAccountSaved(false);
    try {
      await api.put("/admin/settings", settings);
      setAccountSaved(true);
      setTimeout(() => setAccountSaved(false), 3000);
    } catch (error) {
      console.error("Erreur enregistrement:", error);
      alert("Erreur lors de l'enregistrement des paramètres");
    } finally {
      setSaving(false);
    }
  };

  // Helpers de mise à jour (imbriqué)
  const setFlat = (key) => (e) => {
    const value = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setSettings((s) => ({ ...s, [key]: value }));
  };
  const setNested = (section, key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setSettings((s) => ({
      ...s,
      [section]: { ...(s[section] || {}), [key]: value },
    }));
  };
  const setNestedBool = (section, key) => (e) => {
    setSettings((s) => ({
      ...s,
      [section]: { ...(s[section] || {}), [key]: e.target.checked },
    }));
  };

  const Field = ({ label, value, onChange, type = "text", placeholder = "", required = false, hint = "" }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  );

  const Toggle = ({ label, checked, onChange, hint = "" }) => (
    <label className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 cursor-pointer">
      <span>
        <span className="block text-sm font-semibold text-gray-700">{label}</span>
        {hint && <span className="block text-xs text-gray-500 mt-0.5">{hint}</span>}
      </span>
      <input
        type="checkbox"
        checked={!!checked}
        onChange={onChange}
        className="w-5 h-5 accent-blue-600"
      />
    </label>
  );

  const Card = ({ title, icon, children }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
        <span className="text-blue-600">{icon}</span> {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  );

  const tabs = [
    { id: "general", label: "Général & contact", icon: <FaStore /> },
    { id: "shipping", label: "Livraison", icon: <FaTruck /> },
    { id: "payment", label: "Paiements", icon: <FaCreditCard /> },
    { id: "warranty", label: "Garanties & retours", icon: <FaShieldAlt /> },
    { id: "loyalty", label: "Fidélité", icon: <FaStar /> },
    { id: "seo", label: "SEO & Tracking", icon: <FaChartLine /> },
    { id: "maintenance", label: "Maintenance", icon: <FaCog /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="text-blue-600 hover:text-blue-700 font-semibold mb-4 inline-block"
          >
            ← Retour au dashboard
          </Link>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                ⚙️ Paramètres du site
              </h1>
              <p className="text-gray-600">
                Informations, livraison, paiements, SEO et tracking
              </p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-md disabled:opacity-60"
            >
              <FaSave /> {saving ? "Enregistrement..." : "Enregistrer les paramètres"}
            </button>
          </div>
          {accountSaved && (
            <div className="mt-4 bg-green-50 text-green-700 border border-green-200 px-4 py-3 rounded-lg font-semibold">
              ✅ Paramètres enregistrés avec succès !
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Tabs Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition flex items-center gap-3 ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="w-full mt-2 text-center px-4 py-3 rounded-lg font-bold transition bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60"
              >
                <FaSave className="inline mr-2" />
                {saving ? "..." : "Enregistrer"}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-6">
            {activeTab === "general" && (
              <>
                <Card title="Informations générales" icon={<FaStore />}>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Nom du site" required value={settings.siteName} onChange={setFlat("siteName")} />
                    <Field label="Email de contact" type="email" value={settings.contactEmail} onChange={setFlat("contactEmail")} />
                  </div>
                  <Field label="Description du site" value={settings.siteDescription} onChange={setFlat("siteDescription")} />
                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Téléphone" type="tel" value={settings.contactPhone} onChange={setFlat("contactPhone")} />
                    <Field label="Adresse physique" value={settings.contactAddress} onChange={setFlat("contactAddress")} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label="URL du logo" value={settings.logo} onChange={setFlat("logo")} placeholder="https://..." />
                    <Field label="URL favicon" value={settings.favicon} onChange={setFlat("favicon")} placeholder="https://..." />
                  </div>
                </Card>

                <Card title="Réseaux sociaux" icon={<FaStore />}>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Facebook" value={settings.socialLinks?.facebook} onChange={setNested("socialLinks", "facebook")} placeholder="https://facebook.com/..." />
                    <Field label="Instagram" value={settings.socialLinks?.instagram} onChange={setNested("socialLinks", "instagram")} placeholder="https://instagram.com/..." />
                    <Field label="Twitter / X" value={settings.socialLinks?.twitter} onChange={setNested("socialLinks", "twitter")} placeholder="https://x.com/..." />
                    <Field label="LinkedIn" value={settings.socialLinks?.linkedin} onChange={setNested("socialLinks", "linkedin")} placeholder="https://linkedin.com/..." />
                    <Field label="YouTube" value={settings.socialLinks?.youtube} onChange={setNested("socialLinks", "youtube")} placeholder="https://youtube.com/..." />
                  </div>
                </Card>
              </>
            )}

            {activeTab === "shipping" && (
              <Card title="Livraison" icon={<FaTruck />}>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Coût standard (FCFA)" type="number" value={settings.shipping?.standardCost} onChange={setNested("shipping", "standardCost")} />
                  <Field label="Seuil livraison gratuite (FCFA)" type="number" value={settings.shipping?.freeShippingThreshold} onChange={setNested("shipping", "freeShippingThreshold")} />
                  <Field label="Coût express (FCFA)" type="number" value={settings.shipping?.expressCost} onChange={setNested("shipping", "expressCost")} />
                </div>
                <Toggle label="Livraison express disponible" checked={settings.shipping?.expressAvailable} onChange={setNestedBool("shipping", "expressAvailable")} />
              </Card>
            )}

            {activeTab === "payment" && (
              <Card title="Moyens de paiement" icon={<FaCreditCard />}>
                <Toggle label="Paiement à la livraison (cash)" checked={settings.paymentMethods?.cash} onChange={setNestedBool("paymentMethods", "cash")} />
                <Toggle label="Wave" checked={settings.paymentMethods?.wave} onChange={setNestedBool("paymentMethods", "wave")} />
                <Toggle label="Orange Money" checked={settings.paymentMethods?.orangeMoney} onChange={setNestedBool("paymentMethods", "orangeMoney")} />
                <Toggle label="Free Money" checked={settings.paymentMethods?.freeMoney} onChange={setNestedBool("paymentMethods", "freeMoney")} />
                <Toggle label="Carte bancaire / Stripe" checked={settings.paymentMethods?.stripe} onChange={setNestedBool("paymentMethods", "stripe")} />
              </Card>
            )}

            {activeTab === "warranty" && (
              <>
                <Card title="Garantie" icon={<FaShieldAlt />}>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Durée par défaut (mois)" type="number" value={settings.warranty?.defaultDuration} onChange={setNested("warranty", "defaultDuration")} />
                    <Field label="Coût extension (FCFA)" type="number" value={settings.warranty?.extensionCost} onChange={setNested("warranty", "extensionCost")} />
                  </div>
                  <Toggle label="Extension de garantie disponible" checked={settings.warranty?.extensionAvailable} onChange={setNestedBool("warranty", "extensionAvailable")} />
                </Card>

                <Card title="Retours / SAV" icon={<FaExchangeAlt />}>
                  <Field label="Période de retour (jours)" type="number" value={settings.returns?.periodDays} onChange={setNested("returns", "periodDays")} />
                  <Field label="Conditions de retour" value={settings.returns?.conditions} onChange={setNested("returns", "conditions")} />
                  <Toggle label="Retours activés" checked={settings.returns?.enabled} onChange={setNestedBool("returns", "enabled")} />
                </Card>
              </>
            )}

            {activeTab === "loyalty" && (
              <Card title="Points de fidélité" icon={<FaStar />}>
                <Field label="Points par FCFA (ex. 0.001 = 1 pt / 1000 FCFA)" type="number" step="0.001" value={settings.loyalty?.pointsPerFCFA} onChange={setNested("loyalty", "pointsPerFCFA")} />
                <Field label="Valeur de rachat 1 pt = ? FCFA" type="number" value={settings.loyalty?.redemptionRate} onChange={setNested("loyalty", "redemptionRate")} />
                <Field label="Points minimum pour racheter" type="number" value={settings.loyalty?.minPointsToRedeem} onChange={setNested("loyalty", "minPointsToRedeem")} />
                <Toggle label="Fidélité activée" checked={settings.loyalty?.enabled} onChange={setNestedBool("loyalty", "enabled")} />
              </Card>
            )}

            {activeTab === "seo" && (
              <>
                <Card title="SEO" icon={<FaTag />}>
                  <Field label="Meta title par défaut" value={settings.seo?.metaTitle} onChange={setNested("seo", "metaTitle")} />
                  <Field label="Meta description par défaut" value={settings.seo?.metaDescription} onChange={setNested("seo", "metaDescription")} />
                </Card>

                <Card title="Tracking — Meta Pixel (Facebook Ads)" icon={<FaChartLine />}>
                  <Field
                    label="ID du Pixel Facebook"
                    value={settings.seo?.facebookPixelId}
                    onChange={setNested("seo", "facebookPixelId")}
                    placeholder="Ex : 1234567890123456"
                    hint="Injecté côté frontend. Laissez vide pour désactiver. (préfixe NEXT_PUBLIC_FACEBOOK_PIXEL_ID écrasé si renseigné)"
                  />
                </Card>

                <Card title="Tracking — Google" icon={<FaChartLine />}>
                  <Field
                    label="ID Google Analytics 4"
                    value={settings.seo?.googleAnalyticsId}
                    onChange={setNested("seo", "googleAnalyticsId")}
                    placeholder="Ex : G-XXXXXXXXXX"
                    hint="Injecté côté frontend. Laissez vide pour désactiver."
                  />
                </Card>
              </>
            )}

            {activeTab === "maintenance" && (
              <Card title="Maintenance" icon={<FaCog />}>
                <Toggle label="Activer le mode maintenance" checked={settings.maintenance?.enabled} onChange={setNestedBool("maintenance", "enabled")} />
                <Field label="Message de maintenance" value={settings.maintenance?.message} onChange={setNested("maintenance", "message")} />
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;