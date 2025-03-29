
import React from "react";
import { VoiceUrls, ActiveVoice } from "../types/exercise-types";
import { Button } from "@/components/ui/button";
import { Pause, Play } from "lucide-react";

interface VoiceControlsProps {
  activeVoice: ActiveVoice;
  isActive: boolean;
  veraVoiceUrls: VoiceUrls;
  marcoVoiceUrls: VoiceUrls;
  onStartWithVera: () => void;
  onStartWithMarco: () => void;
}

export function VoiceControls({
  activeVoice,
  isActive,
  veraVoiceUrls,
  marcoVoiceUrls,
  onStartWithVera,
  onStartWithMarco
}: VoiceControlsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 w-full max-w-xs mx-auto mt-6">
      <Button 
        onClick={onStartWithVera} 
        variant={isActive && activeVoice === "vera" ? "secondary" : "default"}
        size="lg"
        className="w-full bg-blue-500 hover:bg-blue-600 border-none"
      >
        {isActive && activeVoice === "vera" ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
        Vera
      </Button>
      
      <Button 
        onClick={onStartWithMarco} 
        variant={isActive && activeVoice === "marco" ? "secondary" : "default"}
        size="lg"
        className="w-full bg-blue-500 hover:bg-blue-600 border-none"
      >
        {isActive && activeVoice === "marco" ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
        Marco
      </Button>
    </div>
  );
}
