import React, { useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  File as FileIcon, 
  Image as ImageIcon, 
  Video, 
  Music, 
  FileText, 
  Archive,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Minimize2,
  Maximize2,
  Play,
  Pause
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, formatFileSize } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

interface FileUploadZoneProps {
  onFilesUploaded?: (files: File[]) => void;
  acceptedTypes?: string[];
  maxFileSize?: number;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error' | 'processing';
  error?: string;
  thumbnail?: string;
  fileUrl?: string;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFilesUploaded,
  acceptedTypes = ['*'],
  maxFileSize = 500 * 1024 * 1024, // 500MB default
  multiple = true,
  disabled = false,
  className
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { addFiles, preferences } = useAppStore();

  const getFileIcon = (file: File) => {
    const type = file.type.split('/')[0];
    switch (type) {
      case 'image':
        return <ImageIcon className="h-6 w-6" />;
      case 'video':
        return <Video className="h-6 w-6" />;
      case 'audio':
        return <Music className="h-6 w-6" />;
      case 'text':
      case 'application':
        if (file.type.includes('pdf') || file.type.includes('document')) {
          return <FileText className="h-6 w-6" />;
        }
        if (file.type.includes('zip') || file.type.includes('rar')) {
          return <Archive className="h-6 w-6" />;
        }
        return <FileIcon className="h-6 w-6" />;
      default:
        return <FileIcon className="h-6 w-6" />;
    }
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize) {
      return `File size exceeds ${Math.round(maxFileSize / (1024 * 1024))}MB limit`;
    }
    
