
export interface MusicTrack {
  id: string;
  title: string;
  description: string;
  duration: number;
  audioUrl: string;
  category: string;
  tags: string[];
  coverImage: string;
}

export interface FormFieldsProps {
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  audioUrl: string;
  setAudioUrl: (url: string) => void;
  coverImageUrl: string;
  setCoverImageUrl: (url: string) => void;
  tags: string[];
  setTags: (tags: string[]) => void;
  category: string;
  setCategory: (category: string) => void;
  categories: string[];
  isValidatingUrl: boolean;
  isUrlValid: boolean;
  validatedUrl: string | null;
  handleAudioPreview: () => void;
  isPreviewPlaying: boolean;
}

// Add Soundscape type to avoid errors in playlist-selector.tsx
export interface Soundscape {
  id: string;
  title: string;
  description?: string;
  category: string;
  audioUrl?: string;
}
