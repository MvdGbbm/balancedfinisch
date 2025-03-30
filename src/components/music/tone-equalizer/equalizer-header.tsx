
import React from "react";
import { Waves, RefreshCw, Volume2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { EqualizerHeaderProps } from "./types";

export function EqualizerHeader({ 
  handleReset, 
  masterVolume, 
  handleVolumeChange,
  isActive,
  isInitialized
}: EqualizerHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-1.5">
        <Waves className="h-3.5 w-3.5 text-blue-400" />
        <span className="text-xs font-medium text-blue-400">Helende Frequenties</span>
      </div>
      <div className="flex items-center gap-1.5">
        <button 
          onClick={handleReset}
          className="p-1 rounded-full hover:bg-blue-900/30 text-blue-300/70"
          title="Reset alle instellingen"
          disabled={!isActive || !isInitialized}
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
        <Volume2 className="h-3 w-3 text-blue-400/70 ml-1" />
        <Slider
          value={[masterVolume]}
          min={0}
          max={1.5}
          step={0.01}
          onValueChange={handleVolumeChange}
          className="w-20"
        />
      </div>
    </div>
  );
}
