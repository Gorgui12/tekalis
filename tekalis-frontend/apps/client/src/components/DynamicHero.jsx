/**
 * HeroSection dynamique — récupère les slides depuis l'API
 * Mobile-first · LCP optimisé · SEO-friendly (un seul H1 par page)
 * 
 * USAGE dans Home.jsx :
 *   import DynamicHero from '../components/DynamicHero';
 *   <DynamicHero isHomePage={true} />  // → génère le H1
 *   <DynamicHero isHomePage={false} /> // → génère un H2 (pages catégories, etc.)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaArrowRight } from 'react-icons/fa';
import api from '../../../../packages/shared/api/api';

/* ── Slides de secours (si API offline) ─────────────────────────────────── */
const FALLBACK_SLIDES = [
  {
    _id: 'fb1',
    title: 'Électronique & High-Tech à Dakar',
    subtitle: 'Livraison rapide partout au Sénégal',
    badge: '🚀 Meilleurs prix garantis',
    image: 'https://images.unsplash.com/photo-1593640408182-31c228edb56a?w=1920&q=80',
    overlay: 'rgba(10,10,30,0.65)',
    gradient: 'from-blue-900/60 via-transparent to-transparent',
    primaryCta: { text: 'Voir les produits', link: '/products', style: 'white' },
    secondaryCta: { text: 'Configurer mon PC', link: '/configurator', style: 'outline' },
    textPosition: 'left',
    stats: [{ value: '10K+', label: 'Clients' }, { value: '98%', label: 'Satisfaits' }, { value: '48h', label: 'Livraison' }],
  },
  {
    _id: 'fb2',
    title: 'Smartphones Dernière Génération',
    subtitle: 'iPhone 15, Samsung S24, Xiaomi — Stock disponible',
    badge: '📱 Nouveautés 2025',
    image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=1920&q=80',
    overlay: 'rgba(0,0,20,0.55)',
    gradient: 'from-indigo-900/60 via-transparent to-transparent',
    primaryCta: { text: 'Explorer', link: '/category/smartphones', style: 'white' },
    secondaryCta: { text: '', link: '', style: 'outline' },
    textPosition: 'left',
    stats: [],
  },
];

