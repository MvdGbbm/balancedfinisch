
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BreathingPatternForm } from "./breathing-pattern-form";
import { UseFormReturn } from "react-hook-form";
import { BreathingPattern } from "@/lib/types";

interface BreathingPatternEditorProps {
  selectedPattern: BreathingPattern | null;
  patternForm: UseFormReturn<BreathingPattern>;
  onSave: (data: BreathingPattern) => void;
  onDelete: (id: string) => void;
}

export function BreathingPatternEditor({ 
  selectedPattern, 
  patternForm, 
  onSave, 
  onDelete 
}: BreathingPatternEditorProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>
          {selectedPattern ? `Bewerk: ${selectedPattern.name}` : "Selecteer een techniek"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <BreathingPatternForm 
          form={patternForm} 
          onSubmit={onSave} 
          onDelete={onDelete} 
          selectedPattern={selectedPattern} 
        />
      </CardContent>
    </Card>
  );
}
