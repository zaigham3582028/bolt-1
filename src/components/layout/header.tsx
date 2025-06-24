import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Grid, List, MoreVertical, Upload, Download, RefreshCw, Settings, User, Bell, X, Sliders, Layout, Palette, Monitor, Zap, Columns, Rows, Space as Spacing, Eye, EyeOff, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import FileUploadZone from '@/components/upload/FileUploadZone';
import AppSettingsPanel from '@/components/settings/AppSettingsPanel';
import { useAppStore } from '@/store/useAppStore';

interface HeaderProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onUpload: () => void;
  onRefresh: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCount: number;
  onShowSettings?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  viewMode,
  onViewModeChange,
  onUpload,
  onRefresh,
  searchQuery,
  onSearchChange,
  selectedCount,
  onShowSettings
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAppSettings, setShowAppSettings] = useState(false);
  const [showGridSettings, setShowGridSettings] = useState(false);
  const { preferences, updatePreferences } = useAppStore();

  const handleUpload = () => {
    setShowUploadModal(true);
  };

  const handleRefresh = () => {
    // Refresh the file list
    window.location.reload();
  };

  const handleDownloadSelected = () => {
    // TODO: Implement batch download functionality
    console.log('Downloading selected files...');
  };

  return (
    <>
      <motion.div
        className="h-16 bg-white/5 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Left Section */}
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
            <input
              type="text"
              placeholder="Search files, folders, and content..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {selectedCount > 0 && (
            <motion.div
              className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <span className="text-sm text-blue-400 font-medium">
                {selectedCount} selected
              </span>
              <Button
                onClick={handleDownloadSelected}
                variant="ghost"
                size="sm"
                className="text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 h-6 px-2"
              >
                <Download className="h-3 w-3" />
              </Button>
            </motion.div>
          )}
        </div>

        {/* Center Section */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefresh}
            variant="ghost"
            size="icon"
            className="text-white/70 hover:bg-white/10 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-white/70 hover:bg-white/10 hover:text-white"
          >
            <Filter className="h-4 w-4" />
          </Button>

          <div className="flex items-center bg-white/10 rounded-lg p-1">
            <Button
              onClick={() => onViewModeChange('grid')}
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 px-2 text-white/70 hover:bg-white/10 hover:text-white",
                viewMode === 'grid' && "bg-white/20 text-white"
              )}
            >
              <Grid className="h-3 w-3" />
            </Button>
            <Button
              onClick={() => onViewModeChange('list')}
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 px-2 text-white/70 hover:bg-white/10 hover:text-white",
                viewMode === 'list' && "bg-white/20 text-white"
              )}
            >
              <List className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleUpload}
            variant="default"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-white/70 hover:bg-white/10 hover:text-white"
          >
            <Bell className="h-4 w-4" />
          </Button>

          {/* Grid Settings Dropdown */}
          <div className="relative">
            <Button
              onClick={() => setShowGridSettings(!showGridSettings)}
              variant="ghost"
              size="icon"
              className="text-white/70 hover:bg-white/10 hover:text-white"
            >
              <Sliders className="h-4 w-4" />
            </Button>

            {showGridSettings && (
              <motion.div
                className="absolute top-12 right-0 bg-gray-900 rounded-xl border border-white/10 p-4 min-w-[300px] z-50"
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
              >
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <Grid className="h-4 w-4" />
                  Grid Layout Settings
                </h3>
                
                <div className="space-y-4">
                  {/* Grid Columns */}
                  <div>
                    <label className="text-white/70 text-sm mb-2 block">Columns: {preferences.gridColumns}</label>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => updatePreferences({ gridColumns: Math.max(1, preferences.gridColumns - 1) })}
                        variant="ghost"
                        size="sm"
                        className="text-white/70 hover:bg-white/10"
                      >
                        -
                      </Button>
                      <div className="flex-1 bg-white/10 rounded-full h-2 relative">
                        <div 
                          className="bg-blue-500 h-full rounded-full transition-all"
                          style={{ width: `${(preferences.gridColumns / 8) * 100}%` }}
                        />
                      </div>
                      <Button
                        onClick={() => updatePreferences({ gridColumns: Math.min(8, preferences.gridColumns + 1) })}
                        variant="ghost"
                        size="sm"
                        className="text-white/70 hover:bg-white/10"
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  {/* Grid Size */}
                  <div>
                    <label className="text-white/70 text-sm mb-2 block">Grid Size</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['small', 'medium', 'large'].map((size) => (
                        <Button
                          key={size}
                          onClick={() => updatePreferences({ gridSize: size as any })}
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "text-white/70 hover:bg-white/10",
                            preferences.gridSize === size && "bg-white/20 text-white"
                          )}
                        >
                          <span className="capitalize">{size}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Display Options */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70 text-sm">Show Thumbnails</span>
                      <Button
                        onClick={() => updatePreferences({ showThumbnails: !preferences.showThumbnails })}
                        variant="ghost"
                        size="sm"
                        className="text-white/70 hover:bg-white/10"
                      >
                        {preferences.showThumbnails ? <ToggleRight className="h-4 w-4 text-green-400" /> : <ToggleLeft className="h-4 w-4" />}
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-white/70 text-sm">Show File Sizes</span>
                      <Button
                        onClick={() => updatePreferences({ showFileSizes: !preferences.showFileSizes })}
                        variant="ghost"
                        size="sm"
                        className="text-white/70 hover:bg-white/10"
                      >
                        {preferences.showFileSizes ? <ToggleRight className="h-4 w-4 text-green-400" /> : <ToggleLeft className="h-4 w-4" />}
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-white/70 text-sm">Hover Preview</span>
                      <Button
                        onClick={() => updatePreferences({ enableHoverPreview: !preferences.enableHoverPreview })}
                        variant="ghost"
                        size="sm"
                        className="text-white/70 hover:bg-white/10"
                      >
                        {preferences.enableHoverPreview ? <ToggleRight className="h-4 w-4 text-green-400" /> : <ToggleLeft className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Thumbnail Quality */}
                  <div>
                    <label className="text-white/70 text-sm mb-2 block">Thumbnail Quality</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['low', 'medium', 'high'].map((quality) => (
                        <Button
                          key={quality}
                          onClick={() => updatePreferences({ thumbnailQuality: quality as any })}
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "text-white/70 hover:bg-white/10",
                            preferences.thumbnailQuality === quality && "bg-white/20 text-white"
                          )}
                        >
                          <span className="capitalize">{quality}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <Button
            onClick={() => setShowAppSettings(true)}
            variant="ghost"
            size="icon"
            className="text-white/70 hover:bg-white/10 hover:text-white"
          >
            <Settings className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-white/70 hover:bg-white/10 hover:text-white"
          >
            <User className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-white/70 hover:bg-white/10 hover:text-white"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Upload Modal */}
      {showUploadModal && (
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gray-900 rounded-xl border border-white/10 w-full max-w-2xl mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Upload Files</h2>
                <Button
                  onClick={() => setShowUploadModal(false)}
                  variant="ghost"
                  size="icon"
                  className="text-white/70 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <FileUploadZone
                onFilesUploaded={(files) => {
                  console.log('Files uploaded:', files);
                  setShowUploadModal(false);
                }}
                multiple={true}
                maxFileSize={500 * 1024 * 1024} // 500MB
              />
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* App Settings Panel */}
      <AppSettingsPanel
        isOpen={showAppSettings}
        onClose={() => setShowAppSettings(false)}
      />
    </>
  );
};

export default Header;