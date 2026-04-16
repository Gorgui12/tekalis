import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Trash2, Edit3, Eye, EyeOff, GripVertical,
  Image, Link, Type, Save, X, ChevronUp, ChevronDown,
  Zap, ExternalLink, ToggleLeft, ToggleRight, ArrowLeft
} from 'lucide-react';
import api from '../../../../packages/shared/api/api';
import { useToast } from '../../../../packages/shared/context/ToastContext';

/* ── Slide vide (formulaire) ──────────────────────────────────────────────── */
const EMPTY_SLIDE = {
  title: '',
  subtitle: '',
  description: '',
  badge: '',
  image: '',
  mobileImage: '',
  overlay: 'rgba(0,0,0,0.45)',
  gradient: '',
  primaryCta: { text: 'Découvrir', link: '/products', style: 'white' },
  secondaryCta: { text: '', link: '', style: 'outline' },
  order: 0,
  isActive: true,
  textPosition: 'left',
  stats: [],
};

/* ── Prévisualisation miniature ───────────────────────────────────────────── */
const SlidePreview = ({ slide }) => (
  <div
    className="relative w-full h-32 rounded-xl overflow-hidden flex-shrink-0 bg-gray-800"
    style={{
      backgroundImage: slide.image ? `url(${slide.image})` : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}
  >
    {/* Overlay */}
    <div className="absolute inset-0" style={{ background: slide.overlay || 'rgba(0,0,0,0.45)' }} />
    {slide.gradient && (
      <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-70`} />
    )}
    {/* Contenu */}
    <div className={`absolute inset-0 flex flex-col justify-center px-4 ${
      slide.textPosition === 'center' ? 'items-center text-center' :
      slide.textPosition === 'right' ? 'items-end text-right' : 'items-start text-left'
    }`}>
      {slide.badge && (
        <span className="text-[9px] bg-white/20 text-white px-2 py-0.5 rounded-full mb-1 font-semibold">
          {slide.badge}
        </span>
      )}
      <p className="text-white font-bold text-xs leading-tight line-clamp-2">{slide.title || 'Titre du slide'}</p>
      {slide.subtitle && (
        <p className="text-white/80 text-[9px] mt-0.5 line-clamp-1">{slide.subtitle}</p>
      )}
    </div>
    {/* Badge actif */}
    {!slide.isActive && (
      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
        <span className="text-white/60 text-[10px] font-medium">INACTIF</span>
      </div>
    )}
  </div>
);

/* ── Formulaire d'édition ─────────────────────────────────────────────────── */
const SlideForm = ({ slide, onSave, onCancel, isNew }) => {
  const [form, setForm] = useState(slide);
  const [saving, setSaving] = useState(false);
  const [newStat, setNewStat] = useState({ value: '', label: '' });
  const toast = useToast();

  const set = (path, value) => {
    const keys = path.split('.');
    setForm(prev => {
      const next = { ...prev };
      let ref = next;
      for (let i = 0; i < keys.length - 1; i++) {
        ref[keys[i]] = { ...ref[keys[i]] };
        ref = ref[keys[i]];
      }
      ref[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Le titre est requis'); return; }
    if (!form.image.trim()) { toast.error("L'image est requise"); return; }
    if (!form.primaryCta.text || !form.primaryCta.link) {
      toast.error('Le CTA principal est requis'); return;
    }
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  const addStat = () => {
    if (!newStat.value || !newStat.label) return;
    setForm(p => ({ ...p, stats: [...(p.stats || []), { ...newStat }] }));
    setNewStat({ value: '', label: '' });
  };

  const removeStat = (idx) => {
    setForm(p => ({ ...p, stats: p.stats.filter((_, i) => i !== idx) }));
  };

  const Input = ({ label, value, onChange, placeholder, type = 'text', required }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-400 mb-1.5">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 px-3 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/60 transition"
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Preview live */}
      <SlidePreview slide={form} />

      {/* Section : Contenu */}
      <div>
        <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">Contenu</h4>
        <div className="space-y-3">
          <Input label="Titre" value={form.title} onChange={v => set('title', v)}
            placeholder="NOUVEAUTÉS GAMING 2025" required />
          <Input label="Badge (optionnel)" value={form.badge} onChange={v => set('badge', v)}
            placeholder="NOUVEAU · PROMO · HOT" />
          <Input label="Sous-titre" value={form.subtitle} onChange={v => set('subtitle', v)}
            placeholder="La puissance à portée de main" />
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={2}
              placeholder="Description courte du slide..."
              className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/60 transition resize-none"
            />
          </div>
        </div>
      </div>

      {/* Section : Médias */}
      <div>
        <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">Médias</h4>
        <div className="space-y-3">
          <Input label="URL Image (desktop)" value={form.image} onChange={v => set('image', v)}
            placeholder="https://... (1920×800 recommandé)" required />
          <Input label="URL Image mobile (optionnel)" value={form.mobileImage || ''} onChange={v => set('mobileImage', v)}
            placeholder="https://... (800×600 recommandé)" />
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Overlay couleur</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.overlay}
                onChange={e => set('overlay', e.target.value)}
                className="flex-1 h-9 px-3 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/60 transition"
                placeholder="rgba(0,0,0,0.45)"
              />
              {/* Presets */}
              {[
                { label: 'Sombre', value: 'rgba(0,0,0,0.55)' },
                { label: 'Léger', value: 'rgba(0,0,0,0.25)' },
                { label: 'Aucun', value: 'rgba(0,0,0,0)' },
              ].map(p => (
                <button key={p.value} type="button" onClick={() => set('overlay', p.value)}
                  className="px-2 text-[10px] font-semibold rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 border border-white/10 transition">
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <Input label="Gradient CSS (optionnel)" value={form.gradient || ''} onChange={v => set('gradient', v)}
            placeholder="from-blue-900/80 to-purple-900/60" />
        </div>
      </div>

      {/* Section : CTAs */}
      <div>
        <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">Boutons d'action</h4>
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-2">
            <p className="text-xs font-semibold text-blue-400">CTA Principal *</p>
            <div className="grid grid-cols-2 gap-2">
              <Input label="Texte" value={form.primaryCta.text} onChange={v => set('primaryCta.text', v)} placeholder="Découvrir" required />
              <Input label="Lien" value={form.primaryCta.link} onChange={v => set('primaryCta.link', v)} placeholder="/products" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Style</label>
              <select value={form.primaryCta.style} onChange={e => set('primaryCta.style', e.target.value)}
                className="h-8 px-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none">
                <option value="white">Blanc</option>
                <option value="primary">Bleu</option>
                <option value="outline">Contour</option>
              </select>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
            <p className="text-xs font-semibold text-gray-500">CTA Secondaire (optionnel)</p>
            <div className="grid grid-cols-2 gap-2">
              <Input label="Texte" value={form.secondaryCta?.text || ''} onChange={v => set('secondaryCta.text', v)} placeholder="En savoir plus" />
              <Input label="Lien" value={form.secondaryCta?.link || ''} onChange={v => set('secondaryCta.link', v)} placeholder="/contact" />
            </div>
          </div>
        </div>
      </div>

      {/* Section : Apparence */}
      <div>
        <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">Apparence</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Position texte</label>
            <select value={form.textPosition} onChange={e => set('textPosition', e.target.value)}
              className="w-full h-9 px-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none">
              <option value="left">Gauche</option>
              <option value="center">Centre</option>
              <option value="right">Droite</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Ordre d'affichage</label>
            <input type="number" value={form.order} onChange={e => set('order', Number(e.target.value))} min={0}
              className="w-full h-9 px-3 text-sm rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/60 transition" />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <button type="button" onClick={() => set('isActive', !form.isActive)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
              form.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                           : 'bg-white/5 text-gray-500 border border-white/10'
            }`}>
            {form.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
            {form.isActive ? 'Actif' : 'Inactif'}
          </button>
        </div>
      </div>

      {/* Section : Stats */}
      <div>
        <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">
          Statistiques affichées (optionnel)
        </h4>
        <div className="space-y-2">
          {(form.stats || []).map((s, i) => (
            <div key={i} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
              <span className="text-white text-sm font-bold">{s.value}</span>
              <span className="text-gray-500 text-xs">{s.label}</span>
              <button type="button" onClick={() => removeStat(i)} className="ml-auto text-red-400 hover:text-red-300">
                <X size={12} />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input value={newStat.value} onChange={e => setNewStat(p => ({ ...p, value: e.target.value }))}
              placeholder="10K+" className="w-20 h-8 px-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none" />
            <input value={newStat.label} onChange={e => setNewStat(p => ({ ...p, label: e.target.value }))}
              placeholder="Clients satisfaits" className="flex-1 h-8 px-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none" />
            <button type="button" onClick={addStat}
              className="px-3 h-8 bg-blue-600/50 hover:bg-blue-600/70 text-white text-xs rounded-lg transition">
              <Plus size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-white/10">
        <button type="button" onClick={onCancel}
          className="flex-1 h-9 text-sm rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 transition">
          Annuler
        </button>
        <button type="submit" disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 h-9 text-sm rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold transition">
          {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={14} />}
          {isNew ? 'Créer le slide' : 'Sauvegarder'}
        </button>
      </div>
    </form>
  );
};

/* ── Page principale ──────────────────────────────────────────────────────── */
const HeroSlides = () => {
  const toast = useToast();
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null); // null = liste, 'new' = créer, id = éditer
  const [editingSlide, setEditingSlide] = useState(null);

  /* Chargement */
  const fetchSlides = async () => {
    try {
      const { data } = await api.get('/hero/all');
      setSlides(data.slides || []);
    } catch {
      // Données démo si API pas encore branchée
      setSlides([
        {
          _id: 'demo1',
          title: 'GAMING PC ULTRA — RTX 5090',
          subtitle: 'Repoussez les limites du possible',
          badge: '🔥 NOUVEAU',
          image: 'https://images.unsplash.com/photo-1593640408182-31c228edb56a?w=1920&q=80',
          overlay: 'rgba(0,0,0,0.55)',
          gradient: 'from-purple-900/70 to-blue-900/50',
          primaryCta: { text: 'Voir les offres', link: '/category/gaming', style: 'white' },
          secondaryCta: { text: 'Configurer mon PC', link: '/configurator', style: 'outline' },
          order: 0, isActive: true, textPosition: 'left',
          stats: [{ value: '10K+', label: 'Clients' }, { value: '4.9★', label: 'Avis' }],
        },
        {
          _id: 'demo2',
          title: 'SMARTPHONES DERNIÈRE GÉNÉRATION',
          subtitle: 'iPhone, Samsung, Xiaomi — Meilleurs prix à Dakar',
          badge: '📱 EXCLUSIVITÉ',
          image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=1920&q=80',
          overlay: 'rgba(0,0,0,0.4)',
          gradient: 'from-blue-900/60 to-cyan-900/40',
          primaryCta: { text: 'Explorer', link: '/category/smartphones', style: 'white' },
          secondaryCta: { text: '', link: '', style: 'outline' },
          order: 1, isActive: true, textPosition: 'left',
          stats: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSlides(); }, []);

  /* CRUD */
  const handleSave = async (formData) => {
    try {
      if (editingId === 'new') {
        const { data } = await api.post('/hero', formData);
        setSlides(p => [...p, data.slide]);
        toast.success('Slide créé !');
      } else {
        const { data } = await api.put(`/hero/${editingId}`, formData);
        setSlides(p => p.map(s => s._id === editingId ? data.slide : s));
        toast.success('Slide mis à jour !');
      }
      setEditingId(null);
      setEditingSlide(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce slide ?')) return;
    try {
      await api.delete(`/hero/${id}`);
      setSlides(p => p.filter(s => s._id !== id));
      toast.success('Slide supprimé');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await api.patch(`/hero/${id}/toggle`);
      setSlides(p => p.map(s => s._id === id ? data.slide : s));
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleMoveOrder = async (id, direction) => {
    const idx = slides.findIndex(s => s._id === id);
    if ((direction === -1 && idx === 0) || (direction === 1 && idx === slides.length - 1)) return;
    const next = [...slides];
    [next[idx], next[idx + direction]] = [next[idx + direction], next[idx]];
    const reordered = next.map((s, i) => ({ ...s, order: i }));
    setSlides(reordered);
    try {
      await api.patch('/hero/reorder', { order: reordered.map(s => ({ id: s._id, order: s.order })) });
    } catch {
      toast.error("Erreur d'ordre");
    }
  };

  const openNew = () => {
    setEditingId('new');
    setEditingSlide({ ...EMPTY_SLIDE, order: slides.length });
  };

  const openEdit = (slide) => {
    setEditingId(slide._id);
    setEditingSlide({ ...slide });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  /* Formulaire ouvert */
  if (editingId !== null) {
    return (
      <div className="max-w-2xl space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => { setEditingId(null); setEditingSlide(null); }}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">
              {editingId === 'new' ? 'Nouveau slide Hero' : 'Modifier le slide'}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {editingId === 'new' ? 'Créer un nouveau slide pour le hero de la page d\'accueil' : 'Modifier les informations du slide'}
            </p>
          </div>
        </div>

        <div className="bg-gray-900 border border-white/5 rounded-2xl p-6">
          <SlideForm
            slide={editingSlide}
            isNew={editingId === 'new'}
            onSave={handleSave}
            onCancel={() => { setEditingId(null); setEditingSlide(null); }}
          />
        </div>
      </div>
    );
  }

  /* Liste des slides */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Slides Hero</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Gérez le carrousel de la page d'accueil — {slides.length} slide{slides.length > 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition">
          <Plus size={16} />
          Nouveau slide
        </button>
      </div>

      {/* Tip */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3 text-sm text-blue-300 flex items-start gap-3">
        <Zap size={15} className="mt-0.5 flex-shrink-0 text-blue-400" />
        <span>
          Les slides sont affichés dans l'ordre indiqué. Utilisez les flèches pour réordonner.
          Seuls les slides <strong>actifs</strong> sont visibles sur le site.
        </span>
      </div>

      {/* Slides list */}
      {slides.length === 0 ? (
        <div className="bg-gray-900 border border-white/5 rounded-2xl p-12 text-center">
          <Image size={40} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 font-medium mb-2">Aucun slide configuré</p>
          <p className="text-gray-600 text-sm mb-6">Créez votre premier slide Hero pour la page d'accueil</p>
          <button onClick={openNew}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition">
            Créer le premier slide
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map((slide, idx) => (
            <div key={slide._id}
              className={`bg-gray-900 border rounded-2xl p-4 transition ${
                slide.isActive ? 'border-white/5 hover:border-white/10' : 'border-white/[0.03] opacity-60'
              }`}>
              <div className="flex gap-4">
                {/* Drag handle + order */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-1">
                  <button onClick={() => handleMoveOrder(slide._id, -1)} disabled={idx === 0}
                    className="p-1 rounded text-gray-600 hover:text-gray-300 disabled:opacity-30 transition">
                    <ChevronUp size={14} />
                  </button>
                  <span className="text-xs text-gray-600 font-mono w-4 text-center">{idx + 1}</span>
                  <button onClick={() => handleMoveOrder(slide._id, 1)} disabled={idx === slides.length - 1}
                    className="p-1 rounded text-gray-600 hover:text-gray-300 disabled:opacity-30 transition">
                    <ChevronDown size={14} />
                  </button>
                </div>

                {/* Preview */}
                <div className="w-48 flex-shrink-0">
                  <SlidePreview slide={slide} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 py-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-white truncate">{slide.title}</h3>
                        <span className={`flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          slide.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-700 text-gray-500'
                        }`}>
                          {slide.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                      {slide.subtitle && (
                        <p className="text-xs text-gray-500 truncate mb-2">{slide.subtitle}</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {slide.badge && (
                          <span className="text-[10px] bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-500/20">
                            {slide.badge}
                          </span>
                        )}
                        {slide.primaryCta?.text && (
                          <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Link size={9} />
                            {slide.primaryCta.text} → {slide.primaryCta.link}
                          </span>
                        )}
                        {(slide.stats || []).length > 0 && (
                          <span className="text-[10px] text-gray-500">
                            {slide.stats.length} stat{slide.stats.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <a href="/" target="_blank" rel="noreferrer"
                        className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition" title="Voir sur le site">
                        <ExternalLink size={15} />
                      </a>
                      <button onClick={() => handleToggle(slide._id)}
                        className={`p-2 rounded-lg transition ${
                          slide.isActive
                            ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
                            : 'text-gray-600 hover:text-gray-300 hover:bg-white/5'
                        }`} title={slide.isActive ? 'Désactiver' : 'Activer'}>
                        {slide.isActive ? <Eye size={15} /> : <EyeOff size={15} />}
                      </button>
                      <button onClick={() => openEdit(slide)}
                        className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition" title="Modifier">
                        <Edit3 size={15} />
                      </button>
                      <button onClick={() => handleDelete(slide._id)}
                        className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition" title="Supprimer">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroSlides;
