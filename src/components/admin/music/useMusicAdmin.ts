
import { useMusicTracks } from "./hooks/use-music-tracks";
import { useMusicDialog } from "./hooks/use-music-dialog";
import { useMusicPreview } from "./hooks/use-music-preview";
import { useMusicApi } from "./hooks/use-music-api";
import { Soundscape } from "@/lib/types";

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
    handlePreviewToggle
  };
}
