
import React from "react";
import { Volume2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (newValue: number[]) => void;
  className?: string;
}

export function VolumeControl({
  volume,
  onVolumeChange,
  className
}: VolumeControlProps) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Volume2 className="h-4 w-4 text-muted-foreground" />
      <Slider
        value={[volume]}
        min={0}
        max={1}
        step={0.01}
        onValueChange={onVolumeChange}
        className="w-24"
      />
    </div>
  );
}
