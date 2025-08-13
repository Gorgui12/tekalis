import { useState } from "react";
import api from "../../api/api";
import { useNavigate } from "react-router-dom";

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "", // ici sous forme de texte séparé par des virgules
    image: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Transformer les catégories en tableau (en enlevant les espaces superflus)
    const categoriesArray = formData.category
      .split(",")
      .map((cat) => cat.trim())
      .filter((cat) => cat.length > 0);

    const payload = {
      ...formData,
      category: categoriesArray, // tableau à envoyer au backend
      price: Number(formData.price),
      stock: Number(formData.stock),
    };

    try {
      await api.post("/products", payload);
      alert("Produit ajouté avec succès !");
      navigate("/admin/produits");
    } catch (error) {
      console.error("Erreur complète:", error.response ? error.response.data : error.message);
      alert("Échec de l'ajout du produit.");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Ajouter un Produit</h1>
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white shadow-md p-6 rounded-lg">
        <div className="mb-4">
          <label className="block text-gray-700">Nom du Produit</label>
          <input type="text" name="name" onChange={handleChange} required className="w-full p-2 border rounded" />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Description</label>
          <textarea name="description" onChange={handleChange} required className="w-full p-2 border rounded"></textarea>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Prix (€)</label>
          <input type="number" name="price" onChange={handleChange} required className="w-full p-2 border rounded" />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Image (URL)</label>
          <input type="text" name="image" onChange={handleChange} required className="w-full p-2 border rounded" />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Stock</label>
          <input type="number" name="stock" onChange={handleChange} required className="w-full p-2 border rounded" />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700">Catégories (séparées par des virgules)</label>
          <input
            type="text"
            name="category"
            onChange={handleChange}
            placeholder="Ex: Gaming Premium, Audio & Son"
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded">
          Publier le produit
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
