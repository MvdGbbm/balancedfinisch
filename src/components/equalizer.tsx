
import React, { useRef, useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { AudioProcessor } from "@/lib/audio-processor";
import { Sliders, WaveSine } from "lucide-react";

interface EqualizerProps {
  audioProcessor: AudioProcessor | null;
  className?: string;
}

export function Equalizer({ audioProcessor, className }: EqualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [eqValues, setEqValues] = useState<number[]>(Array(9).fill(0));
  const [bypass, setBypass] = useState(true);
  const [reverbMix, setReverbMix] = useState(0);
  const animationRef = useRef<number>();
  
  useEffect(() => {
    if (!audioProcessor) return;
    
    const frequencies = audioProcessor.getEqualizerFrequencies();
    const bands = audioProcessor.getEqualizerBands();
    
    // Set initial EQ values from processor
    const initialValues = bands.map(band => band.gain.value);
    setEqValues(initialValues);
    
    // Apply initial bypass state
    setBypass(audioProcessor.getBypassedState());
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioProcessor]);
  
  useEffect(() => {
    if (!audioProcessor || !canvasRef.current) return;
    
    const analyser = audioProcessor.getAnalyserNode();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const width = canvas.width;
    const height = canvas.height;
    
    const renderFrame = () => {
      animationRef.current = requestAnimationFrame(renderFrame);
      
      analyser.getByteFrequencyData(dataArray);
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Dark background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, 0, width, height);
      
      // Draw spectrum
      const barWidth = (width / dataArray.length) * 2.5;
      let x = 0;
      
      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, '#3B82F6');
      gradient.addColorStop(0.5, '#8B5CF6');
      gradient.addColorStop(1, '#EC4899');
      
      for (let i = 0; i < dataArray.length; i++) {
        const barHeight = (dataArray[i] / 255) * height;
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
    };
    
    renderFrame();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioProcessor]);
  
  const handleEqChange = (index: number, value: number[]) => {
    if (!audioProcessor) return;
    
    const newValues = [...eqValues];
    newValues[index] = value[0];
    setEqValues(newValues);
    
    audioProcessor.setEqualizerBand(index, value[0]);
  };
  
  const handleBypassChange = (checked: boolean) => {
    if (!audioProcessor) return;
    
    setBypass(!checked);
    audioProcessor.bypass(!checked);
  };
  
  const handleReverbChange = (value: number[]) => {
    if (!audioProcessor) return;
    
    setReverbMix(value[0]);
    audioProcessor.setReverbMix(value[0]);
  };
  
  const formatFrequency = (freq: number) => {
    return freq >= 1000 ? `${freq / 1000}kHz` : `${freq}Hz`;
  };
  
  return (
    <div className={cn("space-y-2 w-full", className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Sliders className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">Equalizer & Effects</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground">Effect</span>
          <Switch 
            checked={!bypass} 
            onCheckedChange={handleBypassChange}
          />
        </div>
      </div>
      
      <div className="w-full h-20 mb-3 overflow-hidden rounded-md bg-black/20 backdrop-blur-sm">
        <canvas 
          ref={canvasRef} 
          width={300} 
          height={80} 
          className="w-full h-full"
        />
      </div>
      
      <div className="grid grid-cols-9 gap-1 mb-4">
        {audioProcessor?.getEqualizerFrequencies().map((freq, i) => (
          <div key={i} className="flex flex-col items-center">
            <Slider
              orientation="vertical"
              value={[eqValues[i]]}
              min={-12}
              max={12}
              step={0.5}
              disabled={bypass}
              onValueChange={(value) => handleEqChange(i, value)}
              className="h-32"
            />
            <span className="text-[9px] mt-1 text-muted-foreground">
              {formatFrequency(freq)}
            </span>
          </div>
        ))}
      </div>
      
      <div className="space-y-4 pt-1 border-t border-border/30">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <WaveSine className="h-4 w-4 text-primary" />
              <span className="text-sm">Reverb</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {Math.round(reverbMix * 100)}%
            </span>
          </div>
          <Slider
            value={[reverbMix]}
            min={0}
            max={1}
            step={0.01}
            disabled={bypass}
            onValueChange={handleReverbChange}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
