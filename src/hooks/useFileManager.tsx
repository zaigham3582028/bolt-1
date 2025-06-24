import { useState, useCallback, useMemo } from 'react';
import { FileItem } from '@/components/file-grid/file-card';

export interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
  children?: Category[];
  isExpanded?: boolean;
}

export interface VideoClip {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  tags: string[];
  fileId: string;
  fileName: string;
  thumbnail?: string;
  createdAt: Date;
}

export const useFileManager = () => {
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: '1',
      name: 'Arijit Singh - Tum Hi Ho.mp4',
      type: 'video',
      size: 45678912,
      duration: 240,
      thumbnail: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=300',
      createdAt: new Date('2024-01-15'),
      modifiedAt: new Date('2024-01-15'),
      isFavorite: true,
      tags: ['music', 'bollywood', 'arijit singh'],
      metadata: {
        width: 1920,
        height: 1080,
        resolution: '1080p',
        codec: 'H.264',
        bitrate: '2.5 Mbps'
      }
    },
    {
      id: '2',
      name: 'Nature Documentary 4K.mp4',
      type: 'video',
      size: 1234567890,
      duration: 3600,
      thumbnail: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=300',
      createdAt: new Date('2024-01-10'),
      modifiedAt: new Date('2024-01-12'),
      isFavorite: false,
      tags: ['nature', 'documentary', '4k'],
      metadata: {
        width: 3840,
        height: 2160,
        resolution: '4K',
        codec: 'H.265',
        bitrate: '15 Mbps'
      }
    },
    {
      id: '3',
      name: 'Sunset Landscape.jpg',
      type: 'image',
      size: 5432109,
      thumbnail: 'https://images.pexels.com/photos/358482/pexels-photo-358482.jpeg?auto=compress&cs=tinysrgb&w=300',
      createdAt: new Date('2024-01-08'),
      modifiedAt: new Date('2024-01-08'),
      isFavorite: true,
      tags: ['landscape', 'sunset', 'photography'],
      metadata: {
        width: 4000,
        height: 3000,
        resolution: '4000x3000'
      }
    },
    {
      id: '4',
      name: 'Arijit Singh - Agar Tum Saath Ho.mp3',
      type: 'audio',
      size: 8765432,
      duration: 280,
      thumbnail: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=300',
      createdAt: new Date('2024-01-05'),
      modifiedAt: new Date('2024-01-05'),
      isFavorite: false,
      tags: ['music', 'bollywood', 'arijit singh', 'audio'],
      metadata: {
        bitrate: '320 kbps'
      }
    },
    {
      id: '5',
      name: 'Project Report.pdf',
      type: 'document',
      size: 2345678,
      thumbnail: 'https://images.pexels.com/photos/590016/pexels-photo-590016.jpg?auto=compress&cs=tinysrgb&w=300',
      createdAt: new Date('2024-01-03'),
      modifiedAt: new Date('2024-01-03'),
      isFavorite: false,
      tags: ['document', 'report', 'work']
    }
  ]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [favoriteClips, setFavoriteClips] = useState<VideoClip[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const toggleFileSelection = useCallback((fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  }, []);

  const toggleFavorite = useCallback((fileId: string) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, isFavorite: !file.isFavorite }
        : file
    ));
  }, []);

  const addFavoriteClip = useCallback((clip: Omit<VideoClip, 'id' | 'createdAt'>) => {
    const newClip: VideoClip = {
      ...clip,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setFavoriteClips(prev => [...prev, newClip]);
  }, []);

  const createCategory = useCallback((name: string, searchTerms: string[]) => {
    const matchingFiles = files.filter(file =>
      searchTerms.some(term =>
        file.name.toLowerCase().includes(term.toLowerCase()) ||
        file.tags.some(tag => tag.toLowerCase().includes(term.toLowerCase()))
      )
    );

    const newCategory: Category = {
      id: Date.now().toString(),
      name,
      icon: <div className="w-4 h-4 bg-blue-500 rounded" />,
      count: matchingFiles.length
    };

    setCategories(prev => [...prev, newCategory]);
  }, [files]);

  const autoCategorizeBySingers = useCallback(() => {
    const singers = new Set<string>();
    
    files.forEach(file => {
      const name = file.name.toLowerCase();
      const commonSingers = [
        'arijit singh',
        'shreya ghoshal',
        'rahat fateh ali khan',
        'atif aslam',
        'kishore kumar',
        'lata mangeshkar',
        'mohd rafi',
        'sonu nigam'
      ];

      commonSingers.forEach(singer => {
        if (name.includes(singer)) {
          singers.add(singer);
        }
      });
    });

    singers.forEach(singer => {
      createCategory(
        singer.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        [singer]
      );
    });
  }, [files, createCategory]);

  const filteredFiles = useMemo(() => {
    let filtered = files;

    // Filter by category
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
        case 'favorites':
          filtered = filtered.filter(file => file.isFavorite);
          break;
        case 'fav-parts':
          // This would show clips, but for now we'll show files with clips
          const filesWithClips = new Set(favoriteClips.map(clip => clip.fileId));
          filtered = filtered.filter(file => filesWithClips.has(file.id));
          break;
      }
    }

    return filtered;
  }, [files, selectedCategoryId, favoriteClips]);

  return {
    files: filteredFiles,
    categories,
    selectedFiles,
    favoriteClips,
    searchQuery,
    selectedCategoryId,
    viewMode,
    sortBy,
    sortOrder,
    toggleFileSelection,
    toggleFavorite,
    addFavoriteClip,
    createCategory,
    autoCategorizeBySingers,
    setSearchQuery,
    setSelectedCategoryId,
    setViewMode,
    setSortBy,
    setSortOrder
  };
};