
import React, { useState, useEffect, useRef } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { MusicFormDialog } from "@/components/admin/music/MusicFormDialog";
import { MusicHeader } from "@/components/admin/music/MusicHeader";
import { MusicSearch } from "@/components/admin/music/MusicSearch";
import { MusicTable } from "@/components/admin/music/MusicTable";
import { EmptyMusicState } from "@/components/admin/music/EmptyMusicState";
import { MusicLoading } from "@/components/admin/music/MusicLoading";
import { useMusicManagement } from "@/hooks/admin/useMusicManagement";

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
    handlePreviewToggle
  } = useMusicManagement();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Handle edit music request
  const onEditMusic = (music: typeof currentMusic) => {
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

  return (
    <AdminLayout>
      <div className="space-y-4">
        <MusicHeader onCreateClick={() => setIsCreateDialogOpen(true)} />
        
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
        onSave={handleSaveMusic}
        currentMusic={null}
      />

      {/* Edit Dialog */}
      <MusicFormDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveMusic}
        currentMusic={currentMusic}
      />

      {/* Hidden audio player for previews */}
      <audio ref={audioRef} style={{ display: "none" }} />
    </AdminLayout>
  );
};

export default AdminMusic;
