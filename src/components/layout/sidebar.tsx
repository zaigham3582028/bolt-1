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
  Archive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
  children?: Category[];
  isExpanded?: boolean;
}

interface SidebarProps {
  categories: Category[];
  onCategorySelect: (categoryId: string) => void;
  selectedCategoryId?: string;
  onCreateCategory: () => void;
  onSearch: (query: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  categories,
  onCategorySelect,
  selectedCategoryId,
  onCreateCategory,
  onSearch
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const defaultCategories: Category[] = [
    { id: 'all', name: 'All Files', icon: <Home className="h-4 w-4" />, count: 1250 },
    { id: 'videos', name: 'Videos', icon: <Video className="h-4 w-4" />, count: 324 },
    { id: 'images', name: 'Images', icon: <Image className="h-4 w-4" />, count: 892 },
    { id: 'audio', name: 'Audio', icon: <Music className="h-4 w-4" />, count: 156 },
    { id: 'documents', name: 'Documents', icon: <FileText className="h-4 w-4" />, count: 78 },
    { id: 'archives', name: 'Archives', icon: <Archive className="h-4 w-4" />, count: 23 },
  ];

  const specialCategories: Category[] = [
    { id: 'favorites', name: 'Favorites', icon: <Heart className="h-4 w-4" />, count: 45 },
    { id: 'starred', name: 'Starred', icon: <Star className="h-4 w-4" />, count: 23 },
    { id: 'fav-parts', name: 'Favorite Parts', icon: <Tag className="h-4 w-4" />, count: 12 },
  ];

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
            level > 0 && "ml-4"
          )}
          onClick={() => {
            onCategorySelect(category.id);
            if (hasChildren) {
              toggleCategory(category.id);
            }
          }}
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
        >
          {hasChildren && (
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="h-3 w-3 text-white/50" />
            </motion.div>
          )}
          
          <div className="text-white/70 group-hover:text-white transition-colors">
            {category.icon}
          </div>
          
          <span className={cn(
            "text-sm font-medium flex-1 text-white/80 group-hover:text-white transition-colors",
            isSelected && "text-blue-400"
          )}>
            {category.name}
          </span>
          
          <span className="text-xs text-white/50 bg-white/10 px-2 py-0.5 rounded-full">
            {category.count}
          </span>
        </motion.div>

        <AnimatePresence>
          {hasChildren && isExpanded && (
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
      className="w-64 h-full bg-gray-900/80 backdrop-blur-xl border-r border-white/10 flex flex-col"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4">Data Platform</h2>
        
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
        <div className="flex gap-2">
          <Button
            onClick={onCreateCategory}
            variant="ghost"
            size="sm"
            className="flex-1 text-white/80 hover:bg-white/10 hover:text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/80 hover:bg-white/10 hover:text-white"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Default Categories */}
        <div>
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">
            File Types
          </h3>
          <div className="space-y-1">
            {defaultCategories.map(category => renderCategory(category))}
          </div>
        </div>

        {/* Special Categories */}
        <div>
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">
            Collections
          </h3>
          <div className="space-y-1">
            {specialCategories.map(category => renderCategory(category))}
          </div>
        </div>

        {/* Custom Categories */}
        {categories.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wide">
                Categories
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
            <div className="space-y-1">
              {categories.map(category => renderCategory(category))}
            </div>
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="p-4 border-t border-white/10">
        <Button
          variant="ghost"
          className="w-full justify-start text-white/80 hover:bg-white/10 hover:text-white"
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>
    </motion.div>
  );
};

export default Sidebar;