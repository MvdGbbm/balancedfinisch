export interface Meditation {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  duration: number;
  category: string;
  coverImageUrl: string;
  tags: string[];
  createdAt: string;
  veraLink?: string;
  marcoLink?: string;
  isFavorite?: boolean;
}
