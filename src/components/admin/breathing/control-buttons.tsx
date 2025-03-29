
import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RefreshCw } from "lucide-react";

interface ControlButtonsProps {
  isActive: boolean;
  setIsActive: (active: boolean) => void;
  resetExercise: () => void;
  activeVoice?: "vera" | "marco" | null;
}

export function ControlButtons({
  isActive,
  setIsActive,
  resetExercise,
  activeVoice
}: ControlButtonsProps) {
  return (
    <div className="flex gap-2 mt-4">
      <Button 
        onClick={() => setIsActive(!isActive)} 
        variant="outline"
        size="sm"
        className="min-w-24"
        disabled={!!activeVoice}
      >
        {isActive ? <><Pause className="mr-2 h-4 w-4" /> Pauzeren</> : <><Play className="mr-2 h-4 w-4" /> Starten</>}
      </Button>
      
      <Button 
        onClick={resetExercise} 
        variant="outline"
        size="sm"
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Reset
      </Button>
    </div>
  );
}

export default ControlButtons;
