
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ChevronRight } from "lucide-react";
import { BreathingPattern } from "./types";

interface PatternSelectorProps {
  patterns: BreathingPattern[];
  selectedPattern: BreathingPattern | null;
  onSelect: (patternId: string) => void;
}

export const PatternSelector: React.FC<PatternSelectorProps> = ({
  patterns,
  selectedPattern,
  onSelect
}) => {
  return (
    <Card className="border-none shadow-md bg-black/5 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Selecteer een Ademhaling Oefening</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-0.5">
          {patterns.map((pattern) => (
            <Button
              key={pattern.id}
              variant="ghost"
              className={`w-full justify-between px-6 py-3 h-auto ${
                selectedPattern?.id === pattern.id ? "bg-primary/10" : ""
              }`}
              onClick={() => onSelect(pattern.id)}
            >
              <div className="flex items-start flex-col text-left">
                <span className="font-medium">{pattern.name}</span>
                <span className="text-xs text-muted-foreground">{pattern.description}</span>
              </div>
              {selectedPattern?.id === pattern.id ? (
                <Check className="h-5 w-5 text-primary" aria-label="Selected" />
              ) : (
                <ChevronRight className="h-5 w-5 text-muted-foreground" aria-label="Select" />
              )}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
