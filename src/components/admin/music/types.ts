
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
  categories: string[];
  onOpenCategoryDialog: () => void;
}
