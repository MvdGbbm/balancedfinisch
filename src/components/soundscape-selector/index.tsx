
import React from 'react';
import { Soundscape } from '@/lib/types';

interface SoundscapeSelectorProps {
  soundscapes: Soundscape[];
  selectedSoundscape: Soundscape | null;
  onSelectSoundscape: (soundscape: Soundscape) => void;
}

export const SoundscapeSelector: React.FC<SoundscapeSelectorProps> = ({ 
  soundscapes, 
  selectedSoundscape, 
  onSelectSoundscape 
}) => {
  if (!soundscapes || soundscapes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Soundscapes</h3>
      <div className="grid grid-cols-2 gap-2">
        {soundscapes.map((soundscape) => (
          <button
            key={soundscape.id}
            className={`p-2 text-sm rounded-md transition-colors ${
              selectedSoundscape?.id === soundscape.id 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary hover:bg-secondary/80'
            }`}
            onClick={() => onSelectSoundscape(soundscape)}
          >
            {soundscape.title}
          </button>
        ))}
      </div>
    </div>
  );
};
