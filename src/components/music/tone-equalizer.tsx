
import React, { useState, useEffect, useRef } from 'react';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { cn } from '@/lib/utils';

interface ToneEqualizerProps {
  isActive: boolean;
  className?: string;
  audioRef: React.RefObject<HTMLAudioElement>;
}

export const ToneEqualizer: React.FC<ToneEqualizerProps> = ({
  isActive,
  className,
  audioRef
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [bassGain, setBassGain] = useState(0);
  const [midGain, setMidGain] = useState(0);
  const [trebleGain, setTrebleGain] = useState(0);
  
  // Audio context and nodes
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const bassFilterRef = useRef<BiquadFilterNode | null>(null);
  const midFilterRef = useRef<BiquadFilterNode | null>(null);
  const trebleFilterRef = useRef<BiquadFilterNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const isProcessingSetupRef = useRef(false);

  // Reset all filters to default
  const handleReset = () => {
    setBassGain(0);
    setMidGain(0);
    setTrebleGain(0);
    
    if (bassFilterRef.current) bassFilterRef.current.gain.value = 0;
    if (midFilterRef.current) midFilterRef.current.gain.value = 0;
    if (trebleFilterRef.current) trebleFilterRef.current.gain.value = 0;
  };

  // Set up audio processing when active
  useEffect(() => {
    if (!isActive || !audioRef.current || isProcessingSetupRef.current) return;
    
    const setupAudioProcessing = () => {
      try {
        // Clean up any existing audio context and nodes
        if (audioContextRef.current) {
          if (sourceNodeRef.current) {
            sourceNodeRef.current.disconnect();
          }
          audioContextRef.current.close();
        }
        
        // Create new audio context
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        
        if (!audioRef.current) return;
        
        // Create source node from audio element
        const sourceNode = audioContext.createMediaElementSource(audioRef.current);
        sourceNodeRef.current = sourceNode;
        
        // Create filter nodes
        const bassFilter = audioContext.createBiquadFilter();
        bassFilter.type = 'lowshelf';
        bassFilter.frequency.value = 200;
        bassFilter.gain.value = bassGain;
        bassFilterRef.current = bassFilter;
        
        const midFilter = audioContext.createBiquadFilter();
        midFilter.type = 'peaking';
        midFilter.frequency.value = 1000;
        midFilter.Q.value = 1;
        midFilter.gain.value = midGain;
        midFilterRef.current = midFilter;
        
        const trebleFilter = audioContext.createBiquadFilter();
        trebleFilter.type = 'highshelf';
        trebleFilter.frequency.value = 3000;
        trebleFilter.gain.value = trebleGain;
        trebleFilterRef.current = trebleFilter;
        
        // Create main gain node
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 1.0;
        gainNodeRef.current = gainNode;
        
        // Connect the nodes:
        // source -> bass -> mid -> treble -> gain -> destination
        sourceNode.connect(bassFilter);
        bassFilter.connect(midFilter);
        midFilter.connect(trebleFilter);
        trebleFilter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        isProcessingSetupRef.current = true;
        console.log('Audio processing setup completed successfully');
      } catch (err) {
        console.error('Error in setup:', err);
        // If we get an error, we'll just pass the audio through without processing
        if (audioRef.current && audioContextRef.current) {
          try {
            // Try to disconnect and reconnect without filters
            if (sourceNodeRef.current) {
              sourceNodeRef.current.disconnect();
            }
          } catch (e) {
            console.error('Error cleaning up after failure:', e);
          }
        }
      }
    };
    
    // Only set up audio processing if we have an active audio element
    if (audioRef.current && isActive && !audioRef.current.paused) {
      setupAudioProcessing();
    } else {
      // Add a listener for when playback starts
      const handlePlay = () => {
        if (!isProcessingSetupRef.current) {
          setupAudioProcessing();
        }
      };
      
      if (audioRef.current) {
        audioRef.current.addEventListener('play', handlePlay);
        return () => {
          if (audioRef.current) {
            audioRef.current.removeEventListener('play', handlePlay);
          }
        };
      }
    }
    
    // Cleanup when component unmounts
    return () => {
      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.disconnect();
        } catch (e) {
          // Already disconnected
        }
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
      }
      
      isProcessingSetupRef.current = false;
    };
  }, [isActive, audioRef]);

  // Update filter values when sliders change
  useEffect(() => {
    if (bassFilterRef.current) {
      bassFilterRef.current.gain.value = bassGain;
    }
    
    if (midFilterRef.current) {
      midFilterRef.current.gain.value = midGain;
    }
    
    if (trebleFilterRef.current) {
      trebleFilterRef.current.gain.value = trebleGain;
    }
  }, [bassGain, midGain, trebleGain]);

  if (!isActive) return null;

  return isOpen ? (
    <div className={cn("p-2 bg-muted/30 backdrop-blur-sm rounded-md", className)}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium">Bass</span>
        <span className="text-xs">{bassGain}dB</span>
      </div>
      <Slider 
        value={[bassGain]} 
        min={-12} 
        max={12} 
        step={1} 
        onValueChange={(value) => setBassGain(value[0])} 
        className="mb-3"
      />
      
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium">Mid</span>
        <span className="text-xs">{midGain}dB</span>
      </div>
      <Slider 
        value={[midGain]} 
        min={-12} 
        max={12} 
        step={1} 
        onValueChange={(value) => setMidGain(value[0])} 
        className="mb-3"
      />
      
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium">Treble</span>
        <span className="text-xs">{trebleGain}dB</span>
      </div>
      <Slider 
        value={[trebleGain]} 
        min={-12} 
        max={12} 
        step={1} 
        onValueChange={(value) => setTrebleGain(value[0])} 
        className="mb-2"
      />
      
      <div className="flex justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleReset} 
          className="text-xs h-7 px-2"
        >
          <RefreshCcw className="h-3 w-3 mr-1" />
          Reset
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsOpen(false)} 
          className="text-xs h-7 px-3"
        >
          Sluiten
        </Button>
      </div>
    </div>
  ) : (
    <div className={cn("flex space-x-1 animate-pulse", className)}>
      <div className="w-1 h-3 bg-primary rounded-full" style={{ animation: 'equalizer 0.8s ease-in-out infinite' }} />
      <div className="w-1 h-5 bg-primary rounded-full" style={{ animation: 'equalizer 1.2s ease-in-out infinite' }} />
      <div className="w-1 h-2 bg-primary rounded-full" style={{ animation: 'equalizer 0.6s ease-in-out infinite' }} />
      <div className="w-1 h-4 bg-primary rounded-full" style={{ animation: 'equalizer 1s ease-in-out infinite' }} />
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setIsOpen(true)} 
        className="text-xs ml-1 h-5 px-2"
      >
        EQ
      </Button>
    </div>
  );
};
