
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BreathingPattern } from "../types/breathing-page-types";

interface PatternSelectorProps {
  patterns: BreathingPattern[];
  selectedPattern: BreathingPattern | null;
  onSelectPattern: (patternId: string) => void;
  disabled: boolean;
}

export const PatternSelector: React.FC<PatternSelectorProps> = ({
  patterns,
  selectedPattern,
  onSelectPattern,
  disabled
}) => {
  return (
    <div className="w-full">
      <Select
        value={selectedPattern?.id}
        onValueChange={onSelectPattern}
        disabled={disabled}
      >
        <SelectTrigger className="w-full bg-tranquil-400 hover:bg-tranquil-500 text-black">
          <SelectValue placeholder="Kies" />
        </SelectTrigger>
        <SelectContent>
          {patterns.map((pattern) => (
            <SelectItem key={pattern.id} value={pattern.id} className="py-3">
              <div>
                <div className="font-medium">{pattern.name}</div>
                {pattern.description && (
                  <div className="text-xs text-muted-foreground mt-0.5">{pattern.description}</div>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
