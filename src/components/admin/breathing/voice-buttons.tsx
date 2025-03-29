
import React from "react";
import { Button } from "@/components/ui/button";

interface VoiceButtonsProps {
  isActive: boolean;
  activeVoice: "vera" | "marco" | null;
  startWithVera: () => void;
  startWithMarco: () => void;
}

export function VoiceButtons({
  isActive,
  activeVoice,
  startWithVera,
  startWithMarco
}: VoiceButtonsProps) {
  return (
    <div className="mt-4 flex flex-col gap-2">
      <div className="text-sm font-medium mb-1">Met stem begeleiding:</div>
      <div className="flex gap-2">
        <Button 
          onClick={startWithVera} 
          variant={activeVoice === "vera" ? "default" : "outline"}
          size="sm"
          className="min-w-24"
        >
          {isActive && activeVoice === "vera" ? "Stop Vera" : "Start met Vera"}
        </Button>
        
        <Button 
          onClick={startWithMarco} 
          variant={activeVoice === "marco" ? "default" : "outline"}
          size="sm"
          className="min-w-24"
        >
          {isActive && activeVoice === "marco" ? "Stop Marco" : "Start met Marco"}
        </Button>
      </div>
    </div>
  );
}

export default VoiceButtons;
