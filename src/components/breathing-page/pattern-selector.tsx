
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PatternSelectorProps } from './types';
import { Info } from "lucide-react";

export const PatternSelector: React.FC<PatternSelectorProps> = ({
  breathingPatterns,
  selectedPattern,
  isExerciseActive,
  onSelectPattern
}) => {
  return (
    <div className="w-full">
      <div className="mb-2 flex items-center">
        <h3 className="text-md font-medium">Kies een ademhalingstechniek</h3>
        <Info className="ml-2 h-4 w-4 text-muted-foreground cursor-help" title="Selecteer een ademhalingspatroon om te beginnen" />
      </div>
      
      <Select
        value={selectedPattern?.id}
        onValueChange={onSelectPattern}
        disabled={isExerciseActive}
      >
        <SelectTrigger className="w-full bg-tranquil-400 hover:bg-tranquil-500 text-black focus:ring-offset-background">
          <SelectValue placeholder="Kies een techniek" />
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
