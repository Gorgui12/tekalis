import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserOrders } from "../../slices/orderSlice";

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchUserOrders());
  }, [dispatch]);

  if (loading) return <p className="text-center">Chargement de vos commandes...</p>;
  if (error) return <p className="text-red-500 text-center">Erreur : {error}</p>;

  if (orders.length === 0) {
    return <p className="text-center text-gray-600">Vous n'avez encore passé aucune commande.</p>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-10">📦 Mes Commandes</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="border rounded shadow-md p-4">
            {/* En-tête */}
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-blue-600">Commande #{order._id.slice(-6)}</h2>
              <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</span>
            </div>

            {/* Produits */}
            <ul className="mb-4">
              {order.products.map((item, index) => (
                <li key={index} className="flex justify-between border-b py-1">
                  <span>{item.product?.name || "Produit supprimé"} × {item.quantity}</span>
                  <span>{item.product?.price * item.quantity} €</span>
                </li>
              ))}
            </ul>

            {/* Détails de livraison */}
            <div className="mb-4 text-sm text-gray-700">
              <p><strong>Nom :</strong> {order.deliveryName}</p>
              <p><strong>Téléphone :</strong> {order.deliveryPhone}</p>
              <p><strong>Adresse :</strong> {order.deliveryAddress}</p>
            </div>

            {/* Statuts */}
            <div className="flex justify-between items-center text-sm text-gray-700">
              <span>Total : <strong className="text-black">{order.totalPrice} €</strong></span>
              <span>Status :
                <span className={`ml-2 px-2 py-1 rounded text-white ${order.status === "pending" ? "bg-yellow-500" : "bg-green-600"}`}>
                  {order.status}
                </span>
              </span>
              <span>Paiement :
                <span className={`ml-2 px-2 py-1 rounded text-white ${order.isPaid ? "bg-green-600" : "bg-red-500"}`}>
                  {order.isPaid ? "Payé" : "Non payé"}
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;

