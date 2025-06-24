import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Wand2,
  Settings,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Loader2,
  Tag,
  Folder,
  Users,
  Calendar,
  FileType,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import AIService, { CategorySuggestion, AIServiceConfig } from '@/services/AIService';

interface AICategorizationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AICategorizationPanel: React.FC<AICategorizationPanelProps> = ({
  isOpen,
  onClose
}) => {
  const { files, addCategory, batchAddTags, autoCategorizeBySingers, autoCategorizeByContent } = useAppStore();
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{
    categories: CategorySuggestion[];
    tags: {[fileId: string]: string[]};
    artists: {[artist: string]: string[]};
  } | null>(null);
  const [selectedOperations, setSelectedOperations] = useState({
    autoCategories: true,
    autoTags: true,
    artistCategories: true,
    contentAnalysis: false
  });

  const handleStartProcessing = async () => {
    if (!apiKey && selectedOperations.contentAnalysis) {
      alert('Please provide an OpenAI API key for content analysis');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResults(null);

    try {
      const newResults = {
        categories: [] as CategorySuggestion[],
        tags: {} as {[fileId: string]: string[]},
        artists: {} as {[artist: string]: string[]}
      };

      // Process artist categorization
      if (selectedOperations.artistCategories) {
        setProgress(25);
        const aiService = new AIService({ apiKey: apiKey || 'dummy', model });
        const artistCategories = await aiService.categorizeByArtist(files);
        newResults.artists = artistCategories;
        
        // Apply artist categories to store
        autoCategorizeBySingers();
      }

      // Process auto-tagging
      if (selectedOperations.autoTags) {
        setProgress(50);
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          try {
            // Simple filename-based tagging
            const tags = file.name.toLowerCase()
              .split(/[._-\s]+/)
              .filter(tag => tag.length > 2 && !['mp4', 'jpg', 'png', 'mp3', 'pdf', 'zip'].includes(tag))
              .slice(0, 5);
            
            newResults.tags[file.id] = tags;
          } catch (error) {
            console.error(`Error processing file ${file.name}:`, error);
          }
          setProgress(50 + (i / files.length) * 25);
        }
      }

      // Process auto categories
      if (selectedOperations.autoCategories) {
        setProgress(75);
        autoCategorizeByContent();
      }

      // Process content analysis (if API key provided)
      if (selectedOperations.contentAnalysis && apiKey) {
        setProgress(90);
        // This would require actual file content analysis
        // For now, we'll simulate it
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setProgress(100);
      setResults(newResults);
    } catch (error) {
      console.error('Error during AI processing:', error);
      alert('Error during processing. Please check your API key and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyResults = () => {
    if (!results) return;

    // Apply tags
    Object.entries(results.tags).forEach(([fileId, tags]) => {
      if (tags.length > 0) {
        batchAddTags([fileId], tags);
      }
    });

    // Apply categories
    results.categories.forEach(category => {
      addCategory({
        name: category.name,
        icon: 'folder',
        count: 0,
        color: '#10b981',
        description: category.reasoning
      });
    });

    alert('AI categorization applied successfully!');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gray-900 rounded-xl border border-white/10 w-full max-w-4xl h-[80vh] flex flex-col"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AI Categorization
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

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Settings Panel */}
          <div className="w-1/3 border-r border-white/10 p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Configuration</h3>
            
            {/* API Settings */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-white/70 text-sm mb-2 block">OpenAI API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="sk-..."
                />
                <p className="text-white/40 text-xs mt-1">
                  Required for content analysis only
                </p>
              </div>

              <div>
                <label className="text-white/70 text-sm mb-2 block">Model</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                </select>
              </div>
            </div>

            {/* Operations */}
            <div className="space-y-3">
              <h4 className="text-white font-medium">Operations</h4>
              
              {[
                {
                  key: 'artistCategories',
                  label: 'Artist Categories',
                  description: 'Group music files by artist names',
                  icon: Users,
                  offline: true
                },
                {
                  key: 'autoTags',
                  label: 'Auto Tagging',
                  description: 'Generate tags from filenames',
                  icon: Tag,
                  offline: true
                },
                {
                  key: 'autoCategories',
                  label: 'Smart Categories',
                  description: 'Create categories by file types',
                  icon: Folder,
                  offline: true
                },
                {
                  key: 'contentAnalysis',
                  label: 'Content Analysis',
                  description: 'Analyze file content with AI',
                  icon: Brain,
                  offline: false
                }
              ].map((operation) => (
                <label
                  key={operation.key}
                  className="flex items-start gap-3 p-3 rounded-lg border border-white/10 hover:bg-white/5 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedOperations[operation.key as keyof typeof selectedOperations]}
                    onChange={(e) => setSelectedOperations(prev => ({
                      ...prev,
                      [operation.key]: e.target.checked
                    }))}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <operation.icon className="h-4 w-4 text-white/70" />
                      <span className="text-white font-medium">{operation.label}</span>
                      {operation.offline && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                          Offline
                        </span>
                      )}
                    </div>
                    <p className="text-white/60 text-sm">{operation.description}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Start Button */}
            <Button
              onClick={handleStartProcessing}
              disabled={isProcessing}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Start AI Processing
                </>
              )}
            </Button>
          </div>

          {/* Results Panel */}
          <div className="flex-1 p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Results</h3>
            
            {isProcessing && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-white">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Processing files...</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <motion.div
                    className="bg-blue-500 h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-white/60 text-sm">{progress}% complete</p>
              </div>
            )}

            {results && (
              <div className="space-y-6">
                {/* Artist Categories */}
                {Object.keys(results.artists).length > 0 && (
                  <div>
                    <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Artist Categories ({Object.keys(results.artists).length})
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(results.artists).map(([artist, fileIds]) => (
                        <div
                          key={artist}
                          className="p-3 bg-white/5 rounded-lg border border-white/10"
                        >
                          <div className="font-medium text-white">{artist}</div>
                          <div className="text-white/60 text-sm">{fileIds.length} files</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags Summary */}
                {Object.keys(results.tags).length > 0 && (
                  <div>
                    <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Generated Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(new Set(Object.values(results.tags).flat())).slice(0, 20).map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-blue-500/20 text-blue-300 text-sm rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Apply Button */}
                <Button
                  onClick={handleApplyResults}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Apply Results
                </Button>
              </div>
            )}

            {!isProcessing && !results && (
              <div className="text-center text-white/50 py-12">
                <Brain className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Configure settings and start processing to see results</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AICategorizationPanel;