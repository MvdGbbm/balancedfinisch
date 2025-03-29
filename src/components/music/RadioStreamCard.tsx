
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link2, Play, StopCircle, Volume2 } from "lucide-react";
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
          : 'hover:border-primary/50'
      }`}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className={`p-2 rounded-full ${
              isPlaying 
                ? 'bg-primary/20' 
                : 'bg-green-100/10 dark:bg-green-900/20'
            }`}>
              {isPlaying 
                ? <Volume2 className="h-4 w-4 text-primary animate-pulse" />
                : <Link2 className="h-4 w-4 text-green-600 dark:text-green-300" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <h3 className="font-medium text-sm">{stream.title}</h3>
                {isPlaying && (
                  <Badge variant="secondary" className="ml-2 bg-primary/20 text-primary text-xs">
                    Actief
                  </Badge>
                )}
              </div>
              {stream.description && (
                <p className="text-xs text-muted-foreground">{stream.description}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {!isPlaying ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onPlay}
                className="px-3"
              >
                <Play className="h-3.5 w-3.5 mr-1.5" />
                Afspelen
              </Button>
            ) : (
              <Button
                variant="destructive"
                size="sm"
                onClick={onStop}
                className="px-3"
              >
                <StopCircle className="h-3.5 w-3.5 mr-1.5" />
                Stop
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
