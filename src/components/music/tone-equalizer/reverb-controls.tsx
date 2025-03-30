
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ReverbControlsProps } from "./types";

export function ReverbControls({ 
  reverbEnabled, 
  reverbAmount, 
  handleReverbToggle, 
  handleReverbAmountChange,
  isActive,
  isInitialized
}: ReverbControlsProps) {
  return (
    <div className="flex items-center justify-between border-t border-blue-900/30 pt-1.5">
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-blue-100/70">Galm</span>
        <Switch 
          checked={reverbEnabled} 
          onCheckedChange={handleReverbToggle} 
          disabled={!isActive || !isInitialized}
          className="h-4 w-7 data-[state=checked]:bg-blue-500"
        />
      </div>
      <div className="flex items-center gap-1">
        <Slider
          value={[reverbAmount]}
          min={0}
          max={1}
          step={0.01}
          disabled={!isActive || !isInitialized || !reverbEnabled}
          onValueChange={handleReverbAmountChange}
          className="w-20"
        />
        <span className="text-[10px] text-blue-100/70 w-6 text-right">{Math.round(reverbAmount * 100)}%</span>
      </div>
    </div>
  );
}
