
import { useState } from "react";
import { Soundscape } from "@/lib/types";

export function useMusicDialog() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentMusic, setCurrentMusic] = useState<Soundscape | null>(null);

  const handleEditMusic = (music: Soundscape) => {
    setCurrentMusic(music);
    setIsEditDialogOpen(true);
  };

  return {
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    currentMusic,
    setCurrentMusic,
    handleEditMusic
  };
}
