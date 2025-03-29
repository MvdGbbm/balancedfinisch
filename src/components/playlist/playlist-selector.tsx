
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ListMusic, Music } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Playlist } from "./types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useApp } from "@/context/AppContext";
import { Soundscape } from "@/lib/types";

interface PlaylistSelectorProps {
  playlists: Playlist[];
  onSelect: (playlistId: string) => void;
  onCreateNew: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlaylistSelector({ 
  playlists, 
  onSelect, 
  onCreateNew, 
  open, 
  onOpenChange 
}: PlaylistSelectorProps) {
  const [activeTab, setActiveTab] = useState<string>("playlists");
  const { soundscapes } = useApp();
  
  // Filter for music tracks
  const musicTracks = soundscapes.filter(track => track.category === "Muziek");

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1 bg-background/10 backdrop-blur-sm border-muted hover:bg-background/20"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-background/95 backdrop-blur-sm border-muted"
      >
        <Tabs defaultValue="playlists" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-2">
            <TabsTrigger value="playlists" className="text-xs">Afspeellijsten</TabsTrigger>
            <TabsTrigger value="music" className="text-xs">Muziek</TabsTrigger>
          </TabsList>
          
          {activeTab === "playlists" ? (
            <>
              <DropdownMenuLabel className="text-xs font-medium">Selecteer een afspeellijst</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {playlists.length > 0 ? (
                <div className="max-h-48 overflow-y-auto py-1">
                  {playlists.map(playlist => (
                    <DropdownMenuItem 
                      key={playlist.id}
                      onClick={() => onSelect(playlist.id)}
                      className="flex items-center gap-2 text-sm py-1.5"
                    >
                      <ListMusic className="h-4 w-4 text-primary" />
                      <span className="truncate">{playlist.name}</span>
                    </DropdownMenuItem>
                  ))}
                </div>
              ) : (
                <div className="px-2 py-3 text-xs text-center text-muted-foreground">
                  Geen afspeellijsten beschikbaar
                </div>
              )}
              
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={onCreateNew}
                className="text-sm py-1.5 text-primary hover:text-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span>Nieuwe afspeellijst maken</span>
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuLabel className="text-xs font-medium">Beschikbare muziek</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {musicTracks.length > 0 ? (
                <div className="max-h-48 overflow-y-auto py-1">
                  {musicTracks.map(track => (
                    <DropdownMenuItem 
                      key={track.id}
                      className="flex items-center gap-2 text-sm py-1.5"
                    >
                      <Music className="h-4 w-4 text-primary" />
                      <div className="overflow-hidden">
                        <p className="truncate">{track.title}</p>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              ) : (
                <div className="px-2 py-3 text-xs text-center text-muted-foreground">
                  Geen muziek beschikbaar
                </div>
              )}
            </>
          )}
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
