
import { useMusicTracks } from "./hooks/use-music-tracks";
import { useMusicDialog } from "./hooks/use-music-dialog";
import { useMusicPreview } from "./hooks/use-music-preview";
import { useMusicApi } from "./hooks/use-music-api";
import { Soundscape } from "@/lib/types";
import { toast } from "sonner";

export function useMusicAdmin() {
  const { 
    filteredTracks, 
    searchQuery, 
    setSearchQuery 
  } = useMusicTracks();
  
  const {
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    currentMusic,
    handleEditMusic
  } = useMusicDialog();
  
  const {
    previewUrl,
    isPlaying,
    audioRef,
    handlePreviewToggle
  } = useMusicPreview();
  
  const {
    isLoading,
    handleSaveMusic,
    handleDeleteMusic
  } = useMusicApi();
  
  // Function to reload data
  const handleReloadData = () => {
    // We could implement a more sophisticated reload logic here
    // For now, just refresh the page
    window.location.reload();
  };
  
  // Function to clear cache
  const handleClearCache = () => {
    // Clear localStorage items related to music
    localStorage.removeItem('processedSoundscapes');
    localStorage.removeItem('soundscapes');
    localStorage.removeItem('musicPlaylists');
    
    toast("Cachegeheugen gewist", {
      description: "Alle opgeslagen muziekgegevens zijn verwijderd."
    });
    
    // Reload page after clearing cache
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return {
    isLoading,
    filteredTracks,
    searchQuery,
    setSearchQuery,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    currentMusic,
    previewUrl,
    isPlaying,
    audioRef,
    handleSaveMusic,
    handleEditMusic,
    handleDeleteMusic,
    handlePreviewToggle,
    handleReloadData,
    handleClearCache
  };
}
