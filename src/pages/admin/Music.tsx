
import React, { useState, useEffect, useRef } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { MusicFormDialog } from "@/components/admin/music/MusicFormDialog";
import { MusicHeader } from "@/components/admin/music/MusicHeader";
import { MusicSearch } from "@/components/admin/music/MusicSearch";
import { MusicTable } from "@/components/admin/music/MusicTable";
import { EmptyMusicState } from "@/components/admin/music/EmptyMusicState";
import { MusicLoading } from "@/components/admin/music/MusicLoading";
import { useMusicManagement } from "@/hooks/admin/useMusicManagement";
import { Soundscape } from "@/lib/types";
import { CategoryManagementDialog } from "@/components/admin/music/CategoryManagementDialog";

const AdminMusic = () => {
  const {
    isLoading,
    filteredTracks,
    currentMusic,
    setCurrentMusic,
    searchQuery,
    setSearchQuery,
    previewUrl,
    isPlaying,
    setIsPlaying,
    handleSaveMusic,
    handleEditMusic,
    handleDeleteMusic,
    handlePreviewToggle,
    categories,
    addCategory,
    deleteCategory
  } = useMusicManagement();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Handle edit music request
  const onEditMusic = (music: Soundscape) => {
    if (music) {
      handleEditMusic(music);
      setIsEditDialogOpen(true);
    }
  };

  // Handle audio play/pause
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && previewUrl) {
        audioRef.current.src = previewUrl;
        audioRef.current.play().catch(err => {
          console.error("Error playing audio:", err);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, previewUrl]);

  // Prevent duplicate music creation
  const handleCreateDialogSave = (music: Partial<Soundscape>) => {
    handleSaveMusic(music);
    setIsCreateDialogOpen(false);
  };
  
  // Prevent duplicate music editing
  const handleEditDialogSave = (music: Partial<Soundscape>) => {
    handleSaveMusic(music);
    setIsEditDialogOpen(false);
  };

  // Handle category management
  const handleCategoryAdd = (category: string) => {
    addCategory(category);
  };

  const handleCategoryDelete = (category: string) => {
    deleteCategory(category);
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <MusicHeader 
          onCreateClick={() => setIsCreateDialogOpen(true)}
          onManageCategoriesClick={() => setIsCategoryDialogOpen(true)}
        />
        
        <MusicSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {isLoading ? (
          <MusicLoading />
        ) : filteredTracks.length === 0 ? (
          <EmptyMusicState searchQuery={searchQuery} />
        ) : (
          <MusicTable
            tracks={filteredTracks}
            previewUrl={previewUrl}
            isPlaying={isPlaying}
            onPreviewToggle={handlePreviewToggle}
            onEditMusic={onEditMusic}
            onDeleteMusic={handleDeleteMusic}
          />
        )}
      </div>

      {/* Create Dialog */}
      <MusicFormDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSave={handleCreateDialogSave}
        currentMusic={null}
        categories={categories}
      />

      {/* Edit Dialog */}
      <MusicFormDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleEditDialogSave}
        currentMusic={currentMusic}
        categories={categories}
      />

      {/* Category Management Dialog */}
      <CategoryManagementDialog
        isOpen={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
        categories={categories}
        onAddCategory={handleCategoryAdd}
        onDeleteCategory={handleCategoryDelete}
      />

      {/* Hidden audio player for previews */}
      <audio ref={audioRef} style={{ display: "none" }} />
    </AdminLayout>
  );
};

export default AdminMusic;
