
import React from "react";
import { BreathingPattern } from "@/lib/types";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface PatternSelectorProps {
  patterns: BreathingPattern[];
  selectedPatternId: string | undefined;
  onPatternChange: (patternId: string) => void;
  disabled: boolean;
}

export function PatternSelector({
  patterns,
  selectedPatternId,
  onPatternChange,
  disabled
}: PatternSelectorProps) {
  if (!patterns || patterns.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <Select
        value={selectedPatternId}
        onValueChange={onPatternChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full bg-black/20 border-white/10 text-white">
          <SelectValue placeholder="Selecteer een ademhalingstechniek" />
        </SelectTrigger>
        <SelectContent>
          {patterns.map((pattern) => (
            <SelectItem key={pattern.id} value={pattern.id}>
              {pattern.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
