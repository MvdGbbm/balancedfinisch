
import React from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { BreathExercise } from "@/components/breathing/breath-exercise";
import { BreathingMusicPlayer } from "@/components/breathing/breathing-music-player";

const Breathing = () => {
  return (
    <MobileLayout>
      <div className="space-y-6 animate-fade-in">
        <BreathExercise />
        <BreathingMusicPlayer />
      </div>
    </MobileLayout>
  );
};

export default Breathing;
