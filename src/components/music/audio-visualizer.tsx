
import React, { useRef, useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface AudioVisualizerProps {
  audioElement: HTMLAudioElement | null;
  className?: string;
}

export function AudioVisualizer({ audioElement, className }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [source, setSource] = useState<MediaElementAudioSourceNode | null>(null);
  const [reverbAmount, setReverbAmount] = useState(0);
  const [equalizerValues, setEqualizerValues] = useState<number[]>([
    0, 0, 0, 0, 0, 0, 0, 0
  ]);
  
  const frequencyBands = [
    { freq: 60, label: "60Hz" },
    { freq: 170, label: "170Hz" },
    { freq: 310, label: "310Hz" },
    { freq: 600, label: "600Hz" },
    { freq: 1000, label: "1kHz" },
    { freq: 3000, label: "3kHz" },
    { freq: 6000, label: "6kHz" },
    { freq: 12000, label: "12kHz" },
  ];
  
  const [equalizerNodes, setEqualizerNodes] = useState<BiquadFilterNode[]>([]);
  const [reverbNode, setReverbNode] = useState<ConvolverNode | null>(null);
  const [reverbGainNode, setReverbGainNode] = useState<GainNode | null>(null);
  
  // Initialize audio context and analyzer
  useEffect(() => {
    if (!audioElement) return;
    
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioAnalyser = ctx.createAnalyser();
    audioAnalyser.fftSize = 1024;
    
    const audioSource = ctx.createMediaElementSource(audioElement);
    
    // Create equalizer filter nodes
    const filters = frequencyBands.map((band) => {
      const filter = ctx.createBiquadFilter();
      filter.type = "peaking";
      filter.frequency.value = band.freq;
      filter.Q.value = 1;
      filter.gain.value = 0;
      return filter;
    });
    
    // Create reverb (convolver) node
    const convolver = ctx.createConvolver();
    const reverbGain = ctx.createGain();
    reverbGain.gain.value = 0; // Initial reverb amount
    
    // Generate impulse response for reverb
    const impulseResponse = createImpulseResponse(ctx);
    convolver.buffer = impulseResponse;
    
    // Connect the audio processing chain
    audioSource.connect(filters[0]);
    for (let i = 0; i < filters.length - 1; i++) {
      filters[i].connect(filters[i + 1]);
    }
    
    // Split the signal for reverb processing
    const lastFilter = filters[filters.length - 1];
    lastFilter.connect(audioAnalyser);
    lastFilter.connect(convolver);
    convolver.connect(reverbGain);
    reverbGain.connect(audioAnalyser);
    
    audioAnalyser.connect(ctx.destination);
    
    setAudioContext(ctx);
    setAnalyser(audioAnalyser);
    setSource(audioSource);
    setEqualizerNodes(filters);
    setReverbNode(convolver);
    setReverbGainNode(reverbGain);
    
    return () => {
      if (ctx.state !== 'closed') {
        audioSource.disconnect();
        audioAnalyser.disconnect();
        filters.forEach(filter => filter.disconnect());
        convolver.disconnect();
        reverbGain.disconnect();
        ctx.close();
      }
    };
  }, [audioElement]);
  
  // Function to create impulse response for reverb
  const createImpulseResponse = (ctx: AudioContext): AudioBuffer => {
    const sampleRate = ctx.sampleRate;
    const length = 2 * sampleRate; // 2 seconds
    const impulse = ctx.createBuffer(2, length, sampleRate);
    const leftChannel = impulse.getChannelData(0);
    const rightChannel = impulse.getChannelData(1);
    
    // Simple exponential decay
    for (let i = 0; i < length; i++) {
      const decay = Math.exp(-i / (sampleRate * 0.5)); // 0.5 second decay
      const randomValue = (Math.random() * 2 - 1) * decay;
      leftChannel[i] = randomValue;
      rightChannel[i] = randomValue * 0.9; // Slight stereo difference
    }
    
    return impulse;
  };
  
  // Handle equalizer band changes
  const handleEqualizerChange = (index: number, value: number[]) => {
    if (!equalizerNodes[index]) return;
    
    const newValue = value[0];
    equalizerNodes[index].gain.value = newValue * 2; // Scale to -20 to +20 dB
    
    const newValues = [...equalizerValues];
    newValues[index] = newValue;
    setEqualizerValues(newValues);
  };
  
  // Handle reverb amount change
  const handleReverbChange = (value: number[]) => {
    if (!reverbGainNode) return;
    const newValue = value[0];
    reverbGainNode.gain.value = newValue / 10;
    setReverbAmount(newValue);
  };
  
  // Draw visualization
  useEffect(() => {
    if (!analyser || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const width = canvas.width;
    const height = canvas.height;
    
    const draw = () => {
      requestAnimationFrame(draw);
      
      analyser.getByteFrequencyData(dataArray);
      
      ctx.clearRect(0, 0, width, height);
      
      // Background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, width, height);
      
      // Calculate bar width
      const barCount = 40; // 40 frequency divisions as requested
      const barWidth = width / barCount;
      const binPerBar = Math.floor(bufferLength / barCount);
      
      // Draw frequency bars
      for (let i = 0; i < barCount; i++) {
        let sum = 0;
        
        // Average the values in each frequency band
        for (let j = 0; j < binPerBar; j++) {
          sum += dataArray[i * binPerBar + j];
        }
        
        const average = sum / binPerBar;
        const barHeight = (average / 255) * height;
        
        // Calculate hue based on frequency (blue for low, red for high)
        const hue = (i / barCount) * 220;
        
        // Draw bar with gradient
        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, `hsla(${hue}, 100%, 50%, 0.8)`);
        gradient.addColorStop(1, `hsla(${hue}, 100%, 70%, 0.8)`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight);
        
        // Draw frequency label every 5 bars
        if (i % 5 === 0) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.font = '8px sans-serif';
          ctx.fillText(`${Math.round((i / barCount) * 20)}kHz`, i * barWidth, height - 5);
        }
      }
      
      // Draw peak lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      
      for (let i = 0; i < barCount; i++) {
        let peakValue = 0;
        
        for (let j = 0; j < binPerBar; j++) {
          peakValue = Math.max(peakValue, dataArray[i * binPerBar + j]);
        }
        
        const peakHeight = (peakValue / 255) * height;
        const x = i * barWidth + barWidth / 2;
        
        if (i === 0) {
          ctx.moveTo(x, height - peakHeight);
        } else {
          ctx.lineTo(x, height - peakHeight);
        }
      }
      
      ctx.stroke();
    };
    
    draw();
  }, [analyser]);
  
  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative h-40 w-full overflow-hidden rounded-md bg-black/10 dark:bg-white/5">
        <canvas 
          ref={canvasRef} 
          className="w-full h-full" 
          width={800} 
          height={200}
        />
        <div className="absolute bottom-2 left-0 right-0 text-center text-xs text-muted-foreground">
          Frequency Spectrum Analyzer
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <Label>Reverb</Label>
            <span className="text-xs text-muted-foreground">{reverbAmount}%</span>
          </div>
          <Slider
            value={[reverbAmount]}
            min={0}
            max={100}
            step={1}
            onValueChange={handleReverbChange}
          />
        </div>
        
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {frequencyBands.map((band, index) => (
            <div key={band.freq} className="space-y-1">
              <div className="text-center">
                <span className="text-xs font-medium">{band.label}</span>
              </div>
              <Slider
                orientation="vertical"
                value={[equalizerValues[index]]}
                min={-10}
                max={10}
                step={0.1}
                className="h-32"
                onValueChange={(value) => handleEqualizerChange(index, value)}
              />
              <div className="text-center">
                <span className="text-xs text-muted-foreground">
                  {equalizerValues[index] > 0 ? "+" : ""}{equalizerValues[index] * 2}dB
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
