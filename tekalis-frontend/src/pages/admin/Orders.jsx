import { useEffect, useState } from "react";
import api from "../../api/api";
import Navbar from "../../components/admin/Navbar";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
      setOrders(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Erreur de chargement des commandes :", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders(); // Rafraîchir la liste
    } catch (err) {
      console.error("Erreur lors de la mise à jour du statut :", err);
    }
  };

  return (
    <div className="p-6">
      <Navbar />
      <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">📋 Gestion des Commandes</h1>

      {loading ? (
        <p className="text-center">Chargement des commandes...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border text-sm text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 border">Commande</th>
                <th className="p-3 border">Client</th>
                <th className="p-3 border">Méthode Paiement</th>
                <th className="p-3 border">Adresse Livraison</th>
                <th className="p-3 border">Statut</th>
                <th className="p-3 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="p-3 border text-blue-600 font-medium">{order._id.slice(-6)}</td>
                  <td className="p-3 border">{order.user?.email || "N/A"}</td>
                  <td className="p-3 border">{order.paymentMethod}</td>
                  <td className="p-3 border">
                    <span className="block font-semibold">{order.deliveryName}</span>
                    <span className="text-gray-600 text-sm">{order.deliveryPhone}</span><br />
                    <span className="text-gray-600 text-sm">{order.deliveryAddress}</span>
                  </td>
                  <td className="p-3 border">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="border p-1 rounded"
                    >
                      <option value="pending">🕒 En attente</option>
                      <option value="processing">⚙️ En traitement</option>
                      <option value="shipped">🚚 Expédiée</option>
                      <option value="delivered">✅ Livrée</option>
                      <option value="cancelled">❌ Annulée</option>
                    </select>
                  </td>
                  <td className="p-3 border">
                    <button
                        className={`text-white px-3 py-1 rounded ${order.isPaid ? "bg-green-600" : "bg-red-500"}`}
  disabled={order.isPaid}
  onClick={async () => {
    try {
      await api.put(`/orders/${order._id}/pay`);
      fetchOrders(); // Rafraîchir la liste
    } catch (err) {
      alert("Erreur lors du paiement manuel");
    }
                        }}
                       >
                        {order.isPaid ? "Payé" : "Marquer comme Payé"}
                   </button>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;

