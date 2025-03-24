
import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Waves, Volume2, Reset } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

// Healing frequencies in Hz
const HEALING_FREQUENCIES = [
  { value: "174", label: "174 Hz - Pain Reduction" },
  { value: "258", label: "258 Hz - Healing & Recovery" },
  { value: "396", label: "396 Hz - Liberation" },
  { value: "417", label: "417 Hz - Transformation" },
  { value: "528", label: "528 Hz - Repair & DNA" },
  { value: "639", label: "639 Hz - Connection" },
  { value: "741", label: "741 Hz - Expression" },
  { value: "852", label: "852 Hz - Intuition" },
  { value: "963", label: "963 Hz - Awakening" },
];

export function ToneEqualizer({ isActive, className, audioRef }: ToneEqualizerProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [reverbEnabled, setReverbEnabled] = useState(false);
  const [reverbAmount, setReverbAmount] = useState(0.3);
  const [masterVolume, setMasterVolume] = useState(1);
  const [selectedFrequency, setSelectedFrequency] = useState("528");
  
  // Audio processing nodes
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const convolverNodeRef = useRef<ConvolverNode | null>(null);
  const dryGainNodeRef = useRef<GainNode | null>(null);
  const wetGainNodeRef = useRef<GainNode | null>(null);
  
  // Selected band state
  const [currentBand, setCurrentBand] = useState<FilterBand>({
    frequency: 528,
    gain: 0,
    q: 2.5 // Sharper Q for more focused frequency enhancement
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
        
        // Create single filter node for the selected frequency
        filterNodeRef.current = audioContextRef.current.createBiquadFilter();
        filterNodeRef.current.type = 'peaking';
        filterNodeRef.current.frequency.value = currentBand.frequency;
        filterNodeRef.current.gain.value = currentBand.gain;
        filterNodeRef.current.Q.value = currentBand.q;
        
        // Create reverb (convolver) node
        convolverNodeRef.current = audioContextRef.current.createConvolver();
        
        // Create dry/wet nodes for reverb mix
        dryGainNodeRef.current = audioContextRef.current.createGain();
        wetGainNodeRef.current = audioContextRef.current.createGain();
        
        // Set initial dry/wet mix
        updateReverbMix();
        
        // Generate impulse response for reverb
        await generateImpulseResponse();
        
        // Connect nodes - main path through filter
        sourceNodeRef.current.connect(filterNodeRef.current);
        filterNodeRef.current.connect(dryGainNodeRef.current);
        dryGainNodeRef.current.connect(gainNodeRef.current);
        
        // Wet/reverb path 
        sourceNodeRef.current.connect(convolverNodeRef.current);
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
  }, [isActive, audioRef, isInitialized, currentBand]);
  
  // Update filter settings when band changes
  useEffect(() => {
    if (!isInitialized || !filterNodeRef.current) return;
    
    filterNodeRef.current.frequency.value = currentBand.frequency;
    filterNodeRef.current.gain.value = currentBand.gain;
    filterNodeRef.current.Q.value = currentBand.q;
  }, [currentBand, isInitialized]);
  
  // Update selected frequency when dropdown changes
  useEffect(() => {
    const freqValue = parseInt(selectedFrequency);
    setCurrentBand(prev => ({
      ...prev,
      frequency: freqValue
    }));
  }, [selectedFrequency]);
  
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
      dryGainNodeRef.current.gain.value = 1; // Keep dry signal at full volume
      wetGainNodeRef.current.gain.value = reverbAmount; // Add reverb as an additional layer
    } else {
      // Bypass reverb completely
      dryGainNodeRef.current.gain.value = 1;
      wetGainNodeRef.current.gain.value = 0;
    }
  };
  
  // Handle band gain change
  const handleBandChange = (value: number[]) => {
    setCurrentBand(prev => ({
      ...prev,
      gain: value[0]
    }));
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

  // Reset all controls to default
  const handleReset = () => {
    setCurrentBand(prev => ({
      ...prev,
      gain: 0
    }));
    setReverbAmount(0.3);
    setReverbEnabled(false);
    setMasterVolume(1);
  };

  return (
    <div className={cn("p-3 bg-black/90 backdrop-blur-lg rounded-lg shadow-lg", className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Waves className="h-3.5 w-3.5 text-blue-400" />
          <span className="text-xs font-medium text-blue-400">Healing Frequencies</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={handleReset}
            className="p-1 rounded-full hover:bg-blue-900/30 text-blue-300/70"
            title="Reset all settings"
            disabled={!isActive || !isInitialized}
          >
            <Reset className="h-3.5 w-3.5" />
          </button>
          <Volume2 className="h-3 w-3 text-blue-400/70 ml-1" />
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

      <div className="mb-3">
        <Select
          value={selectedFrequency}
          onValueChange={setSelectedFrequency}
          disabled={!isActive || !isInitialized}
        >
          <SelectTrigger className="w-full h-8 text-xs bg-blue-950/50 border-blue-800/50 focus:ring-blue-700/50">
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent className="bg-blue-950 border-blue-800 text-blue-100">
            {HEALING_FREQUENCIES.map((freq) => (
              <SelectItem key={freq.value} value={freq.value} className="text-xs">
                {freq.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Single band EQ display */}
      <div className="flex justify-center items-end mb-3">
        <div className="flex flex-col items-center w-full">
          <Slider
            orientation="vertical"
            value={[currentBand.gain]}
            min={-12}
            max={12}
            step={0.5}
            className="h-24"
            disabled={!isActive || !isInitialized}
            onValueChange={handleBandChange}
          />
          <div className="text-xs text-center text-blue-200 mt-1.5 font-medium">
            {currentBand.frequency} Hz
          </div>
          <div className="text-[10px] text-center text-blue-300/70">
            {currentBand.gain > 0 ? "+" : ""}{Math.round(currentBand.gain * 10) / 10} dB
          </div>
        </div>
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
