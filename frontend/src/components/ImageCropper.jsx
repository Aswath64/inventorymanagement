import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

/**
 * Interactive Image Cropper Component
 * 
 * Allows users to drag and resize a crop area on an image
 * Maintains square aspect ratio for profile pictures
 * 
 * @param {string} imageSrc - Source image URL/data URL
 * @param {number} outputSize - Output image size (default: 400)
 * @param {Function} onCrop - Callback with cropped image blob
 * @param {Function} onCancel - Cancel callback
 */
export default function ImageCropper({ imageSrc, outputSize = 400, onCrop, onCancel }) {
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, size: 200 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropStart, setCropStart] = useState({ x: 0, y: 0, size: 0 });
  
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const canvasRef = useRef(null);

  // Load image dimensions and set initial crop area
  useEffect(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.onload = () => {
      const container = containerRef.current;
      if (!container) return;

      // Wait for container to be measured
      const updateSize = () => {
        const containerWidth = container.clientWidth - 32; // Account for padding
        const containerHeight = Math.min(400, window.innerHeight * 0.5);
        
        // Calculate scale to fit image in container
        const scaleX = containerWidth / img.width;
        const scaleY = containerHeight / img.height;
        const scale = Math.min(scaleX, scaleY, 1); // Don't scale up

        const displayWidth = img.width * scale;
        const displayHeight = img.height * scale;

        const newImageSize = {
          width: displayWidth,
          height: displayHeight,
          naturalWidth: img.width,
          naturalHeight: img.height,
          scale: scale
        };

        setImageSize(newImageSize);

        // Set initial crop area (centered, 60% of smaller dimension)
        const initialSize = Math.min(displayWidth, displayHeight) * 0.6;
        setCropArea({
          x: (displayWidth - initialSize) / 2,
          y: (displayHeight - initialSize) / 2,
          size: initialSize
        });
      };

      // Try immediately, then retry after a short delay
      updateSize();
      setTimeout(updateSize, 100);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Handle mouse/touch events for dragging
  const handleStart = useCallback((clientX, clientY) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Check if clicking on resize handle (bottom-right corner)
    const handleSize = 20;
    const handleX = cropArea.x + cropArea.size - handleSize / 2;
    const handleY = cropArea.y + cropArea.size - handleSize / 2;
    const distance = Math.sqrt(
      Math.pow(x - handleX, 2) + Math.pow(y - handleY, 2)
    );

    if (distance < handleSize) {
      setIsResizing(true);
    } else if (
      x >= cropArea.x &&
      x <= cropArea.x + cropArea.size &&
      y >= cropArea.y &&
      y <= cropArea.y + cropArea.size
    ) {
      setIsDragging(true);
      setDragStart({ x: x - cropArea.x, y: y - cropArea.y });
    }

    setCropStart(cropArea);
  }, [cropArea]);

  const handleMove = useCallback((clientX, clientY) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (isDragging) {
      // Move crop area
      let newX = x - dragStart.x;
      let newY = y - dragStart.y;

      // Constrain to image bounds
      newX = Math.max(0, Math.min(newX, imageSize.width - cropArea.size));
      newY = Math.max(0, Math.min(newY, imageSize.height - cropArea.size));

      setCropArea(prev => ({ ...prev, x: newX, y: newY }));
    } else if (isResizing) {
      // Resize crop area (maintain square)
      const centerX = cropStart.x + cropStart.size / 2;
      const centerY = cropStart.y + cropStart.size / 2;
      
      const deltaX = x - centerX;
      const deltaY = y - centerY;
      const delta = Math.max(Math.abs(deltaX), Math.abs(deltaY));
      
      let newSize = cropStart.size + (deltaX > 0 || deltaY > 0 ? delta : -delta) * 2;
      
      // Constrain size
      const minSize = 50;
      const maxSize = Math.min(imageSize.width, imageSize.height);
      newSize = Math.max(minSize, Math.min(newSize, maxSize));

      // Calculate new position to keep center
      const sizeDelta = newSize - cropStart.size;
      let newX = cropStart.x - sizeDelta / 2;
      let newY = cropStart.y - sizeDelta / 2;

      // Constrain to image bounds
      newX = Math.max(0, Math.min(newX, imageSize.width - newSize));
      newY = Math.max(0, Math.min(newY, imageSize.height - newSize));

      setCropArea({ x: newX, y: newY, size: newSize });
    }
  }, [isDragging, isResizing, dragStart, cropStart, imageSize, cropArea.size]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  // Mouse events
  useEffect(() => {
    const handleMouseMove = (e) => handleMove(e.clientX, e.clientY);
    const handleMouseUp = () => handleEnd();

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMove, handleEnd]);

  // Touch events
  useEffect(() => {
    const handleTouchMove = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (touch) handleMove(touch.clientX, touch.clientY);
    };
    const handleTouchEnd = () => handleEnd();

    if (isDragging || isResizing) {
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
      return () => {
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, isResizing, handleMove, handleEnd]);

  // Perform crop
  const performCrop = () => {
    if (!imageSrc || !canvasRef.current) return;

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      canvas.width = outputSize;
      canvas.height = outputSize;

      // Calculate crop coordinates in original image space
      const scale = imageSize.scale;
      const sourceX = cropArea.x / scale;
      const sourceY = cropArea.y / scale;
      const sourceSize = cropArea.size / scale;

      // Draw cropped and resized image
      ctx.drawImage(
        img,
        sourceX, sourceY, sourceSize, sourceSize,
        0, 0, outputSize, outputSize
      );

      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob && onCrop) {
          onCrop(blob);
        }
      }, 'image/jpeg', 0.9);
    };
    img.src = imageSrc;
  };

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
        Drag to move • Drag corner to resize
      </p>

      {/* Image Container with Crop Area */}
      <div
        ref={containerRef}
        className="relative mx-auto bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden flex items-center justify-center"
        style={{ maxWidth: '100%', minHeight: '300px', padding: '16px' }}
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
        onTouchStart={(e) => {
          e.preventDefault();
          const touch = e.touches[0];
          if (touch) handleStart(touch.clientX, touch.clientY);
        }}
      >
        {/* Image */}
        <img
          ref={imageRef}
          src={imageSrc}
          alt="Crop"
          className="block max-w-full h-auto"
          style={{ width: imageSize.width, height: imageSize.height }}
          draggable={false}
        />

        {/* Dark Overlay - Shows darkened areas outside crop */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `rgba(0, 0, 0, 0.5)`,
            clipPath: `polygon(
              0% 0%, 
              0% 100%, 
              ${(cropArea.x / imageSize.width) * 100}% 100%, 
              ${(cropArea.x / imageSize.width) * 100}% ${(cropArea.y / imageSize.height) * 100}%, 
              ${((cropArea.x + cropArea.size) / imageSize.width) * 100}% ${(cropArea.y / imageSize.height) * 100}%, 
              ${((cropArea.x + cropArea.size) / imageSize.width) * 100}% ${((cropArea.y + cropArea.size) / imageSize.height) * 100}%, 
              ${(cropArea.x / imageSize.width) * 100}% ${((cropArea.y + cropArea.size) / imageSize.height) * 100}%, 
              ${(cropArea.x / imageSize.width) * 100}% 100%, 
              100% 100%, 
              100% 0%
            )`
          }}
        />

        {/* Crop Area Border */}
        <div
          className="absolute border-4 border-cartoon-blue-500 shadow-sticker-lg pointer-events-none"
          style={{
            left: `${cropArea.x}px`,
            top: `${cropArea.y}px`,
            width: `${cropArea.size}px`,
            height: `${cropArea.size}px`,
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
        >
          {/* Resize Handle */}
          <div
            className="absolute bottom-0 right-0 w-6 h-6 bg-cartoon-blue-500 border-2 border-white rounded-full shadow-sticker cursor-nwse-resize"
            style={{
              transform: 'translate(50%, 50%)',
            }}
          />
        </div>
      </div>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Actions */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 rounded-2xl border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          Cancel
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={performCrop}
          className="flex-1 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cartoon-blue-500 to-cartoon-purple-500 text-white font-bold shadow-sticker-lg hover:shadow-floating transition-all"
        >
          Crop & Save
        </motion.button>
      </div>
    </div>
  );
}

