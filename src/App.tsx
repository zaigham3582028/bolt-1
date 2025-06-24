import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useHotkeys } from 'react-hotkeys-hook';
import { X } from 'lucide-react';

import { cn } from './lib/utils';
import { Button } from './components/ui/button';
import EnhancedSidebar from './components/layout/enhanced-sidebar';
import Header from './components/layout/header';
import FileGrid from './components/file-grid/file-grid';
import AdvancedVideoPlayer from './components/ui/advanced-video-player';
import AdvancedImageViewer from './components/ui/advanced-image-viewer';
import FavoriteClipsViewer from './components/ui/favorite-clips-viewer';
import AdvancedCategorization from './components/ui/advanced-categorization';
import AICategorizationPanel from './components/ai/AICategorizationPanel';
import AppSettingsPanel from './components/settings/AppSettingsPanel';

import { useAppStore } from './store/useAppStore';
import { FileItem } from './components/file-grid/file-card';

function App() {
  const {
    files,
    categories,
    selectedFiles,
    favoriteClips,
    searchQuery,
    selectedCategoryId,
    viewMode,
    sortBy,
    sortOrder,
    preferences,
    toggleFileSelection,
    toggleFavorite,
    addFavoriteClip,
    setSearchQuery,
    setSelectedCategoryId,
    setViewMode,
    setSortBy,
    setSortOrder,
    clearSelection,
    selectAllFiles
  } = useAppStore();

  const [currentMedia, setCurrentMedia] = useState<FileItem | null>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [showFavoriteClips, setShowFavoriteClips] = useState(false);
  const [showCategorization, setShowCategorization] = useState(false);
  const [showAICategorization, setShowAICategorization] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const imageFiles = files.filter(file => file.type === 'image');

  // Keyboard shortcuts
  useHotkeys('ctrl+a', (e) => {
    e.preventDefault();
    selectAllFiles();
  });

  useHotkeys('escape', () => {
    clearSelection();
    setShowVideoPlayer(false);
    setShowImageViewer(false);
    setShowFavoriteClips(false);
    setShowCategorization(false);
    setShowAICategorization(false);
    setShowSettings(false);
  });

  useHotkeys('ctrl+f', (e) => {
    e.preventDefault();
    // Focus search input
    const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
    searchInput?.focus();
  });

  useHotkeys('ctrl+1', () => setViewMode('grid'));
  useHotkeys('ctrl+2', () => setViewMode('list'));

  const handleFilePlay = (file: FileItem) => {
    setCurrentMedia(file);
    if (file.type === 'video') {
      setShowVideoPlayer(true);
    } else if (file.type === 'image') {
      const imageIndex = imageFiles.findIndex(img => img.id === file.id);
      setCurrentImageIndex(imageIndex);
      setShowImageViewer(true);
    }
  };

  const handleFilePreview = (file: FileItem) => {
    handleFilePlay(file);
  };

  const handleDownload = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file) {
      console.log('Downloading:', file.name);
      // Implement download logic
    }
  };

  const handleShare = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file) {
      console.log('Sharing:', file.name);
      // Implement share logic
    }
  };

  const handleUpload = () => {
    console.log('Upload files');
    // This is now handled in the Header component
  };

  const handleRefresh = () => {
    console.log('Refresh files');
    // Implement refresh logic
    window.location.reload();
  };

  const handleCreateCategory = () => {
    setShowCategorization(true);
  };

  const handleShowAICategorization = () => {
    setShowAICategorization(true);
  };

  const handleNextImage = () => {
    if (currentImageIndex < imageFiles.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handlePreviousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleToggleImageFavorite = () => {
    if (imageFiles[currentImageIndex]) {
      toggleFavorite(imageFiles[currentImageIndex].id);
    }
  };

  const handleAddToFavorites = (clip: any) => {
    if (currentMedia) {
      addFavoriteClip({
        ...clip,
        fileId: currentMedia.id,
        fileName: currentMedia.name,
        thumbnail: currentMedia.thumbnail
      });
    }
  };

  const handleSaveClip = (clip: any) => {
    if (currentMedia) {
      addFavoriteClip({
        ...clip,
        fileId: currentMedia.id,
        fileName: currentMedia.name,
        thumbnail: currentMedia.thumbnail
      });
    }
  };

  const handlePlayClip = (clip: any) => {
    // Find the file and play the specific clip
    const file = files.find(f => f.id === clip.fileId);
    if (file) {
      setCurrentMedia(file);
      setShowVideoPlayer(true);
      // TODO: Implement clip-specific playback
    }
  };

  // Filter files based on selected category - Fixed to show files properly
  const filteredFiles = React.useMemo(() => {
    let filtered = files;

    // Apply category filter
    if (selectedCategoryId !== 'all') {
      switch (selectedCategoryId) {
        case 'videos':
          filtered = filtered.filter(file => file.type === 'video');
          break;
        case 'images':
          filtered = filtered.filter(file => file.type === 'image');
          break;
        case 'audio':
          filtered = filtered.filter(file => file.type === 'audio');
          break;
        case 'documents':
          filtered = filtered.filter(file => file.type === 'document');
          break;
        case 'archives':
          filtered = filtered.filter(file => file.type === 'archive');
          break;
        case 'favorites':
          filtered = filtered.filter(file => file.isFavorite);
          break;
        case 'fav-parts':
          setShowFavoriteClips(true);
          return files; // Return all files, don't filter to empty
        case 'recent':
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          filtered = filtered.filter(file => file.modifiedAt > dayAgo);
          break;
        case 'large-files':
          filtered = filtered.filter(file => file.size > 100 * 1024 * 1024);
          break;
        case 'untagged':
          filtered = filtered.filter(file => file.tags.length === 0);
          break;
        default:
          // Check if it's a custom category
          const category = categories.find(c => c.id === selectedCategoryId);
          if (category && category.rules) {
            filtered = filtered.filter(file =>
              category.rules!.some(rule =>
                file.name.toLowerCase().includes(rule.toLowerCase()) ||
                file.tags.some(tag => tag.toLowerCase().includes(rule.toLowerCase()))
              )
            );
          }
      }
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(file =>
        file.name.toLowerCase().includes(query) ||
        file.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [files, selectedCategoryId, categories, searchQuery]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={cn(
        "h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden",
        preferences.theme === 'light' && "from-gray-100 via-gray-200 to-white text-gray-900"
      )}>
        <div className="h-full flex">
          {/* Sidebar */}
          <EnhancedSidebar
            categories={categories}
            onCategorySelect={setSelectedCategoryId}
            selectedCategoryId={selectedCategoryId}
            onCreateCategory={handleCreateCategory}
            onSearch={setSearchQuery}
            onShowCategorization={() => setShowCategorization(true)}
            onShowAnalytics={() => setShowAnalytics(true)}
            onShowAICategorization={handleShowAICategorization}
            onShowSettings={() => setShowSettings(true)}
          />

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <Header
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onUpload={handleUpload}
              onRefresh={handleRefresh}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCount={selectedFiles.size}
              onShowSettings={() => setShowSettings(true)}
            />

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                {showFavoriteClips ? (
                  <motion.div
                    key="favorite-clips"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full"
                  >
                    <FavoriteClipsViewer onPlayClip={handlePlayClip} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="file-grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full"
                  >
                    <FileGrid
                      files={filteredFiles}
                      viewMode={viewMode}
                      selectedFiles={selectedFiles}
                      onFileSelect={toggleFileSelection}
                      onFilePlay={handleFilePlay}
                      onFilePreview={handleFilePreview}
                      onToggleFavorite={toggleFavorite}
                      onDownload={handleDownload}
                      onShare={handleShare}
                      searchQuery={searchQuery}
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Video Player Modal */}
        <AnimatePresence>
          {showVideoPlayer && currentMedia && (
            <motion.div
              className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AdvancedVideoPlayer
                src={currentMedia.metadata?.fileUrl || currentMedia.thumbnail || ''}
                file={currentMedia}
                onAddToFavorites={handleAddToFavorites}
                onSaveClip={handleSaveClip}
                onClose={() => setShowVideoPlayer(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Image Viewer */}
        <AdvancedImageViewer
          src={imageFiles[currentImageIndex]?.thumbnail || ''}
          alt={imageFiles[currentImageIndex]?.name || ''}
          isOpen={showImageViewer}
          onClose={() => setShowImageViewer(false)}
          onNext={handleNextImage}
          onPrevious={handlePreviousImage}
          onToggleFavorite={handleToggleImageFavorite}
          isFavorite={imageFiles[currentImageIndex]?.isFavorite || false}
          images={imageFiles.map(img => img.thumbnail || '')}
          currentIndex={currentImageIndex}
        />

        {/* Advanced Categorization Modal */}
        <AnimatePresence>
          {showCategorization && (
            <AdvancedCategorization
              onClose={() => setShowCategorization(false)}
            />
          )}
        </AnimatePresence>

        {/* AI Categorization Panel */}
        <AnimatePresence>
          {showAICategorization && (
            <AICategorizationPanel
              isOpen={showAICategorization}
              onClose={() => setShowAICategorization(false)}
            />
          )}
        </AnimatePresence>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <AppSettingsPanel
              isOpen={showSettings}
              onClose={() => setShowSettings(false)}
            />
          )}
        </AnimatePresence>

        {/* Analytics Modal */}
        <AnimatePresence>
          {showAnalytics && (
            <motion.div
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-gray-900 rounded-xl border border-white/10 w-full max-w-4xl h-[80vh] p-6"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
                  <Button
                    onClick={() => setShowAnalytics(false)}
                    variant="ghost"
                    size="icon"
                    className="text-white/70 hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-2">Total Files</h3>
                    <p className="text-2xl font-bold text-blue-400">{files.length}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-2">Total Size</h3>
                    <p className="text-2xl font-bold text-green-400">
                      {Math.round(files.reduce((sum, file) => sum + file.size, 0) / (1024 * 1024 * 1024))} GB
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-2">Favorites</h3>
                    <p className="text-2xl font-bold text-red-400">
                      {files.filter(f => f.isFavorite).length}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-2">Video Files</h3>
                    <p className="text-2xl font-bold text-purple-400">
                      {files.filter(f => f.type === 'video').length}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-2">Image Files</h3>
                    <p className="text-2xl font-bold text-yellow-400">
                      {files.filter(f => f.type === 'image').length}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-2">Favorite Clips</h3>
                    <p className="text-2xl font-bold text-pink-400">{favoriteClips.length}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DndProvider>
  );
}

export default App;