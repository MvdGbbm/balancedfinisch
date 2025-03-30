
import React from "react";
import { Plus, ListMusic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Playlist } from "@/components/playlist/types";

interface PlaylistsTabProps {
  playlists: Playlist[];
  onPlaylistCreation: () => void;
}

export const PlaylistsTab: React.FC<PlaylistsTabProps> = ({
  playlists,
  onPlaylistCreation
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center mb-4">
        <Button variant="outline" size="sm" onClick={onPlaylistCreation}>
          <Plus className="h-4 w-4 mr-1" />
          Nieuwe afspeellijst
        </Button>
      </div>
      
      <div className="space-y-2">
        {playlists.length > 0 ? (
          playlists.map(playlist => (
            <Card key={playlist.id} className="mb-3">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded bg-primary/10 flex-shrink-0 flex items-center justify-center">
                    <ListMusic className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{playlist.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {playlist.tracks.length} nummers
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-center py-8 text-muted-foreground">
            Geen afspeellijsten gevonden
          </p>
        )}
      </div>
    </div>
  );
};
