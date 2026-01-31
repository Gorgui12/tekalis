import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const HeroSection = ({ slides, autoplay = true, interval = 5000 }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Navigation
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Autoplay
  useEffect(() => {
    if (!autoplay || slides.length <= 1) return;

    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [autoplay, interval, slides.length]);

  if (!slides || slides.length === 0) {
    return null;
  }

  return (
    <section className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden bg-gray-900">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id || index}
          className={`absolute inset-0 transition-all duration-1000 ${
            index === currentSlide 
              ? "opacity-100 scale-100" 
              : "opacity-0 scale-105"
          }`}
        >
          {/* Background Image */}
          {slide.image && (
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="absolute inset-0 bg-black/40"></div>
            </div>
          )}

          {/* Gradient Background */}
          {slide.bg && (
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.bg}`}></div>
          )}

          {/* Content */}
          <div className="relative h-full container mx-auto px-4 flex items-center">
            <div className="max-w-2xl text-white">
              {/* Badge */}
              {slide.badge && (
                <span className="inline-block bg-white/20 px-4 py-2 rounded-full text-sm font-bold mb-4 backdrop-blur-sm animate-pulse">
                  {slide.badge}
                </span>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight animate-fade-in-up">
                {slide.title}
              </h1>

              {/* Subtitle */}
              {slide.subtitle && (
                <p className="text-lg md:text-xl lg:text-2xl mb-6 text-white/90 animate-fade-in-up animation-delay-200">
                  {slide.subtitle}
                </p>
              )}

              {/* Description */}
              {slide.description && (
                <p className="text-base md:text-lg mb-8 text-white/80 animate-fade-in-up animation-delay-400">
                  {slide.description}
                </p>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 animate-fade-in-up animation-delay-600">
                {slide.cta && slide.link && (
                  <Link
                    to={slide.link}
                    className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold text-base md:text-lg hover:bg-gray-100 transition shadow-xl transform hover:scale-105"
                  >
                    {slide.cta}
                    <span>→</span>
                  </Link>
                )}

                {slide.secondaryCta && slide.secondaryLink && (
                  <Link
                    to={slide.secondaryLink}
                    className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold text-base md:text-lg hover:bg-white/30 transition border-2 border-white/50"
                  >
                    {slide.secondaryCta}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 md:p-3 rounded-full transition z-10 group"
            aria-label="Slide précédent"
          >
            <FaChevronLeft size={20} className="md:text-2xl group-hover:scale-110 transition" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 md:p-3 rounded-full transition z-10 group"
            aria-label="Slide suivant"
          >
            <FaChevronRight size={20} className="md:text-2xl group-hover:scale-110 transition" />
          </button>
        </>
      )}

      {/* Dots Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide 
                  ? "bg-white w-8" 
                  : "bg-white/50 w-2 hover:bg-white/70"
              }`}
              aria-label={`Aller au slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar (optionnel) */}
      {autoplay && slides.length > 1 && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
          <div 
            className="h-full bg-white transition-all"
            style={{
              width: `${((currentSlide + 1) / slides.length) * 100}%`
            }}
          />
        </div>
      )}
    </section>
  );
};

export default HeroSection;