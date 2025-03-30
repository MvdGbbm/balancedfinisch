
import React from "react";
import { Slider } from "@/components/ui/slider";
import { FrequencySliderProps } from "./types";
import { getSliderThumbColor } from "./utils";

export function FrequencySlider({ 
  currentBand, 
  onBandChange,
  isActive,
  isInitialized
}: FrequencySliderProps) {
  return (
    <div className="mb-3">
      <div className="flex flex-col">
        <div className="flex justify-between mb-1">
          <span className="text-xs text-blue-200 font-medium">{currentBand.frequency} Hz</span>
          <span className="text-xs text-blue-300/70">
            {Math.round(currentBand.gain * 10) / 10} dB
          </span>
        </div>
        <Slider
          value={[currentBand.gain]}
          min={0}
          max={10}
          step={0.5}
          disabled={!isActive || !isInitialized}
          onValueChange={onBandChange}
          className="my-2"
          // Custom styles for the interactive thumb
          styles={{
            thumb: {
              backgroundColor: getSliderThumbColor(currentBand.gain, 10),
              transition: 'background-color 0.3s ease'
            }
          }}
        />
        <div className="flex justify-between text-[10px] text-blue-300/60">
          <span>0 dB</span>
          <span>Meest effectief</span>
        </div>
      </div>
    </div>
  );
}
