
import React from "react";
import { RadioStreamCard } from "./RadioStreamCard";
import { RadioStream } from "@/hooks/use-radio-streams";

interface RadioTabContentProps {
  streams: RadioStream[];
  isStreamPlaying: boolean;
  onStreamPlay: (stream: RadioStream) => void;
  onStreamStop: () => void;
}

export const RadioTabContent: React.FC<RadioTabContentProps> = ({
  streams,
  isStreamPlaying,
  onStreamPlay,
  onStreamStop
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Radio Streams</h2>
      
      {streams.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Geen radio streams beschikbaar.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {streams.map((stream) => (
            <RadioStreamCard
              key={stream.id}
              stream={stream}
              isPlaying={isStreamPlaying}
              onPlay={() => onStreamPlay(stream)}
              onStop={onStreamStop}
            />
          ))}
        </div>
      )}
    </div>
  );
};
