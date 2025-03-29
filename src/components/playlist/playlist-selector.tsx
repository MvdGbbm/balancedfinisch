
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Playlist } from "./types";

interface PlaylistSelectorProps {
  playlists: Playlist[];
  onSelectPlaylist: (playlist: Playlist) => void;
  onCreateNew: () => void;
}

export const PlaylistSelector: React.FC<PlaylistSelectorProps> = ({
  playlists,
  onSelectPlaylist,
  onCreateNew,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Voeg toe aan...
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {playlists.length > 0 ? (
          <>
            {playlists.map((playlist) => (
              <DropdownMenuItem
                key={playlist.id}
                onClick={() => onSelectPlaylist(playlist)}
              >
                {playlist.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        ) : (
          <DropdownMenuItem disabled className="text-muted-foreground">
            Geen afspeellijsten gevonden
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onCreateNew}>
          <Plus className="h-4 w-4 mr-1" />
          Nieuwe afspeellijst
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
