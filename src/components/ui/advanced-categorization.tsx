import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Folder,
  FolderPlus,
  Tag,
  Wand2,
  Brain,
  Search,
  Filter,
  Plus,
  X,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  Music,
  Video,
  Image,
  FileText,
  Archive,
  Star,
  Heart,
  Clock,
  Calendar,
  User,
  MapPin,
  Palette,
  Camera,
  Mic,
  Monitor,
  Smartphone,
  Settings,
  Zap,
  Target,
  Layers,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppStore, Category } from '@/store/useAppStore';

interface AdvancedCategorizationProps {
  onClose: () => void;
}

const AdvancedCategorization: React.FC<AdvancedCategorizationProps> = ({ onClose }) => {
  const { 
    files, 
    categories, 
    addCategory, 
    updateCategory, 
    deleteCategory,
    autoCategorizeBySingers,
    autoCategorizeByContent
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'manual' | 'auto' | 'ai'>('manual');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('folder');
  const [newCategoryColor, setNewCategoryColor] = useState('#3b82f6');
  const [searchTerms, setSearchTerms] = useState<string[]>(['']);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResults, setProcessingResults] = useState<{
    created: number;
    matched: number;
    errors: string[];
  } | null>(null);
  
  // Auto categorization settings
  const [autoSettings, setAutoSettings] = useState({
    byArtist: true,
    byGenre: true,
    byYear: true,
    byFileType: true,
    bySize: false,
    byDuration: false,
    byResolution: false,
    byLocation: false,
    byDate: true,
    byKeywords: true
  });

  // Enhanced artist/singer list
  const [artistList, setArtistList] = useState<string[]>([
    'Arijit Singh',
    'Shreya Ghoshal',
    'Rahat Fateh Ali Khan',
    'Atif Aslam',
    'Kishore Kumar',
    'Lata Mangeshkar',
    'Mohammed Rafi',
    'Sonu Nigam',
    'Armaan Malik',
    'Neha Kakkar',
    'Honey Singh',
    'Badshah',
    'Guru Randhawa',
    'Diljit Dosanjh',
    'Hardy Sandhu',
    'B Praak'
  ]);

  const [newArtist, setNewArtist] = useState('');

  const iconOptions = [
    { name: 'folder', icon: Folder },
    { name: 'music', icon: Music },
    { name: 'video', icon: Video },
    { name: 'image', icon: Image },
    { name: 'document', icon: FileText },
    { name: 'archive', icon: Archive },
    { name: 'star', icon: Star },
    { name: 'heart', icon: Heart },
    { name: 'user', icon: User },
    { name: 'calendar', icon: Calendar },
    { name: 'clock', icon: Clock },
    { name: 'location', icon: MapPin },
    { name: 'palette', icon: Palette },
    { name: 'camera', icon: Camera },
    { name: 'mic', icon: Mic },
    { name: 'monitor', icon: Monitor },
    { name: 'smartphone', icon: Smartphone },
    { name: 'tag', icon: Tag }
  ];

  const colorOptions = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
    '#f97316', '#6366f1', '#14b8a6', '#eab308',
    '#a855f7', '#f43f5e', '#0ea5e9', '#22c55e'
  ];

  const handleCreateCategory = useCallback(() => {
    if (!newCategoryName.trim()) return;

    const matchingFiles = files.filter(file => {
      return searchTerms.some(term => {
        if (!term.trim()) return false;
        const searchTerm = term.toLowerCase();
        return (
          file.name.toLowerCase().includes(searchTerm) ||
          file.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      });
    });

    addCategory({
      name: newCategoryName,
      icon: newCategoryIcon,
      count: matchingFiles.length,
      color: newCategoryColor,
      description: `Category with ${matchingFiles.length} matching files`,
      rules: searchTerms.filter(term => term.trim())
    });

    // Reset form
    setNewCategoryName('');
    setNewCategoryIcon('folder');
    setNewCategoryColor('#3b82f6');
    setSearchTerms(['']);
  }, [newCategoryName, newCategoryIcon, newCategoryColor, searchTerms, files, addCategory]);

  const handleAutoCategorizeBySingers = useCallback(async () => {
    setIsProcessing(true);
    setProcessingResults(null);

    try {
      let created = 0;
      let matched = 0;
      const errors: string[] = [];

      for (const artist of artistList) {
        const artistLower = artist.toLowerCase();
        const matchingFiles = files.filter(file =>
          file.name.toLowerCase().includes(artistLower) ||
          file.tags.some(tag => tag.toLowerCase().includes(artistLower))
        );

        if (matchingFiles.length > 0) {
          try {
            addCategory({
              name: artist,
              icon: 'music',
              count: matchingFiles.length,
              color: '#3b82f6',
              description: `Songs by ${artist}`,
              rules: [artistLower]
            });
            created++;
            matched += matchingFiles.length;
          } catch (error) {
            errors.push(`Failed to create category for ${artist}`);
          }
        }
      }

      setProcessingResults({ created, matched, errors });
    } catch (error) {
      setProcessingResults({ created: 0, matched: 0, errors: ['Failed to process artists'] });
    } finally {
      setIsProcessing(false);
    }
  }, [artistList, files, addCategory]);

  const handleAutoCategorizeByGenre = useCallback(async () => {
    setIsProcessing(true);
    setProcessingResults(null);

    try {
      const genres = [
        'Bollywood', 'Punjabi', 'Classical', 'Rock', 'Pop', 'Jazz',
        'Hip Hop', 'Electronic', 'Folk', 'Devotional', 'Ghazal',
        'Qawwali', 'Sufi', 'Romantic', 'Sad', 'Party', 'Dance'
      ];

      let created = 0;
      let matched = 0;
      const errors: string[] = [];

      for (const genre of genres) {
        const genreLower = genre.toLowerCase();
        const matchingFiles = files.filter(file =>
          file.name.toLowerCase().includes(genreLower) ||
          file.tags.some(tag => tag.toLowerCase().includes(genreLower))
        );

        if (matchingFiles.length > 0) {
          try {
            addCategory({
              name: genre,
              icon: 'music',
              count: matchingFiles.length,
              color: '#10b981',
              description: `${genre} music collection`,
              rules: [genreLower]
            });
            created++;
            matched += matchingFiles.length;
          } catch (error) {
            errors.push(`Failed to create category for ${genre}`);
          }
        }
      }

      setProcessingResults({ created, matched, errors });
    } catch (error) {
      setProcessingResults({ created: 0, matched: 0, errors: ['Failed to process genres'] });
    } finally {
      setIsProcessing(false);
    }
  }, [files, addCategory]);

  const handleAutoCategorizeByFileType = useCallback(async () => {
    setIsProcessing(true);
    setProcessingResults(null);

    try {
      const typeCategories = [
        { type: 'video', name: 'Videos', icon: 'video', color: '#ef4444' },
        { type: 'image', name: 'Images', icon: 'image', color: '#10b981' },
        { type: 'audio', name: 'Audio', icon: 'music', color: '#f59e0b' },
        { type: 'document', name: 'Documents', icon: 'document', color: '#6366f1' },
        { type: 'archive', name: 'Archives', icon: 'archive', color: '#8b5cf6' }
      ];

      let created = 0;
      let matched = 0;
      const errors: string[] = [];

      for (const { type, name, icon, color } of typeCategories) {
        const matchingFiles = files.filter(file => file.type === type);
        
        if (matchingFiles.length > 0) {
          try {
            addCategory({
              name,
              icon,
              count: matchingFiles.length,
              color,
              description: `All ${name.toLowerCase()} in your collection`,
              rules: [type]
            });
            created++;
            matched += matchingFiles.length;
          } catch (error) {
            errors.push(`Failed to create category for ${name}`);
          }
        }
      }

      setProcessingResults({ created, matched, errors });
    } catch (error) {
      setProcessingResults({ created: 0, matched: 0, errors: ['Failed to process file types'] });
    } finally {
      setIsProcessing(false);
    }
  }, [files, addCategory]);

  const handleAutoCategorizeByDate = useCallback(async () => {
    setIsProcessing(true);
    setProcessingResults(null);

    try {
      const dateCategories = new Map<string, any[]>();
      
      files.forEach(file => {
        const year = file.createdAt.getFullYear();
        const yearKey = year.toString();
        
        if (!dateCategories.has(yearKey)) {
          dateCategories.set(yearKey, []);
        }
        dateCategories.get(yearKey)!.push(file);
      });

      let created = 0;
      let matched = 0;
      const errors: string[] = [];

      for (const [year, yearFiles] of dateCategories) {
        if (yearFiles.length > 0) {
          try {
            addCategory({
              name: `Year ${year}`,
              icon: 'calendar',
              count: yearFiles.length,
              color: '#06b6d4',
              description: `Files from ${year}`,
              rules: [year]
            });
            created++;
            matched += yearFiles.length;
          } catch (error) {
            errors.push(`Failed to create category for ${year}`);
          }
        }
      }

      setProcessingResults({ created, matched, errors });
    } catch (error) {
      setProcessingResults({ created: 0, matched: 0, errors: ['Failed to process dates'] });
    } finally {
      setIsProcessing(false);
    }
  }, [files, addCategory]);

  const addSearchTerm = () => {
    setSearchTerms([...searchTerms, '']);
  };

  const updateSearchTerm = (index: number, value: string) => {
    const newTerms = [...searchTerms];
    newTerms[index] = value;
    setSearchTerms(newTerms);
  };

  const removeSearchTerm = (index: number) => {
    if (searchTerms.length > 1) {
      setSearchTerms(searchTerms.filter((_, i) => i !== index));
    }
  };

  const addArtist = () => {
    if (newArtist.trim() && !artistList.includes(newArtist.trim())) {
      setArtistList([...artistList, newArtist.trim()]);
      setNewArtist('');
    }
  };

  const removeArtist = (artist: string) => {
    setArtistList(artistList.filter(a => a !== artist));
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gray-900 rounded-xl border border-white/10 w-full max-w-6xl h-[90vh] flex flex-col"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wand2 className="h-6 w-6" />
            Advanced Categorization
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

        {/* Tabs */}
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex gap-1 bg-white/5 rounded-lg p-1">
            {[
              { id: 'manual', label: 'Manual', icon: Settings },
              { id: 'auto', label: 'Auto Rules', icon: Zap },
              { id: 'ai', label: 'AI Powered', icon: Brain }
            ].map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                onClick={() => setActiveTab(id as any)}
                variant="ghost"
                className={cn(
                  "flex-1 flex items-center gap-2 text-white/70 hover:bg-white/10",
                  activeTab === id && "bg-white/10 text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'manual' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Create Custom Category</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-white/70 text-sm mb-2 block">Category Name</label>
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter category name..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/70 text-sm mb-2 block">Icon</label>
                        <div className="grid grid-cols-6 gap-2">
                          {iconOptions.map(({ name, icon: Icon }) => (
                            <Button
                              key={name}
                              onClick={() => setNewCategoryIcon(name)}
                              variant="ghost"
                              size="icon"
                              className={cn(
                                "text-white/70 hover:bg-white/10",
                                newCategoryIcon === name && "bg-white/20 text-white"
                              )}
                            >
                              <Icon className="h-4 w-4" />
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-white/70 text-sm mb-2 block">Color</label>
                        <div className="grid grid-cols-8 gap-2">
                          {colorOptions.map((color) => (
                            <button
                              key={color}
                              onClick={() => setNewCategoryColor(color)}
                              className={cn(
                                "w-8 h-8 rounded-lg border-2",
                                newCategoryColor === color ? "border-white" : "border-white/20"
                              )}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-white/70 text-sm mb-2 block">Search Terms</label>
                      <div className="space-y-2">
                        {searchTerms.map((term, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={term}
                              onChange={(e) => updateSearchTerm(index, e.target.value)}
                              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter search term..."
                            />
                            {searchTerms.length > 1 && (
                              <Button
                                onClick={() => removeSearchTerm(index)}
                                variant="ghost"
                                size="icon"
                                className="text-white/70 hover:bg-white/10 hover:text-red-400"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          onClick={addSearchTerm}
                          variant="ghost"
                          size="sm"
                          className="text-white/70 hover:bg-white/10 hover:text-white"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Search Term
                        </Button>
                      </div>
                    </div>

                    <Button
                      onClick={handleCreateCategory}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={!newCategoryName.trim()}
                    >
                      Create Category
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'auto' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Automatic Categorization Rules</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Button
                      onClick={handleAutoCategorizeBySingers}
                      disabled={isProcessing}
                      className="p-4 h-auto flex flex-col items-start gap-2 bg-white/5 hover:bg-white/10 border border-white/10"
                    >
                      <div className="flex items-center gap-2 text-white">
                        <Music className="h-5 w-5" />
                        <span className="font-medium">By Artists/Singers</span>
                      </div>
                      <p className="text-sm text-white/60 text-left">
                        Automatically categorize music files by artist names found in filenames
                      </p>
                    </Button>

                    <Button
                      onClick={handleAutoCategorizeByGenre}
                      disabled={isProcessing}
                      className="p-4 h-auto flex flex-col items-start gap-2 bg-white/5 hover:bg-white/10 border border-white/10"
                    >
                      <div className="flex items-center gap-2 text-white">
                        <Tag className="h-5 w-5" />
                        <span className="font-medium">By Genre</span>
                      </div>
                      <p className="text-sm text-white/60 text-left">
                        Group files by music genres and content types
                      </p>
                    </Button>

                    <Button
                      onClick={handleAutoCategorizeByFileType}
                      disabled={isProcessing}
                      className="p-4 h-auto flex flex-col items-start gap-2 bg-white/5 hover:bg-white/10 border border-white/10"
                    >
                      <div className="flex items-center gap-2 text-white">
                        <Layers className="h-5 w-5" />
                        <span className="font-medium">By File Type</span>
                      </div>
                      <p className="text-sm text-white/60 text-left">
                        Create categories for videos, images, audio, and documents
                      </p>
                    </Button>

                    <Button
                      onClick={handleAutoCategorizeByDate}
                      disabled={isProcessing}
                      className="p-4 h-auto flex flex-col items-start gap-2 bg-white/5 hover:bg-white/10 border border-white/10"
                    >
                      <div className="flex items-center gap-2 text-white">
                        <Calendar className="h-5 w-5" />
                        <span className="font-medium">By Date</span>
                      </div>
                      <p className="text-sm text-white/60 text-left">
                        Organize files by creation date and time periods
                      </p>
                    </Button>
                  </div>

                  {/* Artist Management */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Manage Artists/Singers</h4>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newArtist}
                        onChange={(e) => setNewArtist(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Add new artist..."
                        onKeyPress={(e) => e.key === 'Enter' && addArtist()}
                      />
                      <Button
                        onClick={addArtist}
                        variant="ghost"
                        size="icon"
                        className="text-white/70 hover:bg-white/10 hover:text-white"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {artistList.map((artist) => (
                        <div
                          key={artist}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full"
                        >
                          <span>{artist}</span>
                          <Button
                            onClick={() => removeArtist(artist)}
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 text-blue-300 hover:text-red-400"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Processing Status */}
                  {isProcessing && (
                    <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-blue-400">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Processing categories...</span>
                      </div>
                    </div>
                  )}

                  {/* Processing Results */}
                  {processingResults && (
                    <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-green-400 mb-2">
                        <CheckCircle className="h-5 w-5" />
                        <span>Processing Complete</span>
                      </div>
                      <div className="text-white/70 text-sm space-y-1">
                        <div>Categories created: {processingResults.created}</div>
                        <div>Files matched: {processingResults.matched}</div>
                        {processingResults.errors.length > 0 && (
                          <div className="text-red-400">
                            Errors: {processingResults.errors.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">AI-Powered Categorization</h3>
                  
                  <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 text-yellow-400 mb-2">
                      <AlertCircle className="h-5 w-5" />
                      <span>AI Features Coming Soon</span>
                    </div>
                    <p className="text-white/70 text-sm">
                      Advanced AI categorization features are currently in development. 
                      For now, use the Auto Rules tab for intelligent categorization.
                    </p>
                  </div>

                  <div className="space-y-4 opacity-50">
                    <div>
                      <label className="text-white/70 text-sm mb-2 block">OpenAI API Key</label>
                      <input
                        type="password"
                        disabled
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your OpenAI API key..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/70 text-sm mb-2 block">Model</label>
                        <select
                          disabled
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                          <option value="gpt-4">GPT-4</option>
                          <option value="gpt-4-turbo">GPT-4 Turbo</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-white/70 text-sm mb-2 block">Max Categories</label>
                        <input
                          type="number"
                          disabled
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          defaultValue={10}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        disabled
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        Preview AI Categories
                      </Button>
                      <Button
                        disabled
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Target className="h-4 w-4 mr-2" />
                        Apply AI Categories
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Existing Categories */}
          <div className="w-80 border-l border-white/10 p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Existing Categories</h3>
            
            {categories.length === 0 ? (
              <div className="text-center text-white/50 py-8">
                <Folder className="h-12 w-12 mx-auto mb-2" />
                <p>No categories yet</p>
                <p className="text-sm">Create your first category</p>
              </div>
            ) : (
              <div className="space-y-2">
                {categories.map((category) => (
                  <motion.div
                    key={category.id}
                    className="p-3 rounded-lg border border-white/10 bg-white/5"
                    layout
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-white text-sm font-medium">{category.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-white/50 text-xs">{category.count}</span>
                        <Button
                          onClick={() => deleteCategory(category.id)}
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-white/50 hover:bg-white/10 hover:text-red-400"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {category.description && (
                      <p className="text-white/60 text-xs mt-1">{category.description}</p>
                    )}
                    {category.rules && category.rules.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {category.rules.map((rule, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-white/10 text-white/60 text-xs rounded"
                          >
                            {rule}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdvancedCategorization;