import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Monitor,
  Palette,
  Grid,
  Volume2,
  Eye,
  Keyboard,
  Download,
  Upload,
  Shield,
  Database,
  Wifi,
  Bell,
  User,
  Zap,
  MousePointer,
  Smartphone,
  Tablet,
  Sun,
  Moon,
  Contrast,
  Droplets,
  RotateCw,
  Save,
  RotateCcw,
  X,
  ChevronRight,
  ChevronDown,
  Layout,
  Layers,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Sliders,
  ToggleLeft,
  ToggleRight,
  HardDrive,
  Cpu,
  MemoryStick,
  Gauge,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

interface AppSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AppSettingsPanel: React.FC<AppSettingsPanelProps> = ({ isOpen, onClose }) => {
  const { preferences, updatePreferences } = useAppStore();
  const [activeTab, setActiveTab] = useState('interface');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['general']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const CustomSlider = ({ 
    value, 
    onChange, 
    min = 0, 
    max = 100, 
    step = 1,
    label,
    unit = ''
  }: {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    label: string;
    unit?: string;
  }) => (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-white/70">{label}</span>
        <span className="text-white">{value}{unit}</span>
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

  const ToggleSwitch = ({ 
    checked, 
    onChange, 
    label, 
    description 
  }: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    description?: string;
  }) => (
    <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 hover:bg-white/5">
      <div className="flex-1">
        <div className="text-white font-medium">{label}</div>
        {description && (
          <div className="text-white/60 text-sm">{description}</div>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          "relative w-12 h-6 rounded-full transition-colors",
          checked ? "bg-blue-600" : "bg-white/20"
        )}
      >
        <div
          className={cn(
            "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
            checked ? "translate-x-7" : "translate-x-1"
          )}
        />
      </button>
    </div>
  );

  const ColorPicker = ({ 
    value, 
    onChange, 
    label 
  }: {
    value: string;
    onChange: (color: string) => void;
    label: string;
  }) => {
    const colors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
      '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
      '#f97316', '#6366f1', '#14b8a6', '#eab308',
      '#a855f7', '#f43f5e', '#0ea5e9', '#22c55e'
    ];

