import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Folder,
  FolderOpen,
  Heart,
  Star,
  Tag,
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Settings,
  Home,
  Video,
  Image,
  Music,
  FileText,
  Archive,
  Clock,
  Calendar,
  TrendingUp,
  BarChart3,
  Layers,
  Wand2,
  Brain,
  Zap,
  Database,
  HardDrive,
  Wifi,
  WifiOff,
  User,
  Users,
  Shield,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppStore, Category } from '@/store/useAppStore';

interface EnhancedSidebarProps {
  onCategorySelect: (categoryId: string) => void;
  selectedCategoryId?: string;
  onCreateCategory: () => void;
  onSearch: (query: string) => void;
  onShowCategorization: () => void;
  onShowAnalytics: () => void;
  onShowAICategorization?: () => void;
  onShowSettings?: () => void;
}

const EnhancedSidebar: React.FC<EnhancedSidebarProps> = ({
  onCategorySelect,
  selectedCategoryId,
  onCreateCategory,
  onSearch,
  onShowCategorization,
  onShowAnalytics,
  onShowAICategorization,
  onShowSettings
}) => {
  const { 
    categories, 
    favoriteClips, 
    files, 
    analytics,
    preferences,
    updatePreferences 
  } = useAppStore();
  
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const defaultCategories: Category[] = [
    { id: 'all', name: 'All Files', icon: 'home', count: files.length },
    { id: 'videos', name: 'Videos', icon: 'video', count: files.filter(f => f.type === 'video').length },
    { id: 'images', name: 'Images', icon: 'image', count: files.filter(f => f.type === 'image').length },
    { id: 'audio', name: 'Audio', icon: 'music', count: files.filter(f => f.type === 'audio').length },
    { id: 'documents', name: 'Documents', icon: 'document', count: files.filter(f => f.type === 'document').length },
    { id: 'archives', name: 'Archives', icon: 'archive', count: files.filter(f => f.type === 'archive').length },
  ];

  const specialCategories: Category[] = [
    { id: 'favorites', name: 'Favorites', icon: 'heart', count: files.filter(f => f.isFavorite).length },
    { id: 'starred', name: 'Starred', icon: 'star', count: files.filter(f => f.isFavorite).length },
    { id: 'fav-parts', name: 'Favorite Clips', icon: 'clock', count: favoriteClips.length },
    { id: 'recent', name: 'Recent', icon: 'clock', count: files.filter(f => {
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return f.modifiedAt > dayAgo;
    }).length },
  ];

  const smartCategories: Category[] = [
    { id: 'large-files', name: 'Large Files', icon: 'harddrive', count: files.filter(f => f.size > 100 * 1024 * 1024).length },
    { id: 'duplicates', name: 'Duplicates', icon: 'layers', count: 0 },
    { id: 'untagged', name: 'Untagged', icon: 'tag', count: files.filter(f => f.tags.length === 0).length },
    { id: 'trending', name: 'Trending', icon: 'trending-up', count: 0 },
  ];

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      home: Home,
      video: Video,
      image: Image,
      music: Music,
      document: FileText,
      archive: Archive,
      heart: Heart,
      star: Star,
      clock: Clock,
      calendar: Calendar,
      tag: Tag,
      folder: Folder,
      'folder-open': FolderOpen,
      'trending-up': TrendingUp,
      'bar-chart': BarChart3,
      layers: Layers,
      harddrive: HardDrive,
      database: Database,
      user: User,
      users: Users,
      shield: Shield
    };
    
    const IconComponent = iconMap[iconName] || Folder;
    return <IconComponent className="h-4 w-4" />;
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const renderCategory = (category: Category, level: number = 0) => {
    const isExpanded = expandedCategories.has(category.id);
    const isSelected = selectedCategoryId === category.id;
    const hasChildren = category.children && category.children.length > 0;

    return (
      <div key={category.id} className="w-full">
        <motion.div
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200",
            "hover:bg-white/5 group",
            isSelected && "bg-blue-500/20 text-blue-400 border-l-2 border-blue-500",
            level > 0 && "ml-4",
            isCollapsed && "justify-center px-2"
          )}
          onClick={() => {
            onCategorySelect(category.id);
            if (hasChildren) {
              toggleCategory(category.id);
            }
          }}
          whileHover={{ x: isCollapsed ? 0 : 2 }}
          whileTap={{ scale: 0.98 }}
        >
          {hasChildren && !isCollapsed && (
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="h-3 w-3 text-white/50" />
            </motion.div>
          )}
          
          <div className="text-white/70 group-hover:text-white transition-colors">
            {getIconComponent(category.icon)}
          </div>
          
          {!isCollapsed && (
            <>
              <span className={cn(
                "text-sm font-medium flex-1 text-white/80 group-hover:text-white transition-colors",
                isSelected && "text-blue-400"
              )}>
                {category.name}
              </span>
              
              <span className="text-xs text-white/50 bg-white/10 px-2 py-0.5 rounded-full">
                {category.count}
              </span>
            </>
          )}
        </motion.div>

        <AnimatePresence>
          {hasChildren && isExpanded && !isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="py-1">
                {category.children?.map(child => renderCategory(child, level + 1))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <motion.div
      className={cn(
        "h-full bg-gray-900/80 backdrop-blur-xl border-r border-white/10 flex flex-col transition-all duration-300",
        isCollapsed ? "w-16" : "w-80"
      )}
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className={cn("p-4 border-b border-white/10", isCollapsed && "px-2")}>
        {!isCollapsed && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Data Platform</h2>
              <Button
                onClick={() => setIsCollapsed(true)}
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-white/50 hover:bg-white/10 hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  onSearch(e.target.value);
                }}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={onCreateCategory}
                variant="ghost"
                size="sm"
                className="text-white/80 hover:bg-white/10 hover:text-white"
              >
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
              <Button
                onClick={onShowCategorization}
                variant="ghost"
                size="sm"
                className="text-white/80 hover:bg-white/10 hover:text-white"
              >
                <Wand2 className="h-4 w-4 mr-1" />
                Auto
              </Button>
            </div>
          </>
        )}

        {isCollapsed && (
          <div className="flex flex-col items-center gap-2">
            <Button
              onClick={() => setIsCollapsed(false)}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/50 hover:bg-white/10 hover:text-white"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button
              onClick={onCreateCategory}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/50 hover:bg-white/10 hover:text-white"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* File Types */}
        <div>
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">
              File Types
            </h3>
          )}
          <div className="space-y-1">
            {defaultCategories.map(category => renderCategory(category))}
          </div>
        </div>

        {/* Collections */}
        <div>
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">
              Collections
            </h3>
          )}
          <div className="space-y-1">
            {specialCategories.map(category => renderCategory(category))}
          </div>
        </div>

        {/* Smart Categories */}
        <div>
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">
              Smart
            </h3>
          )}
          <div className="space-y-1">
            {smartCategories.map(category => renderCategory(category))}
          </div>
        </div>

        {/* Custom Categories */}
        {categories.length > 0 && (
          <div>
            {!isCollapsed && (
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wide">
                  Custom
                </h3>
                <Button
                  onClick={onCreateCategory}
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-white/50 hover:bg-white/10 hover:text-white"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            )}
            <div className="space-y-1">
              {categories.map(category => renderCategory(category))}
            </div>
          </div>
        )}

        {/* Advanced Tools */}
        {!isCollapsed && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wide">
                Tools
              </h3>
              <Button
                onClick={() => setShowAdvanced(!showAdvanced)}
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-white/50 hover:bg-white/10 hover:text-white"
              >
                <ChevronDown className={cn(
                  "h-3 w-3 transition-transform",
                  showAdvanced && "rotate-180"
                )} />
              </Button>
            </div>
            
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1 overflow-hidden"
                >
                  <Button
                    onClick={onShowAnalytics}
                    variant="ghost"
                    className="w-full justify-start text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                  <Button
                    onClick={onShowCategorization}
                    variant="ghost"
                    className="w-full justify-start text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    Auto Categorize
                  </Button>
                  {onShowAICategorization && (
                    <Button
                      onClick={onShowAICategorization}
                      variant="ghost"
                      className="w-full justify-start text-white/80 hover:bg-white/10 hover:text-white"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      AI Tools
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Backup
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Security
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={cn("p-4 border-t border-white/10", isCollapsed && "px-2")}>
        {!isCollapsed ? (
          <>
            {/* Storage Info */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-white/50 mb-1">
                <span>Storage</span>
                <span>{Math.round(analytics.totalSize / (1024 * 1024 * 1024))} GB</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1">
                <div 
                  className="bg-blue-500 h-1 rounded-full" 
                  style={{ width: '65%' }}
                />
              </div>
            </div>

            {/* Connection Status */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs text-white/50">
                <Wifi className="h-3 w-3" />
                <span>Online</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/50">
                <span>{analytics.totalFiles} files</span>
              </div>
            </div>

            <Button
              onClick={onShowSettings}
              variant="ghost"
              className="w-full justify-start text-white/80 hover:bg-white/10 hover:text-white"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Button
              onClick={onShowSettings}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/50 hover:bg-white/10 hover:text-white"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <div className="w-2 h-2 bg-green-500 rounded-full" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EnhancedSidebar;