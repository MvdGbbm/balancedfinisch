
import React from "react";
import { Button } from "@/components/ui/button";
import { Pause, Play, RefreshCw } from "lucide-react";
import { BreathingExerciseControlsProps } from "./types";

export function BreathingExerciseControls({
  isActive,
  activeVoice,
  onStartWithVera,
  onStartWithMarco,
  onReset
}: BreathingExerciseControlsProps) {
  return (
    <>
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
      
      <div className="flex justify-center mt-3">
        <Button 
          onClick={onReset} 
          variant="outline"
          size="sm"
          className="text-white/80 border-white/20 hover:bg-white/10"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>
    </>
  );
}
