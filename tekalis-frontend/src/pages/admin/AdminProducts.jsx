import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/api";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get("/products");
        setProducts(data);
      } catch (error) {
        console.error("Erreur lors du chargement des produits", error);
      }
    };
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce produit ?")) return;

    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
    } catch (error) {
      console.error("Erreur suppression produit:", error);
      alert("Échec de la suppression.");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Gestion des Produits</h1>
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Nom</th>
              <th className="p-2 border">Prix</th>
              <th className="p-2 border">Stock</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="text-center">
                <td className="p-2 border">{product.name}</td>
                <td className="p-2 border">{product.price} CFA</td>
                <td className="p-2 border">{product.stock}</td>
                <td className="p-2 border space-x-2">
                  <Link
                    to={`/admin/products/edit/${product._id}`}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Modifier
                  </Link>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProducts;
