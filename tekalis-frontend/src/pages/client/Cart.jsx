import { useDispatch, useSelector } from "react-redux";
import { removeFromCart, increaseQuantity, decreaseQuantity, clearCart } from "../../slices/cartSlice";

const Cart = () => {
  const dispatch = useDispatch();
  const { items, totalAmount } = useSelector((state) => state.cart);

  if (items.length === 0) {
    return <p className="text-center text-gray-500">Votre panier est vide.</p>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Panier</h1>
      {items.map((item) => (
        <div key={item._id} className="flex justify-between p-4 border-b">
          <div>
            <h2 className="font-bold">{item.name}</h2>
            <p>{item.price} €</p>
            <div className="flex items-center space-x-2">
              <button onClick={() => dispatch(decreaseQuantity(item._id))} className="px-2 py-1 bg-gray-200">-</button>
              <span>{item.quantity}</span>
              <button onClick={() => dispatch(increaseQuantity(item._id))} className="px-2 py-1 bg-gray-200">+</button>
            </div>
          </div>
          <button onClick={() => dispatch(removeFromCart(item._id))} className="text-red-500">Supprimer</button>
        </div>
      ))}
      <h3 className="text-right text-lg font-bold mt-4">Total : {totalAmount} €</h3>

<div className="flex flex-col sm:flex-row gap-4 mt-6">
  <button
    onClick={() => dispatch(clearCart())}
    className="w-full sm:w-1/2 bg-red-500 hover:bg-red-600 text-white py-2 rounded"
  >
    Vider le panier
  </button>

  <a
    href="/checkout"
    className="w-full sm:w-1/2 text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
  >
    Continuer la commande
  </a>
</div>

  </div>
  );
};

export default Cart;
