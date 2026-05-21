import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaSearchPlus, FaTimes, FaSearchMinus } from 'react-icons/fa';

/**
 * Composant ImageZoom pour zoomer sur les images produits
 */
const ImageZoom = ({ 
  src, 
  alt,
  thumbnail = null,
  className = '',
  zoomLevel = 2
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePosition({ x, y });
  };

  return (
    <>
      {/* Image normale avec hover */}
      <div 
        className={`relative group cursor-zoom-in ${className}`}
        onClick={() => setIsZoomed(true)}
        onMouseMove={handleMouseMove}
      >
        <img 
          src={thumbnail || src} 
          alt={alt} 
          className="w-full h-full object-contain"
        />
        
        {/* Overlay hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white rounded-full p-3 shadow-lg">
            <FaSearchPlus className="text-gray-700 text-2xl" />
          </div>
        </div>
      </div>

      {/* Modal Zoom */}
      {isZoomed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          {/* Boutons de contrôle */}
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <button
              className="bg-white hover:bg-gray-100 text-gray-700 p-3 rounded-full shadow-lg transition"
              onClick={() => setIsZoomed(false)}
              aria-label="Fermer le zoom"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>

          {/* Image zoomée */}
          <div 
            className="relative max-w-full max-h-full overflow-hidden cursor-zoom-out"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={src} 
              alt={alt} 
              className="max-w-full max-h-[90vh] object-contain select-none"
              style={{
                transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                transform: `scale(${zoomLevel})`,
                transition: 'transform 0.2s ease-out'
              }}
              draggable={false}
              onMouseMove={handleMouseMove}
            />
          </div>

          {/* Instructions */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 px-4 py-2 rounded-full shadow-lg">
            <p className="text-sm text-gray-700 font-medium">
              Déplacez la souris pour zoomer • Cliquez pour fermer
            </p>
          </div>
        </div>
      )}
    </>
  );
};

ImageZoom.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  thumbnail: PropTypes.string,
  className: PropTypes.string,
  zoomLevel: PropTypes.number
};

export default ImageZoom;

/**
 * Version avancée avec gallery
 */
export const ImageGalleryZoom = ({ 
  images, // Array of { src, alt, thumbnail }
  initialIndex = 0,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const currentImage = images[currentIndex];

  return (
    <>
      <div className={`relative group cursor-pointer ${className}`}>
        <img 
          src={currentImage.thumbnail || currentImage.src} 
          alt={currentImage.alt} 
          className="w-full h-full object-contain"
          onClick={() => setIsZoomed(true)}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
          <FaSearchPlus className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-4xl drop-shadow-lg" />
        </div>
      </div>

      {isZoomed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center"
          onClick={() => setIsZoomed(false)}
        >
          <button
            className="absolute top-4 right-4 bg-white hover:bg-gray-100 text-gray-700 p-3 rounded-full shadow-lg transition z-10"
            onClick={() => setIsZoomed(false)}
          >
            <FaTimes className="text-xl" />
          </button>

          {images.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-100 text-gray-700 p-3 rounded-full shadow-lg transition z-10"
                onClick={handlePrev}
                aria-label="Image précédente"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-100 text-gray-700 p-3 rounded-full shadow-lg transition z-10"
                onClick={handleNext}
                aria-label="Image suivante"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          <img 
            src={currentImage.src} 
            alt={currentImage.alt} 
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 px-4 py-2 rounded-full shadow-lg">
              <p className="text-sm text-gray-700 font-medium">
                {currentIndex + 1} / {images.length}
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

ImageGalleryZoom.propTypes = {
  images: PropTypes.arrayOf(PropTypes.shape({
    src: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired,
    thumbnail: PropTypes.string
  })).isRequired,
  initialIndex: PropTypes.number,
  className: PropTypes.string
};

/**
 * UTILISATION:
 * 
 * // Simple
 * <ImageZoom 
 *   src="/path/to/image.jpg" 
 *   alt="Product image"
 * />
 * 
 * // Avec thumbnail
 * <ImageZoom 
 *   src="/path/to/full-image.jpg"
 *   thumbnail="/path/to/thumbnail.jpg"
 *   alt="Product image"
 * />
 * 
 * // Gallery avec plusieurs images
 * <ImageGalleryZoom
 *   images={[
 *     { src: '/img1.jpg', alt: 'Image 1' },
 *     { src: '/img2.jpg', alt: 'Image 2' },
 *     { src: '/img3.jpg', alt: 'Image 3' }
 *   ]}
 * />
 */