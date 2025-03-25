
import React from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { BreathExercise } from "@/components/breathing/breath-exercise";
import { BreathingMusicPlayer } from "@/components/breathing/breathing-music-player";

const Breathing = () => {
  return (
    <MobileLayout>
      <div className="space-y-6 animate-fade-in p-4 bg-gradient-to-b from-[#0a0c14] to-[#161a24]">
        <BreathExercise />
        <BreathingMusicPlayer />
      </div>
    </MobileLayout>
  );
};

export default Breathing;
