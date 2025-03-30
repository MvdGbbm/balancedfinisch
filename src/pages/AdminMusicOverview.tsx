
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MobileLayout } from "@/components/mobile-layout";
import { Soundscape } from "@/lib/types";
import { AudioPlayer } from "@/components/audio-player";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Music, Play, Pause } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AdminMusicOverview = () => {
  const navigate = useNavigate();
  const [currentTrack, setCurrentTrack] = React.useState<Soundscape | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);

  const { data: musicTracks, isLoading, error } = useQuery({
    queryKey: ["admin-music-overview"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("soundscapes")
          .select("*")
          .eq("category", "Muziek")
          .order("title");

        if (error) {
          throw error;
        }

        return data.map((item): Soundscape => ({
          id: item.id,
          title: item.title,
          description: item.description || "",
          audioUrl: item.audio_url,
          category: item.category,
          coverImageUrl: item.cover_image_url,
          tags: item.tags || [],
        }));
      } catch (err) {
        console.error("Error fetching music:", err);
        toast.error("Er is een fout opgetreden bij het ophalen van de muziek.");
        return [];
      }
    }
  });

  const handlePlayTrack = (track: Soundscape) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
      return;
    }
    
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  return (
    <MobileLayout>
      <div className="container py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Muziekoverzicht</h1>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Music className="text-primary h-5 w-5" />
            <h2 className="text-lg font-medium">Alle beschikbare muziek</h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-destructive">
              <p>Er is een fout opgetreden bij het laden van de muziek.</p>
            </div>
          ) : musicTracks?.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <p>Er is nog geen muziek toegevoegd via het Admin paneel.</p>
              <Button 
                className="mt-4" 
                onClick={() => navigate("/admin/music")}
                variant="outline"
              >
                Ga naar Admin Muziek
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {musicTracks?.map((track) => (
                <div 
                  key={track.id}
                  className="flex items-center gap-3 p-4 rounded-lg border bg-card"
                >
                  <div 
                    className="h-16 w-16 rounded-md overflow-hidden bg-cover bg-center shadow-md flex-shrink-0"
                    style={{ backgroundImage: `url(${track.coverImageUrl})` }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{track.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{track.description}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {track.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-xs px-2 py-0.5 bg-muted rounded-full">
                          {tag}
                        </span>
                      ))}
                      {track.tags.length > 3 && (
                        <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
                          +{track.tags.length - 3} meer
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                    onClick={() => handlePlayTrack(track)}
                  >
                    {currentTrack?.id === track.id && isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {currentTrack && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
            <div className="flex items-center gap-3 mb-2">
              <div 
                className="w-10 h-10 rounded-md bg-cover bg-center" 
                style={{ backgroundImage: `url(${currentTrack.coverImageUrl})` }}
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{currentTrack.title}</h4>
                <p className="text-xs text-muted-foreground truncate">
                  {currentTrack.tags.slice(0, 2).join(", ")}
                </p>
              </div>
            </div>
            <AudioPlayer 
              audioUrl={currentTrack.audioUrl} 
              className="w-full"
              isPlayingExternal={isPlaying}
              onPlayPauseChange={setIsPlaying}
              title={currentTrack.title}
            />
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default AdminMusicOverview;
