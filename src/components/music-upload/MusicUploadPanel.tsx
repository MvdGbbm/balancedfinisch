
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Music, Upload, Image, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MusicTable } from "@/components/admin/music/MusicTable";
import { MusicSearch } from "@/components/admin/music/MusicSearch";
import { EmptyMusicState } from "@/components/admin/music/EmptyMusicState";
import { LoadingState } from "@/components/admin/music/LoadingState";
import { MusicFormDialog } from "@/components/admin/music/MusicFormDialog";
import { useMusicAdmin } from "@/components/admin/music/useMusicAdmin";

export const MusicUploadPanel: React.FC = () => {
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
    handleSaveMusic,
    handleEditMusic,
    handleDeleteMusic,
    handlePreviewToggle
  } = useMusicAdmin();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Music className="h-6 w-6 text-primary" />
            <span>Muziek Beheer</span>
          </h2>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Nieuwe Muziek Toevoegen
          </Button>
        </div>

        {/* Zoekveld */}
        <MusicSearch 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />

        {/* Muziek tabel of lege toestand */}
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

      {/* Dialogen */}
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
    </div>
  );
};
