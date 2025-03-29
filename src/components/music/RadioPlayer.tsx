
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StopCircle, Volume2 } from "lucide-react";

interface RadioPlayerProps {
  streamTitle: string;
  onStop: () => void;
}

export const RadioPlayer: React.FC<RadioPlayerProps> = ({
  streamTitle,
  onStop
}) => {
  return (
    <div className="fixed bottom-16 left-0 right-0 bg-background border-t shadow-lg z-40 animate-slide-up">
      <div className="mx-auto max-w-4xl px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Volume2 className="h-5 w-5 text-primary mr-2 animate-pulse" />
          <div>
            <h3 className="font-medium text-sm">Radio Stream</h3>
            <p className="text-xs text-muted-foreground">{streamTitle}</p>
          </div>
          <Badge variant="outline" className="ml-2 text-xs border-primary/50 text-primary animate-pulse">
            Live
          </Badge>
        </div>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={onStop}
          className="flex items-center gap-1"
        >
          <StopCircle className="h-4 w-4" />
          Stoppen
        </Button>
      </div>
    </div>
  );
}
