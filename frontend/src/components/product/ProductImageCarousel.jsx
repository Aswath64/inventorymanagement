import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ProductImageCarousel Component
 * 
 * Displays product images with automatic rotation and manual controls.
 * - Auto-rotates every 2 seconds
 * - Pauses on hover
 * - Manual prev/next buttons
 * - Dot indicators
 * - Smooth fade transitions
 */
export default function ProductImageCarousel({ 
  images = [], 
  productName = 'Product',
  autoRotate = true,
  rotationInterval = 2000,
  className = '',
  aspectRatio = '4/3' // Can be '4/3', '16/9', '1/1', etc.
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-rotate logic
  useEffect(() => {
    if (!autoRotate || images.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [images.length, autoRotate, rotationInterval, isPaused]);

  // Reset to first image when images change
  useEffect(() => {
    setCurrentIndex(0);
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div 
        className={`relative overflow-hidden rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center ${className}`}
        style={{ aspectRatio }}
      >
        <img
          src="/placeholder.png"
          alt={productName}
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            e.target.src = '/placeholder.png';
            e.target.onerror = null;
          }}
        />
      </div>
    );
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToIndex = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 ${className}`}
      style={{ aspectRatio }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main Image Container - Ensures proper fitting */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex] || '/placeholder.png'}
            alt={`${productName} - Image ${currentIndex + 1}`}
            className="w-full h-full object-cover object-center"
            style={{ 
              objectFit: 'cover',
              objectPosition: 'center',
              maxWidth: '100%',
              maxHeight: '100%',
            }}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            onError={(e) => {
              e.target.src = '/placeholder.png';
              e.target.onerror = null;
            }}
            loading="lazy"
          />
        </AnimatePresence>
      </div>

      {/* Navigation Buttons (only show if more than 1 image) - Enhanced with cartoon style */}
      {images.length > 1 && (
        <>
          <motion.button
            onClick={goToPrevious}
            whileHover={{ scale: 1.15, x: -2 }}
            whileTap={{ scale: 0.9 }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-md shadow-sticker flex items-center justify-center text-cartoon-blue-600 dark:text-cartoon-blue-400 hover:bg-white dark:hover:bg-slate-700 transition-all z-10 border-2 border-cartoon-blue-200 dark:border-cartoon-blue-700"
            aria-label="Previous image"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>

          <motion.button
            onClick={goToNext}
            whileHover={{ scale: 1.15, x: 2 }}
            whileTap={{ scale: 0.9 }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-md shadow-sticker flex items-center justify-center text-cartoon-blue-600 dark:text-cartoon-blue-400 hover:bg-white dark:hover:bg-slate-700 transition-all z-10 border-2 border-cartoon-blue-200 dark:border-cartoon-blue-700"
            aria-label="Next image"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        </>
      )}

      {/* Dot Indicators (only show if more than 1 image) - Enhanced with cartoon style */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10 px-3 py-2 rounded-full bg-black/20 dark:bg-black/40 backdrop-blur-sm">
          {images.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => goToIndex(index)}
              whileHover={{ scale: 1.3, y: -2 }}
              whileTap={{ scale: 0.9 }}
              className={`rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white dark:bg-cartoon-blue-300 w-8 h-2.5 shadow-sticker'
                  : 'bg-white/60 dark:bg-slate-400/60 hover:bg-white/80 dark:hover:bg-slate-300/80 w-2 h-2'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Image Counter (optional, shows "1 / 3" style) - Enhanced with cartoon style */}
      {images.length > 1 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 right-4 bg-gradient-to-r from-cartoon-blue-500 to-cartoon-purple-500 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full z-10 shadow-sticker border-2 border-white/30"
        >
          {currentIndex + 1} / {images.length}
        </motion.div>
      )}
    </div>
  );
}

