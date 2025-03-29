
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BreathingPattern } from "./types";

interface PatternListProps {
  patterns: BreathingPattern[];
  selectedPattern: BreathingPattern | null;
  onSelectPattern: (pattern: BreathingPattern) => void;
}

export function PatternList({ patterns, selectedPattern, onSelectPattern }: PatternListProps) {
  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>Ademhalingstechnieken</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {patterns.map(pattern => (
            <Button 
              key={pattern.id} 
              variant={selectedPattern?.id === pattern.id ? "default" : "outline"} 
              className="w-full justify-start text-left" 
              onClick={() => onSelectPattern(pattern)}
            >
              {pattern.name}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
