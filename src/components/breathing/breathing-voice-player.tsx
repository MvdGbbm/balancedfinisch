
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Mic, Pause, Play, Volume2 } from "lucide-react";

interface BreathingVoicePlayerProps {
  veraUrls: {
    start?: string;
    inhale: string;
    hold: string;
    exhale: string;
  };
  marcoUrls: {
    start?: string;
    inhale: string;
    hold: string;
    exhale: string;
  };
  isActive: boolean;
  onPlay: (voice: "vera" | "marco") => void;
  onPause: () => void;
  activeVoice: "vera" | "marco" | null;
  headerText: string;
  volume?: number;
  onVolumeChange?: (newValue: number[]) => void;
}

export function BreathingVoicePlayer({
  veraUrls,
  marcoUrls,
  isActive,
  onPlay,
  onPause,
  activeVoice,
  headerText,
  volume = 0.8,
  onVolumeChange = () => {}
}: BreathingVoicePlayerProps) {
  const hasVeraUrls = veraUrls.inhale && veraUrls.hold && veraUrls.exhale;
  const hasMarcoUrls = marcoUrls.inhale && marcoUrls.hold && marcoUrls.exhale;
  
  const handleVoiceToggle = (voice: "vera" | "marco") => {
    if (isActive && activeVoice === voice) {
      onPause();
    } else {
      onPlay(voice);
    }
  };
  
  return (
    <Card className="bg-card/60 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Mic className="h-5 w-5 text-primary" />
          {headerText}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 pt-2">
          <Button
            variant={activeVoice === "vera" ? "default" : "outline"}
            size="sm"
            className={`flex-1 ${!hasVeraUrls ? "opacity-50" : ""}`}
            disabled={!hasVeraUrls}
            onClick={() => handleVoiceToggle("vera")}
          >
            {isActive && activeVoice === "vera" ? (
              <Pause className="h-4 w-4 mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Vera
          </Button>
          
          <Button
            variant={activeVoice === "marco" ? "default" : "outline"}
            size="sm"
            className={`flex-1 ${!hasMarcoUrls ? "opacity-50" : ""}`}
            disabled={!hasMarcoUrls}
            onClick={() => handleVoiceToggle("marco")}
          >
            {isActive && activeVoice === "marco" ? (
              <Pause className="h-4 w-4 mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Marco
          </Button>
        </div>
        
        {(activeVoice === "vera" || activeVoice === "marco") && (
          <div className="flex items-center space-x-2 mt-3">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <Slider
              value={[volume]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={onVolumeChange}
              className="w-full"
            />
          </div>
        )}
        
        {!hasVeraUrls && !hasMarcoUrls && (
          <p className="text-sm text-muted-foreground mt-2">
            Er zijn nog geen stembestanden toegevoegd. Voeg deze toe in de admin instellingen.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
