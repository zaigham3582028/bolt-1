interface CategorySuggestion {
  name: string;
  confidence: number;
  reasoning: string;
}

interface TagSuggestion {
  tag: string;
  confidence: number;
}

interface OrganizationPlan {
  categories: {
    name: string;
    files: string[];
    subcategories?: OrganizationPlan['categories'];
  }[];
}

interface AIServiceConfig {
  apiKey: string;
  model: string;
  baseURL?: string;
}

class AIService {
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
  }

  async analyzeContent(file: File): Promise<CategorySuggestion[]> {
    try {
      // For text files, analyze content
      if (file.type.startsWith('text/') || file.type.includes('json') || file.type.includes('xml')) {
        const content = await this.readFileContent(file);
        return this.analyzeTextContent(content, file.name);
      }

      // For other files, analyze filename and metadata
      return this.analyzeFileMetadata(file);
    } catch (error) {
      console.error('Error analyzing content:', error);
      return [];
    }
  }

  async generateTags(content: string, filename?: string): Promise<TagSuggestion[]> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: 'You are a file tagging expert. Generate relevant tags for files based on their content and filename. Return only a JSON array of objects with "tag" and "confidence" properties.'
            },
            {
              role: 'user',
              content: `Generate tags for this file:
              Filename: ${filename || 'Unknown'}
              Content preview: ${content.substring(0, 1000)}
              
              Return 5-10 relevant tags as JSON array.`
            }
          ],
          max_tokens: 200,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const content_text = data.choices[0]?.message?.content;
      
      try {
        return JSON.parse(content_text);
      } catch {
        // Fallback to manual parsing if JSON is malformed
        return this.parseTagsFromText(content_text);
      }
    } catch (error) {
      console.error('Error generating tags:', error);
      return this.generateFallbackTags(filename || '', content);
    }
  }

  async suggestOrganization(files: Array<{id: string, name: string, type: string, tags: string[]}>): Promise<OrganizationPlan> {
    try {
      const filesSummary = files.map(f => ({
        name: f.name,
        type: f.type,
        tags: f.tags
      }));

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: 'You are a file organization expert. Analyze files and suggest a logical folder structure. Return only valid JSON.'
            },
            {
              role: 'user',
              content: `Organize these files into a logical folder structure:
              ${JSON.stringify(filesSummary, null, 2)}
              
              Return a JSON object with "categories" array containing folder structures.`
            }
          ],
          max_tokens: 1000,
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      try {
        return JSON.parse(content);
      } catch {
        return this.generateFallbackOrganization(files);
      }
    } catch (error) {
      console.error('Error suggesting organization:', error);
      return this.generateFallbackOrganization(files);
    }
  }

  async categorizeByArtist(files: Array<{id: string, name: string}>): Promise<{[artist: string]: string[]}> {
    const artistCategories: {[artist: string]: string[]} = {};
    
    // Common artist patterns
    const artistPatterns = [
      /^([^-]+)\s*-/,  // "Artist - Song"
      /\[([^\]]+)\]/,   // "[Artist]"
      /\(([^)]+)\)/,    // "(Artist)"
      /by\s+([^.]+)/i,  // "by Artist"
    ];

    for (const file of files) {
      const filename = file.name.toLowerCase();
      let artist = null;

      // Try to extract artist from filename
      for (const pattern of artistPatterns) {
        const match = filename.match(pattern);
        if (match) {
          artist = match[1].trim();
          break;
        }
      }

      // If no pattern match, try common artist names
      const commonArtists = [
        'arijit singh', 'shreya ghoshal', 'rahat fateh ali khan', 'atif aslam',
        'kishore kumar', 'lata mangeshkar', 'mohd rafi', 'sonu nigam',
        'armaan malik', 'neha kakkar', 'honey singh', 'badshah',
        'guru randhawa', 'diljit dosanjh', 'hardy sandhu', 'b praak'
      ];

      if (!artist) {
        for (const commonArtist of commonArtists) {
          if (filename.includes(commonArtist)) {
            artist = commonArtist;
            break;
          }
        }
      }

      if (artist) {
        const normalizedArtist = this.normalizeArtistName(artist);
        if (!artistCategories[normalizedArtist]) {
          artistCategories[normalizedArtist] = [];
        }
        artistCategories[normalizedArtist].push(file.id);
      }
    }

    return artistCategories;
  }

  private async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file.slice(0, 10000)); // Read first 10KB
    });
  }

  private async analyzeTextContent(content: string, filename: string): Promise<CategorySuggestion[]> {
    // Simple content analysis without API
    const suggestions: CategorySuggestion[] = [];

    if (content.includes('function') || content.includes('class') || content.includes('import')) {
      suggestions.push({
        name: 'Code',
        confidence: 0.9,
        reasoning: 'Contains programming keywords'
      });
    }

    if (content.includes('TODO') || content.includes('FIXME') || content.includes('NOTE')) {
      suggestions.push({
        name: 'Development Notes',
        confidence: 0.8,
        reasoning: 'Contains development annotations'
      });
    }

    if (filename.includes('readme') || filename.includes('doc') || content.includes('# ')) {
      suggestions.push({
        name: 'Documentation',
        confidence: 0.85,
        reasoning: 'Appears to be documentation'
      });
    }

    return suggestions;
  }

  private analyzeFileMetadata(file: File): CategorySuggestion[] {
    const suggestions: CategorySuggestion[] = [];
    const filename = file.name.toLowerCase();
    const fileType = file.type;

    // Type-based categorization
    if (fileType.startsWith('image/')) {
      suggestions.push({
        name: 'Images',
        confidence: 1.0,
        reasoning: 'Image file type'
      });

      if (filename.includes('screenshot') || filename.includes('screen')) {
        suggestions.push({
          name: 'Screenshots',
          confidence: 0.9,
          reasoning: 'Filename suggests screenshot'
        });
      }
    }

    if (fileType.startsWith('video/')) {
      suggestions.push({
        name: 'Videos',
        confidence: 1.0,
        reasoning: 'Video file type'
      });
    }

    if (fileType.startsWith('audio/')) {
      suggestions.push({
        name: 'Audio',
        confidence: 1.0,
        reasoning: 'Audio file type'
      });

      if (filename.includes('song') || filename.includes('music')) {
        suggestions.push({
          name: 'Music',
          confidence: 0.9,
          reasoning: 'Filename suggests music'
        });
      }
    }

    return suggestions;
  }

  private parseTagsFromText(text: string): TagSuggestion[] {
    // Simple tag extraction from text
    const tags: TagSuggestion[] = [];
    const words = text.toLowerCase().split(/\s+/);
    
    const relevantWords = words.filter(word => 
      word.length > 3 && 
      !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'man', 'end', 'few', 'got', 'let', 'put', 'say', 'she', 'too', 'use'].includes(word)
    );

    return relevantWords.slice(0, 8).map(word => ({
      tag: word,
      confidence: 0.6
    }));
  }

  private generateFallbackTags(filename: string, content: string): TagSuggestion[] {
    const tags: TagSuggestion[] = [];
    
    // Extract from filename
    const filenameParts = filename.toLowerCase().split(/[._-\s]+/);
    filenameParts.forEach(part => {
      if (part.length > 2) {
        tags.push({ tag: part, confidence: 0.7 });
      }
    });

    // Extract from content
    const contentWords = content.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const uniqueWords = [...new Set(contentWords)].slice(0, 5);
    uniqueWords.forEach(word => {
      tags.push({ tag: word, confidence: 0.5 });
    });

    return tags.slice(0, 10);
  }

  private generateFallbackOrganization(files: Array<{id: string, name: string, type: string, tags: string[]}>): OrganizationPlan {
    const categories: OrganizationPlan['categories'] = [];

    // Group by file type
    const typeGroups: {[type: string]: string[]} = {};
    files.forEach(file => {
      if (!typeGroups[file.type]) {
        typeGroups[file.type] = [];
      }
      typeGroups[file.type].push(file.id);
    });

    Object.entries(typeGroups).forEach(([type, fileIds]) => {
      categories.push({
        name: type.charAt(0).toUpperCase() + type.slice(1) + 's',
        files: fileIds
      });
    });

    return { categories };
  }

  private normalizeArtistName(artist: string): string {
    return artist
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

export default AIService;
export type { CategorySuggestion, TagSuggestion, OrganizationPlan, AIServiceConfig };