import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { createOrder } from "../../slices/orderSlice";
import MobileMoneyPayment from "../../components/client/MobileMoneyPayment";

const Checkout = () => {
  const dispatch = useDispatch();
  const { order, loading, error } = useSelector((state) => state.orders);
  const cart = useSelector((state) => state.cart.items);
  const totalPrice = useSelector((state) => state.cart.totalAmount);
  const orderId = order?._id;

  // Champs du formulaire
  const [deliveryName, setDeliveryName] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [showMobileMoney, setShowMobileMoney] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!deliveryName || !deliveryPhone || !deliveryAddress) {
      alert("Tous les champs de livraison sont obligatoires.");
      return;
    }

    dispatch(
      createOrder({
        products: cart.map((item) => ({ product: item._id, quantity: item.quantity })),
        totalPrice,
        paymentMethod: "cash", // temporaire, on peut le changer au clic
        deliveryName,
        deliveryPhone,
        deliveryAddress,
      })
    );
  };

  const handleCashOnDelivery = async () => {
    try {
      await fetch("http://localhost:5000/api/payment/cash-on-delivery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ orderId }),
      });

      alert("Commande enregistrée avec paiement à la livraison !");
    } catch (err) {
      alert("Erreur lors de la validation : " + err.message);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-6">🧾 Résumé de la commande</h1>

      {/* Produits */}
      <div className="bg-white rounded shadow-md p-4 mb-6">
        {cart.map((item) => (
          <div key={item._id} className="flex justify-between border-b py-2">
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-gray-600">Quantité : {item.quantity}</p>
            </div>
            <p className="text-blue-600 font-semibold">{item.price * item.quantity} €</p>
          </div>
        ))}
        <div className="text-right font-bold mt-4 text-lg">
          Total : <span className="text-blue-600">{totalPrice} €</span>
        </div>
      </div>

      {/* Formulaire livraison */}
      <form onSubmit={handleSubmit} className="bg-white rounded shadow p-4 mb-6">
        <h2 className="text-lg font-semibold text-blue-600 mb-4">📦 Informations de livraison</h2>
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
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full">
          Valider les infos de livraison
        </button>
      </form>

      {/* Paiement */}
      {orderId && (
        <>
          <h2 className="text-xl font-semibold text-center mb-4 text-blue-600">💳 Mode de paiement</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border p-4 rounded shadow-md">
              <h3 className="text-lg font-semibold mb-2 text-blue-600">Paiement à la livraison</h3>
              <p className="text-gray-600 mb-4">Payez en espèces à la réception de votre commande.</p>
              <button
                onClick={handleCashOnDelivery}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full"
              >
                Confirmer
              </button>
            </div>

            <div className="border p-4 rounded shadow-md">
              <h3 className="text-lg font-semibold mb-2 text-blue-600">Payer avec Wave</h3>
              <p className="text-gray-600 mb-4">Payer directement via Wave.</p>
              <button
                onClick={() => setShowMobileMoney(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full"
              >
                Payer avec Wave
              </button>

              {showMobileMoney && (
                <div className="mt-4">
                  <MobileMoneyPayment orderId={orderId} />
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {loading && <p className="text-center mt-4">Création de la commande en cours...</p>}
      {error && <p className="text-center text-red-500 mt-4">Erreur : {error}</p>}
    </div>
  );
};

export default Checkout;
