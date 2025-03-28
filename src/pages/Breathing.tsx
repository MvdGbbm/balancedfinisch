
import React, { useState, useEffect } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import BreathingAnimation from "@/components/breathing/breathing-animation";
import { BreathExercise } from "@/components/breathing/breath-exercise";
import { BreathingVoicePlayer } from "@/components/breathing/breathing-voice-player";
import { BreathingPhase, BreathingTechnique } from "@/components/breathing/types";
import { BreathingMusicPlayer } from "@/components/breathing/breathing-music-player";
import { Wand2, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

// Define a type alias to match what the component expects
type ExerciseType = "box" | "4-7-8";

// Helper function to convert ExerciseType to BreathingTechnique
const mapExerciseTypeToTechnique = (type: ExerciseType): BreathingTechnique => {
  if (type === "box") return "box-breathing";
  if (type === "4-7-8") return "4-7-8";
  return "box-breathing"; // default
};

const Breathing = () => {
  const [exerciseType, setExerciseType] = useState<ExerciseType>("box");
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [activeVoice, setActiveVoice] = useState<"vera" | "marco" | null>(null);
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [voiceVolume, setVoiceVolume] = useState(0.8);
  
  // Voice guidance audio URLs
  const veraUrls = {
    start: "/audio/vera_breathing_start.mp3",
    inhale: "/audio/vera_breathing_inhale.mp3",
    hold: "/audio/vera_breathing_hold.mp3",
    exhale: "/audio/vera_breathing_exhale.mp3",
  };

  const marcoUrls = {
    start: "/audio/marco_breathing_start.mp3",
    inhale: "/audio/marco_breathing_inhale.mp3",
    hold: "/audio/marco_breathing_hold.mp3",
    exhale: "/audio/marco_breathing_exhale.mp3",
  };

  // Map the active voice to the correct voice URLs
  const getActiveVoiceUrls = () => {
    if (activeVoice === "vera") return veraUrls;
    if (activeVoice === "marco") return marcoUrls;
    return null;
  };

  const handlePlayVoice = (voice: "vera" | "marco") => {
    setIsPlayingVoice(true);
    setActiveVoice(voice);
  };

  const handlePauseVoice = () => {
    setIsPlayingVoice(false);
    setActiveVoice(null);
  };

  const handleVoiceVolumeChange = (newValue: number[]) => {
    setVoiceVolume(newValue[0]);
  };

  const toggleMusicPlayer = () => {
    setShowMusicPlayer(!showMusicPlayer);
  };

  return (
    <MobileLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Ademhalingsoefeningen</h1>
          <p className="text-muted-foreground">
            Ontspan en vind je focus met begeleide ademhalingsoefeningen
          </p>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant={exerciseType === "box" ? "default" : "outline"}
              size="sm"
              onClick={() => setExerciseType("box")}
            >
              Box Breathing
            </Button>
            <Button
              variant={exerciseType === "4-7-8" ? "default" : "outline"}
              size="sm"
              onClick={() => setExerciseType("4-7-8")}
            >
              4-7-8 Techniek
            </Button>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Music className="h-4 w-4 mr-2" />
                Muziek
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[350px] p-0 bg-background border" align="end">
              <BreathingMusicPlayer />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-8">
          <BreathingAnimation 
            technique={mapExerciseTypeToTechnique(exerciseType)}
            voiceUrls={getActiveVoiceUrls()}
            isVoiceActive={isPlayingVoice}
            inhaleTime={exerciseType === "box" ? 4 : 4}
            holdTime={exerciseType === "box" ? 4 : 7}
            exhaleTime={exerciseType === "box" ? 4 : 8}
            pauseTime={exerciseType === "box" ? 4 : 0}
          />
          
          {/* Pass correct props to BreathExercise based on its interface */}
          <BreathExercise 
            breathingPatterns={[
              {
                id: "box",
                name: "Box Breathing",
                inhale: 4,
                hold1: 4, 
                exhale: 4,
                hold2: 4,
                cycles: 5
              },
              {
                id: "4-7-8",
                name: "4-7-8 Techniek",
                inhale: 4,
                hold1: 7,
                exhale: 8,
                hold2: 0, // Add hold2 property with a value of 0 for this pattern
                cycles: 5
              }
            ]}
            selectedPattern={exerciseType === "box" ? {
              id: "box",
              name: "Box Breathing",
              inhale: 4,
              hold1: 4, 
              exhale: 4,
              hold2: 4,
              cycles: 5
            } : {
              id: "4-7-8",
              name: "4-7-8 Techniek",
              inhale: 4,
              hold1: 7,
              exhale: 8,
              hold2: 0, // Add hold2 property with a value of 0 for this pattern
              cycles: 5
            }}
            onPatternChange={(patternId) => {
              if (patternId === "box" || patternId === "4-7-8") {
                setExerciseType(patternId);
              }
            }}
          />
          
          <BreathingVoicePlayer 
            veraUrls={veraUrls}
            marcoUrls={marcoUrls}
            isActive={isPlayingVoice}
            onPlay={handlePlayVoice}
            onPause={handlePauseVoice}
            activeVoice={activeVoice}
            headerText="Stembegeleiding"
            volume={voiceVolume}
            onVolumeChange={handleVoiceVolumeChange}
          />
        </div>
      </div>
    </MobileLayout>
  );
};

export default Breathing;
