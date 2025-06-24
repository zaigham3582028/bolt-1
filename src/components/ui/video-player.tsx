"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Pause, 
  Volume2, 
  Volume1, 
  VolumeX, 
  Maximize, 
  Settings,
  SkipBack,
  SkipForward,
  Heart,
  Tag,
  Scissors
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

interface VideoClip {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  tags: string[];
}

interface VideoPlayerProps {
  src: string;
  onAddToFavorites?: (clip: VideoClip) => void;
  onSaveClip?: (clip: VideoClip) => void;
}

const CustomSlider = ({
  value,
  onChange,
  className,
  disabled = false,
}: {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  disabled?: boolean;
}) => {
  return (
    <motion.div
      className={cn(
        "relative w-full h-1 bg-white/20 rounded-full cursor-pointer",
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
    >
      <motion.div
        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
        style={{ width: `${value}%` }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
      <motion.div
        className="absolute w-3 h-3 bg-white rounded-full shadow-lg transform -translate-y-1"
        style={{ left: `${value}%`, transform: 'translateX(-50%) translateY(-50%)' }}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
      />
    </motion.div>
  );
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, onAddToFavorites, onSaveClip }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isMarkingClip, setIsMarkingClip] = useState(false);
  const [clipStart, setClipStart] = useState(0);
  const [clipEnd, setClipEnd] = useState(0);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (value: number) => {
    if (videoRef.current) {
      const newVolume = value / 100;
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(isFinite(progress) ? progress : 0);
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (value: number) => {
    if (videoRef.current && videoRef.current.duration) {
      const time = (value / 100) * videoRef.current.duration;
      if (isFinite(time)) {
        videoRef.current.currentTime = time;
        setProgress(value);
      }
    }
  };

  const toggleMute = () => {
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
  };

  const setSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!isFullscreen) {
        containerRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime += 10;
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime -= 10;
    }
  };

  const startMarkingClip = () => {
    setIsMarkingClip(true);
    setClipStart(currentTime);
  };

  const endMarkingClip = () => {
    if (isMarkingClip) {
      setClipEnd(currentTime);
      setIsMarkingClip(false);
      
      const clip: VideoClip = {
        id: Date.now().toString(),
        name: `Clip ${formatTime(clipStart)} - ${formatTime(currentTime)}`,
        startTime: clipStart,
        endTime: currentTime,
        tags: []
      };
      
      onSaveClip?.(clip);
    }
  };

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        "relative w-full mx-auto rounded-xl overflow-hidden bg-black shadow-2xl",
        isFullscreen ? "h-screen w-screen rounded-none" : "max-w-6xl"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        src={src}
        onClick={togglePlay}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration);
          }
        }}
      />

      {/* Loading overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <motion.div
          className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <AnimatePresence>
        {showControls && (
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
        {showControls && (
          <motion.div
            className="absolute top-4 right-4 flex items-center gap-2"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
          >
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
              onClick={toggleFullscreen}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
            >
              <Maximize className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Controls */}
      <AnimatePresence>
        {showControls && (
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
                <span className="text-white text-sm font-medium min-w-[45px]">
                  {formatTime(currentTime)}
                </span>
                <div className="flex-1 relative">
                  <CustomSlider
                    value={progress}
                    onChange={handleSeek}
                    className="h-2"
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
                </div>
                <span className="text-white text-sm font-medium min-w-[45px]">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={skipBackward}
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
                    onClick={skipForward}
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 hover:text-white"
                  >
                    <SkipForward className="h-5 w-5" />
                  </Button>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      onClick={toggleMute}
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

                    <div className="w-24">
                      <CustomSlider
                        value={volume * 100}
                        onChange={handleVolumeChange}
                      />
                    </div>
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
                  {[0.5, 1, 1.25, 1.5, 2].map((speed) => (
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
            className="absolute top-16 right-4 bg-black/80 backdrop-blur-md rounded-xl p-4 border border-white/10 min-w-[300px]"
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
          >
            <h3 className="text-white font-semibold mb-3">Player Settings</h3>
            <div className="space-y-3">
              <div>
                <label className="text-white/70 text-sm">Playback Speed</label>
                <div className="flex gap-1 mt-1">
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VideoPlayer;