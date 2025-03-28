
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, ListMusic, Sunrise, BookOpen, Music, Quote } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Playlist } from "./types";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

// Features data from Index.tsx
const features = [
  {
    title: "Meditaties",
    description: "Ontdek geleide meditaties voor elke gemoedstoestand",
    icon: Sunrise,
    color: "bg-blue-100 dark:bg-blue-900/30",
    textColor: "text-blue-600 dark:text-blue-300",
    path: "/meditations"
  },
  {
    title: "Ademhalingsoefeningen",
    description: "Verbeter je ademhaling met visuele oefeningen",
    icon: Sunrise,
    color: "bg-emerald-100 dark:bg-emerald-900/30",
    textColor: "text-emerald-600 dark:text-emerald-300",
    path: "/breathing"
  },
  {
    title: "Muziek",
    description: "Ontdek rustgevende muziek voor meditatie en ontspanning",
    icon: Music,
    color: "bg-amber-100 dark:bg-amber-900/30",
    textColor: "text-amber-600 dark:text-amber-300",
    path: "/music"
  },
  {
    title: "Dagboek",
    description: "Houd je emotionele reis bij en zie je voortgang",
    icon: BookOpen,
    color: "bg-rose-100 dark:bg-rose-900/30",
    textColor: "text-rose-600 dark:text-rose-300",
    path: "/journal"
  },
  {
    title: "Soundscapes",
    description: "Ontspan met rustgevende natuurgeluiden en muziek",
    icon: Music,
    color: "bg-indigo-100 dark:bg-indigo-900/30",
    textColor: "text-indigo-600 dark:text-indigo-300",
    path: "/soundscapes"
  },
  {
    title: "Dagelijkse Quote",
    description: "Inspiratie voor elke dag van de week",
    icon: Quote,
    color: "bg-purple-100 dark:bg-purple-900/30",
    textColor: "text-purple-600 dark:text-purple-300",
    path: "/daily-quote"
  }
];

interface PlaylistSelectorProps {
  playlists: Playlist[];
  onSelectPlaylist: (playlist: Playlist) => void;
  onCreateNew: () => void;
}

export function PlaylistSelector({ playlists, onSelectPlaylist, onCreateNew }: PlaylistSelectorProps) {
  const navigate = useNavigate();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1 bg-background/10 backdrop-blur-sm border-muted hover:bg-background/20"
        >
          <Plus className="h-4 w-4" />
          Toevoegen aan
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-[450px] bg-background/95 backdrop-blur-sm border-muted z-50"
      >
        <DropdownMenuLabel>Balanced Mind Meditation</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="p-3 max-h-[70vh] overflow-y-auto">
          <div className="text-center mb-4">
            <h2 className="font-bold tracking-tight mb-2 text-lg">Balanced Mind Meditation</h2>
            <p className="text-muted-foreground text-sm">
              Vind innerlijke rust en verbeter je welzijn
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            {features.map(feature => (
              <Card 
                key={feature.title} 
                className={cn("overflow-hidden cursor-pointer neo-morphism hover:shadow-md transition-shadow duration-300")} 
                onClick={() => {
                  navigate(feature.path);
                }}
              >
                <CardContent className="p-3">
                  <div className={cn("p-1.5 rounded-full w-fit mb-1.5", feature.color)}>
                    <feature.icon className={cn("h-4 w-4", feature.textColor)} />
                  </div>
                  <h3 className="font-medium mb-0.5 text-sm">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <DropdownMenuSeparator />
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
