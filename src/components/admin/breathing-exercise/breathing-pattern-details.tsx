
import React from "react";
import { BreathingPattern } from "@/lib/types";

interface BreathingPatternDetailsProps {
  pattern: BreathingPattern;
}

export function BreathingPatternDetails({ pattern }: BreathingPatternDetailsProps) {
  return (
    <div className="rounded-md bg-muted p-3 text-sm">
      <h4 className="font-medium mb-2">Patroon details:</h4>
      <ul className="space-y-1 list-disc pl-4">
        <li>Inademen: {pattern.inhale} seconden</li>
        <li>Vasthouden na inademen: {pattern.hold1} seconden {pattern.hold1 === 0 && "(wordt overgeslagen)"}</li>
        <li>Uitademen: {pattern.exhale} seconden</li>
        <li>Vasthouden na uitademen: {pattern.hold2} seconden {pattern.hold2 === 0 && "(wordt overgeslagen)"}</li>
        <li>Aantal cycli: {pattern.cycles}</li>
      </ul>
    </div>
  );
}
