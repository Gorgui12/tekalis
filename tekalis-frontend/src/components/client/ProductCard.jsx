import { useDispatch } from "react-redux";
import { addToCart } from "../../slices/cartSlice";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  if (!product) {
    return (
      <div className="p-4 border rounded text-red-500">
        Produit introuvable
      </div>
    );
  }

  return (
    <div className="p-4 border rounded flex flex-col items-center justify-between shadow hover:shadow-lg transition">
      {/* 📎 Lien vers la page de détails */}
      <Link to={`/products/${product._id}`} className="w-full text-center">
        <img src={product.image} alt={product.name} className="w-full h-48 object-contain mb-2" />
        <h2 className="font-bold text-lg text-gray-800">{product.name}</h2>
        <p className="text-sm text-gray-600">{product.description}</p>
        <p className="text-blue-600 font-semibold mt-1">{product.price} €</p>
      </Link>

      {/* 🛒 Bouton ajouter au panier */}
      <button
        onClick={() => dispatch(addToCart(product))}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded mt-3 w-full"
      >
        Ajouter au panier
      </button>
    </div>
  );
};

export default ProductCard;
