import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../../slices/cartSlice";
import { useState, useEffect } from "react";
import axios from "axios";

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();
  const { totalAmount } = useSelector((state) => state.cart);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    axios.post("http://localhost:5000/api/stripe/create-payment-intent", { amount: totalAmount })
      .then(res => setClientSecret(res.data.clientSecret))
      .catch(err => setMessage("Erreur lors de la connexion au serveur"));
  }, [totalAmount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setLoading(true);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
    } else if (paymentIntent.status === "succeeded") {
      setMessage("Paiement réussi !");
      dispatch(clearCart());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <CardElement className="border p-3 rounded" />
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-500 text-white py-2 mt-4"
      >
        {loading ? "Paiement en cours..." : `Payer ${totalAmount} €`}
      </button>
      {message && <p className="text-center text-red-500 mt-2">{message}</p>}
    </form>
  );
};

export default CheckoutForm;
