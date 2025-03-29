
import React from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { BreathingPatternSelectorProps } from "./types";

export function BreathingPatternSelector({
  breathingPatterns,
  selectedPattern,
  isActive,
  onPatternChange
}: BreathingPatternSelectorProps) {
  if (!selectedPattern || breathingPatterns.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        Geen ademhalingstechnieken beschikbaar.
      </div>
    );
  }

  return (
    <div className="mb-4">
      <Select
        value={selectedPattern.id}
        onValueChange={onPatternChange}
        disabled={isActive}
      >
        <SelectTrigger className="w-full bg-black/20 border-white/10 text-white">
          <SelectValue placeholder="Selecteer een ademhalingstechniek" />
        </SelectTrigger>
        <SelectContent>
          {breathingPatterns.map((pattern) => (
            <SelectItem key={pattern.id} value={pattern.id}>
              {pattern.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
