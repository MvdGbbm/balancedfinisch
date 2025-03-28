
import React from "react";
import { Slider } from "@/components/ui/slider";
import { Volume2, Music } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreathingVolumeControlsProps {
  voiceVolume: number;
  musicVolume: number;
  onVoiceVolumeChange: (volume: number) => void;
  onMusicVolumeChange: (volume: number) => void;
  className?: string;
}

export const BreathingVolumeControls = ({
  voiceVolume,
  musicVolume,
  onVoiceVolumeChange,
  onMusicVolumeChange,
  className
}: BreathingVolumeControlsProps) => {
  const handleVoiceVolumeChange = (values: number[]) => {
    onVoiceVolumeChange(values[0]);
  };

  const handleMusicVolumeChange = (values: number[]) => {
    onMusicVolumeChange(values[0]);
  };

  return (
    <div className={cn("flex items-center justify-around gap-4 p-3 rounded-lg bg-black/10 backdrop-blur-sm", className)}>
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium">Stem</span>
        </div>
        <Slider
          value={[voiceVolume]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={handleVoiceVolumeChange}
          className="w-24"
        />
        <span className="text-xs text-muted-foreground">
          {Math.round(voiceVolume * 100)}%
        </span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <Music className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium">Muziek</span>
        </div>
        <Slider
          value={[musicVolume]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={handleMusicVolumeChange}
          className="w-24"
        />
        <span className="text-xs text-muted-foreground">
          {Math.round(musicVolume * 100)}%
        </span>
      </div>
    </div>
  );
};
