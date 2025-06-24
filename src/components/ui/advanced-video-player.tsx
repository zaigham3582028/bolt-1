"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, Volume1, VolumeX, Maximize, Settings, SkipBack, SkipForward, Heart, Tag, Scissors, RotateCcw, RotateCw, Maximize2, Minimize2, PictureInPicture, Download, Share2, Bookmark, Clock, Layers, Zap, Monitor, Headphones, Eye, EyeOff, MousePointer, Repeat, Shuffle, FastForward, Rewind, Square, X, Fullscreen, Fullscreen as FullscreenExit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

interface VideoClip {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  tags: string[];
}

interface AdvancedVideoPlayerProps {
  src: string;
  file?: any;
  onAddToFavorites?: (clip: VideoClip) => void;
  onSaveClip?: (clip: VideoClip) => void;
  onClose?: () => void;
}

const CustomSlider = ({
  value,
  onChange,
  className,
  disabled = false,
  markers = [],
  onHover,
}: {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  disabled?: boolean;
  markers?: number[];
  onHover?: (value: number | null) => void;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    const clampedValue = Math.min(Math.max(percentage, 0), 100);
    
    if (isDragging) {
      onChange(clampedValue);
    } else {
      setHoverValue(clampedValue);
      onHover?.(clampedValue);
    }
  };

  const handleMouseLeave = () => {
    setHoverValue(null);
    onHover?.(null);
  };

  return (
    <motion.div
      className={cn(
        "relative w-full h-2 bg-white/20 rounded-full cursor-pointer group",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      onClick={(e) => {
        if (disabled) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        onChange(Math.min(Math.max(percentage, 0), 100));
      }}
      onMouseDown={() => setIsDragging(true)}
      onMouseUp={() => setIsDragging(false)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Markers */}
      {markers.map((marker, index) => (
        <div
          key={index}
          className="absolute top-0 w-0.5 h-full bg-yellow-400 opacity-70"
          style={{ left: `${marker}%` }}
        />
      ))}
      
      {/* Progress */}
      <motion.div
        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
        style={{ width: `${value}%` }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
      
      {/* Hover preview */}
      {hoverValue !== null && (
        <div
          className="absolute top-0 h-full bg-white/30 rounded-full"
          style={{ 
            left: `${Math.min(value, hoverValue)}%`,
            width: `${Math.abs(hoverValue - value)}%`
          }}
        />
      )}
      
      {/* Handle */}
      <motion.div
        className="absolute w-4 h-4 bg-white rounded-full shadow-lg transform -translate-y-1 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ left: `${value}%`, transform: 'translateX(-50%) translateY(-25%)' }}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
      />
    </motion.div>
  );
};

const AdvancedVideoPlayer: React.FC<AdvancedVideoPlayerProps> = ({ 
  src, 
  file,
  onAddToFavorites, 
  onSaveClip,
  onClose 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isMarkingClip, setIsMarkingClip] = useState(false);
  const [clipStart, setClipStart] = useState(0);
  const [clipEnd, setClipEnd] = useState(0);
  const [showClipDialog, setShowClipDialog] = useState(false);
  const [clipName, setClipName] = useState('');
  const [clipTags, setClipTags] = useState<string[]>([]);
  const [quality, setQuality] = useState('auto');
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [chapters, setChapters] = useState<Array<{time: number, title: string}>>([]);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [previewTime, setPreviewTime] = useState<number | null>(null);
  const [hasError, setHasError] = useState(false);
  const [gestureStartX, setGestureStartX] = useState(0);
  const [gestureStartY, setGestureStartY] = useState(0);
  const [isGesturing, setIsGesturing] = useState(false);

  // Auto-hide controls timer
  const hideControlsTimer = useRef<NodeJS.Timeout>();

  const { addFavoriteClip, tags, preferences } = useAppStore();

  const resetHideTimer = useCallback(() => {
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
    }
    setShowControls(true);
    hideControlsTimer.current = setTimeout(() => {
      if (!showSettings && !showClipDialog && !isFullscreen) {
        setShowControls(false);
      }
    }, 3000);
  }, [showSettings, showClipDialog, isFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;
      
      resetHideTimer();
      
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (e.shiftKey) {
            skipBackward(30);
          } else {
            skipBackward();
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (e.shiftKey) {
            skipForward(30);
          } else {
            skipForward();
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleVolumeChange(Math.min(volume * 100 + 10, 100));
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleVolumeChange(Math.max(volume * 100 - 10, 0));
          break;
        case 'f':
        case 'F11':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'Escape':
          if (isFullscreen) {
            toggleFullscreen();
          } else {
            onClose?.();
          }
          break;
        case 'Home':
          e.preventDefault();
          videoRef.current.currentTime = 0;
          break;
        case 'End':
          e.preventDefault();
          videoRef.current.currentTime = duration;
          break;
        case 'j':
          skipBackward();
          break;
        case 'k':
          togglePlay();
          break;
        case 'l':
          skipForward();
          break;
        case ',':
          if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
          videoRef.current.currentTime -= 1/30; // Frame by frame
          break;
        case '.':
          if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
          videoRef.current.currentTime += 1/30; // Frame by frame
          break;
      }
    };

    const handleMouseMove = () => {
      resetHideTimer();
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousemove', handleMouseMove);
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current);
      }
    };
  }, [isFullscreen, volume, onClose, isPlaying, duration, resetHideTimer]);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error('Error playing video:', error);
            setHasError(true);
          });
        }
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleVolumeChange = useCallback((value: number) => {
    if (videoRef.current) {
      const newVolume = value / 100;
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(isFinite(progress) ? progress : 0);
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);
      
      // Update buffered
      if (videoRef.current.buffered.length > 0) {
        const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
        const bufferedProgress = (bufferedEnd / videoRef.current.duration) * 100;
        setBuffered(isFinite(bufferedProgress) ? bufferedProgress : 0);
      }
    }
  }, []);

  const handleSeek = useCallback((value: number) => {
    if (videoRef.current && videoRef.current.duration) {
      const time = (value / 100) * videoRef.current.duration;
      if (isFinite(time)) {
        videoRef.current.currentTime = time;
        setProgress(value);
      }
    }
  }, []);

  const handleProgressHover = useCallback((value: number | null) => {
    if (value !== null && videoRef.current && videoRef.current.duration) {
      const time = (value / 100) * videoRef.current.duration;
      setPreviewTime(time);
    } else {
      setPreviewTime(null);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      if (!isMuted) {
        setVolume(0);
      } else {
        setVolume(1);
        videoRef.current.volume = 1;
      }
    }
  }, [isMuted]);

  const setSpeed = useCallback((speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setPlaybackRate(speed);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (containerRef.current) {
      if (!isFullscreen) {
        containerRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  }, [isFullscreen]);

  const skipForward = useCallback((seconds = 10) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  }, []);

  const skipBackward = useCallback((seconds = 10) => {
    if (videoRef.current) {
      videoRef.current.currentTime -= seconds;
    }
  }, []);

  const startMarkingClip = useCallback(() => {
    setIsMarkingClip(true);
    setClipStart(currentTime);
  }, [currentTime]);

  const endMarkingClip = useCallback(() => {
    if (isMarkingClip) {
      setClipEnd(currentTime);
      setIsMarkingClip(false);
      setShowClipDialog(true);
      setClipName(`Clip ${formatTime(clipStart)} - ${formatTime(currentTime)}`);
    }
  }, [isMarkingClip, currentTime, clipStart]);

  const saveClip = useCallback(() => {
    const clip = {
      name: clipName,
      startTime: clipStart,
      endTime: clipEnd,
      tags: clipTags,
      fileId: 'current-video',
      fileName: 'Current Video',
      thumbnail: src
    };
    
    addFavoriteClip(clip);
    onSaveClip?.(clip);
    setShowClipDialog(false);
    setClipName('');
    setClipTags([]);
  }, [clipName, clipStart, clipEnd, clipTags, src, addFavoriteClip, onSaveClip]);

  const addBookmark = useCallback(() => {
    setBookmarks(prev => [...prev, currentTime]);
  }, [currentTime]);

  const jumpToBookmark = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  }, []);

  const togglePictureInPicture = useCallback(async () => {
    if (videoRef.current) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      } catch (error) {
        console.error('Picture-in-picture error:', error);
      }
    }
  }, []);

  // Mouse gesture handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (preferences.enableGestures) {
      setGestureStartX(e.clientX);
      setGestureStartY(e.clientY);
      setIsGesturing(true);
    }
  }, [preferences.enableGestures]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isGesturing && preferences.enableGestures) {
      const deltaX = e.clientX - gestureStartX;
      const deltaY = e.clientY - gestureStartY;
      
      // Horizontal gesture for seeking
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        const seekAmount = deltaX > 0 ? 10 : -10;
        if (videoRef.current) {
          videoRef.current.currentTime += seekAmount;
        }
        setGestureStartX(e.clientX);
      }
      
      // Vertical gesture for volume
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
        const volumeChange = deltaY > 0 ? -10 : 10;
        handleVolumeChange(Math.max(0, Math.min(100, volume * 100 + volumeChange)));
        setGestureStartY(e.clientY);
      }
    }
  }, [isGesturing, gestureStartX, gestureStartY, preferences.enableGestures, volume, handleVolumeChange]);

  const handleMouseUp = useCallback(() => {
    setIsGesturing(false);
  }, []);

  const handleVideoClick = useCallback((e: React.MouseEvent) => {
    if (e.detail === 1) {
      // Single click - toggle play/pause
      setTimeout(() => {
        if (e.detail === 1) {
          togglePlay();
        }
      }, 200);
    } else if (e.detail === 2) {
      // Double click - toggle fullscreen
      toggleFullscreen();
    }
  }, [togglePlay, toggleFullscreen]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
      setHasError(false);
    }
  }, []);

  const handleCanPlay = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleVideoError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  // Get video source - use file URL if available, otherwise fallback
  const getVideoSource = () => {
    if (file?.metadata?.fileUrl) {
      return file.metadata.fileUrl;
    }
    if (src && src !== 'placeholder') {
      return src;
    }
    // Fallback to demo video
    return 'https://videos.pexels.com/video-files/30333849/13003128_2560_1440_25fps.mp4';
  };

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        "relative w-full mx-auto rounded-xl overflow-hidden bg-black shadow-2xl",
        isFullscreen ? "h-screen w-screen rounded-none fixed inset-0 z-50" : "h-[90vh] max-w-full"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={handleCanPlay}
        onLoadStart={() => setIsLoading(true)}
        onError={handleVideoError}
        onClick={handleVideoClick}
        style={{
          filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
        }}
        crossOrigin="anonymous"
        preload="metadata"
        playsInline
      >
        <source src={getVideoSource()} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Loading overlay */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <motion.div
            className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      )}

      {/* Error overlay */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center text-white">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold mb-2">Video Error</h3>
            <p className="text-white/70 mb-4">Unable to load video file</p>
            <Button
              onClick={() => {
                setHasError(false);
                setIsLoading(true);
                if (videoRef.current) {
                  videoRef.current.load();
                }
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Clip marking overlay */}
      {isMarkingClip && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span>Marking clip from {formatTime(clipStart)}</span>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showControls && !hasError && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* Top Controls */}
      <AnimatePresence>
        {showControls && !hasError && (
          <motion.div
            className="absolute top-4 left-4 right-4 flex items-center justify-between"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
          >
            <div className="flex items-center gap-2">
              <Button
                onClick={addBookmark}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
              >
                <Bookmark className="h-5 w-5" />
              </Button>
              <Button
                onClick={() => onAddToFavorites?.({
                  id: Date.now().toString(),
                  name: 'Favorite Video',
                  startTime: 0,
                  endTime: duration,
                  tags: ['favorite']
                })}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
              >
                <Heart className="h-5 w-5" />
              </Button>
              <Button
                onClick={() => setShowSettings(!showSettings)}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
              >
                <Settings className="h-5 w-5" />
              </Button>
              <Button
                onClick={togglePictureInPicture}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
              >
                <PictureInPicture className="h-5 w-5" />
              </Button>
              <Button
                onClick={toggleFullscreen}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
              >
                {isFullscreen ? <FullscreenExit className="h-5 w-5" /> : <Fullscreen className="h-5 w-5" />}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-white/70 text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              {onClose && (
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Controls */}
      <AnimatePresence>
        {showControls && !hasError && (
          <motion.div
            className="absolute bottom-4 left-4 right-4"
            initial={{ y: 20, opacity: 0, filter: "blur(10px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: 20, opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.6, ease: "circInOut", type: "spring" }}
          >
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              {/* Progress Bar */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-white text-sm font-medium min-w-[60px]">
                  {formatTime(currentTime)}
                </span>
                <div className="flex-1 relative">
                  {/* Buffered progress */}
                  <div 
                    className="absolute top-0 left-0 h-2 bg-white/30 rounded-full"
                    style={{ width: `${buffered}%` }}
                  />
                  <CustomSlider
                    value={progress}
                    onChange={handleSeek}
                    onHover={handleProgressHover}
                    className="h-2"
                    markers={bookmarks.map(b => (b / duration) * 100)}
                  />
                  {isMarkingClip && (
                    <div 
                      className="absolute top-0 h-2 bg-red-500/50 rounded-full"
                      style={{
                        left: `${(clipStart / duration) * 100}%`,
                        width: `${((currentTime - clipStart) / duration) * 100}%`
                      }}
                    />
                  )}
                  {/* Preview tooltip */}
                  {previewTime !== null && (
                    <div 
                      className="absolute -top-8 bg-black/80 text-white text-xs px-2 py-1 rounded transform -translate-x-1/2"
                      style={{ left: `${(previewTime / duration) * 100}%` }}
                    >
                      {formatTime(previewTime)}
                    </div>
                  )}
                </div>
                <span className="text-white text-sm font-medium min-w-[60px]">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => skipBackward(30)}
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 hover:text-white"
                  >
                    <Rewind className="h-5 w-5" />
                  </Button>
                  
                  <Button
                    onClick={() => skipBackward()}
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 hover:text-white"
                  >
                    <SkipBack className="h-5 w-5" />
                  </Button>
                  
                  <Button
                    onClick={togglePlay}
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 hover:text-white w-12 h-12"
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="h-6 w-6" />
                    )}
                  </Button>

                  <Button
                    onClick={() => skipForward()}
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 hover:text-white"
                  >
                    <SkipForward className="h-5 w-5" />
                  </Button>

                  <Button
                    onClick={() => skipForward(30)}
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 hover:text-white"
                  >
                    <FastForward className="h-5 w-5" />
                  </Button>

                  <div className="flex items-center gap-2 ml-4 relative">
                    <Button
                      onClick={toggleMute}
                      onMouseEnter={() => setShowVolumeSlider(true)}
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20 hover:text-white"
                    >
                      {isMuted ? (
                        <VolumeX className="h-5 w-5" />
                      ) : volume > 0.5 ? (
                        <Volume2 className="h-5 w-5" />
                      ) : (
                        <Volume1 className="h-5 w-5" />
                      )}
                    </Button>

                    <AnimatePresence>
                      {showVolumeSlider && (
                        <motion.div
                          className="w-24"
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 96 }}
                          exit={{ opacity: 0, width: 0 }}
                          onMouseLeave={() => setShowVolumeSlider(false)}
                        >
                          <CustomSlider
                            value={volume * 100}
                            onChange={handleVolumeChange}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Clip Marking Buttons */}
                  <Button
                    onClick={isMarkingClip ? endMarkingClip : startMarkingClip}
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "text-white hover:bg-white/20 hover:text-white",
                      isMarkingClip && "bg-red-500/20 text-red-400"
                    )}
                  >
                    <Scissors className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 hover:text-white"
                  >
                    <Tag className="h-4 w-4" />
                  </Button>

                  {/* Speed Controls */}
                  {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => (
                    <Button
                      key={speed}
                      onClick={() => setSpeed(speed)}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "text-white hover:bg-white/20 hover:text-white text-xs px-2",
                        playbackSpeed === speed && "bg-white/20"
                      )}
                    >
                      {speed}x
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="absolute top-16 right-4 bg-black/90 backdrop-blur-md rounded-xl p-6 border border-white/10 min-w-[350px] max-h-[500px] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
          >
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Player Settings
            </h3>
            
            <div className="space-y-4">
              {/* Playback Speed */}
              <div>
                <label className="text-white/70 text-sm mb-2 block">Playback Speed</label>
                <div className="grid grid-cols-4 gap-1">
                  {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => (
                    <Button
                      key={speed}
                      onClick={() => setSpeed(speed)}
                      variant={playbackSpeed === speed ? "default" : "ghost"}
                      size="sm"
                      className="text-xs"
                    >
                      {speed}x
                    </Button>
                  ))}
                </div>
              </div>

              {/* Quality */}
              <div>
                <label className="text-white/70 text-sm mb-2 block">Quality</label>
                <div className="grid grid-cols-3 gap-1">
                  {['auto', '720p', '1080p', '4K'].map((q) => (
                    <Button
                      key={q}
                      onClick={() => setQuality(q)}
                      variant={quality === q ? "default" : "ghost"}
                      size="sm"
                      className="text-xs"
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Video Adjustments */}
              <div>
                <label className="text-white/70 text-sm mb-2 block">Video Adjustments</label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">Brightness</span>
                    <span className="text-white text-sm">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full"
                  />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">Contrast</span>
                    <span className="text-white text-sm">{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full"
                  />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">Saturation</span>
                    <span className="text-white text-sm">{saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={saturation}
                    onChange={(e) => setSaturation(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clip Dialog */}
      <AnimatePresence>
        {showClipDialog && (
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-900 rounded-xl p-6 border border-white/10 min-w-[400px]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-white font-semibold mb-4">Save Video Clip</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-white/70 text-sm mb-1 block">Clip Name</label>
                  <input
                    type="text"
                    value={clipName}
                    onChange={(e) => setClipName(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter clip name..."
                  />
                </div>
                
                <div>
                  <label className="text-white/70 text-sm mb-1 block">Duration</label>
                  <div className="text-white text-sm">
                    {formatTime(clipStart)} - {formatTime(clipEnd)} ({formatTime(clipEnd - clipStart)})
                  </div>
                </div>
                
                <div>
                  <label className="text-white/70 text-sm mb-1 block">Tags</label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {tags.slice(0, 8).map((tag) => (
                      <Button
                        key={tag}
                        onClick={() => {
                          if (clipTags.includes(tag)) {
                            setClipTags(clipTags.filter(t => t !== tag));
                          } else {
                            setClipTags([...clipTags, tag]);
                          }
                        }}
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "text-xs",
                          clipTags.includes(tag) 
                            ? "bg-blue-500/20 text-blue-300" 
                            : "text-white/70 hover:bg-white/10"
                        )}
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <Button
                  onClick={() => setShowClipDialog(false)}
                  variant="ghost"
                  className="flex-1 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveClip}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Save Clip
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdvancedVideoPlayer;