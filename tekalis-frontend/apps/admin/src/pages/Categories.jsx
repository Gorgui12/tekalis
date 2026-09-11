import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye,
  FaSearch,
  FaTimes,
  FaFolder,
  FaLayerGroup
} from "react-icons/fa";
import api from "@shared/api/api";
import { useToast } from '@shared/context/ToastContext';

const CLIENT_URL = import.meta.env.VITE_CLIENT_URL || "https://tekalis.com";

const AdminCategories = () => {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "",
    parentCategory: "",
    isActive: true,
    order: 0
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/admin/categories");
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Erreur chargement catégories:", error);
      toast.error("Erreur lors du chargement des catégories");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editMode) {
        await api.put(`/admin/categories/${formData._id}`, formData);
        toast.success("Catégorie mise à jour avec succès");
      } else {
        await api.post("/admin/categories", formData);
        toast.success("Catégorie créée avec succès");
      }
      
      fetchCategories();
      resetForm();
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const handleEdit = (category) => {
    setFormData(category);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) return;
    
    try {
      await api.delete(`/admin/categories/${id}`);
      toast.success("Catégorie supprimée avec succès");
      fetchCategories();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      icon: "",
      parentCategory: "",
      isActive: true,
      order: 0
    });
    setEditMode(false);
    setShowModal(false);
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="text-blue-600 hover:text-blue-700 font-semibold mb-4 inline-block"
          >
            ← Retour au dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                📁 Gestion des catégories
              </h1>
              <p className="text-gray-600">
                {filteredCategories.length} catégorie(s) • {categories.reduce((sum, cat) => sum + cat.productsCount, 0)} produits total
              </p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-md"
            >
              <FaPlus /> Ajouter une catégorie
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une catégorie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <div
              key={category._id}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-6 border-b">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{category.icon}</div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        {category.name}
                      </h3>
                      <p className="text-xs text-gray-500">/{category.slug}</p>
                    </div>
                  </div>
                  
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    category.isActive 
                      ? "bg-green-100 text-green-700" 
                      : "bg-red-100 text-red-700"
                  }`}>
                    {category.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2">
                  {category.description}
                </p>
              </div>

              {/* Card Stats */}
              <div className="px-6 py-3 bg-gray-50 border-b">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Produits</span>
                  <span className="font-bold text-blue-600">
                    {category.productsCount}
                  </span>
                </div>
              </div>

              {/* Card Actions */}
              <div className="p-3 flex gap-2">
                <a
                  href={`${CLIENT_URL}/category/${category.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold text-sm text-center flex items-center justify-center gap-2"
                >
                  <FaEye /> Voir
                </a>
                <button
                  onClick={() => handleEdit(category)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                >
                  <FaEdit /> Modifier
                </button>
                <button
                  onClick={() => handleDelete(category._id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <FaFolder className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Aucune catégorie trouvée</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Créer la première catégorie
            </button>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editMode ? "Modifier la catégorie" : "Nouvelle catégorie"}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nom de la catégorie *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Ordinateurs Portables"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Slug *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: ordinateurs-portables"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Courte description de la catégorie..."
                  ></textarea>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Icône (emoji)
                    </label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 💻"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ordre d'affichage
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <label htmlFor="isActive" className="text-sm font-semibold text-gray-700">
                    Catégorie active
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
                  >
                    {editMode ? "Mettre à jour" : "Créer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategories;