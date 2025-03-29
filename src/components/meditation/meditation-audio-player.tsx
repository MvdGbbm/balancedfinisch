
import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { formatTime } from "@/lib/utils";
import { getRandomQuote } from "@/components/audio-player/utils";
import { AudioPlayer, AudioPlayerHandle } from "@/components/audio-player";

interface MeditationAudioPlayerProps {
  audioUrl: string;
  coverImage?: string;
  title: string;
  subtitle?: string;
  showQuote?: boolean;
  quotes?: string[];
}

export const MeditationAudioPlayer: React.FC<MeditationAudioPlayerProps> = ({
  audioUrl,
  coverImage,
  title,
  subtitle,
  showQuote = false,
  quotes = []
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [quote, setQuote] = useState<string>('');
  
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Initialize with a random quote
  useEffect(() => {
    if (showQuote && quotes.length > 0) {
      setQuote(getRandomQuote(quotes));
    }
  }, [showQuote, quotes]);
  
  // Toggle play/pause
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };
  
  // Skip backward/forward
  const skipTime = (amount: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime + amount);
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      {showQuote && quote && (
        <div className="mb-4 p-3 rounded-lg bg-primary/10 text-center italic text-sm">
          "{quote}"
        </div>
      )}
      
      <AudioPlayer 
        audioUrl={audioUrl}
        title={title}
        subtitle={subtitle}
        coverImage={coverImage}
        isPlayingExternal={isPlaying}
        onPlayPauseChange={setIsPlaying}
        volume={volume}
        ref={audioRef as React.Ref<AudioPlayerHandle>}
      />
    </div>
  );
};
