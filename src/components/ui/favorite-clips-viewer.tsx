import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Edit,
  Trash2,
  Tag,
  Clock,
  Calendar,
  Star,
  Filter,
  Search,
  Grid,
  List,
  SortAsc,
  SortDesc,
  MoreVertical,
  Eye,
  Download,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, formatTime } from '@/lib/utils';
import { useAppStore, VideoClip } from '@/store/useAppStore';

interface FavoriteClipsViewerProps {
  onPlayClip: (clip: VideoClip) => void;
}

const FavoriteClipsViewer: React.FC<FavoriteClipsViewerProps> = ({ onPlayClip }) => {
  const { favoriteClips, updateFavoriteClip, deleteFavoriteClip, tags } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'duration'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedClips, setSelectedClips] = useState<Set<string>>(new Set());
  const [editingClip, setEditingClip] = useState<VideoClip | null>(null);

  const filteredAndSortedClips = React.useMemo(() => {
    let filtered = favoriteClips;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(clip =>
        clip.name.toLowerCase().includes(query) ||
        clip.description?.toLowerCase().includes(query) ||
        clip.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply tag filter
    if (selectedTag) {
      filtered = filtered.filter(clip => clip.tags.includes(selectedTag));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'duration':
          comparison = (a.endTime - a.startTime) - (b.endTime - b.startTime);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [favoriteClips, searchQuery, selectedTag, sortBy, sortOrder]);

  const toggleClipSelection = (clipId: string) => {
    setSelectedClips(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clipId)) {
        newSet.delete(clipId);
      } else {
        newSet.add(clipId);
      }
      return newSet;
    });
  };

  const handleEditClip = (clip: VideoClip) => {
    setEditingClip(clip);
  };

  const handleSaveEdit = () => {
    if (editingClip) {
      updateFavoriteClip(editingClip.id, editingClip);
      setEditingClip(null);
    }
  };

  const handleDeleteClip = (clipId: string) => {
    deleteFavoriteClip(clipId);
    setSelectedClips(prev => {
      const newSet = new Set(prev);
      newSet.delete(clipId);
      return newSet;
    });
  };

  const ClipCard = ({ clip }: { clip: VideoClip }) => {
    const duration = clip.endTime - clip.startTime;
    const isSelected = selectedClips.has(clip.id);

    if (viewMode === 'list') {
      return (
        <motion.div
          className={cn(
            "flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 cursor-pointer",
            "hover:bg-white/5 hover:border-white/20 group",
            isSelected && "bg-blue-500/20 border-blue-500/50",
            "border-white/10"
          )}
          onClick={() => toggleClipSelection(clip.id)}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {/* Thumbnail */}
          <div className="w-20 h-12 rounded-lg overflow-hidden bg-white/10 flex-shrink-0 relative">
            {clip.thumbnail ? (
              <img
                src={clip.thumbnail}
                alt={clip.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/50">
                <Play className="h-6 w-6" />
              </div>
            )}
            <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
              {formatTime(duration)}
            </div>
          </div>

          {/* Clip Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-white truncate group-hover:text-blue-300 transition-colors">
              {clip.name}
            </h3>
            <div className="flex items-center gap-3 mt-1 text-xs text-white/50">
              <span>{formatTime(clip.startTime)} - {formatTime(clip.endTime)}</span>
              <span>•</span>
              <span>{clip.createdAt.toLocaleDateString()}</span>
              {clip.rating && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{clip.rating}</span>
                  </div>
                </>
              )}
            </div>
            {clip.description && (
              <p className="text-xs text-white/40 mt-1 truncate">{clip.description}</p>
            )}
          </div>

          {/* Tags */}
          {clip.tags.length > 0 && (
            <div className="flex gap-1 flex-shrink-0">
              {clip.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
              {clip.tags.length > 2 && (
                <span className="px-2 py-1 bg-white/10 text-white/50 text-xs rounded-full">
                  +{clip.tags.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onPlayClip(clip);
              }}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/70 hover:bg-white/10 hover:text-white"
            >
              <Play className="h-4 w-4" />
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleEditClip(clip);
              }}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/70 hover:bg-white/10 hover:text-white"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClip(clip.id);
              }}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/70 hover:bg-white/10 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
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
        onClick={() => toggleClipSelection(clip.id)}
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        layout
      >
        {/* Thumbnail */}
        <div className="aspect-video relative overflow-hidden bg-white/10">
          {clip.thumbnail ? (
            <img
              src={clip.thumbnail}
              alt={clip.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/30">
              <Play className="h-12 w-12" />
            </div>
          )}

          {/* Overlay */}
          <AnimatePresence>
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <div className="flex items-center gap-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayClip(clip);
                  }}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 hover:text-white w-12 h-12"
                >
                  <Play className="h-6 w-6" />
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditClip(clip);
                  }}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 hover:text-white w-12 h-12"
                >
                  <Edit className="h-6 w-6" />
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Duration Badge */}
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            {formatTime(duration)}
          </div>

          {/* Rating Badge */}
          {clip.rating && (
            <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{clip.rating}</span>
            </div>
          )}

          {/* Time Range Badge */}
          <div className="absolute top-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-medium text-white group-hover:text-blue-300 transition-colors truncate mb-2">
            {clip.name}
          </h3>

          {clip.description && (
            <p className="text-xs text-white/60 mb-3 line-clamp-2">{clip.description}</p>
          )}

          <div className="flex items-center justify-between text-xs text-white/50 mb-3">
            <span>{clip.fileName}</span>
            <span>{clip.createdAt.toLocaleDateString()}</span>
          </div>

          {/* Tags */}
          {clip.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {clip.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
              {clip.tags.length > 3 && (
                <span className="px-2 py-1 bg-white/10 text-white/50 text-xs rounded-full">
                  +{clip.tags.length - 3}
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
                  onPlayClip(clip);
                }}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/70 hover:bg-white/10 hover:text-white"
              >
                <Play className="h-4 w-4" />
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditClip(clip);
                }}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/70 hover:bg-white/10 hover:text-white"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/70 hover:bg-white/10 hover:text-white"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
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
                handleDeleteClip(clip.id);
              }}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/70 hover:bg-white/10 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Favorite Clips</h2>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              variant="ghost"
              size="icon"
              className="text-white/70 hover:bg-white/10 hover:text-white"
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
            <input
              type="text"
              placeholder="Search clips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Tags</option>
            {tags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'duration')}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="duration">Sort by Duration</option>
          </select>

          <Button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            variant="ghost"
            size="icon"
            className="text-white/70 hover:bg-white/10 hover:text-white"
          >
            {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-white/60">
          <span>{filteredAndSortedClips.length} clips</span>
          {selectedClips.size > 0 && (
            <span>{selectedClips.size} selected</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {filteredAndSortedClips.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/50">
            <Clock className="h-16 w-16 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No clips found</h3>
            <p className="text-center">
              {favoriteClips.length === 0 
                ? "Start creating clips by marking your favorite parts in videos"
                : "Try adjusting your search or filters"
              }
            </p>
          </div>
        ) : (
          <div className={cn(
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          )}>
            <AnimatePresence mode="popLayout">
              {filteredAndSortedClips.map((clip, index) => (
                <motion.div
                  key={clip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  layout
                >
                  <ClipCard clip={clip} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <AnimatePresence>
        {editingClip && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-900 rounded-xl p-6 border border-white/10 min-w-[500px] max-w-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-white font-semibold mb-4">Edit Clip</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-white/70 text-sm mb-1 block">Clip Name</label>
                  <input
                    type="text"
                    value={editingClip.name}
                    onChange={(e) => setEditingClip({...editingClip, name: e.target.value})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="text-white/70 text-sm mb-1 block">Description</label>
                  <textarea
                    value={editingClip.description || ''}
                    onChange={(e) => setEditingClip({...editingClip, description: e.target.value})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                    placeholder="Add a description..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/70 text-sm mb-1 block">Start Time</label>
                    <input
                      type="number"
                      value={editingClip.startTime}
                      onChange={(e) => setEditingClip({...editingClip, startTime: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="text-white/70 text-sm mb-1 block">End Time</label>
                    <input
                      type="number"
                      value={editingClip.endTime}
                      onChange={(e) => setEditingClip({...editingClip, endTime: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="0.1"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-white/70 text-sm mb-1 block">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button
                        key={rating}
                        onClick={() => setEditingClip({...editingClip, rating})}
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "text-white/70 hover:bg-white/10",
                          editingClip.rating && editingClip.rating >= rating && "text-yellow-400"
                        )}
                      >
                        <Star className={cn(
                          "h-4 w-4",
                          editingClip.rating && editingClip.rating >= rating && "fill-current"
                        )} />
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-white/70 text-sm mb-1 block">Tags</label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {tags.map((tag) => (
                      <Button
                        key={tag}
                        onClick={() => {
                          const newTags = editingClip.tags.includes(tag)
                            ? editingClip.tags.filter(t => t !== tag)
                            : [...editingClip.tags, tag];
                          setEditingClip({...editingClip, tags: newTags});
                        }}
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "text-xs",
                          editingClip.tags.includes(tag) 
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
                  onClick={() => setEditingClip(null)}
                  variant="ghost"
                  className="flex-1 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Save Changes
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FavoriteClipsViewer;