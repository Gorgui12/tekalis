import { useState } from "react";
import { FaTimes, FaChevronLeft, FaChevronRight, FaSearchPlus } from "react-icons/fa";

/**
 * ProductGallery - Score 9/10
 * Gallery avec zoom et lightbox
 */
const ProductGallery = ({ images = [], productName = "" }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Fallback si pas d'images
  const galleryImages = images.length > 0 
    ? images 
    : [{ url: "/images/no-image.webp", isPrimary: true }];

  const currentImage = galleryImages[selectedIndex];

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isLightboxOpen) return;
    
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  };

  return (
    <div className="space-y-4">
      {/* Image principale */}
      <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden aspect-square group">
        <img
          src={currentImage.url}
          alt={productName}
          className="w-full h-full object-contain p-8 cursor-zoom-in"
          onClick={() => openLightbox(selectedIndex)}
        />
        
        {/* Bouton zoom */}
        <button
          onClick={() => openLightbox(selectedIndex)}
          className="absolute top-4 right-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600 hover:text-white"
          aria-label="Zoom"
        >
          <FaSearchPlus size={20} />
        </button>

        {/* Navigation si plusieurs images */}
        {galleryImages.length > 1 && (
          <>
            <button
              onClick={() => setSelectedIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 p-2 rounded-full shadow-lg hover:bg-blue-600 hover:text-white transition opacity-0 group-hover:opacity-100"
              aria-label="Image précédente"
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={() => setSelectedIndex((prev) => (prev + 1) % galleryImages.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 p-2 rounded-full shadow-lg hover:bg-blue-600 hover:text-white transition opacity-0 group-hover:opacity-100"
              aria-label="Image suivante"
            >
              <FaChevronRight />
            </button>
          </>
        )}

        {/* Indicateur */}
        {galleryImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {selectedIndex + 1} / {galleryImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {galleryImages.length > 1 && (
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
          {galleryImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border-2 transition ${
                index === selectedIndex
                  ? 'border-blue-600 dark:border-blue-400'
                  : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <img
                src={image.url}
                alt={`${productName} ${index + 1}`}
                className="w-full h-full object-contain p-2"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-red-500 transition p-2"
            aria-label="Fermer"
          >
            <FaTimes size={32} />
          </button>

          {/* Image */}
          <div className="relative max-w-7xl max-h-screen p-8" onClick={(e) => e.stopPropagation()}>
            <img
              src={galleryImages[lightboxIndex].url}
              alt={productName}
              className="max-w-full max-h-[90vh] object-contain"
            />

            {/* Navigation */}
            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-4 rounded-full transition"
                  aria-label="Image précédente"
                >
                  <FaChevronLeft size={24} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-4 rounded-full transition"
                  aria-label="Image suivante"
                >
                  <FaChevronRight size={24} />
                </button>

                {/* Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full">
                  {lightboxIndex + 1} / {galleryImages.length}
                </div>
              </>
            )}
          </div>

          {/* Instructions */}
          <div className="absolute bottom-4 left-4 text-white/70 text-sm">
            <p>← → pour naviguer • ESC pour fermer</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductGallery;