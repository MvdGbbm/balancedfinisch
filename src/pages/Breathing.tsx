
import React from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { BreathExercise } from "@/components/breathing/breath-exercise";
import { BreathingMusicPlayer } from "@/components/breathing/breathing-music-player";

const Breathing = () => {
  return (
    <MobileLayout>
      <div className="space-y-6 animate-fade-in bg-gradient-to-b from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 min-h-full p-4 rounded-lg">
        <BreathExercise />
        <BreathingMusicPlayer />
      </div>
    </MobileLayout>
  );
};

export default Breathing;
