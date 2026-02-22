import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaTools, FaUpload, FaTimes } from "react-icons/fa";
import api from "../../../../packages/shared/api/api";

const CreateRMA = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useSelector((state) => state.auth);
  
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({
    orderId: searchParams.get("orderId") || "",
    productId: searchParams.get("productId") || "",
    type: "repair",
    reason: "",
    description: "",
    photos: []
  });
  const [uploadedPhotos, setUploadedPhotos] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Charger les commandes éligibles au SAV (livrées)
    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/orders/my-orders");
        const deliveredOrders = data.filter(o => o.status === "delivered");
        setOrders(deliveredOrders);

        // Si orderId fourni dans l'URL, sélectionner la commande
        if (formData.orderId) {
          const order = deliveredOrders.find(o => o._id === formData.orderId);
          setSelectedOrder(order);
        }
      } catch (error) {
        console.error("Erreur chargement commandes:", error);
      }
    };

    fetchOrders();
  }, [user, navigate, formData.orderId]);

  // Gérer changement de commande
  const handleOrderChange = (e) => {
    const orderId = e.target.value;
    const order = orders.find(o => o._id === orderId);
    setSelectedOrder(order);
    setFormData({ ...formData, orderId, productId: "" });
  };

  // Gérer upload photos
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (uploadedPhotos.length + files.length > 5) {
      alert("Maximum 5 photos autorisées");
      return;
    }

    // Simuler upload (à remplacer par vraie logique)
    const newPhotos = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));

    setUploadedPhotos([...uploadedPhotos, ...newPhotos]);
  };

  // Supprimer une photo
  const removePhoto = (index) => {
    const updated = uploadedPhotos.filter((_, i) => i !== index);
    setUploadedPhotos(updated);
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.orderId || !formData.productId) {
      alert("Veuillez sélectionner une commande et un produit");
      return;
    }

    if (!formData.reason.trim()) {
      alert("Veuillez indiquer le motif de votre demande");
      return;
    }

    setLoading(true);

    try {
      // Upload photos d'abord (si besoin)
      const photoUrls = []; // À implémenter selon votre backend
      
      const rmaData = {
        ...formData,
        photos: photoUrls
      };

      const { data } = await api.post("/rma", rmaData);
      
      alert("✅ Demande SAV créée avec succès !");
      navigate(`/rma/${data.rma._id}`);
    } catch (error) {
      console.error("Erreur création RMA:", error);
      alert(error.response?.data?.message || "Erreur lors de la création de la demande");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* En-tête */}
        <div className="mb-8">
          <Link
            to="/rma"
            className="text-blue-600 hover:text-blue-700 font-semibold mb-4 inline-block"
          >
            ← Retour aux demandes SAV
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔧 Nouvelle Demande SAV
          </h1>
          <p className="text-gray-600">
            Remplissez le formulaire ci-dessous pour créer votre demande
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          {/* Sélection commande */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Commande concernée *
            </label>
            <select
              value={formData.orderId}
              onChange={handleOrderChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Sélectionnez une commande</option>
              {orders.map(order => (
                <option key={order._id} value={order._id}>
                  #{order._id.slice(-8).toUpperCase()} - {new Date(order.createdAt).toLocaleDateString("fr-FR")} - {order.totalPrice?.toLocaleString()} FCFA
                </option>
              ))}
            </select>
            {orders.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Aucune commande éligible au SAV. Seules les commandes livrées sont disponibles.
              </p>
            )}
          </div>

          {/* Sélection produit */}
          {selectedOrder && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Produit concerné *
              </label>
              <div className="space-y-3">
                {selectedOrder.products?.map((item) => (
                  <label
                    key={item.product._id}
                    className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition ${
                      formData.productId === item.product._id
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="product"
                      value={item.product._id}
                      checked={formData.productId === item.product._id}
                      onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                      className="text-blue-600"
                      required
                    />
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-contain rounded"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.product.name}</p>
                      <p className="text-sm text-gray-600">Qté: {item.quantity}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Type de demande */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Type de demande *
            </label>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                formData.type === "repair"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}>
                <input
                  type="radio"
                  name="type"
                  value="repair"
                  checked={formData.type === "repair"}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="text-blue-600"
                />
                <div>
                  <p className="font-semibold text-gray-900">🔧 Réparation</p>
                  <p className="text-xs text-gray-600">Produit défectueux</p>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                formData.type === "replacement"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}>
                <input
                  type="radio"
                  name="type"
                  value="replacement"
                  checked={formData.type === "replacement"}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="text-blue-600"
                />
                <div>
                  <p className="font-semibold text-gray-900">🔄 Remplacement</p>
                  <p className="text-xs text-gray-600">Échange du produit</p>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                formData.type === "refund"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}>
                <input
                  type="radio"
                  name="type"
                  value="refund"
                  checked={formData.type === "refund"}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="text-blue-600"
                />
                <div>
                  <p className="font-semibold text-gray-900">💰 Remboursement</p>
                  <p className="text-xs text-gray-600">Retour produit</p>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                formData.type === "technical_support"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}>
                <input
                  type="radio"
                  name="type"
                  value="technical_support"
                  checked={formData.type === "technical_support"}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="text-blue-600"
                />
                <div>
                  <p className="font-semibold text-gray-900">💡 Support technique</p>
                  <p className="text-xs text-gray-600">Aide & assistance</p>
                </div>
              </label>
            </div>
          </div>

          {/* Motif */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Motif de la demande *
            </label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Ex: Écran ne s'allume plus, bouton défectueux..."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description détaillée */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Description détaillée *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Décrivez le problème en détail, quand il est apparu, les circonstances..."
              rows={6}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-2">
              Plus vous êtes précis, plus nous pourrons traiter votre demande rapidement.
            </p>
          </div>

          {/* Photos */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Photos (optionnel)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <FaUpload className="text-4xl text-gray-400 mb-3" />
                <p className="text-sm text-gray-600 mb-1">
                  Cliquez pour ajouter des photos
                </p>
                <p className="text-xs text-gray-500">
                  Maximum 5 photos (JPG, PNG)
                </p>
              </label>
            </div>

            {/* Prévisualisation des photos */}
            {uploadedPhotos.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
                {uploadedPhotos.map((photo, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={photo.preview}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Message info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ À savoir :</strong> Notre équipe analysera votre demande sous 48h ouvrées. 
              Vous serez notifié par email et SMS à chaque étape du traitement.
            </p>
          </div>

          {/* Boutons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={loading || !formData.orderId || !formData.productId}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                  Envoi en cours...
                </>
              ) : (
                <>
                  <FaTools />
                  Soumettre la demande
                </>
              )}
            </button>
            
            <Link
              to="/rma"
              className="flex-1 sm:flex-none bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold transition text-center"
            >
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRMA;