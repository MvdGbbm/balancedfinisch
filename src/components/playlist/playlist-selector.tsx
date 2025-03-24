
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, ListMusic } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Playlist } from "./types";

interface PlaylistSelectorProps {
  playlists: Playlist[];
  onSelectPlaylist: (playlist: Playlist) => void;
  onCreateNew: () => void;
}

export function PlaylistSelector({ playlists, onSelectPlaylist, onCreateNew }: PlaylistSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Toevoegen aan
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Afspeellijsten</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {playlists.length > 0 ? (
          playlists.map(playlist => (
            <DropdownMenuItem 
              key={playlist.id}
              onClick={() => onSelectPlaylist(playlist)}
              className="flex items-center gap-2"
            >
              <ListMusic className="h-4 w-4" />
              <span>{playlist.name}</span>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled className="text-muted-foreground">
            Geen afspeellijsten
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onCreateNew}>
          <Plus className="h-4 w-4 mr-1" />
          <span>Nieuwe afspeellijst...</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
