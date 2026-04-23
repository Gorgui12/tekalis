// ===============================================
// AddArticle.jsx — Admin
// ✅ FIX : POST /admin/articles — ajout du champ "category" requis par le modèle
// ✅ FIX : author injecté côté backend (req.user._id) — plus besoin de l'envoyer
// ✅ FIX : status = "published" | "draft" (enum du modèle)
// ✅ FIX : content requis avec validation
// ===============================================
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Eye } from "lucide-react";
import api from "../../../../packages/shared/api/api";
import { useToast } from "../../../../packages/shared/context/ToastContext";

// Enum du modèle Article
const CATEGORIES = [
  { value: "test",        label: "Test produit" },
  { value: "comparatif",  label: "Comparatif" },
  { value: "tutoriel",    label: "Tutoriel" },
  { value: "actualite",   label: "Actualité" }
];

const AddArticle = () => {
  const navigate = useNavigate();
  const toast    = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title:    "",
    slug:     "",
    excerpt:  "",
    content:  "",
    category: "",       // REQUIS par le modèle
    tags:     "",
    coverImage: { url: "", alt: "" },
    isFeatured: false,
    status: "draft"     // "draft" | "published" — enum du modèle
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      // Auto-slug depuis le titre
      ...(name === "title" && !prev.slug ? {
        slug: value
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .trim()
      } : {})
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleCoverChange = (e) => {
    setForm(prev => ({
      ...prev,
      coverImage: { ...prev.coverImage, url: e.target.value }
    }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim())    errs.title    = "Le titre est requis";
    if (!form.category)        errs.category = "La catégorie est requise";
    if (!form.content.trim() || form.content.length < 50)
      errs.content = "Le contenu doit faire au moins 50 caractères";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (publishNow = false) => {
    if (!validate()) {
      toast.error("Veuillez corriger les erreurs du formulaire");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title:      form.title.trim(),
        slug:       form.slug.trim() || undefined,
        excerpt:    form.excerpt.trim(),
        content:    form.content.trim(),
        category:   form.category,
        tags:       form.tags.split(",").map(t => t.trim()).filter(Boolean),
        coverImage: form.coverImage.url ? form.coverImage : undefined,
        isFeatured: form.isFeatured,
        status:     publishNow ? "published" : "draft",
        ...(publishNow && { publishedAt: new Date().toISOString() })
        // NB: author est injecté côté backend depuis req.user._id
      };

      await api.post("/admin/articles", payload);
      toast.success(publishNow ? "Article publié avec succès !" : "Brouillon enregistré");
      navigate("/articles");
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur lors de l'enregistrement";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/articles")}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Nouvel article</h1>
          <p className="text-sm text-gray-500 mt-0.5">Créer un article de blog</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Colonne principale ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Titre */}
          <Field label="Titre" error={errors.title}>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Titre de l'article"
              className={inputCls(errors.title)}
            />
          </Field>

          {/* Slug */}
          <Field label="Slug URL">
            <input
              name="slug"
              value={form.slug}
              onChange={handleChange}
              placeholder="slug-de-l-article"
              className={inputCls()}
            />
          </Field>

          {/* Extrait */}
          <Field label="Extrait">
            <textarea
              name="excerpt"
              value={form.excerpt}
              onChange={handleChange}
              rows={2}
              placeholder="Résumé affiché dans les listings"
              className={inputCls()}
            />
          </Field>

          {/* Contenu */}
          <Field label="Contenu *" error={errors.content}>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={14}
              placeholder="Contenu de l'article (Markdown supporté)..."
              className={`${inputCls(errors.content)} resize-y font-mono text-xs`}
            />
            <p className="text-xs text-gray-600 mt-1">{form.content.length} caractères</p>
          </Field>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">

          {/* Catégorie — REQUIS */}
          <Field label="Catégorie *" error={errors.category}>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className={inputCls(errors.category)}
            >
              <option value="">Choisir une catégorie…</option>
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </Field>

          {/* Tags */}
          <Field label="Tags" hint="Séparés par des virgules">
            <input
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="ryzen, pc, gaming"
              className={inputCls()}
            />
          </Field>

          {/* Image de couverture */}
          <Field label="URL Image de couverture">
            <input
              name="coverImageUrl"
              value={form.coverImage.url}
              onChange={handleCoverChange}
              placeholder="https://…"
              className={inputCls()}
            />
          </Field>
          {form.coverImage.url && (
            <img
              src={form.coverImage.url}
              alt="cover"
              className="w-full h-32 object-cover rounded-xl bg-white/5"
              onError={e => { e.target.style.display = "none"; }}
            />
          )}

          {/* En vedette */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <input
              type="checkbox"
              id="isFeatured"
              name="isFeatured"
              checked={form.isFeatured}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="isFeatured" className="text-sm text-gray-300">Article mis en avant ⭐</label>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 h-10 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition"
            >
              <Eye size={14} /> Publier maintenant
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 h-10 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-gray-300 text-sm font-medium rounded-xl transition"
            >
              <Save size={14} /> Enregistrer brouillon
            </button>
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <span className="w-4 h-4 border-2 border-white/20 border-t-blue-400 rounded-full animate-spin" />
              Enregistrement…
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Helpers UI ─────────────────────────────────────────────────────────────
const Field = ({ label, children, error, hint }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-400 mb-1.5">
      {label}
      {hint && <span className="text-gray-600 ml-1 font-normal">— {hint}</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
  </div>
);

const inputCls = (error) => `
  w-full px-3 py-2.5 rounded-xl text-sm text-white
  bg-white/5 border ${error ? "border-red-500/50" : "border-white/8"}
  placeholder:text-gray-600
  focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07]
  transition-all duration-150
`;

export default AddArticle;