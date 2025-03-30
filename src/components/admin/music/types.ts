
import { Soundscape } from "@/lib/types";

export interface MusicFormData extends Omit<Soundscape, "id"> {
  title: string;
  description: string;
  audioUrl: string;
  coverImageUrl: string;
  tags: string[];
  category: string;
}

export interface MusicFormProps {
  currentMusic: Soundscape | null;
  onSave: (music: Omit<Soundscape, "id">) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface AudioPreviewProps {
  audioUrl: string;
  isPreviewPlaying: boolean;
  setIsPreviewPlaying: (playing: boolean) => void;
  isValidatingUrl: boolean;
  isUrlValid: boolean;
  validatedUrl: string;
  audioRef: React.RefObject<HTMLAudioElement>;
  handleAudioError: () => void;
}

export interface ImagePreviewProps {
  coverImageUrl: string;
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
  isValidatingUrl: boolean;
  isUrlValid: boolean;
  validatedUrl: string;
  handleAudioPreview: () => void;
  isPreviewPlaying: boolean;
}
