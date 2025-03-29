
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Radio, Play, StopCircle, ExternalLink, Info } from "lucide-react";
import { LoadingState } from "@/components/admin/music/LoadingState";
import { RadioStream } from "@/hooks/use-radio-streams";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StreamingPanelProps {
  radioStreams: RadioStream[];
  isLoadingStreams: boolean;
  isStreamPlaying: boolean;
  streamUrl: string;
  streamTitle: string;
  handleStreamPlay: (stream: RadioStream) => void;
  handleStreamStop: () => void;
}

export const StreamingPanel: React.FC<StreamingPanelProps> = ({
  radioStreams,
  isLoadingStreams,
  isStreamPlaying,
  streamUrl,
  streamTitle,
  handleStreamPlay,
  handleStreamStop
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Radio className="h-6 w-6 text-primary" />
          <span>Streaming Links</span>
        </h2>
        {isStreamPlaying && (
          <div className="flex items-center gap-2 bg-primary/10 text-primary rounded-full py-1 px-3">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
            <span className="text-sm font-medium">Nu spelend: {streamTitle}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 p-0 hover:bg-primary/20"
              onClick={handleStreamStop}
            >
              <StopCircle className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      {isLoadingStreams ? (
        <LoadingState />
      ) : radioStreams.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
          <Radio className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">Geen streaming links</h3>
          <p className="text-muted-foreground text-center mb-4">
            Er zijn nog geen streaming links beschikbaar. Deze kunnen in het admin paneel worden toegevoegd.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {radioStreams.map((stream) => {
            const isActive = isStreamPlaying && streamUrl === stream.url;
            
            return (
              <Card 
                key={stream.id} 
                className={`hover:shadow-md transition-shadow overflow-hidden ${isActive ? 'ring-2 ring-primary' : ''}`}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col h-full">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-medium">{stream.title}</h3>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                            >
                              <Info className="h-4 w-4" />
                              <span className="sr-only">Info</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              {stream.description || "Geen beschrijving beschikbaar"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    
                    {stream.description && (
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {stream.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mt-auto pt-3">
                      <div className="text-xs flex items-center gap-1 text-muted-foreground">
                        <ExternalLink className="h-3 w-3" />
                        <span className="truncate max-w-[140px]">{stream.url}</span>
                      </div>
                      
                      <Button
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        className={isActive ? "gap-1" : ""}
                        onClick={() => isActive ? handleStreamStop() : handleStreamPlay(stream)}
                      >
                        {isActive ? (
                          <>
                            <StopCircle className="h-4 w-4" />
                            <span>Stop</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-1" />
                            <span>Afspelen</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
