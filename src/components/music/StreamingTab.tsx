
import React from "react";
import { Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioStream } from "./types";

interface StreamingTabProps {
  radioStreams: RadioStream[];
}

export const StreamingTab: React.FC<StreamingTabProps> = ({
  radioStreams
}) => {
  return (
    <div className="space-y-2">
      {radioStreams.length > 0 ? (
        radioStreams.map(stream => (
          <Card key={stream.id} className="mb-3">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded bg-primary/10 flex-shrink-0 flex items-center justify-center">
                  <Radio className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{stream.title}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {stream.description}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Afspelen
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <p className="text-center py-8 text-muted-foreground">
          Geen streaming links gevonden
        </p>
      )}
    </div>
  );
};