    if (acceptedTypes.length > 0 && !acceptedTypes.includes('*')) {
      const fileType = file.type;
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      const isTypeAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return type.slice(1) === fileExtension;
        }
        return fileType.startsWith(type.replace('*', ''));
      });
      
      if (!isTypeAccepted) {
        return `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`;
      }
    }
    
    return null;
  };

  const generateHighQualityThumbnail = async (file: File): Promise<string | undefined> => {
    if (file.type.startsWith('image/')) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = document.createElement('img');
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            const maxSize = preferences.maxThumbnailSize || 400;
            const ratio = Math.min(maxSize / img.width, maxSize / img.height);
            canvas.width = img.width * ratio;
            canvas.height = img.height * ratio;
            
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.9));
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      });
    }
    
    if (file.type.startsWith('video/')) {
      return new Promise((resolve) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.crossOrigin = 'anonymous';
        
        video.onloadedmetadata = () => {
          video.currentTime = Math.min(5, video.duration / 4);
        };
        
        video.onseeked = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          const maxSize = preferences.maxThumbnailSize || 400;
          const ratio = Math.min(maxSize / video.videoWidth, maxSize / video.videoHeight);
          canvas.width = video.videoWidth * ratio;
          canvas.height = video.videoHeight * ratio;
          
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
          URL.revokeObjectURL(video.src);
        };
        
        video.onerror = () => {
          resolve(undefined);
          URL.revokeObjectURL(video.src);
        };
        
        video.src = URL.createObjectURL(file);
      });
    }
    
    return undefined;
  };

  const processFiles = async (files: File[]) => {
    setIsUploading(true);
    setIsPaused(false);
    const validFiles: File[] = [];
    const progressItems: UploadProgress[] = [];

    // Validate files first
    for (const file of files) {
      const error = validateFile(file);
      if (error) {
        progressItems.push({
          file,
          progress: 0,
          status: 'error',
          error
        });
      } else {
        validFiles.push(file);
        progressItems.push({
          file,
          progress: 0,
          status: 'uploading'
        });
      }
    }

    setUploadProgress(progressItems);

    // Process valid files one by one
    for (let i = 0; i < validFiles.length; i++) {
      if (isPaused) {
        await new Promise(resolve => {
          const checkPause = () => {
            if (!isPaused) {
              resolve(undefined);
            } else {
              setTimeout(checkPause, 100);
            }
          };
          checkPause();
        });
      }

      const file = validFiles[i];
      
      try {
        // Update status to processing
        setUploadProgress(prev => prev.map(item => 
          item.file === file 
            ? { ...item, status: 'processing' }
            : item
        ));

        // Simulate realistic upload progress
        for (let progress = 0; progress <= 80; progress += Math.random() * 15 + 5) {
          if (isPaused) break;
          
          await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
          setUploadProgress(prev => prev.map(item => 
            item.file === file 
              ? { ...item, progress: Math.min(progress, 80) }
              : item
          ));
        }

        // Generate high-quality thumbnail
        const thumbnail = await generateHighQualityThumbnail(file);
        
        // Create file URL for actual playback
        const fileUrl = URL.createObjectURL(file);
        
        // Update progress to show thumbnail generation
        setUploadProgress(prev => prev.map(item => 
          item.file === file 
            ? { ...item, progress: 90, thumbnail, fileUrl }
            : item
        ));

        // Create file item with actual file data
        const fileItem = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' as const :
                file.type.startsWith('video/') ? 'video' as const :
                file.type.startsWith('audio/') ? 'audio' as const :
                file.type.includes('pdf') || file.type.includes('document') ? 'document' as const :
                'archive' as const,
          size: file.size,
          duration: file.type.startsWith('video/') || file.type.startsWith('audio/') ? 0 : undefined,
          thumbnail,
          createdAt: new Date(),
          modifiedAt: new Date(file.lastModified),
          isFavorite: false,
          tags: [],
          metadata: {
            originalFile: file,
            fileUrl,
            width: file.type.startsWith('image/') ? undefined : undefined,
            height: file.type.startsWith('image/') ? undefined : undefined,
          }
        };

        // Add to store
        addFiles([fileItem]);

        // Mark as completed
        setUploadProgress(prev => prev.map(item => 
          item.file === file 
            ? { ...item, progress: 100, status: 'completed' }
            : item
        ));

        // Small delay between files for better UX
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        setUploadProgress(prev => prev.map(item => 
          item.file === file 
            ? { ...item, status: 'error', error: 'Failed to process file' }
            : item
        ));
      }
    }

    // Clear progress after delay if not minimized
    setTimeout(() => {
      if (!isMinimized) {
        setUploadProgress([]);
        setIsUploading(false);
      }
    }, 3000);

    onFilesUploaded?.(validFiles);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFiles(files);
    }
  }, [disabled]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      processFiles(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const removeUploadItem = (file: File) => {
    setUploadProgress(prev => prev.filter(item => item.file !== file));
    if (uploadProgress.length <= 1) {
      setIsUploading(false);
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const clearCompleted = () => {
    setUploadProgress(prev => prev.filter(item => item.status !== 'completed'));
    if (uploadProgress.filter(item => item.status !== 'completed').length === 0) {
      setIsUploading(false);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Zone - Only show when not uploading or when minimized */}
      <AnimatePresence>
        {(!isUploading || isMinimized) && (
          <motion.div
            className={cn(
              "relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer",
              "hover:border-blue-400 hover:bg-blue-500/5",
              isDragOver && "border-blue-500 bg-blue-500/10 scale-105",
              disabled && "opacity-50 cursor-not-allowed",
              "border-white/20 bg-white/5"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple={multiple}
              accept={acceptedTypes.join(',')}
              onChange={handleFileSelect}
              className="hidden"
              disabled={disabled}
            />

            <div className="flex flex-col items-center gap-4">
              <motion.div
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center",
                  "bg-blue-500/20 text-blue-400"
                )}
                animate={{ 
                  scale: isDragOver ? 1.1 : 1,
                  rotate: isDragOver ? 5 : 0 
                }}
              >
                <Upload className="h-8 w-8" />
              </motion.div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {isDragOver ? 'Drop files here' : 'Upload Files'}
                </h3>
                <p className="text-white/60 text-sm">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-white/40 text-xs mt-1">
                  Max size: {Math.round(maxFileSize / (1024 * 1024))}MB
                  {acceptedTypes.length > 0 && !acceptedTypes.includes('*') && 
                    ` • Types: ${acceptedTypes.join(', ')}`
                  }
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Progress Dialog */}
      <AnimatePresence>
        {uploadProgress.length > 0 && (
          <motion.div
            className={cn(
              "fixed bottom-4 right-4 bg-gray-900/95 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl z-50",
              isMinimized ? "w-80" : "w-96 max-h-[70vh]"
            )}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <h4 className="text-white font-medium">
                  {isMinimized ? `${uploadProgress.length} files` : 'Upload Progress'}
                </h4>
              </div>
              <div className="flex items-center gap-1">
                {isUploading && (
                  <Button
                    onClick={togglePause}
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-white/70 hover:text-white"
                  >
                    {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                  </Button>
                )}
                <Button
                  onClick={() => setIsMinimized(!isMinimized)}
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-white/70 hover:text-white"
                >
                  {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
                </Button>
                <Button
                  onClick={clearCompleted}
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-white/70 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Progress List */}
            {!isMinimized && (
              <div className="max-h-80 overflow-y-auto p-2">
                <AnimatePresence mode="popLayout">
                  {uploadProgress.map((item, index) => (
                    <motion.div
                      key={`${item.file.name}-${index}`}
                      className="p-3 rounded-lg border border-white/5 mb-2 bg-white/5"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      layout
                    >
                      <div className="flex items-center gap-3">
                        {/* Thumbnail or Icon */}
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 flex-shrink-0 flex items-center justify-center">
                          {item.thumbnail ? (
                            <img
                              src={item.thumbnail}
                              alt={item.file.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-white/70">
                              {getFileIcon(item.file)}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white text-sm font-medium truncate">
                              {item.file.name}
                            </span>
                            <div className="flex items-center gap-2">
                              {item.status === 'uploading' && (
                                <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                              )}
                              {item.status === 'processing' && (
                                <div className="h-4 w-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                              )}
                              {item.status === 'completed' && (
                                <CheckCircle className="h-4 w-4 text-green-400" />
                              )}
                              {item.status === 'error' && (
                                <AlertCircle className="h-4 w-4 text-red-400" />
                              )}
                              <Button
                                onClick={() => removeUploadItem(item.file)}
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-white/50 hover:text-white"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-white/60 mb-2">
                            <span>{formatFileSize(item.file.size)}</span>
                            <span>
                              {item.status === 'uploading' && 'Uploading...'}
                              {item.status === 'processing' && 'Processing...'}
                              {item.status === 'completed' && 'Completed'}
                              {item.status === 'error' && 'Error'}
                            </span>
                          </div>
                          
                          {item.status === 'error' ? (
                            <p className="text-red-400 text-xs">{item.error}</p>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-white/10 rounded-full h-1.5">
                                <motion.div
                                  className={cn(
                                    "h-full rounded-full",
                                    item.status === 'completed' ? "bg-green-500" :
                                    item.status === 'processing' ? "bg-yellow-500" :
                                    "bg-blue-500"
                                  )}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${item.progress}%` }}
                                  transition={{ duration: 0.3 }}
                                />
                              </div>
                              <span className="text-white/60 text-xs min-w-[35px]">
                                {item.progress}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Minimized Summary */}
            {isMinimized && (
              <div className="p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">
                    {uploadProgress.filter(i => i.status === 'completed').length} / {uploadProgress.length} completed
                  </span>
                  <span className="text-white/50">
                    {isPaused ? 'Paused' : isUploading ? 'Uploading...' : 'Done'}
                  </span>
                </div>
                <div className="mt-2 bg-white/10 rounded-full h-1.5">
                  <div 
                    className="bg-blue-500 h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(uploadProgress.filter(i => i.status === 'completed').length / uploadProgress.length) * 100}%` 
                    }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUploadZone;