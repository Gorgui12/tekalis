import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { createOrder } from "../../slices/orderSlice";
import { clearCart } from "../../slices/cartSlice"; // ✅ importer clearCart

const Checkout = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.orders);
  const cart = useSelector((state) => state.cart.items);
  const totalPrice = useSelector((state) => state.cart.totalAmount);

  // Champs de livraison
  const [deliveryName, setDeliveryName] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  // Gestion modal
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // ✅ Fonction pour afficher la confirmation
  const handleChoosePayment = (method) => {
    if (!deliveryName || !deliveryPhone || !deliveryAddress) {
      alert("Tous les champs de livraison sont obligatoires.");
      return;
    }
    setSelectedPayment(method);
    setShowConfirm(true);
  };

  // ✅ Validation finale
  const confirmOrder = async () => {
    setShowConfirm(false);

    const action = await dispatch(
      createOrder({
        products: cart.map((item) => ({
          product: item._id,
          quantity: item.quantity,
        })),
        totalPrice,
        paymentMethod: selectedPayment,
        deliveryName,
        deliveryPhone,
        deliveryAddress,
      })
    );

    const createdOrder = action?.payload;
    if (!createdOrder?._id) {
      alert("Erreur lors de la création de la commande.");
      return;
    }

    if (selectedPayment === "cash") {
      alert("✅ Commande enregistrée, vous paierez à la livraison.");
      dispatch(clearCart()); // ✅ vider panier
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-6">
        🧾 Résumé de la commande
      </h1>

      {/* Produits */}
      <div className="bg-white rounded shadow-md p-4 mb-6">
        {cart.map((item) => (
          <div key={item._id} className="flex justify-between border-b py-2">
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-gray-600">Quantité : {item.quantity}</p>
            </div>
            <p className="text-blue-600 font-semibold">
              {item.price * item.quantity} CFA
            </p>
          </div>
        ))}
        <div className="text-right font-bold mt-4 text-lg">
          Total : <span className="text-blue-600">{totalPrice} CFA</span>
        </div>
      </div>

      {/* Formulaire livraison */}
      <div className="bg-white rounded shadow p-4 mb-6">
        <h2 className="text-lg font-semibold text-blue-600 mb-4">
          📦 Informations de livraison
        </h2>
        <input
          type="text"
          placeholder="Nom complet"
          className="w-full border p-2 mb-2"
          value={deliveryName}
          onChange={(e) => setDeliveryName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Téléphone"
          className="w-full border p-2 mb-2"
          value={deliveryPhone}
          onChange={(e) => setDeliveryPhone(e.target.value)}
        />
        <input
          type="text"
          placeholder="Adresse complète"
          className="w-full border p-2 mb-4"
          value={deliveryAddress}
          onChange={(e) => setDeliveryAddress(e.target.value)}
        />
      </div>

      {/* Choix paiement */}
      <h2 className="text-xl font-semibold text-center mb-4 text-blue-600">
        💳 Choisissez un mode de paiement
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cash */}
        <div className="border p-4 rounded shadow-md text-center">
          <h3 className="text-lg font-semibold mb-2 text-blue-600">
            Paiement à la livraison
          </h3>
          <p className="text-gray-600 mb-4">Payez en espèces à la réception.</p>
          <button
            onClick={() => handleChoosePayment("cash")}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full"
          >
            Choisir
          </button>
        </div>
      </div>

      {loading && (
        <p className="text-center mt-4">Création de la commande en cours...</p>
      )}
      {error && (
        <p className="text-center text-red-500 mt-4">Erreur : {error}</p>
      )}

      {/* 🔹 Modal de confirmation */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Confirmer la commande</h2>
            <p>
              Mode de paiement : <strong>{selectedPayment}</strong>
            </p>
            <p>
              Total : <strong>{totalPrice} CFA</strong>
            </p>
            <ul className="mt-2 mb-4 text-sm text-gray-600">
              {cart.map((item) => (
                <li key={item._id}>
                  {item.name} × {item.quantity}
                </li>
              ))}
            </ul>

            <div className="flex justify-between gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="w-1/2 bg-gray-300 py-2 rounded"
              >
                Annuler
              </button>
              <button
                onClick={confirmOrder}
                className="w-1/2 bg-green-600 hover:bg-green-700 text-white py-2 rounded"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
