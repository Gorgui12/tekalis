import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FaSave, 
  FaStore,
  FaTruck,
  FaCreditCard,
  FaEnvelope,
  FaBell,
  FaShieldAlt,
  FaCog
} from "react-icons/fa";
import api from "../../../../packages/shared/api/api";

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({
    // General
    siteName: "Tekalis",
    siteDescription: "Votre boutique high-tech au Sénégal",
    contactEmail: "contact@tekalis.com",
    contactPhone: "+221 33 123 45 67",
    address: "Dakar, Plateau",
    
    // Shipping
    freeShippingThreshold: 100000,
    shippingCost: 5000,
    shippingTime: "2-5 jours ouvrés",
    
    // Payment
    enableCash: true,
    enableWave: true,
    enableOrangeMoney: true,
    enableCard: false,
    waveNumber: "+221 77 123 45 67",
    orangeMoneyNumber: "+221 78 123 45 67",
    
    // Email
    emailNotificationsEnabled: true,
    orderConfirmationEmail: true,
    shippingConfirmationEmail: true,
    promotionalEmails: false,
    
    // Notifications
    lowStockAlert: 10,
    newOrderNotification: true,
    newReviewNotification: true,
    
    // Security
    requireEmailVerification: false,
    enableTwoFactor: false,
    sessionTimeout: 30
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get("/admin/settings");
      setSettings(data.settings || settings);
    } catch (error) {
      console.error("Erreur chargement paramètres:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put("/admin/settings", settings);
      alert("Paramètres enregistrés avec succès !");
    } catch (error) {
      console.error("Erreur enregistrement:", error);
      alert("Erreur lors de l'enregistrement des paramètres");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "general", label: "Général", icon: <FaStore /> },
    { id: "shipping", label: "Livraison", icon: <FaTruck /> },
    { id: "payment", label: "Paiement", icon: <FaCreditCard /> },
    { id: "email", label: "Emails", icon: <FaEnvelope /> },
    { id: "notifications", label: "Notifications", icon: <FaBell /> },
    { id: "security", label: "Sécurité", icon: <FaShieldAlt /> }
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
            to="/admin"
            className="text-blue-600 hover:text-blue-700 font-semibold mb-4 inline-block"
          >
            ← Retour au dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ⚙️ Paramètres du site
          </h1>
          <p className="text-gray-600">
            Configurez les paramètres de votre boutique
          </p>
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
                  <span className="text-xl">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* General Settings */}
              {activeTab === "general" && (
                <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Informations générales</h2>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nom du site *
                    </label>
                    <input
                      type="text"
                      required
                      value={settings.siteName}
                      onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={settings.siteDescription}
                      onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email de contact *
                      </label>
                      <input
                        type="email"
                        required
                        value={settings.contactEmail}
                        onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Téléphone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={settings.contactPhone}
                        onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Adresse physique
                    </label>
                    <input
                      type="text"
                      value={settings.address}
                      onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Shipping Settings */}
              {activeTab === "shipping" && (
                <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Paramètres de livraison</h2>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Frais de livraison (FCFA)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={settings.shippingCost}
                      onChange={(e) => setSettings({ ...settings, shippingCost: parseInt(e.target.value) })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Seuil livraison gratuite (FCFA)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={settings.freeShippingThreshold}
                      onChange={(e) => setSettings({ ...settings, freeShippingThreshold: parseInt(e.target.value) })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Livraison gratuite à partir de ce montant
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Délai de livraison
                    </label>
                    <input
                      type="text"
                      value={settings.shippingTime}
                      onChange={(e) => setSettings({ ...settings, shippingTime: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 2-5 jours ouvrés"
                    />
                  </div>
                </div>
              )}

              {/* Payment Settings */}
              {activeTab === "payment" && (
                <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Méthodes de paiement</h2>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="enableCash"
                        checked={settings.enableCash}
                        onChange={(e) => setSettings({ ...settings, enableCash: e.target.checked })}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <label htmlFor="enableCash" className="text-sm font-semibold text-gray-700">
                        💵 Paiement à la livraison (Cash)
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="enableWave"
                        checked={settings.enableWave}
                        onChange={(e) => setSettings({ ...settings, enableWave: e.target.checked })}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <label htmlFor="enableWave" className="text-sm font-semibold text-gray-700">
                        📱 Wave
                      </label>
                    </div>

                    {settings.enableWave && (
                      <div className="ml-7">
                        <input
                          type="tel"
                          value={settings.waveNumber}
                          onChange={(e) => setSettings({ ...settings, waveNumber: e.target.value })}
                          className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Numéro Wave"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="enableOrangeMoney"
                        checked={settings.enableOrangeMoney}
                        onChange={(e) => setSettings({ ...settings, enableOrangeMoney: e.target.checked })}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <label htmlFor="enableOrangeMoney" className="text-sm font-semibold text-gray-700">
                        🟠 Orange Money
                      </label>
                    </div>

                    {settings.enableOrangeMoney && (
                      <div className="ml-7">
                        <input
                          type="tel"
                          value={settings.orangeMoneyNumber}
                          onChange={(e) => setSettings({ ...settings, orangeMoneyNumber: e.target.value })}
                          className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Numéro Orange Money"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="enableCard"
                        checked={settings.enableCard}
                        onChange={(e) => setSettings({ ...settings, enableCard: e.target.checked })}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <label htmlFor="enableCard" className="text-sm font-semibold text-gray-700">
                        💳 Carte bancaire
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Email Settings */}
              {activeTab === "email" && (
                <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Paramètres emails</h2>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="emailNotificationsEnabled"
                        checked={settings.emailNotificationsEnabled}
                        onChange={(e) => setSettings({ ...settings, emailNotificationsEnabled: e.target.checked })}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <label htmlFor="emailNotificationsEnabled" className="text-sm font-semibold text-gray-700">
                        Activer les notifications par email
                      </label>
                    </div>

                    {settings.emailNotificationsEnabled && (
                      <>
                        <div className="ml-7 space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="orderConfirmationEmail"
                              checked={settings.orderConfirmationEmail}
                              onChange={(e) => setSettings({ ...settings, orderConfirmationEmail: e.target.checked })}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <label htmlFor="orderConfirmationEmail" className="text-sm text-gray-700">
                              Confirmation de commande
                            </label>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="shippingConfirmationEmail"
                              checked={settings.shippingConfirmationEmail}
                              onChange={(e) => setSettings({ ...settings, shippingConfirmationEmail: e.target.checked })}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <label htmlFor="shippingConfirmationEmail" className="text-sm text-gray-700">
                              Confirmation d'expédition
                            </label>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="promotionalEmails"
                              checked={settings.promotionalEmails}
                              onChange={(e) => setSettings({ ...settings, promotionalEmails: e.target.checked })}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <label htmlFor="promotionalEmails" className="text-sm text-gray-700">
                              Emails promotionnels
                            </label>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === "notifications" && (
                <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Notifications admin</h2>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Alerte stock faible (unités)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={settings.lowStockAlert}
                      onChange={(e) => setSettings({ ...settings, lowStockAlert: parseInt(e.target.value) })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Recevoir une alerte quand le stock est inférieur à ce nombre
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="newOrderNotification"
                        checked={settings.newOrderNotification}
                        onChange={(e) => setSettings({ ...settings, newOrderNotification: e.target.checked })}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <label htmlFor="newOrderNotification" className="text-sm font-semibold text-gray-700">
                        Notifier pour les nouvelles commandes
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="newReviewNotification"
                        checked={settings.newReviewNotification}
                        onChange={(e) => setSettings({ ...settings, newReviewNotification: e.target.checked })}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <label htmlFor="newReviewNotification" className="text-sm font-semibold text-gray-700">
                        Notifier pour les nouveaux avis
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === "security" && (
                <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Sécurité</h2>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="requireEmailVerification"
                        checked={settings.requireEmailVerification}
                        onChange={(e) => setSettings({ ...settings, requireEmailVerification: e.target.checked })}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <label htmlFor="requireEmailVerification" className="text-sm font-semibold text-gray-700">
                        Vérification email obligatoire à l'inscription
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="enableTwoFactor"
                        checked={settings.enableTwoFactor}
                        onChange={(e) => setSettings({ ...settings, enableTwoFactor: e.target.checked })}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <label htmlFor="enableTwoFactor" className="text-sm font-semibold text-gray-700">
                        Authentification à deux facteurs
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Durée de session (minutes)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="1440"
                      value={settings.sessionTimeout}
                      onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <button
                  type="submit"
                  disabled={saving}
                  className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                    saving ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <FaSave /> Enregistrer les paramètres
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;