import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ArrowLeft, Save, Eye } from 'lucide-react';

// ✅ Fix : import useToast depuis ToastContext (et non manquant comme avant)
import { useToast } from '../../../../packages/shared/context/ToastContext';
import { createArticle } from '../../../../packages/shared/redux/slices/articleSlice';
import { validateProduct } from '../../../../packages/shared/outils/validators';
import { ARTICLE_CATEGORIES, ARTICLE_CATEGORY_LABELS } from '../../../../packages/shared/outils/constants';

const AddArticle = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // ✅ Fix : utilisation correcte de useToast()
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: '',
    tags: '',
    image: '',
    published: false,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      // Auto-slug depuis le titre
      ...(name === 'title' ? { slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') } : {}),
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Le titre est requis';
    if (!form.content.trim() || form.content.length < 50) errs.content = 'Le contenu doit faire au moins 50 caractères';
    if (!form.category) errs.category = 'La catégorie est requise';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (published = false) => {
    if (!validate()) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    setLoading(true);
    try {
      const articleData = {
        ...form,
        published,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };

      await dispatch(createArticle(articleData)).unwrap();
      toast.success(published ? 'Article publié avec succès !' : 'Brouillon enregistré');
      navigate('/admin/blog');
    } catch (err) {
      toast.error(err?.message || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/blog')}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Nouvel article</h1>
          <p className="text-sm text-gray-500 mt-0.5">Créer un article de blog</p>
        </div>
      </div>

      {/* Formulaire */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
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
          <Field label="Extrait / sous-titre">
            <textarea
              name="excerpt"
              value={form.excerpt}
              onChange={handleChange}
              rows={2}
              placeholder="Résumé court affiché dans les listings"
              className={inputCls()}
            />
          </Field>

          {/* Contenu */}
          <Field label="Contenu" error={errors.content}>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={12}
              placeholder="Contenu de l'article (Markdown supporté)"
              className={`${inputCls(errors.content)} resize-y font-mono text-xs`}
            />
          </Field>
        </div>

        {/* Sidebar droite */}
        <div className="space-y-4">
          {/* Catégorie */}
          <Field label="Catégorie" error={errors.category}>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className={inputCls(errors.category)}
            >
              <option value="">Choisir…</option>
              {Object.entries(ARTICLE_CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
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

          {/* Image */}
          <Field label="URL Image de couverture">
            <input
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="https://…"
              className={inputCls()}
            />
          </Field>

          {form.image && (
            <img src={form.image} alt="cover" className="w-full h-32 object-cover rounded-xl bg-white/5" />
          )}

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 h-10 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition"
            >
              <Eye size={15} />
              Publier
            </button>
            <button
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 h-10 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-gray-300 text-sm font-medium rounded-xl transition"
            >
              <Save size={15} />
              Enregistrer brouillon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Helpers UI ─────────────────────────────────────────────────────────── */
const Field = ({ label, children, error, hint }) => (
  <div>
    <label className="block text-xs font-medium text-gray-400 mb-1.5">
      {label}
      {hint && <span className="text-gray-600 ml-1">— {hint}</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
  </div>
);

const inputCls = (error) => `
  w-full px-3 py-2.5 rounded-xl text-sm text-white
  bg-white/5 border ${error ? 'border-red-500/50' : 'border-white/8'}
  placeholder:text-gray-600
  focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07]
  transition-all duration-150
`;

export default AddArticle;