    return (
      <div className="space-y-2">
        <label className="text-white/70 text-sm">{label}</label>
        <div className="grid grid-cols-8 gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => onChange(color)}
              className={cn(
                "w-8 h-8 rounded-lg border-2 transition-all",
                value === color ? "border-white scale-110" : "border-white/20 hover:border-white/40"
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'interface', label: 'Interface', icon: Layout },
    { id: 'grid', label: 'Grid & Layout', icon: Grid },
    { id: 'media', label: 'Media Player', icon: Video },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'performance', label: 'Performance', icon: Zap },
    { id: 'advanced', label: 'Advanced', icon: Settings },
  ];

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gray-900 rounded-xl border border-white/10 w-full max-w-6xl h-[90vh] flex"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-6 border-b border-white/10 flex items-center justify-between bg-gray-900 rounded-t-xl z-10">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="h-6 w-6" />
            App Settings
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Sidebar */}
        <div className="w-64 border-r border-white/10 pt-20 pb-6">
          <div className="px-4 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 pt-20 pb-6 overflow-y-auto">
          <div className="px-6">
            {activeTab === 'interface' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Layout & Navigation</h3>
                  <div className="space-y-4">
                    <CustomSlider
                      label="Sidebar Width"
                      value={preferences.sidebarWidth}
                      onChange={(value) => updatePreferences({ sidebarWidth: value })}
                      min={200}
                      max={400}
                      step={10}
                      unit="px"
                    />
                    
                    <div>
                      <label className="text-white/70 text-sm mb-2 block">Default View Mode</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['grid', 'list'].map((view) => (
                          <button
                            key={view}
                            onClick={() => updatePreferences({ defaultView: view as any })}
                            className={cn(
                              "p-3 rounded-lg border transition-colors flex items-center gap-2",
                              preferences.defaultView === view
                                ? "border-blue-500 bg-blue-500/20 text-white"
                                : "border-white/20 text-white/70 hover:border-white/40"
                            )}
                          >
                            {view === 'grid' ? <Grid className="h-4 w-4" /> : <Layers className="h-4 w-4" />}
                            <span className="capitalize">{view}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Display Options</h3>
                  <div className="space-y-3">
                    <ToggleSwitch
                      checked={preferences.showFileExtensions}
                      onChange={(checked) => updatePreferences({ showFileExtensions: checked })}
                      label="Show File Extensions"
                      description="Display file extensions in file names"
                    />
                    
                    <ToggleSwitch
                      checked={preferences.showFileSizes}
                      onChange={(checked) => updatePreferences({ showFileSizes: checked })}
                      label="Show File Sizes"
                      description="Display file sizes in the grid"
                    />
                    
                    <ToggleSwitch
                      checked={preferences.enableHoverPreview}
                      onChange={(checked) => updatePreferences({ enableHoverPreview: checked })}
                      label="Hover Preview"
                      description="Show preview on hover"
                    />

                    <ToggleSwitch
                      checked={preferences.showThumbnails}
                      onChange={(checked) => updatePreferences({ showThumbnails: checked })}
                      label="Show Thumbnails"
                      description="Display preview images for files"
                    />

                    <ToggleSwitch
                      checked={preferences.showMetadata}
                      onChange={(checked) => updatePreferences({ showMetadata: checked })}
                      label="Show Metadata"
                      description="Display file metadata information"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Interactions</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-white/70 text-sm mb-2 block">Double Click Action</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['open', 'preview', 'select'].map((action) => (
                          <button
                            key={action}
                            onClick={() => updatePreferences({ doubleClickAction: action as any })}
                            className={cn(
                              "p-2 rounded-lg border transition-colors",
                              preferences.doubleClickAction === action
                                ? "border-blue-500 bg-blue-500/20 text-white"
                                : "border-white/20 text-white/70 hover:border-white/40"
                            )}
                          >
                            <span className="capitalize">{action}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <ToggleSwitch
                      checked={preferences.keyboardShortcuts}
                      onChange={(checked) => updatePreferences({ keyboardShortcuts: checked })}
                      label="Enable Keyboard Shortcuts"
                      description="Use keyboard shortcuts for faster navigation"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'grid' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Grid Layout</h3>
                  <div className="space-y-4">
                    <CustomSlider
                      label="Grid Columns"
                      value={preferences.gridColumns}
                      onChange={(value) => updatePreferences({ gridColumns: value })}
                      min={2}
                      max={8}
                      step={1}
                    />
                    
                    <CustomSlider
                      label="Card Spacing"
                      value={preferences.cardSpacing}
                      onChange={(value) => updatePreferences({ cardSpacing: value })}
                      min={8}
                      max={32}
                      step={2}
                      unit="px"
                    />

                    <CustomSlider
                      label="Border Radius"
                      value={preferences.borderRadius}
                      onChange={(value) => updatePreferences({ borderRadius: value })}
                      min={0}
                      max={24}
                      step={2}
                      unit="px"
                    />
                    
                    <div>
                      <label className="text-white/70 text-sm mb-2 block">Grid Size</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['small', 'medium', 'large'].map((size) => (
                          <button
                            key={size}
                            onClick={() => updatePreferences({ gridSize: size as any })}
                            className={cn(
                              "p-3 rounded-lg border transition-colors flex items-center justify-center",
                              preferences.gridSize === size
                                ? "border-blue-500 bg-blue-500/20 text-white"
                                : "border-white/20 text-white/70 hover:border-white/40"
                            )}
                          >
                            <span className="capitalize">{size}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Thumbnails</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-white/70 text-sm mb-2 block">Thumbnail Quality</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['low', 'medium', 'high'].map((quality) => (
                          <button
                            key={quality}
                            onClick={() => updatePreferences({ thumbnailQuality: quality as any })}
                            className={cn(
                              "p-2 rounded-lg border transition-colors",
                              preferences.thumbnailQuality === quality
                                ? "border-blue-500 bg-blue-500/20 text-white"
                                : "border-white/20 text-white/70 hover:border-white/40"
                            )}
                          >
                            <span className="capitalize">{quality}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <CustomSlider
                      label="Max Thumbnail Size"
                      value={preferences.maxThumbnailSize}
                      onChange={(value) => updatePreferences({ maxThumbnailSize: value })}
                      min={200}
                      max={800}
                      step={50}
                      unit="px"
                    />

                    <ToggleSwitch
                      checked={preferences.preloadThumbnails}
                      onChange={(checked) => updatePreferences({ preloadThumbnails: checked })}
                      label="Preload Thumbnails"
                      description="Load thumbnails in advance for better performance"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">File Type Icons</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border border-white/10 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Video className="h-5 w-5 text-red-400" />
                        <span className="text-white">Video Files</span>
                      </div>
                      <p className="text-white/60 text-sm">Show video thumbnails and duration</p>
                    </div>
                    <div className="p-4 border border-white/10 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <ImageIcon className="h-5 w-5 text-green-400" />
                        <span className="text-white">Image Files</span>
                      </div>
                      <p className="text-white/60 text-sm">Show image previews and dimensions</p>
                    </div>
                    <div className="p-4 border border-white/10 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Music className="h-5 w-5 text-blue-400" />
                        <span className="text-white">Audio Files</span>
                      </div>
                      <p className="text-white/60 text-sm">Show waveform and duration</p>
                    </div>
                    <div className="p-4 border border-white/10 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-5 w-5 text-yellow-400" />
                        <span className="text-white">Documents</span>
                      </div>
                      <p className="text-white/60 text-sm">Show document previews</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'media' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Video Player</h3>
                  <div className="space-y-3">
                    <ToggleSwitch
                      checked={preferences.videoAutoPlay}
                      onChange={(checked) => updatePreferences({ videoAutoPlay: checked })}
                      label="Auto Play Videos"
                      description="Automatically play videos when opened"
                    />
                    
                    <CustomSlider
                      label="Default Volume"
                      value={Math.round(preferences.videoVolume * 100)}
                      onChange={(value) => updatePreferences({ videoVolume: value / 100 })}
                      min={0}
                      max={100}
                      step={5}
                      unit="%"
                    />
                    
                    <ToggleSwitch
                      checked={preferences.enableGestures}
                      onChange={(checked) => updatePreferences({ enableGestures: checked })}
                      label="Mouse Gestures"
                      description="Enable mouse gestures for video control"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Image Viewer</h3>
                  <div className="space-y-3">
                    <ToggleSwitch
                      checked={preferences.imageTransitions}
                      onChange={(checked) => updatePreferences({ imageTransitions: checked })}
                      label="Image Transitions"
                      description="Smooth transitions between images"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">General Media</h3>
                  <div className="space-y-3">
                    <ToggleSwitch
                      checked={preferences.autoPlay}
                      onChange={(checked) => updatePreferences({ autoPlay: checked })}
                      label="Auto Play Media"
                      description="Automatically play media files"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Theme</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {['dark', 'light', 'auto'].map((theme) => (
                      <button
                        key={theme}
                        onClick={() => updatePreferences({ theme: theme as any })}
                        className={cn(
                          "p-4 rounded-lg border-2 transition-colors",
                          preferences.theme === theme
                            ? "border-blue-500 bg-blue-500/20"
                            : "border-white/20 hover:border-white/40"
                        )}
                      >
                        <div className="flex items-center gap-2 text-white">
                          {theme === 'dark' && <Moon className="h-5 w-5" />}
                          {theme === 'light' && <Sun className="h-5 w-5" />}
                          {theme === 'auto' && <Monitor className="h-5 w-5" />}
                          <span className="capitalize">{theme}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Accent Color</h3>
                  <ColorPicker
                    value="#3b82f6"
                    onChange={(color) => console.log('Color changed:', color)}
                    label="Primary Accent"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Visual Effects</h3>
                  <div className="space-y-3">
                    <ToggleSwitch
                      checked={preferences.enableAnimations}
                      onChange={(checked) => updatePreferences({ enableAnimations: checked })}
                      label="Enable Animations"
                      description="Show smooth animations and transitions"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Rendering</h3>
                  <div className="space-y-3">
                    <ToggleSwitch
                      checked={preferences.enableVirtualization}
                      onChange={(checked) => updatePreferences({ enableVirtualization: checked })}
                      label="Enable Virtualization"
                      description="Use virtual scrolling for better performance with large file lists"
                    />

                    <ToggleSwitch
                      checked={preferences.enableAnimations}
                      onChange={(checked) => updatePreferences({ enableAnimations: checked })}
                      label="Enable Animations"
                      description="Show smooth animations and transitions"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Data Management</h3>
                  <div className="space-y-3">
                    <ToggleSwitch
                      checked={preferences.autoSave}
                      onChange={(checked) => updatePreferences({ autoSave: checked })}
                      label="Auto Save"
                      description="Automatically save changes"
                    />
                    
                    <ToggleSwitch
                      checked={preferences.backupEnabled}
                      onChange={(checked) => updatePreferences({ backupEnabled: checked })}
                      label="Enable Backups"
                      description="Create automatic backups of your data"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">System Resources</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border border-white/10 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Cpu className="h-5 w-5 text-blue-400" />
                        <span className="text-white">CPU Usage</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }} />
                      </div>
                      <p className="text-white/60 text-sm mt-1">45% - Normal</p>
                    </div>
                    <div className="p-4 border border-white/10 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MemoryStick className="h-5 w-5 text-green-400" />
                        <span className="text-white">Memory Usage</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '62%' }} />
                      </div>
                      <p className="text-white/60 text-sm mt-1">62% - Good</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Keyboard Shortcuts</h3>
                  <div className="space-y-3">
                    <ToggleSwitch
                      checked={preferences.keyboardShortcuts}
                      onChange={(checked) => updatePreferences({ keyboardShortcuts: checked })}
                      label="Enable Keyboard Shortcuts"
                      description="Use keyboard shortcuts for faster navigation"
                    />
                    
                    <div className="bg-white/5 rounded-lg p-4 space-y-2">
                      <h4 className="text-white font-medium">Available Shortcuts</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-white/70">Ctrl + A</div>
                        <div className="text-white/60">Select All</div>
                        <div className="text-white/70">Escape</div>
                        <div className="text-white/60">Clear Selection</div>
                        <div className="text-white/70">Ctrl + F</div>
                        <div className="text-white/60">Search</div>
                        <div className="text-white/70">Ctrl + 1</div>
                        <div className="text-white/60">Grid View</div>
                        <div className="text-white/70">Ctrl + 2</div>
                        <div className="text-white/60">List View</div>
                        <div className="text-white/70">Space</div>
                        <div className="text-white/60">Play/Pause</div>
                        <div className="text-white/70">F11</div>
                        <div className="text-white/60">Fullscreen</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Import/Export</h3>
                  <div className="space-y-3">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <Download className="h-4 w-4 mr-2" />
                      Export Settings
                    </Button>
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                      <Upload className="h-4 w-4 mr-2" />
                      Import Settings
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Reset</h3>
                  <div className="space-y-3">
                    <Button 
                      onClick={() => {
                        // Reset to defaults
                        updatePreferences({
                          theme: 'dark',
                          sidebarWidth: 280,
                          gridSize: 'medium',
                          autoPlay: false,
                          showThumbnails: true,
                          enableAnimations: true,
                          keyboardShortcuts: true,
                          defaultView: 'grid',
                          autoSave: true,
                          backupEnabled: true,
                          thumbnailQuality: 'high',
                          gridColumns: 4,
                          showFileExtensions: true,
                          showFileSizes: true,
                          enableHoverPreview: true,
                          videoAutoPlay: false,
                          videoVolume: 0.8,
                          imageTransitions: true,
                          enableGestures: true,
                          doubleClickAction: 'open',
                          cardSpacing: 16,
                          borderRadius: 12,
                          showMetadata: true,
                          enableVirtualization: true,
                          preloadThumbnails: true,
                          maxThumbnailSize: 400,
                        });
                        alert('Settings reset to defaults');
                      }}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset to Defaults
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Debug Information</h3>
                  <div className="bg-white/5 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/70">App Version:</span>
                      <span className="text-white">1.0.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Build:</span>
                      <span className="text-white">2024.01.15</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Platform:</span>
                      <span className="text-white">Web</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Browser:</span>
                      <span className="text-white">{navigator.userAgent.split(' ')[0]}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AppSettingsPanel;