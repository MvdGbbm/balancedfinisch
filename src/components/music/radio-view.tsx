
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link2, Play, StopCircle } from "lucide-react";

interface RadioStream {
  id: string;
  title: string;
  url: string;
  description: string | null;
  is_active: boolean;
  position: number | null;
}

interface RadioViewProps {
  radioStreams: RadioStream[];
  isLoadingStreams: boolean;
  hiddenIframeUrl: string | null;
  onStreamPlay: (stream: RadioStream) => void;
  onStreamStop: () => void;
}

export const RadioView: React.FC<RadioViewProps> = ({
  radioStreams,
  isLoadingStreams,
  hiddenIframeUrl,
  onStreamPlay,
  onStreamStop
}) => {
  return (
    <div className="space-y-4">
      {isLoadingStreams ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : radioStreams.length > 0 ? (
        <div className="grid grid-cols-1 gap-2">
          {radioStreams.map((stream) => (
            <Card key={stream.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 rounded-full bg-green-100/10 dark:bg-green-900/20 text-green-600 dark:text-green-300">
                      <Link2 className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm">{stream.title}</h3>
                      {stream.description && (
                        <p className="text-xs text-muted-foreground">{stream.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onStreamPlay(stream)}
                      className="px-3"
                    >
                      <Play className="h-3.5 w-3.5 mr-1.5" />
                      Afspelen
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={onStreamStop}
                      className="px-3"
                      disabled={!hiddenIframeUrl}
                    >
                      <StopCircle className="h-3.5 w-3.5 mr-1.5" />
                      Stop
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Geen radiolinks gevonden</p>
        </div>
      )}
    </div>
  );
};
