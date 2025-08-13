import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserOrders } from "../../redux/slices/orderSlice";

const MyOrders = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchUserOrders());
  }, [dispatch]);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur: {error}</p>;

  return (
    <div>
      <h2>Mes Commandes</h2>
      <ul>
        {orders.map((order) => (
          <li key={order._id}>
            <p>Commande #{order._id}</p>
            <p>Total: {order.totalPrice} USD</p>
            <p>Statut: {order.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MyOrders;
