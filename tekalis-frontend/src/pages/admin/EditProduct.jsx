import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/api";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    image: "",
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setFormData({
          ...data,
          category: data.category?.join(", ") || "",
        });
      } catch (error) {
        console.error("Erreur chargement produit", error);
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const categoriesArray = formData.category
      .split(",")
      .map((cat) => cat.trim())
      .filter((cat) => cat.length > 0);

    const payload = {
      ...formData,
      category: categoriesArray,
      price: Number(formData.price),
      stock: Number(formData.stock),
    };

    try {
      await api.put(`/products/${id}`, payload);
      alert("Produit modifié avec succès !");
      navigate("/admin/produits");
    } catch (error) {
      console.error("Erreur modification:", error.response ? error.response.data : error.message);
      alert("Échec de la modification.");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Modifier le Produit</h1>
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white shadow-md p-6 rounded-lg">
        <div className="mb-4">
          <label className="block text-gray-700">Nom du Produit</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2 border rounded" />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} required className="w-full p-2 border rounded"></textarea>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Prix (CFA)</label>
          <input type="number" name="price" value={formData.price} onChange={handleChange} required className="w-full p-2 border rounded" />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Image (URL)</label>
          <input type="text" name="image" value={formData.image} onChange={handleChange} required className="w-full p-2 border rounded" />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Stock</label>
          <input type="number" name="stock" value={formData.stock} onChange={handleChange} required className="w-full p-2 border rounded" />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700">Catégories (séparées par des virgules)</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded">
          Sauvegarder les modifications
        </button>
      </form>
    </div>
  );
};

export default EditProduct;
