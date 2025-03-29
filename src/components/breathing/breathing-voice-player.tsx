
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreathingVoicePlayerProps {
  veraUrls: {
    inhale: string;
    hold: string;
    exhale: string;
  };
  marcoUrls: {
    inhale: string;
    hold: string;
    exhale: string;
  };
  isActive: boolean;
  onPlay: (voice: "vera" | "marco") => void;
  onPause: () => void;
  activeVoice: "vera" | "marco" | null;
  headerText?: string;
  volume?: number;
  onVolumeChange?: (volume: number) => void;
}

export const BreathingVoicePlayer = ({
  veraUrls,
  marcoUrls,
  isActive,
  onPlay,
  onPause,
  activeVoice,
  headerText = "Kies een stem voor begeleiding",
  volume = 0.8,
  onVolumeChange
}: BreathingVoicePlayerProps) => {
  
  const handlePlayVera = () => {
    if (isActive && activeVoice === "vera") {
      onPause();
    } else {
      onPlay("vera");
    }
  };
  
  const handlePlayMarco = () => {
    if (isActive && activeVoice === "marco") {
      onPause();
    } else {
      onPlay("marco");
    }
  };
  
  const areVeraUrlsValid = veraUrls.inhale && veraUrls.hold && veraUrls.exhale;
  const areMarcoUrlsValid = marcoUrls.inhale && marcoUrls.hold && marcoUrls.exhale;
  
  return (
    <Card className="overflow-hidden border-muted bg-card/50 backdrop-blur-sm">
      <CardHeader className="p-3 pb-0">
        <CardTitle className="text-sm font-medium">{headerText}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={activeVoice === "vera" ? "default" : "outline"}
            className={cn(
              "w-full text-sm flex items-center justify-center gap-2",
              !areVeraUrlsValid && "opacity-50 cursor-not-allowed"
            )}
            onClick={handlePlayVera}
            disabled={!areVeraUrlsValid}
          >
            {activeVoice === "vera" && isActive ? "Pauze Vera" : "Vera"}
          </Button>
          
          <Button
            variant={activeVoice === "marco" ? "default" : "outline"}
            className={cn(
              "w-full text-sm flex items-center justify-center gap-2",
              !areMarcoUrlsValid && "opacity-50 cursor-not-allowed"
            )}
            onClick={handlePlayMarco}
            disabled={!areMarcoUrlsValid}
          >
            {activeVoice === "marco" && isActive ? "Pauze Marco" : "Marco"}
          </Button>
        </div>
        
        {(!areVeraUrlsValid || !areMarcoUrlsValid) && (
          <p className="text-xs text-muted-foreground mt-2">
            Let op: Niet alle stemaudio is geconfigureerd. Ga naar de Admin om audio te configureren.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
