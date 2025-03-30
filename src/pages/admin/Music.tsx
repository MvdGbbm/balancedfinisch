
import React from "react";
import { AdminLayout } from "@/components/admin-layout";
import { MusicFormDialog } from "@/components/admin/music/MusicFormDialog";
import { MusicHeader } from "@/components/admin/music/MusicHeader";
import { MusicSearch } from "@/components/admin/music/MusicSearch";
import { EmptyMusicState } from "@/components/admin/music/EmptyMusicState";
import { LoadingState } from "@/components/admin/music/LoadingState";
import { MusicTable } from "@/components/admin/music/MusicTable";
import { useMusicAdmin } from "@/components/admin/music/useMusicAdmin";

const AdminMusic = () => {
  const {
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
  } = useMusicAdmin();

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Header section */}
        <MusicHeader onCreateNew={() => setIsCreateDialogOpen(true)} />

        {/* Search section */}
        <MusicSearch 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />

        {/* Content section */}
        {isLoading ? (
          <LoadingState />
        ) : filteredTracks.length === 0 ? (
          <EmptyMusicState hasSearchQuery={!!searchQuery} />
        ) : (
          <MusicTable
            tracks={filteredTracks}
            previewUrl={previewUrl}
            isPlaying={isPlaying}
            onPreviewToggle={handlePreviewToggle}
            onEdit={handleEditMusic}
            onDelete={handleDeleteMusic}
          />
        )}
      </div>

      {/* Dialogs */}
      <MusicFormDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSave={handleSaveMusic}
        currentMusic={null}
      />

      <MusicFormDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveMusic}
        currentMusic={currentMusic}
      />

      {/* Hidden audio element for previews */}
      <audio ref={audioRef} style={{ display: "none" }} />
    </AdminLayout>
  );
};

export default AdminMusic;
