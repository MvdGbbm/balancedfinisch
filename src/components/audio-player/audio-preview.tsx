
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2 } from "lucide-react";
import { validateAudioUrl } from "./utils";

interface AudioPreviewProps {
  audioUrl: string;
  previewMode?: boolean;
}

export const AudioPreview: React.FC<AudioPreviewProps> = ({ 
  audioUrl, 
  previewMode = false 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const effectiveUrl = validateAudioUrl(audioUrl);
  
  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.error("Error playing audio:", err);
      });
    }
    
    setIsPlaying(!isPlaying);
  };
  
  return (
    <div className={`flex items-center space-x-2 ${previewMode ? 'py-1' : ''}`}>
      <Button
        variant={previewMode ? "ghost" : "outline"}
        size="sm"
        onClick={togglePlay}
        className={previewMode ? "h-8 w-8 p-0" : ""}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
        <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
      </Button>
      
      {previewMode && (
        <div className="text-sm truncate flex-1">
          <span className="font-medium">Audio:</span> {audioUrl.split('/').pop()}
        </div>
      )}
      
      <audio 
        ref={audioRef} 
        src={effectiveUrl} 
        onEnded={() => setIsPlaying(false)}
        preload="none"
        className="hidden"
      />
    </div>
  );
};
