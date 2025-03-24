
import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Waves, Volume2 } from "lucide-react";

interface ToneEqualizerProps {
  isActive: boolean;
  className?: string;
  audioRef?: React.RefObject<HTMLAudioElement>;
}

type FilterBand = {
  frequency: number;
  gain: number;
  q: number;
};

export function ToneEqualizer({ isActive, className, audioRef }: ToneEqualizerProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [reverbEnabled, setReverbEnabled] = useState(false);
  const [reverbAmount, setReverbAmount] = useState(0.3);
  const [masterVolume, setMasterVolume] = useState(1);
  
  // Audio processing nodes
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const filterNodesRef = useRef<BiquadFilterNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);
  const convolverNodeRef = useRef<ConvolverNode | null>(null);
  const dryGainNodeRef = useRef<GainNode | null>(null);
  const wetGainNodeRef = useRef<GainNode | null>(null);
  
  // Generate 40 bands with logarithmic frequency distribution
  const [bands, setBands] = useState<FilterBand[]>(() => {
    const bandsArray: FilterBand[] = [];
    // Frequency range from 20Hz to 20kHz (logarithmically spaced)
    const minFreq = 20;
    const maxFreq = 20000;
    const bandsCount = 40;
    
    for (let i = 0; i < bandsCount; i++) {
      // Calculate frequency using logarithmic distribution
      const normalized = i / (bandsCount - 1);
      const freq = minFreq * Math.pow(maxFreq / minFreq, normalized);
      bandsArray.push({
        frequency: Math.round(freq), 
        gain: 0, 
        q: 1.41 // Standard Q value for 1-octave bands
      });
    }
    return bandsArray;
  });
  
  // Initialize audio context and nodes when activated
  useEffect(() => {
    if (!isActive || !audioRef?.current) {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
      }
      
      // Reset any processing setup
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        setIsInitialized(false);
      }
      return;
    }

    // Create audio context on first activation
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.error("Error creating AudioContext:", error);
        return;
      }
    }

    const setupAudioProcessing = async () => {
      if (!audioContextRef.current || !audioRef.current) return;
      
      try {
        // Create source node
        sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
        
        // Create master gain node
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.gain.value = masterVolume;
        
        // Create filter nodes for each band
        bands.forEach((band, index) => {
          const filter = audioContextRef.current!.createBiquadFilter();
          filter.type = 'peaking';
          filter.frequency.value = band.frequency;
          filter.gain.value = band.gain;
          filter.Q.value = band.q;
          filterNodesRef.current[index] = filter;
        });
        
        // Create reverb (convolver) node
        convolverNodeRef.current = audioContextRef.current.createConvolver();
        
        // Create dry/wet nodes for reverb mix
        dryGainNodeRef.current = audioContextRef.current.createGain();
        wetGainNodeRef.current = audioContextRef.current.createGain();
        
        // Set initial dry/wet mix
        updateReverbMix();
        
        // Generate impulse response for reverb
        await generateImpulseResponse();
        
        // Connect source to first filter
        sourceNodeRef.current.connect(filterNodesRef.current[0]);
        
        // Connect filters in series
        for (let i = 0; i < filterNodesRef.current.length - 1; i++) {
          filterNodesRef.current[i].connect(filterNodesRef.current[i + 1]);
        }
        
        // Create parallel paths for dry/wet
        const lastFilter = filterNodesRef.current[filterNodesRef.current.length - 1];
        
        // Dry path (direct)
        lastFilter.connect(dryGainNodeRef.current);
        dryGainNodeRef.current.connect(gainNodeRef.current);
        
        // Wet path (with reverb)
        lastFilter.connect(convolverNodeRef.current);
        convolverNodeRef.current.connect(wetGainNodeRef.current);
        wetGainNodeRef.current.connect(gainNodeRef.current);
        
        // Final connection to output
        gainNodeRef.current.connect(audioContextRef.current.destination);
        
        setIsInitialized(true);
      } catch (error) {
        console.error("Error setting up audio processing:", error);
      }
    };
    
    if (!isInitialized) {
      setupAudioProcessing();
    }
    
    return () => {
      // Cleanup will happen when component unmounts
    };
  }, [isActive, audioRef, isInitialized, bands]);
  
  // Update filter settings when bands change
  useEffect(() => {
    if (!isInitialized) return;
    
    filterNodesRef.current.forEach((filter, index) => {
      if (filter) {
        const band = bands[index];
        filter.frequency.value = band.frequency;
        filter.gain.value = band.gain;
        filter.Q.value = band.q;
      }
    });
  }, [bands, isInitialized]);
  
  // Update master volume
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = masterVolume;
    }
  }, [masterVolume]);
  
  // Update reverb mix when enabled/disabled or amount changes
  useEffect(() => {
    if (isInitialized) {
      updateReverbMix();
    }
  }, [reverbEnabled, reverbAmount, isInitialized]);
  
  // Generate impulse response for reverb
  const generateImpulseResponse = async () => {
    if (!audioContextRef.current || !convolverNodeRef.current) return;
    
    try {
      const sampleRate = audioContextRef.current.sampleRate;
      const length = 2 * sampleRate; // 2 seconds
      const impulseResponse = audioContextRef.current.createBuffer(2, length, sampleRate);
      
      // Fill buffer with white noise with exponential decay
      for (let channel = 0; channel < 2; channel++) {
        const channelData = impulseResponse.getChannelData(channel);
        
        for (let i = 0; i < length; i++) {
          // Exponential decay for natural reverb sound
          const decay = Math.exp(-i / (sampleRate * 0.5)); // 0.5 second decay
          
          // Random noise
          channelData[i] = (Math.random() * 2 - 1) * decay;
        }
      }
      
      // Set the impulse response
      convolverNodeRef.current.buffer = impulseResponse;
    } catch (error) {
      console.error("Error generating impulse response:", error);
    }
  };
  
  // Update dry/wet mix for reverb
  const updateReverbMix = () => {
    if (!dryGainNodeRef.current || !wetGainNodeRef.current) return;
    
    if (reverbEnabled) {
      // Crossfade between dry and wet
      dryGainNodeRef.current.gain.value = 1 - reverbAmount;
      wetGainNodeRef.current.gain.value = reverbAmount;
    } else {
      // Bypass reverb completely
      dryGainNodeRef.current.gain.value = 1;
      wetGainNodeRef.current.gain.value = 0;
    }
  };
  
  // Handle band gain change
  const handleBandChange = (index: number, value: number[]) => {
    const newBands = [...bands];
    newBands[index].gain = value[0];
    setBands(newBands);
  };
  
  // Handle reverb amount change
  const handleReverbAmountChange = (value: number[]) => {
    setReverbAmount(value[0]);
  };
  
  // Handle master volume change
  const handleVolumeChange = (value: number[]) => {
    setMasterVolume(value[0]);
  };
  
  // Toggle reverb
  const handleReverbToggle = (checked: boolean) => {
    setReverbEnabled(checked);
  };

  // Helper to format frequency display
  const formatFrequency = (frequency: number): string => {
    if (frequency < 1000) {
      return `${frequency}Hz`;
    } else {
      return `${(frequency / 1000).toFixed(1)}kHz`;
    }
  };

  // Helper function to get only the bands we want to display
  // (showing all 40 would be too crowded, so select representative ones)
  const getDisplayBands = () => {
    // Select bands to display in UI (for space constraints)
    // Using indices to select a representative subset of our 40 bands
    const displayIndices = [0, 3, 7, 11, 15, 19, 23, 27, 31, 35, 39]; 
    return displayIndices.map(index => bands[index]);
  };

  const displayBands = getDisplayBands();

  return (
    <div className={cn("p-3 bg-black/90 backdrop-blur-lg rounded-lg shadow-lg", className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Waves className="h-3.5 w-3.5 text-blue-400" />
          <span className="text-xs font-medium text-blue-400">40-Band EQ</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Volume2 className="h-3 w-3 text-blue-400/70" />
          <Slider
            value={[masterVolume]}
            min={0}
            max={1.5}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-20"
          />
        </div>
      </div>

      {/* Display selected bands in UI */}
      <div className="flex justify-between mb-1 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-blue-900 scrollbar-track-transparent">
        {displayBands.map((band, index) => (
          <div key={index} className="flex flex-col items-center mx-0.5 min-w-[18px]">
            <Slider
              orientation="vertical"
              value={[bands.find(b => b.frequency === band.frequency)?.gain || 0]}
              min={-12}
              max={12}
              step={0.5}
              className="h-14"
              disabled={!isActive || !isInitialized}
              onValueChange={(value) => {
                const originalIndex = bands.findIndex(b => b.frequency === band.frequency);
                if (originalIndex !== -1) {
                  handleBandChange(originalIndex, value);
                }
              }}
            />
            <div className="text-[7px] text-center text-blue-200/70 mt-0.5 -rotate-45 origin-top-left translate-x-2">
              {formatFrequency(band.frequency)}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-between border-t border-blue-900/30 pt-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-blue-100/70">Reverb</span>
          <Switch 
            checked={reverbEnabled} 
            onCheckedChange={handleReverbToggle} 
            disabled={!isActive || !isInitialized}
            className="h-4 w-7 data-[state=checked]:bg-blue-500"
          />
        </div>
        <div className="flex items-center gap-1">
          <Slider
            value={[reverbAmount]}
            min={0}
            max={0.8}
            step={0.01}
            disabled={!isActive || !isInitialized || !reverbEnabled}
            onValueChange={handleReverbAmountChange}
            className="w-20"
          />
          <span className="text-[10px] text-blue-100/70 w-6 text-right">{Math.round(reverbAmount * 100)}%</span>
        </div>
      </div>
    </div>
  );
}
