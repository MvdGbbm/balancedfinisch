
import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface AudioVisualizerProps extends React.HTMLAttributes<HTMLDivElement> {
  audioElement: HTMLAudioElement | null;
  variant?: "equalizer" | "waveform" | "peaks" | "bars";
  barCount?: number;
  color?: string;
  height?: number;
}

export function AudioVisualizer({
  audioElement,
  variant = "equalizer",
  barCount = 32,
  color = "hsl(var(--primary))",
  height = 100,
  className,
  ...props
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!audioElement || !canvasRef.current) return;

    // Initialize audio context
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const audioContext = audioContextRef.current;
    
    // Create an analyzer if we don't already have one
    if (!analyzerRef.current) {
      analyzerRef.current = audioContext.createAnalyser();
      
      // Set FFT size based on the visualization type
      if (variant === "equalizer" || variant === "bars") {
        analyzerRef.current.fftSize = 64;
      } else if (variant === "waveform") {
        analyzerRef.current.fftSize = 2048;
      } else if (variant === "peaks") {
        analyzerRef.current.fftSize = 1024;
      }
    }
    
    const analyzer = analyzerRef.current;
    
    // Connect the audio element to the analyzer
    let source: MediaElementAudioSourceNode;
    
    try {
      source = audioContext.createMediaElementSource(audioElement);
      source.connect(analyzer);
      analyzer.connect(audioContext.destination);
    } catch (err) {
      // The source may already be connected
      console.log("Audio source may already be connected", err);
    }
    
    // Create a data array to hold the frequency data
    const bufferLength = analyzer.frequencyBinCount;
    dataArrayRef.current = new Uint8Array(bufferLength);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    
    // Set canvas size
    const resize = () => {
      canvas.width = canvas.clientWidth * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
    };
    
    resize();
    window.addEventListener('resize', resize);
    
    // Animation function based on variant
    const animate = () => {
      if (!canvas || !analyzer || !dataArrayRef.current) return;
      
      animationRef.current = requestAnimationFrame(animate);
      
      if (variant === "equalizer" || variant === "bars") {
        analyzer.getByteFrequencyData(dataArrayRef.current);
        drawEqualizer(ctx, canvas.width, canvas.height, dataArrayRef.current, barCount, color);
      } else if (variant === "waveform") {
        analyzer.getByteTimeDomainData(dataArrayRef.current);
        drawWaveform(ctx, canvas.width, canvas.height, dataArrayRef.current, color);
      } else if (variant === "peaks") {
        analyzer.getByteFrequencyData(dataArrayRef.current);
        drawPeaks(ctx, canvas.width, canvas.height, dataArrayRef.current, color);
      }
    };
    
    // Start the animation
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resize);
    };
  }, [audioElement, variant, barCount, color, height]);
  
  // Drawing functions
  const drawEqualizer = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dataArray: Uint8Array,
    barCount: number,
    color: string
  ) => {
    ctx.clearRect(0, 0, width, height);
    
    const barWidth = width / barCount;
    const dataStep = Math.ceil(dataArray.length / barCount);
    
    ctx.fillStyle = color;
    
    for (let i = 0; i < barCount; i++) {
      const dataIndex = i * dataStep;
      const barHeight = (dataArray[dataIndex] / 255) * height;
      
      // Draw each bar
      ctx.fillRect(
        i * barWidth, 
        height - barHeight, 
        barWidth * 0.8, 
        barHeight
      );
    }
  };
  
  const drawWaveform = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dataArray: Uint8Array,
    color: string
  ) => {
    ctx.clearRect(0, 0, width, height);
    
    const sliceWidth = width / dataArray.length;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    let x = 0;
    for (let i = 0; i < dataArray.length; i++) {
      // Normalize the data to fit the canvas height
      const v = dataArray[i] / 128.0;
      const y = (v * height) / 2;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      
      x += sliceWidth;
    }
    
    ctx.stroke();
  };
  
  const drawPeaks = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dataArray: Uint8Array,
    color: string
  ) => {
    ctx.clearRect(0, 0, width, height);
    
    // We'll draw two peak meters - left and right
    const meterWidth = width / 2 - 10;
    const leftMeterX = 5;
    const rightMeterX = width / 2 + 5;
    
    // Calculate peak values - for a simple demo, we'll use the average of the whole array
    // In a real app, you might want to split for left/right channels
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    
    const average = sum / dataArray.length;
    const peakPercent = average / 255;
    
    // Draw gradient backgrounds for meters
    const gradient = ctx.createLinearGradient(0, height, 0, 0);
    gradient.addColorStop(0, "green");
    gradient.addColorStop(0.7, "yellow");
    gradient.addColorStop(1, "red");
    
    // Left meter background
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(leftMeterX, 0, meterWidth, height);
    
    // Right meter background
    ctx.fillRect(rightMeterX, 0, meterWidth, height);
    
    // Draw active meters
    ctx.fillStyle = gradient;
    
    // Left meter active
    const leftMeterHeight = peakPercent * height;
    ctx.fillRect(leftMeterX, height - leftMeterHeight, meterWidth, leftMeterHeight);
    
    // Right meter active (slightly different to make it more realistic)
    const rightMeterHeight = peakPercent * 0.95 * height;
    ctx.fillRect(rightMeterX, height - rightMeterHeight, meterWidth, rightMeterHeight);
  };
  
  return (
    <div 
      className={cn("w-full overflow-hidden", className)} 
      style={{ height: `${height}px` }}
      {...props}
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
      />
    </div>
  );
}
