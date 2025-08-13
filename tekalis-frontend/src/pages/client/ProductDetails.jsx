import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { fetchProducts } from "../../slices/productSlice";
import { addToCart } from "../../slices/cartSlice";
import ProductCard from "../../components/client/ProductCard";

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { items, isLoading } = useSelector((state) => state.products);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const product = items.find((item) => item._id === id);

  if (isLoading || !product) return <p className="text-center">Chargement...</p>;

  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, quantity }));
    alert("Produit ajouté au panier !");
  };

  const similarProducts = items.filter(
    (item) => item.category === product.category && item._id !== product._id
  );

  return (
    <div className="container mx-auto p-6">
      {/* Produit principal */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <div>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-auto rounded shadow"
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.description}</p>
          <p className="text-2xl font-semibold text-blue-600 mb-4">{product.price} €</p>

          <div className="flex items-center space-x-4 mb-6">
            <label>Quantité:</label>
            <input
              type="number"
              min={1}
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-16 border px-2 py-1 rounded"
            />
          </div>

          <button
            onClick={handleAddToCart}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded"
          >
            Ajouter au panier
          </button>
        </div>
      </div>

      {/* Produits similaires */}
      {similarProducts.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Produits similaires</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {similarProducts.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
