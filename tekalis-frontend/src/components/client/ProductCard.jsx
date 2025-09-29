import { useDispatch } from "react-redux";
import { addToCart } from "../../slices/cartSlice";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  if (!product) {
    return (
      <div className="p-2 border rounded text-red-500 shadow">
        Produit introuvable
      </div>
    );
  }

  return (
   <div className="p-3 border rounded-lg flex flex-col justify-between shadow hover:shadow-lg transition bg-white h-full min-h-[260px]">
  {/* 📎 Image + détails */}
  <Link
    to={`/products/${product._id}`}
    className="flex-1 flex flex-col items-center text-center"
  >
    <img
      src={product.image}
      alt={product.name}
      className="w-full h-28 sm:h-32 object-contain mb-2"
    />
    <h2 className="font-medium text-sm sm:text-base text-gray-800 line-clamp-1">
      {product.name}
    </h2>

    {/* ❌ Description retirée des cartes */}
    {/* <p className="text-xs text-gray-600 line-clamp-2 hidden sm:block">
      {product.description}
    </p> */}

    <p className="text-blue-600 font-bold mt-1 text-sm sm:text-base">
      {product.price} CFA
    </p>
  </Link>

  {/* 🛒 Bouton ajouter au panier */}
  <button
    onClick={() => dispatch(addToCart(product))}
    className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-md mt-2 w-full text-xs sm:text-sm font-medium transition"
  >
    Ajouter au panier
  </button>
</div>

  );
};

export default ProductCard;

