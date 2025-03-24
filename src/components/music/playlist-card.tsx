
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Play, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Playlist } from "@/lib/types";

interface PlaylistCardProps {
  playlist: Playlist;
  onSelect: (playlist: Playlist) => void;
  isActive?: boolean;
  className?: string;
}

export function PlaylistCard({ 
  playlist, 
  onSelect, 
  isActive,
  className 
}: PlaylistCardProps) {
  return (
    <Card 
      className={cn(
        "overflow-hidden cursor-pointer group transition-all",
        isActive ? "ring-2 ring-primary" : "hover:bg-secondary/50",
        className
      )}
      onClick={() => onSelect(playlist)}
    >
      <div className="relative h-40">
        {playlist.coverImageUrl ? (
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform group-hover:scale-105"
            style={{ backgroundImage: `url(${playlist.coverImageUrl})` }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary/30">
            <Music className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity" />
        
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-lg font-semibold text-white">{playlist.name}</h3>
          <p className="text-sm text-white/80">{playlist.trackCount} tracks</p>
        </div>
        
        <Button
          size="icon"
          className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-primary opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(playlist);
          }}
        >
          <Play className="h-5 w-5" />
        </Button>
      </div>
    </Card>
  );
}
