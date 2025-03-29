
import React from "react";
import { Button } from "@/components/ui/button";
import { PlayCircle, StopCircle } from "lucide-react";
import { MeditationPlayerControlsProps } from "./types";

export const MeditationPlayerControls: React.FC<MeditationPlayerControlsProps> = ({
  isPlaying,
  onStop,
  onStart,
  title
}) => {
  return (
    <div className="flex justify-between items-center mb-2">
      <h3 className="font-medium">Nu speelt: {title}</h3>
      {isPlaying ? (
        <Button 
          variant="destructive"
          size="sm"
          onClick={onStop}
          className="flex items-center gap-1"
        >
          <StopCircle className="h-4 w-4" />
          Stoppen
        </Button>
      ) : (
        <Button 
          variant="default"
          size="sm"
          onClick={onStart}
          className="flex items-center gap-1"
        >
          <PlayCircle className="h-4 w-4" />
          Start
        </Button>
      )}
    </div>
  );
};
