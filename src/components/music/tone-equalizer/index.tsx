
import React from "react";
import { cn } from "@/lib/utils";
import { useAudioProcessor } from "./use-audio-processor";
import { ToneEqualizerProps } from "./types";
import { EqualizerHeader } from "./equalizer-header";
import { FrequencySelector } from "./frequency-selector";
import { FrequencySlider } from "./frequency-slider";
import { ReverbControls } from "./reverb-controls";

export function ToneEqualizer({ isActive, className, audioRef }: ToneEqualizerProps) {
  const {
    currentBand,
    handleBandChange,
    selectedFrequency,
    setSelectedFrequency,
    reverbEnabled,
    reverbAmount,
    handleReverbToggle,
    handleReverbAmountChange,
    masterVolume,
    handleVolumeChange,
    handleReset,
    isInitialized
  } = useAudioProcessor(isActive, audioRef);

  return (
    <div className={cn("p-3 bg-black/90 backdrop-blur-lg rounded-lg shadow-lg", className)}>
      <EqualizerHeader 
        handleReset={handleReset}
        masterVolume={masterVolume}
        handleVolumeChange={handleVolumeChange}
        isActive={isActive}
        isInitialized={isInitialized}
      />

      <FrequencySelector 
        selectedFrequency={selectedFrequency}
        setSelectedFrequency={setSelectedFrequency}
        isActive={isActive}
        isInitialized={isInitialized}
      />

      <FrequencySlider 
        currentBand={currentBand}
        onBandChange={handleBandChange}
        isActive={isActive}
        isInitialized={isInitialized}
      />
      
      <ReverbControls 
        reverbEnabled={reverbEnabled}
        reverbAmount={reverbAmount}
        handleReverbToggle={handleReverbToggle}
        handleReverbAmountChange={handleReverbAmountChange}
        isActive={isActive}
        isInitialized={isInitialized}
      />
    </div>
  );
}
