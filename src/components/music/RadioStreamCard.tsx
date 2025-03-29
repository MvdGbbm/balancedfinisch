
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Radio, Play, StopCircle } from "lucide-react";
import { RadioStream } from "@/hooks/use-radio-streams";

interface RadioStreamCardProps {
  stream: RadioStream;
  isPlaying: boolean;
  onPlay: () => void;
  onStop: () => void;
}

export const RadioStreamCard: React.FC<RadioStreamCardProps> = ({
  stream,
  isPlaying,
  onPlay,
  onStop
}) => {
  return (
    <Card 
      className={`transition-all ${
        isPlaying 
          ? 'ring-2 ring-primary border-primary bg-primary/5' 
          : 'bg-background/30 backdrop-blur-sm border-muted'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div 
            className={`w-12 h-12 flex items-center justify-center rounded-md border ${
              isPlaying ? 'border-primary bg-primary/20' : 'border-muted bg-muted/50'
            }`}
          >
            <Radio className={`h-6 w-6 ${isPlaying ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          
          <div className="flex-1">
            <h3 className="font-medium">{stream.title}</h3>
            {stream.description && (
              <p className="text-sm text-muted-foreground">{stream.description}</p>
            )}
          </div>
          
          {isPlaying ? (
            <Button 
              variant="destructive"
              size="sm"
              onClick={onStop}
              className="flex items-center gap-1"
            >
              <StopCircle className="h-4 w-4" />
              Stoppen
            </Button>
          ) : (
            <Button 
              variant="outline"
              size="sm"
              onClick={onPlay}
              className="flex items-center gap-1"
            >
              <Play className="h-4 w-4" />
              Afspelen
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