/* ── Composant Slide individuel ─────────────────────────────────────────── */
const SlideContent = ({ slide, isActive, index, isHomePage }) => {
  const posClass = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right',
  }[slide.textPosition || 'left'];

  /* CTA style mapping */
  const ctaStyle = {
    white: 'bg-white text-gray-900 hover:bg-gray-100 shadow-xl',
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl',
    outline: 'bg-white/10 backdrop-blur-sm border-2 border-white/60 text-white hover:bg-white/20',
  };

  /* Titre : H1 unique seulement sur la home pour le slide actif (index 0) */
  const TitleTag = (isHomePage && index === 0) ? 'h1' : 'h2';

  return (
    <div
      className={`absolute inset-0 flex flex-col justify-center px-5 sm:px-10 lg:px-20 transition-all duration-700 ${
        isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      } ${posClass}`}
    >
      {/* Badge */}
      {slide.badge && (
        <span className="inline-block mb-3 px-3 py-1 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full text-white text-xs sm:text-sm font-semibold tracking-wide">
          {slide.badge}
        </span>
      )}

      {/* Titre principal — SEO: H1 unique sur la home */}
      <TitleTag className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-3 sm:mb-4 max-w-3xl drop-shadow-sm">
        {slide.title}
      </TitleTag>

      {/* Sous-titre */}
      {slide.subtitle && (
        <p className="text-base sm:text-lg md:text-xl text-white/85 mb-4 sm:mb-6 max-w-xl leading-relaxed">
          {slide.subtitle}
        </p>
      )}

      {/* Description */}
      {slide.description && (
        <p className="hidden sm:block text-sm text-white/70 mb-5 max-w-lg leading-relaxed">
          {slide.description}
        </p>
      )}

      {/* Stats */}
      {(slide.stats || []).length > 0 && (
        <div className="flex flex-wrap gap-4 sm:gap-6 mb-5 sm:mb-8">
          {slide.stats.map((stat, i) => (
            <div key={i} className="text-left">
              <div className="text-xl sm:text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-[11px] sm:text-xs text-white/60 uppercase tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* CTAs */}
      <div className={`flex flex-col sm:flex-row gap-3 ${
        slide.textPosition === 'center' ? 'items-center justify-center' : 'items-start'
      }`}>
        {slide.primaryCta?.text && (
          <Link
            to={slide.primaryCta.link || '/products'}
            className={`inline-flex items-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all duration-200 active:scale-95 ${
              ctaStyle[slide.primaryCta.style || 'white']
            }`}
          >
            {slide.primaryCta.text}
            <FaArrowRight size={13} />
          </Link>
        )}
        {slide.secondaryCta?.text && (
          <Link
            to={slide.secondaryCta.link || '#'}
            className={`inline-flex items-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 active:scale-95 ${
              ctaStyle[slide.secondaryCta.style || 'outline']
            }`}
          >
            {slide.secondaryCta.text}
          </Link>
        )}
      </div>
    </div>
  );
};

/* ── Composant principal ────────────────────────────────────────────────── */
const DynamicHero = ({
  isHomePage = true,        // true → slide 0 génère un <h1>
  autoplayInterval = 5500,  // ms entre les slides
  height = 'h-[360px] sm:h-[460px] md:h-[540px] lg:h-[620px]',
}) => {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const [imgLoaded, setImgLoaded] = useState({});
  const timerRef = useRef(null);

  /* Chargement slides ───────────────────────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await api.get('/hero');
        if (!cancelled && data.slides?.length > 0) {
          setSlides(data.slides);
          // Précharger l'image du slide 0
          const img = new Image();
          img.src = data.slides[0].image;
        }
      } catch {
        if (!cancelled) setSlides(FALLBACK_SLIDES);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  /* Autoplay ───────────────────────────────────────────────────────────── */
  const next = useCallback(() => {
    setCurrent(c => (c + 1) % Math.max(slides.length, 1));
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent(c => (c - 1 + slides.length) % Math.max(slides.length, 1));
  }, [slides.length]);

  const goTo = useCallback((i) => setCurrent(i), []);

  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    timerRef.current = setInterval(next, autoplayInterval);
    return () => clearInterval(timerRef.current);
  }, [slides.length, paused, next, autoplayInterval]);

  /* Préchargement des images voisines ─────────────────────────────────── */
  useEffect(() => {
    if (!slides.length) return;
    const nextIdx = (current + 1) % slides.length;
    const prevIdx = (current - 1 + slides.length) % slides.length;
    [nextIdx, prevIdx].forEach(i => {
      if (!imgLoaded[slides[i]?._id] && slides[i]?.image) {
        const img = new Image();
        img.src = slides[i].image;
        img.onload = () => setImgLoaded(p => ({ ...p, [slides[i]._id]: true }));
      }
    });
  }, [current, slides]);

  /* Swipe touch ────────────────────────────────────────────────────────── */
  const touchRef = useRef(null);
  const handleTouchStart = (e) => { touchRef.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchRef.current === null) return;
    const delta = touchRef.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) delta > 0 ? next() : prev();
    touchRef.current = null;
  };

  /* Keyboard ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [prev, next]);

  /* Skeleton ───────────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <section
        className={`relative ${height} bg-gray-900 overflow-hidden`}
        aria-label="Chargement du hero"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-750 to-gray-800 animate-pulse" />
        <div className="absolute inset-0 flex flex-col justify-center px-5 sm:px-10 lg:px-20 gap-4">
          <div className="h-3 bg-white/10 rounded-full w-32 sm:w-48 animate-pulse" />
          <div className="h-8 sm:h-12 bg-white/10 rounded-xl w-3/4 sm:w-1/2 animate-pulse" />
          <div className="h-5 bg-white/10 rounded-lg w-2/3 sm:w-1/3 animate-pulse" />
          <div className="flex gap-3 mt-2">
            <div className="h-11 w-32 bg-white/10 rounded-xl animate-pulse" />
            <div className="h-11 w-32 bg-white/10 rounded-xl animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  if (!slides.length) return null;

  const slide = slides[current];

  return (
    <section
      className={`relative ${height} overflow-hidden bg-gray-900 select-none`}
      aria-label="Présentation Tekalis"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Images background ── */}
      {slides.map((s, i) => (
        <div
          key={s._id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === current ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden={i !== current}
        >
          {/* Image — mobile : mobileImage si dispo, sinon image principale */}
          <picture>
            {s.mobileImage && (
              <source media="(max-width: 640px)" srcSet={s.mobileImage} />
            )}
            <img
              src={s.image}
              alt={s.title}
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              fetchpriority={i === 0 ? 'high' : 'low'}
              className="absolute inset-0 w-full h-full object-cover"
              width="1920"
              height="800"
            />
          </picture>

          {/* Gradient directionnel */}
          {s.gradient && (
            <div className={`absolute inset-0 bg-gradient-to-r ${s.gradient}`} />
          )}

          {/* Overlay de lisibilité */}
          <div
            className="absolute inset-0"
            style={{ background: s.overlay || 'rgba(0,0,0,0.45)' }}
          />
        </div>
      ))}

      {/* ── Contenu des slides ── */}
      {slides.map((s, i) => (
        <SlideContent
          key={s._id}
          slide={s}
          isActive={i === current}
          index={i}
          isHomePage={isHomePage}
        />
      ))}

      {/* ── Contrôles de navigation (> 1 slide) ── */}
      {slides.length > 1 && (
        <>
          {/* Flèches — cachées sur mobile, visibles desktop */}
          <button
            onClick={prev}
            className="hidden sm:flex absolute left-3 lg:left-5 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 items-center justify-center bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white rounded-full transition z-10"
            aria-label="Slide précédent"
          >
            <FaChevronLeft size={16} />
          </button>
          <button
            onClick={next}
            className="hidden sm:flex absolute right-3 lg:right-5 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 items-center justify-center bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white rounded-full transition z-10"
            aria-label="Slide suivant"
          >
            <FaChevronRight size={16} />
          </button>

          {/* Indicateurs / dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Slide ${i + 1}`}
                aria-current={i === current}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-7 sm:w-8 h-2 bg-white'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>

          {/* Barre de progression */}
          {!paused && (
            <div
              key={`progress-${current}`}
              className="absolute bottom-0 left-0 h-0.5 bg-white/60"
              style={{
                animation: `progress ${autoplayInterval}ms linear forwards`,
                width: '0%',
              }}
            />
          )}
        </>
      )}

      {/* Indicateur swipe mobile */}
      {slides.length > 1 && (
        <div className="sm:hidden absolute bottom-10 right-4 text-white/40 text-[10px] flex items-center gap-1">
          <span>⟵ Swipe ⟶</span>
        </div>
      )}

      <style>{`
        @keyframes progress {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>
    </section>
  );
};

export default DynamicHero;
