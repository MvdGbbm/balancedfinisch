
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BreathingExerciseTester } from "./breathing-exercise/breathing-exercise-tester";
import { BreathingPattern } from "@/lib/types";

interface BreathingExerciseTestProps {
  pattern: BreathingPattern | null;
}

export function BreathingExerciseTest({ pattern }: BreathingExerciseTestProps) {
  if (!pattern) {
    return (
      <Card>
        <CardContent>
          <p className="text-muted-foreground">Selecteer eerst een ademhalingstechniek om te testen.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <BreathingExerciseTester pattern={pattern} />
      </CardContent>
    </Card>
  );
}
