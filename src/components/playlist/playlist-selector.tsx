import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ListMusic, Music } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuTabs,
  DropdownMenuTabsList,
  DropdownMenuTabsTrigger,
  DropdownMenuTabsContent,
} from "@/components/ui/dropdown-menu";
import { Playlist } from "./types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/context/AppContext";
import { Soundscape } from "@/lib/types";

interface PlaylistSelectorProps {
  playlists: Playlist[];
  onSelect: (playlistId: string) => void;
  onCreateNew: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerElement?: React.ReactNode;
}

export function PlaylistSelector({ 
  playlists, 
  onSelect, 
  onCreateNew, 
  open, 
  onOpenChange,
  triggerElement
}: PlaylistSelectorProps) {
  const [activeTab, setActiveTab] = useState<string>("playlists");
  const { soundscapes } = useApp();
  
  // Filter for music tracks
  const musicTracks = soundscapes.filter(track => track.category === "Muziek");

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        {triggerElement || (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1 bg-background/10 backdrop-blur-sm border-muted hover:bg-background/20"
          >
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-64 bg-background/95 backdrop-blur-sm border-muted z-50"
      >
        <Tabs defaultValue="playlists" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-2">
            <TabsTrigger value="playlists" className="text-xs">Afspeellijsten</TabsTrigger>
            <TabsTrigger value="music" className="text-xs">Muziek</TabsTrigger>
          </TabsList>
          
          {activeTab === "playlists" && (
            <>
              <DropdownMenuLabel>Toevoegen aan afspeellijst</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {playlists.length > 0 ? (
                playlists.map(playlist => (
                  <DropdownMenuItem 
                    key={playlist.id}
                    onClick={() => onSelect(playlist.id)}
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
            </>
          )}
          
          {activeTab === "music" && (
            <>
              <DropdownMenuLabel>Muziek</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <div className="max-h-60 overflow-y-auto px-1 py-1">
                {musicTracks.length > 0 ? (
                  musicTracks.map(track => (
                    <DropdownMenuItem 
                      key={track.id}
                      className="flex items-center gap-2 rounded-md"
                    >
                      <Music className="h-4 w-4 text-primary" />
                      <div className="flex flex-col">
                        <span className="text-sm">{track.title}</span>
                        <span className="text-xs text-muted-foreground">{track.description?.substring(0, 30)}{track.description?.length > 30 ? '...' : ''}</span>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled className="text-muted-foreground">
                    Geen muziek beschikbaar
                  </DropdownMenuItem>
                )}
              </div>
            </>
          )}
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
