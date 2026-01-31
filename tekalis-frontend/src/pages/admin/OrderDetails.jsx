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
  FaTruck,
  FaCheckCircle,
  FaPrint,
  FaEdit,
  FaTrash
} from "react-icons/fa";
import api from "../../api/api";

const AdminOrderDetails = () => {
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
      setOrder(data.order || getDemoOrder());
    } catch (error) {
      console.error("Erreur chargement commande:", error);
      setOrder(getDemoOrder());
    } finally {
      setLoading(false);
    }
  };

  const getDemoOrder = () => ({
    _id: id,
    orderNumber: "CMD-2025-001",
    customer: {
      name: "Mamadou Diop",
      email: "mamadou@email.com",
      phone: "+221 77 123 45 67"
    },
    deliveryAddress: {
      street: "Rue 10, Quartier Plateau",
      city: "Dakar",
      postalCode: "12000",
      country: "Sénégal"
    },
    products: [
      {
        _id: "1",
        name: "HP Pavilion Gaming 15",
        image: "https://via.placeholder.com/100",
        price: 850000,
        quantity: 1,
        total: 850000
      }
    ],
    subtotal: 850000,
    shipping: 5000,
    tax: 0,
    totalPrice: 855000,
    status: "pending",
    paymentMethod: "cash",
    paymentStatus: "pending",
    tracking: {
      number: "TRK123456789",
      carrier: "DHL Express",
      url: "https://dhl.com/track/TRK123456789"
    },
    timeline: [
      { status: "pending", date: new Date(), message: "Commande reçue" }
    ],
    createdAt: new Date(),
    notes: ""
  });

  const updateStatus = async (newStatus) => {
    if (!window.confirm(`Changer le statut en "${newStatus}" ?`)) return;
    
    setUpdating(true);
    try {
      await api.put(`/admin/orders/${id}/status`, { status: newStatus });
      setOrder(prev => ({ ...prev, status: newStatus }));
      alert("Statut mis à jour avec succès");
    } catch (error) {
      alert("Erreur lors de la mise à jour");
    } finally {
      setUpdating(false);
    }
  };

  const deleteOrder = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette commande ?")) return;
    
    try {
      await api.delete(`/admin/orders/${id}`);
      alert("Commande supprimée");
      navigate("/admin/orders");
    } catch (error) {
      alert("Erreur lors de la suppression");
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
          <Link to="/admin/orders" className="text-blue-600 hover:text-blue-700 font-semibold">
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
            to="/admin/orders"
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
                {order.products.map((product) => (
                  <div key={product._id} className="flex gap-4 pb-4 border-b last:border-b-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Quantité: {product.quantity}
                      </p>
                      <p className="text-sm text-gray-600">
                        Prix unitaire: {product.price.toLocaleString()} FCFA
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {product.total.toLocaleString()} FCFA
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-6 pt-6 border-t space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Sous-total</span>
                  <span>{order.subtotal.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Livraison</span>
                  <span>{order.shipping.toLocaleString()} FCFA</span>
                </div>
                {order.tax > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Taxes</span>
                    <span>{order.tax.toLocaleString()} FCFA</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                  <span>Total</span>
                  <span>{order.totalPrice.toLocaleString()} FCFA</span>
                </div>
              </div>
            </div>

            {/* Tracking */}
            {order.tracking && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FaTruck /> Suivi de livraison
                </h2>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Numéro de suivi</p>
                      <p className="font-semibold text-gray-900">{order.tracking.number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Transporteur</p>
                      <p className="font-semibold text-gray-900">{order.tracking.carrier}</p>
                    </div>
                  </div>
                  
                  <a
                    href={order.tracking.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold inline-block"
                  >
                    Suivre le colis →
                  </a>
                </div>
              </div>
            )}
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
                  <p className="font-semibold text-gray-900">{order.customer.name}</p>
                </div>
                
                <div className="flex items-center gap-2 text-gray-700">
                  <FaEnvelope className="text-gray-400" />
                  <a href={`mailto:${order.customer.email}`} className="hover:text-blue-600">
                    {order.customer.email}
                  </a>
                </div>
                
                <div className="flex items-center gap-2 text-gray-700">
                  <FaPhone className="text-gray-400" />
                  <a href={`tel:${order.customer.phone}`} className="hover:text-blue-600">
                    {order.customer.phone}
                  </a>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaMapMarkerAlt /> Adresse de livraison
              </h2>
              
              <div className="text-gray-700 space-y-1">
                <p>{order.deliveryAddress.street}</p>
                <p>{order.deliveryAddress.city}</p>
                <p>{order.deliveryAddress.postalCode}</p>
                <p className="font-semibold">{order.deliveryAddress.country}</p>
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
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">Statut</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    order.paymentStatus === "paid" 
                      ? "bg-green-100 text-green-700" 
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {order.paymentStatus === "paid" ? "Payé" : "En attente"}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Notes internes</h2>
              <textarea
                placeholder="Ajouter des notes..."
                rows={4}
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue={order.notes}
              ></textarea>
              <button className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold w-full">
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;