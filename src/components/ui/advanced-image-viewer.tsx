import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, RotateCw, Download, Heart, Share2, ChevronLeft, ChevronRight, Maximize, Info, Settings, Grid, Eye, EyeOff, Crop, Palette, Filter, Sun, Contrast, Droplets, Zap, RotateCcw, FlipHorizontal, FlipVertical, Move, MousePointer, Square, Circle, Home, Folder, Copy, Trash2, Edit, Maximize2, Minimize2, Monitor, Smartphone, Tablet, Fullscreen, Fullscreen as FullscreenExit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdvancedImageViewerProps {
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

const AdvancedImageViewer: React.FC<AdvancedImageViewerProps> = ({
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
  const [showSettings, setShowSettings] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [fitMode, setFitMode] = useState<'fit' | 'fill' | 'actual'>('fit');
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Image adjustments
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [hue, setHue] = useState(0);
  const [blur, setBlur] = useState(0);
  const [sepia, setSepia] = useState(0);
  const [grayscale, setGrayscale] = useState(0);
  
  // ImageGlass-like features
  const [slideshow, setSlideshow] = useState(false);
  const [slideshowInterval, setSlideshowInterval] = useState(3000);
  const [showNavigationDots, setShowNavigationDots] = useState(true);
  const [enableMouseGestures, setEnableMouseGestures] = useState(true);
  const [backgroundOpacity, setBackgroundOpacity] = useState(95);
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-hide controls timer
  const hideControlsTimer = useRef<NodeJS.Timeout>();

  const resetHideTimer = useCallback(() => {
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
    }
    setShowControls(true);
    hideControlsTimer.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Reset transformations when opening
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      setFlipHorizontal(false);
      setFlipVertical(false);
      setBrightness(100);
      setContrast(100);
      setSaturation(100);
      setHue(0);
      setBlur(0);
      setSepia(0);
      setGrayscale(0);
      setFitMode('fit');
      resetHideTimer();
    }
  }, [isOpen, src, resetHideTimer]);

  // Slideshow effect
  useEffect(() => {
    if (slideshow && images.length > 1) {
      const interval = setInterval(() => {
        onNext?.();
      }, slideshowInterval);
      return () => clearInterval(interval);
    }
  }, [slideshow, slideshowInterval, onNext, images.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      resetHideTimer();
      
      switch (e.key) {
        case 'Escape':
          if (isFullscreen) {
            setIsFullscreen(false);
          } else {
            onClose();
          }
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
        case 'i':
          setShowInfo(!showInfo);
          break;
        case 't':
          setShowThumbnails(!showThumbnails);
          break;
        case ' ':
          e.preventDefault();
          setSlideshow(!slideshow);
          break;
        case 'F11':
          e.preventDefault();
          setIsFullscreen(!isFullscreen);
          break;
        case 'h':
          setFlipHorizontal(!flipHorizontal);
          break;
        case 'v':
          setFlipVertical(!flipVertical);
          break;
        case '1':
          setFitMode('actual');
          setZoom(1);
          break;
        case '2':
          setFitMode('fit');
          break;
        case '3':
          setFitMode('fill');
          break;
      }
    };

    const handleMouseMove = () => {
      resetHideTimer();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousemove', handleMouseMove);
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current);
      }
    };
  }, [isOpen, onClose, onNext, onPrevious, onToggleFavorite, showInfo, showThumbnails, slideshow, isFullscreen, flipHorizontal, flipVertical, resetHideTimer]);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev * 1.2, 10));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev / 1.2, 0.1));
  }, []);

  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  const resetTransform = useCallback(() => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    setFlipHorizontal(false);
    setFlipVertical(false);
  }, []);

  const resetAdjustments = useCallback(() => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setHue(0);
    setBlur(0);
    setSepia(0);
    setGrayscale(0);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom > 1 || fitMode === 'actual') {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  }, [zoom, position, fitMode]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && (zoom > 1 || fitMode === 'actual')) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, zoom, dragStart, fitMode]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    resetHideTimer();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  }, [handleZoomIn, handleZoomOut, resetHideTimer]);

  const handleDownload = useCallback(() => {
    const link = document.createElement('a');
    link.href = src;
    link.download = alt || 'image';
    link.click();
  }, [src, alt]);

  const handleDoubleClick = useCallback(() => {
    if (zoom === 1) {
      handleZoomIn();
    } else {
      resetTransform();
    }
  }, [zoom, handleZoomIn, resetTransform]);

  const CustomSlider = ({ 
    value, 
    onChange, 
    min = 0, 
    max = 200, 
    step = 1,
    label 
  }: {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    label: string;
  }) => (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-white/70">{label}</span>
        <span className="text-white">{value}{label.includes('%') ? '%' : ''}</span>
      </div>
      <div
        className="relative w-full h-2 bg-white/20 rounded-full cursor-pointer"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const percentage = x / rect.width;
          const newValue = min + (max - min) * percentage;
          onChange(Math.round(newValue / step) * step);
        }}
      >
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
          style={{ width: `${((value - min) / (max - min)) * 100}%` }}
        />
        <div
          className="absolute w-4 h-4 bg-white rounded-full shadow-lg transform -translate-y-1"
          style={{ left: `${((value - min) / (max - min)) * 100}%`, transform: 'translateX(-50%) translateY(-25%)' }}
        />
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={cn(
          "fixed inset-0 z-50 backdrop-blur-sm",
          isFullscreen ? "bg-black" : "bg-black"
        )}
        style={{ backgroundColor: `rgba(0, 0, 0, ${backgroundOpacity / 100})` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Top Toolbar - ImageGlass Style */}
        <AnimatePresence>
          {showControls && showToolbar && (
            <motion.div
              className="absolute top-0 left-0 right-0 bg-black/80 backdrop-blur-md border-b border-white/10 z-20"
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -60, opacity: 0 }}
            >
              <div className="flex items-center justify-between px-4 py-3">
                {/* Left Section */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setShowThumbnails(!showThumbnails)}
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "text-white hover:bg-white/20",
                      showThumbnails && "bg-white/20"
                    )}
                  >
                    <Grid className="h-5 w-5" />
                  </Button>
                  <Button
                    onClick={() => setSlideshow(!slideshow)}
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "text-white hover:bg-white/20",
                      slideshow && "bg-white/20"
                    )}
                  >
                    <Zap className="h-5 w-5" />
                  </Button>
                  <div className="h-6 w-px bg-white/20" />
                  <Button
                    onClick={() => setShowInfo(!showInfo)}
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "text-white hover:bg-white/20",
                      showInfo && "bg-white/20"
                    )}
                  >
                    <Info className="h-5 w-5" />
                  </Button>
                  <Button
                    onClick={onToggleFavorite}
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "text-white hover:bg-white/20",
                      isFavorite && "text-red-500"
                    )}
                  >
                    <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
                  </Button>
                  <div className="h-6 w-px bg-white/20" />
                  <Button
                    onClick={handleDownload}
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                  >
                    <Download className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                  <div className="h-6 w-px bg-white/20" />
                  <Button
                    onClick={() => setShowSettings(!showSettings)}
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "text-white hover:bg-white/20",
                      showSettings && "bg-white/20"
                    )}
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                </div>

                {/* Center Section - File Info */}
                <div className="flex items-center gap-4 text-white">
                  <span className="text-sm font-medium">{alt}</span>
                  {images.length > 0 && (
                    <span className="text-sm text-white/70">
                      {currentIndex + 1} / {images.length}
                    </span>
                  )}
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                  >
                    {isFullscreen ? <FullscreenExit className="h-5 w-5" /> : <Fullscreen className="h-5 w-5" />}
                  </Button>
                  <Button
                    onClick={onClose}
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
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
                    className="text-white hover:bg-white/20 backdrop-blur-sm w-12 h-12 rounded-full"
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
                    className="text-white hover:bg-white/20 backdrop-blur-sm w-12 h-12 rounded-full"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Bottom Controls - Centered */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
            >
              <div className="bg-black/80 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center gap-2">
                <Button
                  onClick={handleZoomOut}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
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
                  className="text-white hover:bg-white/20"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>

                <div className="w-px h-6 bg-white/20 mx-1" />

                <Button
                  onClick={() => setFlipHorizontal(!flipHorizontal)}
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "text-white hover:bg-white/20",
                    flipHorizontal && "bg-white/20"
                  )}
                >
                  <FlipHorizontal className="h-4 w-4" />
                </Button>

                <Button
                  onClick={() => setFlipVertical(!flipVertical)}
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "text-white hover:bg-white/20",
                    flipVertical && "bg-white/20"
                  )}
                >
                  <FlipVertical className="h-4 w-4" />
                </Button>

                <Button
                  onClick={handleRotate}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>

                <div className="w-px h-6 bg-white/20 mx-1" />

                <Button
                  onClick={() => {
                    setFitMode('fit');
                    setZoom(1);
                    setPosition({ x: 0, y: 0 });
                  }}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "text-white hover:bg-white/20 text-xs",
                    fitMode === 'fit' && "bg-white/20"
                  )}
                >
                  Fit
                </Button>

                <Button
                  onClick={() => {
                    setFitMode('fill');
                    setZoom(1);
                    setPosition({ x: 0, y: 0 });
                  }}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "text-white hover:bg-white/20 text-xs",
                    fitMode === 'fill' && "bg-white/20"
                  )}
                >
                  Fill
                </Button>

                <Button
                  onClick={() => {
                    setFitMode('actual');
                    setZoom(1);
                    setPosition({ x: 0, y: 0 });
                  }}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "text-white hover:bg-white/20 text-xs",
                    fitMode === 'actual' && "bg-white/20"
                  )}
                >
                  1:1
                </Button>

                <div className="w-px h-6 bg-white/20 mx-1" />

                <Button
                  onClick={resetTransform}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 text-xs"
                >
                  Reset
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              className="absolute top-16 right-4 bg-black/90 backdrop-blur-md rounded-xl p-6 border border-white/10 min-w-[320px] max-h-[600px] overflow-y-auto z-10"
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
            >
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Image Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-white/80 font-medium mb-3">Color Adjustments</h4>
                  <div className="space-y-3">
                    <CustomSlider
                      label="Brightness"
                      value={brightness}
                      onChange={setBrightness}
                      min={0}
                      max={200}
                    />
                    
                    <CustomSlider
                      label="Contrast"
                      value={contrast}
                      onChange={setContrast}
                      min={0}
                      max={200}
                    />
                    
                    <CustomSlider
                      label="Saturation"
                      value={saturation}
                      onChange={setSaturation}
                      min={0}
                      max={200}
                    />
                    
                    <CustomSlider
                      label="Hue"
                      value={hue}
                      onChange={setHue}
                      min={-180}
                      max={180}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-white/80 font-medium mb-3">Effects</h4>
                  <div className="space-y-3">
                    <CustomSlider
                      label="Blur"
                      value={blur}
                      onChange={setBlur}
                      min={0}
                      max={10}
                    />
                    
                    <CustomSlider
                      label="Sepia"
                      value={sepia}
                      onChange={setSepia}
                      min={0}
                      max={100}
                    />
                    
                    <CustomSlider
                      label="Grayscale"
                      value={grayscale}
                      onChange={setGrayscale}
                      min={0}
                      max={100}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-white/80 font-medium mb-3">Slideshow</h4>
                  <div className="space-y-3">
                    <CustomSlider
                      label="Interval (seconds)"
                      value={slideshowInterval / 1000}
                      onChange={(value) => setSlideshowInterval(value * 1000)}
                      min={1}
                      max={10}
                    />
                    
                    <CustomSlider
                      label="Background Opacity"
                      value={backgroundOpacity}
                      onChange={setBackgroundOpacity}
                      min={50}
                      max={100}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={resetAdjustments}
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-white hover:bg-white/10"
                  >
                    Reset Colors
                  </Button>
                  <Button
                    onClick={() => setShowToolbar(!showToolbar)}
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-white hover:bg-white/10"
                  >
                    {showToolbar ? 'Hide' : 'Show'} Toolbar
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Panel */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              className="absolute top-16 left-4 bg-black/90 backdrop-blur-md rounded-xl p-4 border border-white/10 min-w-[280px] z-10"
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
            >
              <h3 className="text-white font-semibold mb-3">Image Information</h3>
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
                <div className="flex justify-between text-white/70">
                  <span>Fit Mode:</span>
                  <span className="text-white capitalize">{fitMode}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Flipped:</span>
                  <span className="text-white">
                    {flipHorizontal || flipVertical 
                      ? `${flipHorizontal ? 'H' : ''}${flipVertical ? 'V' : ''}`
                      : 'None'
                    }
                  </span>
                </div>
                {slideshow && (
                  <div className="flex justify-between text-white/70">
                    <span>Slideshow:</span>
                    <span className="text-green-400">Active</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Image Container */}
        <div
          ref={containerRef}
          className={cn(
            "absolute inset-0 flex items-center justify-center overflow-hidden",
            showToolbar ? "top-16" : "top-0"
          )}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
          style={{ cursor: zoom > 1 || fitMode === 'actual' ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        >
          <motion.img
            ref={imageRef}
            src={src}
            alt={alt}
            className={cn(
              "select-none transition-all duration-200",
              fitMode === 'fit' && "max-w-full max-h-full object-contain",
              fitMode === 'fill' && "w-full h-full object-cover",
              fitMode === 'actual' && "max-w-none max-h-none"
            )}
            style={{
              transform: `
                translate(${position.x}px, ${position.y}px) 
                scale(${fitMode === 'actual' ? zoom : fitMode === 'fit' ? Math.min(zoom, 1) : zoom}) 
                rotate(${rotation}deg)
                scaleX(${flipHorizontal ? -1 : 1})
                scaleY(${flipVertical ? -1 : 1})
              `,
              filter: `
                brightness(${brightness}%) 
                contrast(${contrast}%) 
                saturate(${saturation}%) 
                hue-rotate(${hue}deg)
                blur(${blur}px)
                sepia(${sepia}%)
                grayscale(${grayscale}%)
              `,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out',
              width: fitMode === 'fill' ? '100%' : 'auto',
              height: fitMode === 'fill' ? '100%' : fitMode === 'fit' ? '100%' : 'auto',
              maxWidth: fitMode === 'fit' ? '100%' : 'none',
              maxHeight: fitMode === 'fit' ? '100%' : 'none'
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            draggable={false}
          />
        </div>

        {/* Navigation Dots */}
        <AnimatePresence>
          {images.length > 1 && showNavigationDots && showControls && (
            <motion.div
              className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
            >
              <div className="flex gap-2">
                {images.slice(Math.max(0, currentIndex - 5), currentIndex + 6).map((_, idx) => {
                  const actualIndex = Math.max(0, currentIndex - 5) + idx;
                  return (
                    <button
                      key={actualIndex}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        actualIndex === currentIndex ? "bg-white" : "bg-white/40"
                      )}
                      onClick={() => {
                        const diff = actualIndex - currentIndex;
                        if (diff > 0) {
                          for (let i = 0; i < diff; i++) onNext?.();
                        } else if (diff < 0) {
                          for (let i = 0; i < Math.abs(diff); i++) onPrevious?.();
                        }
                      }}
                    />
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Thumbnail Strip */}
        <AnimatePresence>
          {images.length > 1 && showThumbnails && showControls && (
            <motion.div
              className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-10"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
            >
              <div className="bg-black/80 backdrop-blur-md rounded-xl p-3 border border-white/10 flex gap-2 max-w-2xl overflow-x-auto">
                {images.map((image, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "w-16 h-16 rounded-lg overflow-hidden border-2 cursor-pointer flex-shrink-0 transition-all",
                      idx === currentIndex ? "border-white scale-110" : "border-white/20 hover:border-white/60"
                    )}
                    onClick={() => {
                      const diff = idx - currentIndex;
                      if (diff > 0) {
                        for (let i = 0; i < diff; i++) onNext?.();
                      } else if (diff < 0) {
                        for (let i = 0; i < Math.abs(diff); i++) onPrevious?.();
                      }
                    }}
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
        </AnimatePresence>

        {/* Slideshow Indicator */}
        <AnimatePresence>
          {slideshow && (
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <div className="bg-black/80 backdrop-blur-md rounded-full p-4 border border-white/10">
                <Zap className="h-8 w-8 text-white animate-pulse" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default AdvancedImageViewer;