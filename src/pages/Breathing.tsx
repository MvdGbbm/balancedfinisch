
import React, { useState, useEffect } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import BreathingAnimation from "@/components/breathing/breathing-animation";
import { BreathExercise } from "@/components/breathing/breath-exercise";
import { BreathingVoicePlayer } from "@/components/breathing/breathing-voice-player";
import { BreathingMusicPlayer } from "@/components/breathing/breathing-music-player";
import { Wand2, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

// Define the ExerciseType type
type ExerciseType = "box" | "4-7-8";

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

  // Map exerciseType to the proper technique format expected by BreathingAnimation
  const getTechnique = (type: ExerciseType): "box-breathing" | "4-7-8" => {
    return type === "box" ? "box-breathing" : "4-7-8";
  };

  // Define breathing times based on technique
  const getBreathingTimes = (type: ExerciseType) => {
    if (type === "box") {
      return {
        inhaleTime: 4,
        holdTime: 4,
        exhaleTime: 4,
        pauseTime: 4
      };
    } else {
      return {
        inhaleTime: 4,
        holdTime: 7,
        exhaleTime: 8,
        pauseTime: 0
      };
    }
  };

  const breathingTimes = getBreathingTimes(exerciseType);

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
            technique={getTechnique(exerciseType)}
            voiceUrls={activeVoice === "vera" ? veraUrls : activeVoice === "marco" ? marcoUrls : null}
            isVoiceActive={isPlayingVoice}
            inhaleTime={breathingTimes.inhaleTime}
            holdTime={breathingTimes.holdTime}
            exhaleTime={breathingTimes.exhaleTime}
            pauseTime={breathingTimes.pauseTime}
          />
          
          <BreathExercise 
            exerciseType={exerciseType}
            activeVoice={activeVoice}
            isPlayingVoice={isPlayingVoice}
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
