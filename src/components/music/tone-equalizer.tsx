
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
  name: string;
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
  
  // Default EQ bands
  const [bands, setBands] = useState<FilterBand[]>([
    { name: "Bass", frequency: 100, gain: 0, q: 1 },
    { name: "Mid", frequency: 1000, gain: 0, q: 1 },
    { name: "Treble", frequency: 8000, gain: 0, q: 1 }
  ]);
  
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
        
        // Connect nodes:
        // source -> filter1 -> filter2 -> filter3 -> masterGain
        
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

  return (
    <div className={cn("p-3 bg-black/90 backdrop-blur-lg rounded-lg shadow-lg", className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Waves className="h-3.5 w-3.5 text-blue-400" />
          <span className="text-xs font-medium text-blue-400">Tone EQ</span>
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
      
      <div className="grid grid-cols-3 gap-3 mb-2">
        {bands.map((band, index) => (
          <div key={index} className="space-y-0.5">
            <div className="text-[10px] text-center text-blue-100/70 mb-1">
              {band.name} ({band.frequency}Hz)
            </div>
            <Slider
              orientation="vertical"
              value={[band.gain]}
              min={-12}
              max={12}
              step={0.5}
              className="h-16"
              disabled={!isActive || !isInitialized}
              onValueChange={(value) => handleBandChange(index, value)}
            />
            <div className="text-[9px] text-center text-blue-200">
              {band.gain > 0 ? "+" : ""}{band.gain}dB
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
