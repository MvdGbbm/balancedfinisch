
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BreathingPattern } from "@/lib/types";

interface BreathingPatternListProps {
  patterns: BreathingPattern[];
  selectedPattern: BreathingPattern | null;
  onPatternSelect: (pattern: BreathingPattern) => void;
}

export function BreathingPatternList({ 
  patterns, 
  selectedPattern, 
  onPatternSelect 
}: BreathingPatternListProps) {
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
              onClick={() => onPatternSelect(pattern)}
            >
              {pattern.name}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
