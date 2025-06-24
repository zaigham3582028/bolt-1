import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  Heart, 
  Share2,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageViewerProps {
  src: string;
  alt?: string;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
  images?: string[];
  currentIndex?: number;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  src,
  alt = 'Image',
  isOpen,
  onClose,
  onNext,
  onPrevious,
  onToggleFavorite,
  isFavorite = false,
  images = [],
  currentIndex = 0
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showControls, setShowControls] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset transformations when opening
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, src]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          onPrevious?.();
          break;
        case 'ArrowRight':
          onNext?.();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case '0':
          resetTransform();
          break;
        case 'r':
          handleRotate();
          break;
        case 'f':
          onToggleFavorite?.();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNext, onPrevious, onToggleFavorite]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.1));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const resetTransform = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = alt || 'image';
    link.click();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Top Controls */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              className="absolute top-4 left-4 right-4 flex justify-between items-center z-10"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
            >
              <div className="flex items-center gap-2">
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
                >
                  <X className="h-5 w-5" />
                </Button>
                <span className="text-white/70 text-sm">
                  {images.length > 0 && `${currentIndex + 1} / ${images.length}`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowInfo(!showInfo)}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
                >
                  <Info className="h-5 w-5" />
                </Button>
                <Button
                  onClick={onToggleFavorite}
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "text-white hover:bg-white/20 hover:text-white backdrop-blur-sm",
                    isFavorite && "text-red-500"
                  )}
                >
                  <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
                </Button>
                <Button
                  onClick={handleDownload}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
                >
                  <Download className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <AnimatePresence>
              {showControls && onPrevious && (
                <motion.div
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                >
                  <Button
                    onClick={onPrevious}
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 hover:text-white backdrop-blur-sm w-12 h-12"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showControls && onNext && (
                <motion.div
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                >
                  <Button
                    onClick={onNext}
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 hover:text-white backdrop-blur-sm w-12 h-12"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Bottom Controls */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
            >
              <div className="bg-black/40 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center gap-2">
                <Button
                  onClick={handleZoomOut}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 hover:text-white"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                
                <span className="text-white text-sm font-medium min-w-[60px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                
                <Button
                  onClick={handleZoomIn}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 hover:text-white"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>

                <div className="w-px h-6 bg-white/20 mx-1" />

                <Button
                  onClick={handleRotate}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 hover:text-white"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>

                <Button
                  onClick={resetTransform}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 hover:text-white text-xs"
                >
                  Reset
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 hover:text-white"
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Panel */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              className="absolute top-16 right-4 bg-black/80 backdrop-blur-md rounded-xl p-4 border border-white/10 min-w-[250px] z-10"
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
            >
              <h3 className="text-white font-semibold mb-3">Image Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-white/70">
                  <span>Name:</span>
                  <span className="text-white">{alt}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Zoom:</span>
                  <span className="text-white">{Math.round(zoom * 100)}%</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Rotation:</span>
                  <span className="text-white">{rotation}°</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Image Container */}
        <div
          ref={containerRef}
          className="absolute inset-0 flex items-center justify-center overflow-hidden"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        >
          <motion.img
            ref={imageRef}
            src={src}
            alt={alt}
            className="max-w-none max-h-none object-contain select-none"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out'
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onDoubleClick={zoom === 1 ? handleZoomIn : resetTransform}
            draggable={false}
          />
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && showControls && (
          <motion.div
            className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
          >
            <div className="bg-black/40 backdrop-blur-md rounded-xl p-2 border border-white/10 flex gap-2 max-w-sm overflow-x-auto">
              {images.slice(Math.max(0, currentIndex - 2), currentIndex + 3).map((image, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "w-12 h-12 rounded-lg overflow-hidden border-2 cursor-pointer",
                    idx === 2 ? "border-white" : "border-white/20"
                  )}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${idx}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageViewer;