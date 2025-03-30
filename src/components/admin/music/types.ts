
// Types file for music admin components
export interface MusicItemFormValues {
  title: string;
  description: string;
  audioUrl: string;
  coverImageUrl: string;
  category: string;
  tags: string[];
}

export interface CategoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  categories: string[];
  onAddCategory: (category: string) => void;
  onUpdateCategory: (oldCategory: string, newCategory: string) => void;
  onDeleteCategory: (category: string) => void;
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
  validatedUrl: string;
  handleAudioPreview: () => void;
  isPreviewPlaying: boolean;
  onOpenCategoryDialog: () => void;
}
