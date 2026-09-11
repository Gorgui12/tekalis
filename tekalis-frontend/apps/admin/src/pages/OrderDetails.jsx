import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  FaArrowLeft, 
  FaUser, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope,
  FaCreditCard,
  FaBox,
  FaPrint,
  FaTrash
} from "react-icons/fa";
import api from "@shared/api/api";
import { useToast } from '@shared/context/ToastContext';

const AdminOrderDetails = () => {
  const toast = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const { data } = await api.get(`/admin/orders/${id}`);
      setOrder(data.order || null);
    } catch (error) {
      console.error("Erreur chargement commande:", error);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    if (!window.confirm(`Changer le statut en "${newStatus}" ?`)) return;
    
    setUpdating(true);
    try {
      await api.put(`/admin/orders/${id}/status`, { status: newStatus });
      setOrder(prev => ({ ...prev, status: newStatus }));
      toast.success("Statut mis à jour avec succès");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du statut");
    } finally {
      setUpdating(false);
    }
  };

  const deleteOrder = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette commande ?")) return;
    
    try {
      await api.delete(`/admin/orders/${id}`);
      toast.success("Commande supprimée avec succès");
      navigate("/orders");
    } catch (error) {
      toast.error("Erreur lors de la suppression de la commande");
    }
  };

  const StatusBadge = ({ status }) => {
    const configs = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "En attente" },
      processing: { bg: "bg-blue-100", text: "text-blue-700", label: "En traitement" },
      shipped: { bg: "bg-purple-100", text: "text-purple-700", label: "Expédiée" },
      delivered: { bg: "bg-green-100", text: "text-green-700", label: "Livrée" },
      cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Annulée" }
    };
    const config = configs[status] || configs.pending;

    return (
      <span className={`${config.bg} ${config.text} px-4 py-2 rounded-full text-sm font-semibold inline-flex items-center gap-2`}>
        <span className={`w-2 h-2 ${config.bg.replace('100', '500')} rounded-full`}></span>
        {config.label}
      </span>
    );
  };

  const items = order?.products || [];
  const customerName = order?.customerInfo?.name || order?.user?.name || order?.deliveryName || "Client";
  const customerEmail = order?.customerInfo?.email || order?.user?.email || "";
  const customerPhone = order?.customerInfo?.phone || order?.deliveryPhone || "";
  const subtotal = items.reduce(
    (sum, p) => sum + (p.price || p.product?.price || 0) * (p.quantity || 1),
    0
  );
  const shipping = order?.shippingCost || 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Commande non trouvée</p>
          <Link to="/orders" className="text-blue-600 hover:text-blue-700 font-semibold">
            Retour aux commandes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/orders"
            className="text-blue-600 hover:text-blue-700 font-semibold mb-4 inline-flex items-center gap-2"
          >
            <FaArrowLeft /> Retour aux commandes
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Commande {order.orderNumber}
              </h1>
              <p className="text-gray-600">
                Passée le {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-semibold border shadow-sm flex items-center gap-2"
              >
                <FaPrint /> Imprimer
              </button>
              <button
                onClick={deleteOrder}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
              >
                <FaTrash /> Supprimer
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status & Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Statut de la commande</h2>
                <StatusBadge status={order.status} />
              </div>

              <div className="grid sm:grid-cols-5 gap-3">
                {["pending", "processing", "shipped", "delivered", "cancelled"].map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStatus(status)}
                    disabled={updating || order.status === status}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                      order.status === status
                        ? "bg-blue-600 text-white cursor-default"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    } ${updating ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {status === "pending" && "En attente"}
                    {status === "processing" && "Traiter"}
                    {status === "shipped" && "Expédier"}
                    {status === "delivered" && "Livrer"}
                    {status === "cancelled" && "Annuler"}
                  </button>
                ))}
              </div>
            </div>

            {/* Products */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaBox /> Produits commandés
              </h2>

              <div className="space-y-4">
                {items.map((item) => {
                  const product = item.product || {};
                  const unitPrice = item.price || product.price || 0;
                  const image = Array.isArray(product.images)
                    ? (product.images[0]?.url || product.images[0])
                    : product.images;
                  const lineTotal = unitPrice * (item.quantity || 1);
                  return (
                    <div key={item._id || product._id} className="flex gap-4 pb-4 border-b last:border-b-0">
                      {image && (
                        <img
                          src={image}
                          alt={product.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Quantité: {item.quantity}
                        </p>
                        <p className="text-sm text-gray-600">
                          Prix unitaire: {unitPrice.toLocaleString()} FCFA
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {lineTotal.toLocaleString()} FCFA
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total */}
              <div className="mt-6 pt-6 border-t space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Sous-total</span>
                  <span>{subtotal.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Livraison</span>
                  <span>{shipping.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                  <span>Total</span>
                  <span>{order.totalPrice.toLocaleString()} FCFA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaUser /> Client
              </h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Nom</p>
                  <p className="font-semibold text-gray-900">{customerName}</p>
                </div>
                
                {customerEmail && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaEnvelope className="text-gray-400" />
                    <a href={`mailto:${customerEmail}`} className="hover:text-blue-600">
                      {customerEmail}
                    </a>
                  </div>
                )}
                
                {customerPhone && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaPhone className="text-gray-400" />
                    <a href={`tel:${customerPhone}`} className="hover:text-blue-600">
                      {customerPhone}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaMapMarkerAlt /> Adresse de livraison
              </h2>
              
              <div className="text-gray-700 space-y-1">
                <p>{order.deliveryAddress}</p>
                <p>{order.deliveryName}</p>
                <p>{order.deliveryPhone}</p>
                <p>{order.deliveryCity}</p>
                {order.deliveryRegion && order.deliveryRegion !== order.deliveryCity && (
                  <p>{order.deliveryRegion}</p>
                )}
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaCreditCard /> Paiement
              </h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Méthode</p>
                  <p className="font-semibold text-gray-900">
                    {order.paymentMethod === "cash" && "Paiement à la livraison"}
                    {order.paymentMethod === "wave" && "Wave"}
                    {order.paymentMethod === "om" && "Orange Money"}
                    {order.paymentMethod === "card" && "Carte bancaire"}
                    {["online", "free"].includes(order.paymentMethod) && order.paymentMethod}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">Statut</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    order.paymentStatus === "paid" 
                      ? "bg-green-100 text-green-700" 
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {order.paymentStatus === "paid"
                      ? "Payé"
                      : order.paymentStatus === "failed"
                        ? "Échoué"
                        : "En attente"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;