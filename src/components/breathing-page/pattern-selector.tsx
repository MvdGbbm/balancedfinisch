
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PatternSelectorProps } from './types';

export const PatternSelector: React.FC<PatternSelectorProps> = ({
  breathingPatterns,
  selectedPattern,
  isExerciseActive,
  onSelectPattern
}) => {
  return (
    <div className="w-full">
      <Select
        value={selectedPattern?.id}
        onValueChange={onSelectPattern}
        disabled={isExerciseActive}
      >
        <SelectTrigger className="w-full bg-tranquil-400 hover:bg-tranquil-500 text-black">
          <SelectValue placeholder="Kies" />
        </SelectTrigger>
        <SelectContent>
          {breathingPatterns.map((pattern) => (
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
