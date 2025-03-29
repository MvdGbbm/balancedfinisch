
import { Meditation } from "@/lib/types";
import { checkUrlExists } from "@/components/audio-player/utils";

// Utility functions for meditation page
export const validateMeditationUrls = async (meditations: Meditation[]) => {
  const validatedItems = await Promise.all(
    meditations.map(async (meditation) => {
      const isAudioUrlValid = meditation.audioUrl 
        ? await checkUrlExists(meditation.audioUrl)
        : false;
        
      const isImageUrlValid = meditation.coverImageUrl 
        ? await checkUrlExists(meditation.coverImageUrl)
        : false;
        
      return {
        ...meditation,
        hasValidAudioUrl: isAudioUrlValid,
        hasValidImageUrl: isImageUrlValid
      };
    })
  );
  
  return validatedItems;
};

// Meditation filtering helpers
export const filterMeditationsByCategory = (
  meditations: Meditation[],
  category: string
): Meditation[] => {
  if (!category || category === "all") return meditations;
  return meditations.filter((m) => m.category === category);
};

export const filterMeditationsByDuration = (
  meditations: Meditation[],
  durationFilter: string
): Meditation[] => {
  if (!durationFilter || durationFilter === "all") return meditations;
  
  const [min, max] = durationFilter.split("-").map(Number);
  
  return meditations.filter((m) => {
    const durationMinutes = m.durationSeconds ? m.durationSeconds / 60 : 0;
    return durationMinutes >= min && (max ? durationMinutes <= max : true);
  });
};

export const sortMeditations = (
  meditations: Meditation[],
  sortOption: string
): Meditation[] => {
  switch (sortOption) {
    case "newest":
      return [...meditations].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case "oldest":
      return [...meditations].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    case "duration-asc":
      return [...meditations].sort(
        (a, b) => (a.durationSeconds || 0) - (b.durationSeconds || 0)
      );
    case "duration-desc":
      return [...meditations].sort(
        (a, b) => (b.durationSeconds || 0) - (a.durationSeconds || 0)
      );
    case "alphabetical":
      return [...meditations].sort((a, b) => a.title.localeCompare(b.title));
    default:
      return meditations;
  }
};

export const getMeditationCategoryIcon = (category: string): string => {
  const categoryIcons: Record<string, string> = {
    "Guided": "🧘",
    "Sleep": "😴",
    "Stress Relief": "😌",
    "Focus": "🎯",
    "Morning": "🌅",
    "Evening": "🌙",
    "Nature Sounds": "🌿",
    "Breathing": "💨",
    "Body Scan": "👁️",
  };
  
  return categoryIcons[category] || "🧘";
};
