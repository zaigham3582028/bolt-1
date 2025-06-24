import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Heart,
  Download,
  Share2,
  MoreVertical,
  Eye,
  Clock,
  Calendar,
  FileText,
  Video,
  Image as ImageIcon,
  Music,
  Archive,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, formatFileSize } from '@/lib/utils';

export interface FileItem {
  id: string;
  name: string;
  type: 'video' | 'image' | 'audio' | 'document' | 'archive';
  size: number;
  duration?: number;
  thumbnail?: string;
  createdAt: Date;
  modifiedAt: Date;
  isFavorite: boolean;
  tags: string[];
  metadata?: {
    width?: number;
    height?: number;
    resolution?: string;
    codec?: string;
    bitrate?: string;
  };
}

interface FileCardProps {
  file: FileItem;
  isSelected: boolean;
  onSelect: (fileId: string) => void;
  onPlay: (file: FileItem) => void;
  onToggleFavorite: (fileId: string) => void;
  onDownload: (fileId: string) => void;
  onShare: (fileId: string) => void;
  onPreview: (file: FileItem) => void;
  viewMode: 'grid' | 'list';
}

const FileCard: React.FC<FileCardProps> = ({
  file,
  isSelected,
  onSelect,
  onPlay,
  onToggleFavorite,
  onDownload,
  onShare,
  onPreview,
  viewMode
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'image':
        return <ImageIcon className="h-5 w-5" />;
      case 'audio':
        return <Music className="h-5 w-5" />;
      case 'document':
        return <FileText className="h-5 w-5" />;
      case 'archive':
        return <Archive className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const generateVideoThumbnail = (file: FileItem): string => {
    // For demo purposes, return a video-related image from Pexels
    const videoThumbnails = [
      'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
      'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
      'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
      'https://images.pexels.com/photos/1519088/pexels-photo-1519088.jpeg?auto=compress&cs=tinysrgb&w=400&h=300'
    ];
    
    // Use file ID to consistently pick the same thumbnail
    const index = parseInt(file.id) % videoThumbnails.length;
    return videoThumbnails[index];
  };

  const getThumbnail = () => {
    if (file.thumbnail) {
      return file.thumbnail;
    }
    
    if (file.type === 'video') {
      return generateVideoThumbnail(file);
    }
    
    return null;
  };

  const handleCardClick = () => {
    // Make entire card clickable for play/preview
    if (file.type === 'video' || file.type === 'image') {
      onPlay(file);
    } else {
      onPreview(file);
    }
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        className={cn(
          "flex items-center gap-4 p-3 rounded-lg border transition-all duration-200 cursor-pointer",
          "hover:bg-white/5 hover:border-white/20 group",
          isSelected && "bg-blue-500/20 border-blue-500/50",
          "border-white/10"
        )}
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {/* Thumbnail */}
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 flex-shrink-0 relative">
          {getThumbnail() ? (
            <img
              src={getThumbnail()!}
              alt={file.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50">
              {getFileIcon(file.type)}
            </div>
          )}
          {file.type === 'video' && file.duration && (
            <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
              {formatDuration(file.duration)}
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-white truncate group-hover:text-blue-300 transition-colors">
            {file.name}
          </h3>
          <div className="flex items-center gap-3 mt-1 text-xs text-white/50">
            <span>{formatFileSize(file.size)}</span>
            <span>•</span>
            <span>{file.modifiedAt.toLocaleDateString()}</span>
            {file.metadata?.resolution && (
              <>
                <span>•</span>
                <span>{file.metadata.resolution}</span>
              </>
            )}
          </div>
        </div>

        {/* Tags */}
        {file.tags.length > 0 && (
          <div className="flex gap-1 flex-shrink-0">
            {file.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {file.tags.length > 2 && (
              <span className="px-2 py-1 bg-white/10 text-white/50 text-xs rounded-full">
                +{file.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(file.id);
            }}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/70 hover:bg-white/10 hover:text-white"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(file.id);
            }}
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 text-white/70 hover:bg-white/10 hover:text-white",
              file.isFavorite && "text-red-500"
            )}
          >
            <Heart className={cn("h-4 w-4", file.isFavorite && "fill-current")} />
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/70 hover:bg-white/10 hover:text-white"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn(
        "relative rounded-xl overflow-hidden border transition-all duration-200 cursor-pointer group",
        "hover:border-white/30 hover:shadow-xl hover:shadow-black/20",
        isSelected && "ring-2 ring-blue-500 border-blue-500/50",
        "border-white/10 bg-white/5 backdrop-blur-sm"
      )}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      {/* Thumbnail */}
      <div className="aspect-video relative overflow-hidden bg-white/10">
        {getThumbnail() ? (
          <img
            src={getThumbnail()!}
            alt={file.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/30">
            {getFileIcon(file.type)}
          </div>
        )}

        {/* Play Overlay */}
        <AnimatePresence>
          {isHovered && (file.type === 'video' || file.type === 'image') && (
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Play className="h-8 w-8 text-white ml-1" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Duration Badge */}
        {file.type === 'video' && file.duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            {formatDuration(file.duration)}
          </div>
        )}

        {/* Favorite Badge */}
        {file.isFavorite && (
          <div className="absolute top-2 right-2 text-red-500">
            <Heart className="h-4 w-4 fill-current" />
          </div>
        )}

        {/* File Type Badge */}
        <div className="absolute top-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          {getFileIcon(file.type)}
          <span className="uppercase">{file.type}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-medium text-white group-hover:text-blue-300 transition-colors truncate mb-2">
          {file.name}
        </h3>

        <div className="flex items-center justify-between text-xs text-white/50 mb-3">
          <span>{formatFileSize(file.size)}</span>
          <span>{file.modifiedAt.toLocaleDateString()}</span>
        </div>

        {/* Metadata */}
        {file.metadata && (
          <div className="text-xs text-white/40 mb-3">
            {file.metadata.resolution && (
              <span>{file.metadata.resolution}</span>
            )}
            {file.metadata.codec && (
              <span> • {file.metadata.codec}</span>
            )}
          </div>
        )}

        {/* Tags */}
        {file.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {file.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {file.tags.length > 3 && (
              <span className="px-2 py-1 bg-white/10 text-white/50 text-xs rounded-full">
                +{file.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(file.id);
              }}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/70 hover:bg-white/10 hover:text-white"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(file.id);
              }}
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 text-white/70 hover:bg-white/10 hover:text-white",
                file.isFavorite && "text-red-500"
              )}
            >
              <Heart className={cn("h-4 w-4", file.isFavorite && "fill-current")} />
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onDownload(file.id);
              }}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/70 hover:bg-white/10 hover:text-white"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onShare(file.id);
              }}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/70 hover:bg-white/10 hover:text-white"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          <Button
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/70 hover:bg-white/10 hover:text-white"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Actions Menu */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            className="absolute top-2 right-2 bg-black/90 backdrop-blur-md rounded-lg p-2 border border-white/20 z-10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-1">
              <Button
                onClick={() => {
                  onPreview(file);
                  setShowActions(false);
                }}
                variant="ghost"
                size="sm"
                className="justify-start text-white hover:bg-white/10"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button
                onClick={() => {
                  onDownload(file.id);
                  setShowActions(false);
                }}
                variant="ghost"
                size="sm"
                className="justify-start text-white hover:bg-white/10"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                onClick={() => {
                  onShare(file.id);
                  setShowActions(false);
                }}
                variant="ghost"
                size="sm"
                className="justify-start text-white hover:bg-white/10"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start text-white hover:bg-white/10"
              >
                <Tag className="h-4 w-4 mr-2" />
                Add Tags
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FileCard;