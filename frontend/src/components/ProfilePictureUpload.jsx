import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageCropper from './ImageCropper';

/**
 * ProfilePictureUpload Component
 * 
 * Allows users to upload and interactively crop their profile picture
 * Features drag-to-move and resize crop area
 * 
 * @param {string} currentAvatarUrl - Current avatar URL
 * @param {string} userName - User's name for fallback avatar
 * @param {Function} onUpload - Callback when image is uploaded (receives File)
 * @param {boolean} loading - Loading state
 */
export default function ProfilePictureUpload({ 
  currentAvatarUrl, 
  userName = 'User',
  onUpload,
  loading = false 
}) {
  const [preview, setPreview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [imageKey, setImageKey] = useState(0); // Force re-render when avatar changes
  const fileInputRef = useRef(null);
  
  // Update image key when avatar URL changes to force reload
  useEffect(() => {
    // Extract base URL (without query params) to detect actual changes
    const baseUrl = currentAvatarUrl?.split('?')[0] || currentAvatarUrl;
    // Increment key whenever the base URL changes to force browser to reload image
    if (baseUrl) {
      setImageKey(prev => prev + 1);
    }
  }, [currentAvatarUrl]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      setShowModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (blob) => {
    if (blob) {
      const file = new File([blob], 'profile-picture.jpg', { type: 'image/jpeg' });
      onUpload(file);
      setShowModal(false);
      setPreview(null);
      setError('');
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setPreview(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      {/* Profile Picture Display with Click to Edit */}
      <div className="relative group">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => fileInputRef.current?.click()}
          className="relative cursor-pointer"
        >
          <img
            key={`avatar-${imageKey}-${currentAvatarUrl?.split('?')[0]}`} // Force re-render when key or URL changes
            src={(() => {
              if (!currentAvatarUrl) {
                return `https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(userName)}`;
              }
              // Remove any existing query params and add fresh cache-busting
              const baseUrl = currentAvatarUrl.split('?')[0];
              // Use both timestamp and key for maximum cache-busting
              const timestamp = Date.now();
              return `${baseUrl}?v=${timestamp}&k=${imageKey}&t=${timestamp}`;
            })()}
            alt={userName}
            className="w-32 h-32 rounded-3xl object-cover shadow-sticker-lg border-4 border-white/80 dark:border-slate-800/80"
            onLoad={() => {
              // Image loaded successfully
              setError('');
            }}
            onError={(e) => {
              // Fallback if image fails to load
              e.target.src = `https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(userName)}`;
              e.target.onerror = null; // Prevent infinite loop
              setError('Failed to load image');
            }}
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/40 dark:bg-black/60 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="text-white text-sm font-bold text-center px-2">
              {loading ? 'Uploading...' : 'Click to Change'}
            </div>
          </div>
          {/* Loading indicator */}
          {loading && (
            <div className="absolute inset-0 bg-black/20 rounded-3xl flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </motion.div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Crop Preview Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancel}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-floating border-2 border-slate-200 dark:border-slate-700 p-6 pointer-events-auto"
              >
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 font-heading">
                  Crop Your Profile Picture
                </h3>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-2xl bg-cartoon-red-50 dark:bg-cartoon-red-900/30 border-2 border-cartoon-red-200 dark:border-cartoon-red-700 text-cartoon-red-700 dark:text-cartoon-red-300 text-sm font-medium"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Interactive Image Cropper */}
                <ImageCropper
                  imageSrc={preview}
                  outputSize={400}
                  onCrop={handleCropComplete}
                  onCancel={handleCancel}
                />
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

