import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaSave, FaTimes, FaImage, FaUpload } from "react-icons/fa";
import api from "../../api/api";

const AddArticle = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "test",
    tags: [],
    featuredImage: "",
    status: "draft",
    featured: false,
    relatedProducts: []
  });
  const [tagInput, setTagInput] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/articles", formData);
      alert("Article créé avec succès !");
      navigate("/admin/articles");
    } catch (error) {
      console.error("Erreur création article:", error);
      alert("Erreur lors de la création de l'article");
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (title) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title)
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/admin/articles"
            className="text-blue-600 hover:text-blue-700 font-semibold mb-4 inline-block"
          >
            ← Retour aux articles
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ✍️ Nouvel article
          </h1>
          <p className="text-gray-600">
            Créez un nouvel article pour le blog
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Titre de l'article *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full border rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Test complet du HP Pavilion Gaming 15"
                />
              </div>

              {/* Slug */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  URL (slug) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="test-hp-pavilion-gaming-15"
                />
                <p className="text-xs text-gray-500 mt-2">
                  URL de l'article: /blog/{formData.slug || "votre-slug"}
                </p>
              </div>

              {/* Excerpt */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Extrait *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Courte description de l'article (150-200 caractères)..."
                ></textarea>
                <p className="text-xs text-gray-500 mt-2">
                  {formData.excerpt.length} caractères
                </p>
              </div>

              {/* Content */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contenu de l'article *
                </label>
                <textarea
                  required
                  rows={15}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Écrivez votre article ici (HTML supporté)..."
                ></textarea>
                <p className="text-xs text-gray-500 mt-2">
                  Supporte le HTML. Vous pouvez utiliser des balises &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;, etc.
                </p>
              </div>

              {/* Featured Image */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Image à la une
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={formData.featuredImage}
                    onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                    className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="URL de l'image..."
                  />
                  <button
                    type="button"
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                  >
                    <FaUpload /> Upload
                  </button>
                </div>
                {formData.featuredImage && (
                  <div className="mt-4">
                    <img
                      src={formData.featuredImage}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Publish */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-bold text-gray-900 mb-4">Publication</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Statut
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="draft">Brouillon</option>
                      <option value="published">Publié</option>
                      <option value="scheduled">Programmé</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <label htmlFor="featured" className="text-sm font-semibold text-gray-700">
                      Article en vedette ⭐
                    </label>
                  </div>
                </div>
              </div>

              {/* Category */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-bold text-gray-900 mb-4">Catégorie</h3>
                
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="test">Test</option>
                  <option value="guide">Guide</option>
                  <option value="tutorial">Tutoriel</option>
                  <option value="news">Actualités</option>
                  <option value="comparison">Comparatif</option>
                </select>
              </div>

              {/* Tags */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-bold text-gray-900 mb-4">Tags</h3>
                
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ajouter un tag..."
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm"
                  >
                    +
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <FaTimes size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end bg-white rounded-lg shadow-md p-6">
            <Link
              to="/admin/articles"
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
            >
              <FaTimes /> Annuler
            </Link>
            <button
              type="submit"
              disabled={loading}
              className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <FaSave /> Publier
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddArticle;