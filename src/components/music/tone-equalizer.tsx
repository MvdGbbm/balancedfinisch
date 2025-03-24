import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Waves, Volume2, RefreshCw } from "lucide-react";
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

// Healing frequencies in Hz with Dutch translations
const HEALING_FREQUENCIES = [
  { value: "174", label: "174 Hz - Pijnvermindering" },
  { value: "258", label: "258 Hz - Genezing & Herstel" },
  { value: "396", label: "396 Hz - Bevrijding" },
  { value: "417", label: "417 Hz - Transformatie" },
  { value: "528", label: "528 Hz - Reparatie & DNA" },
  { value: "639", label: "639 Hz - Verbinding" },
  { value: "741", label: "741 Hz - Expressie" },
  { value: "852", label: "852 Hz - Intuïtie" },
  { value: "963", label: "963 Hz - Ontwaking" },
];

export function ToneEqualizer({ isActive, className, audioRef }: ToneEqualizerProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [reverbEnabled, setReverbEnabled] = useState(false);
  const [reverbAmount, setReverbAmount] = useState(0.3);
  const [masterVolume, setMasterVolume] = useState(1);
  const [selectedFrequency, setSelectedFrequency] = useState("528");
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const convolverNodeRef = useRef<ConvolverNode | null>(null);
  const dryGainNodeRef = useRef<GainNode | null>(null);
  const wetGainNodeRef = useRef<GainNode | null>(null);
  
  const [currentBand, setCurrentBand] = useState<FilterBand>({
    frequency: 528,
    gain: 0,
    q: 2.5
  });
  
  useEffect(() => {
    if (!isActive || !audioRef?.current) {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
      }
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        setIsInitialized(false);
      }
      return;
    }

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
        sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
        
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.gain.value = masterVolume;
        
        filterNodeRef.current = audioContextRef.current.createBiquadFilter();
        filterNodeRef.current.type = 'peaking';
        filterNodeRef.current.frequency.value = currentBand.frequency;
        filterNodeRef.current.gain.value = currentBand.gain;
        filterNodeRef.current.Q.value = currentBand.q;
        
        convolverNodeRef.current = audioContextRef.current.createConvolver();
        
        dryGainNodeRef.current = audioContextRef.current.createGain();
        wetGainNodeRef.current = audioContextRef.current.createGain();
        
        updateReverbMix();
        
        await generateImpulseResponse();
        
        sourceNodeRef.current.connect(filterNodeRef.current);
        filterNodeRef.current.connect(dryGainNodeRef.current);
        dryGainNodeRef.current.connect(gainNodeRef.current);
        
        sourceNodeRef.current.connect(convolverNodeRef.current);
        convolverNodeRef.current.connect(wetGainNodeRef.current);
        wetGainNodeRef.current.connect(gainNodeRef.current);
        
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
    };
  }, [isActive, audioRef, isInitialized, currentBand]);
  
  useEffect(() => {
    if (!isInitialized || !filterNodeRef.current) return;
    
    filterNodeRef.current.frequency.value = currentBand.frequency;
    filterNodeRef.current.gain.value = currentBand.gain;
    filterNodeRef.current.Q.value = currentBand.q;
  }, [currentBand, isInitialized]);
  
  useEffect(() => {
    const freqValue = parseInt(selectedFrequency);
    setCurrentBand(prev => ({
      ...prev,
      frequency: freqValue
    }));
  }, [selectedFrequency]);
  
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = masterVolume;
    }
  }, [masterVolume]);
  
  useEffect(() => {
    if (isInitialized) {
      updateReverbMix();
    }
  }, [reverbEnabled, reverbAmount, isInitialized]);
  
  const setupAudioProcessing = async () => {
    if (!audioContextRef.current || !audioRef.current) return;
    
    try {
      sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
      
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.value = masterVolume;
      
      filterNodeRef.current = audioContextRef.current.createBiquadFilter();
      filterNodeRef.current.type = 'peaking';
      filterNodeRef.current.frequency.value = currentBand.frequency;
      filterNodeRef.current.gain.value = currentBand.gain;
      filterNodeRef.current.Q.value = currentBand.q;
      
      convolverNodeRef.current = audioContextRef.current.createConvolver();
      
      dryGainNodeRef.current = audioContextRef.current.createGain();
      wetGainNodeRef.current = audioContextRef.current.createGain();
      
      updateReverbMix();
      
      await generateImpulseResponse();
      
      sourceNodeRef.current.connect(filterNodeRef.current);
      filterNodeRef.current.connect(dryGainNodeRef.current);
      dryGainNodeRef.current.connect(gainNodeRef.current);
      
      sourceNodeRef.current.connect(convolverNodeRef.current);
      convolverNodeRef.current.connect(wetGainNodeRef.current);
      wetGainNodeRef.current.connect(gainNodeRef.current);
      
      gainNodeRef.current.connect(audioContextRef.current.destination);
      
      setIsInitialized(true);
    } catch (error) {
      console.error("Error setting up audio processing:", error);
    }
  };
  
  const generateImpulseResponse = async () => {
    if (!audioContextRef.current || !convolverNodeRef.current) return;
    
    try {
      const sampleRate = audioContextRef.current.sampleRate;
      const length = 2 * sampleRate;
      const impulseResponse = audioContextRef.current.createBuffer(2, length, sampleRate);
      
      for (let channel = 0; channel < 2; channel++) {
        const channelData = impulseResponse.getChannelData(channel);
        
        for (let i = 0; i < length; i++) {
          const decay = Math.exp(-i / (sampleRate * 0.5));
          channelData[i] = (Math.random() * 2 - 1) * decay;
        }
      }
      
      convolverNodeRef.current.buffer = impulseResponse;
    } catch (error) {
      console.error("Error generating impulse response:", error);
    }
  };
  
  const updateReverbMix = () => {
    if (!dryGainNodeRef.current || !wetGainNodeRef.current) return;
    
    if (reverbEnabled) {
      dryGainNodeRef.current.gain.value = 1;
      wetGainNodeRef.current.gain.value = reverbAmount;
    } else {
      dryGainNodeRef.current.gain.value = 1;
      wetGainNodeRef.current.gain.value = 0;
    }
  };
  
  const handleBandChange = (value: number[]) => {
    setCurrentBand(prev => ({
      ...prev,
      gain: value[0]
    }));
  };
  
  const handleReverbAmountChange = (value: number[]) => {
    setReverbAmount(value[0]);
  };
  
  const handleVolumeChange = (value: number[]) => {
    setMasterVolume(value[0]);
  };
  
  const handleReverbToggle = (checked: boolean) => {
    setReverbEnabled(checked);
  };

  const handleReset = () => {
    setCurrentBand(prev => ({
      ...prev,
      gain: 0
    }));
    setReverbAmount(0.3);
    setReverbEnabled(false);
    setMasterVolume(1);
  };
  
  // Calculate the color for the slider thumb based on the gain value
  const getSliderThumbColor = (value: number, max: number) => {
    // Start with blue at 0 and gradually transition to green at max
    const blueComponent = Math.max(0, 255 * (1 - value / max)).toFixed(0);
    const greenComponent = Math.min(255, 100 + (155 * value / max)).toFixed(0);
    return `rgb(0, ${greenComponent}, ${blueComponent})`;
  };

  // Custom slider thumb style with dynamic color
  const sliderThumbStyle = {
    backgroundColor: getSliderThumbColor(currentBand.gain, 10),
    transition: 'background-color 0.3s ease'
  };

  return (
    <div className={cn("p-3 bg-black/90 backdrop-blur-lg rounded-lg shadow-lg", className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Waves className="h-3.5 w-3.5 text-blue-400" />
          <span className="text-xs font-medium text-blue-400">Helende Frequenties</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={handleReset}
            className="p-1 rounded-full hover:bg-blue-900/30 text-blue-300/70"
            title="Reset alle instellingen"
            disabled={!isActive || !isInitialized}
          >
            <RefreshCw className="h-3.5 w-3.5" />
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
            <SelectValue placeholder="Selecteer frequentie" />
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

      <div className="mb-3">
        <div className="flex flex-col">
          <div className="flex justify-between mb-1">
            <span className="text-xs text-blue-200 font-medium">{currentBand.frequency} Hz</span>
            <span className="text-xs text-blue-300/70">
              {Math.round(currentBand.gain * 10) / 10} dB
            </span>
          </div>
          <Slider
            value={[currentBand.gain]}
            min={0}
            max={10}
            step={0.5}
            disabled={!isActive || !isInitialized}
            onValueChange={handleBandChange}
            className="my-2"
            // Custom styles for the interactive thumb
            styles={{
              thumb: {
                backgroundColor: getSliderThumbColor(currentBand.gain, 10),
                transition: 'background-color 0.3s ease'
              }
            }}
          />
          <div className="flex justify-between text-[10px] text-blue-300/60">
            <span>0 dB</span>
            <span>Meest effectief</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between border-t border-blue-900/30 pt-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-blue-100/70">Galm</span>
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
            max={1}
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
