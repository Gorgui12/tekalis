import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../utils/axiosInstance";

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`/orders/${id}`)
      .then((response) => {
        setOrder(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Erreur");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur: {error}</p>;

  return (
    <div>
      <h2>Détails de la Commande</h2>
      <p>Commande #{order._id}</p>
      <p>Total: {order.totalPrice} USD</p>
      <p>Statut: {order.status}</p>
      <ul>
        {order.products.map((item) => (
          <li key={item.product._id}>
            {item.product.name} - {item.quantity}x
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderDetails;
