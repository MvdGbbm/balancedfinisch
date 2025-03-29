
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function EmptyPatternDisplay() {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Selecteer een techniek</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          Selecteer een ademhalingstechniek om te bewerken, of maak een nieuwe aan.
        </div>
      </CardContent>
    </Card>
  );
}
