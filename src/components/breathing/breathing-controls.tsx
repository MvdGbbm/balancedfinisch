
import React from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipForward, Volume2, VolumeX } from "lucide-react";
import { BreathingPhase } from "./types";

interface BreathingControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSkipToNextPhase: () => void;
  currentPhase: BreathingPhase;
  currentCycle: number;
  totalCycles: number;
  completionPercentage: number;
  breathsCompleted: number;
  volume: number;
  onVolumeChange: (value: number[]) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  showPhaseText?: boolean;
}

export const BreathingControls: React.FC<BreathingControlsProps> = ({
  isPlaying,
  onTogglePlay,
  onSkipToNextPhase,
  currentPhase,
  currentCycle,
  totalCycles,
  completionPercentage,
  breathsCompleted,
  volume,
  onVolumeChange,
  isMuted,
  onToggleMute,
  showPhaseText = true,
}) => {
  const formatPercentage = (percentage: number) => {
    return `${Math.round(percentage)}%`;
  };

  const getPhaseText = () => {
    switch (currentPhase) {
      case "inhale":
        return "Inademen";
      case "hold":
        return "Vasthouden";
      case "exhale":
        return "Uitademen";
      case "pause":
        return "Vasthouden";
      case "start":
        return "Start";
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col space-y-4 w-full max-w-md mx-auto">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Cyclus {currentCycle} van {totalCycles}
        </span>
        <span>
          {formatPercentage(completionPercentage)}
        </span>
      </div>

      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      {showPhaseText && (
        <div className="text-center">
          <span className="text-xl font-medium">{getPhaseText()}</span>
        </div>
      )}

      <div className="flex items-center justify-center space-x-4">
        <Button
          variant="outline"
          size="icon"
          onClick={onTogglePlay}
          className="h-12 w-12 rounded-full"
        >
          {isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6" />
          )}
          <span className="sr-only">
            {isPlaying ? "Pauzeren" : "Afspelen"}
          </span>
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onSkipToNextPhase}
          className="h-10 w-10 rounded-full"
          disabled={currentPhase === "start"}
        >
          <SkipForward className="h-5 w-5" />
          <span className="sr-only">Volgende fase</span>
        </Button>
      </div>

      <div className="flex items-center space-x-2 mt-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleMute}
          className="h-8 w-8"
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
          <span className="sr-only">
            {isMuted ? "Geluid aan" : "Geluid uit"}
          </span>
        </Button>

        <Slider
          value={[isMuted ? 0 : volume * 100]}
          min={0}
          max={100}
          step={1}
          onValueChange={onVolumeChange}
          className="flex-1"
        />
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <span>{breathsCompleted} ademhalingen voltooid</span>
      </div>
    </div>
  );
};
