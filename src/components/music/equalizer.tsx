
import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface EqualizerProps {
  isActive: boolean;
  className?: string;
  audioRef?: React.RefObject<HTMLAudioElement>;
}

export function Equalizer({ isActive, className, audioRef }: EqualizerProps) {
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const numBars = 12;
  const [isAudioConnected, setIsAudioConnected] = useState(false);

  // Threshold in dB (approximately)
  const DB_THRESHOLD = 5;
  // Convert dB threshold to a value between 0-255 (roughly)
  const AMPLITUDE_THRESHOLD = Math.round((DB_THRESHOLD / 60) * 255);

  // Setup audio analyzer when active and audioRef is provided
  useEffect(() => {
    if (!isActive || !audioRef?.current) {
      // Reset bars when inactive
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }

      barsRef.current.forEach(bar => {
        if (bar) bar.style.height = "15%";
      });
      
      // Clean up audio nodes
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
      }
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        setIsAudioConnected(false);
      }
      
      return;
    }

    // Setup audio context and analyzer on first activation
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 64; // Smaller FFT size for better performance
        analyserRef.current.smoothingTimeConstant = 0.8; // Smooth transitions
      } catch (error) {
        console.error("Error creating AudioContext:", error);
        return;
      }
    }

    // Connect to audio element if not already connected
    if (audioRef.current && !isAudioConnected) {
      try {
        // Disconnect any existing source
        if (sourceNodeRef.current) {
          sourceNodeRef.current.disconnect();
        }
        
        // Create and connect new source
        sourceNodeRef.current = audioContextRef.current!.createMediaElementSource(audioRef.current);
        sourceNodeRef.current.connect(analyserRef.current!);
        analyserRef.current!.connect(audioContextRef.current!.destination);
        setIsAudioConnected(true);
      } catch (error) {
        console.error("Error connecting audio:", error);
        // Fall back to simulated equalizer if we can't connect to the audio
        startSimulatedEqualizer();
        return;
      }
    }

    // Start animation loop
    const animate = () => {
      if (!analyserRef.current || !isAudioConnected) {
        startSimulatedEqualizer();
        return;
      }

      try {
        // Get frequency data
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Map frequency data to bar heights
        const barWidth = Math.floor(bufferLength / numBars);
        
        barsRef.current.forEach((bar, index) => {
          if (!bar) return;

          // Calculate average value for the frequency range this bar represents
          let sum = 0;
          const startFreq = index * barWidth;
          for (let i = 0; i < barWidth; i++) {
            sum += dataArray[startFreq + i];
          }
          
          // Get average and convert to percentage height (15% minimum, 95% maximum)
          const average = sum / barWidth;
          
          // Only show activity if above threshold
          if (average > AMPLITUDE_THRESHOLD) {
            const height = 15 + ((average - AMPLITUDE_THRESHOLD) / (255 - AMPLITUDE_THRESHOLD)) * 80;
            
            // Add different transition speeds for more natural movement
            const duration = 100 + (index % 3) * 50; // 100-200ms transitions
            bar.style.transitionDuration = `${duration}ms`;
            bar.style.height = `${height}%`;
          } else {
            // Stay at baseline if below threshold
            bar.style.height = "15%";
          }
        });

        // Continue animation loop
        animationRef.current = requestAnimationFrame(animate);
      } catch (error) {
        console.error("Error in equalizer animation:", error);
        startSimulatedEqualizer();
      }
    };

    // Start the animation
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isActive, audioRef, isAudioConnected, numBars]);

  // Fallback to simulated equalizer when audio analysis fails
  const startSimulatedEqualizer = () => {
    const generateSmoothHeights = () => {
      // Start with random seed values
      let heights = Array(numBars).fill(0).map(() => Math.random() * 0.5 + 0.15);
      
      // Smooth the values to create a more natural pattern
      for (let i = 0; i < 2; i++) {
        const newHeights = [...heights];
        for (let j = 1; j < heights.length - 1; j++) {
          // Each bar is influenced by its neighbors (smoothing)
          newHeights[j] = (heights[j-1] + heights[j] * 2 + heights[j+1]) / 4;
        }
        heights = newHeights;
      }
      
      // Apply threshold to simulated values too
      heights = heights.map(h => {
        // Scale to 0-255 range first to apply same threshold logic
        const scaledValue = h * 255;
        if (scaledValue > AMPLITUDE_THRESHOLD) {
          return ((scaledValue - AMPLITUDE_THRESHOLD) / (255 - AMPLITUDE_THRESHOLD)) * 0.8 + 0.15;
        } else {
          return 0.15; // 15% minimum height
        }
      });
      
      // Convert to percentage (15% to 95%)
      return heights.map(h => Math.floor(h * 100));
    };

    const animateSimulated = () => {
      const heights = generateSmoothHeights();
      
      barsRef.current.forEach((bar, index) => {
        if (!bar) return;
        
        // Apply the height from our smooth generator
        const height = heights[index];
        
        // Add different transition speeds for more natural movement
        const duration = 300 + (index % 3) * 100; // 300-500ms transitions
        bar.style.transitionDuration = `${duration}ms`;
        bar.style.height = `${height}%`;
      });
      
      // Slower frame rate for more natural movement
      animationRef.current = setTimeout(() => {
        requestAnimationFrame(animateSimulated);
      }, 180) as unknown as number;
    };

    // Start simulated animation
    animateSimulated();
  };

  return (
    <div className={cn("flex items-end justify-center h-16 gap-1 p-2 bg-card/30 rounded-md", className)}>
      {Array.from({ length: numBars }).map((_, index) => (
        <div
          key={index}
          ref={el => (barsRef.current[index] = el)}
          className={cn(
            "w-full rounded-t-sm transition-all ease-in-out",
            isActive 
              ? "bg-gradient-to-t from-blue-700 to-blue-400" 
              : "bg-blue-300/30"
          )}
          style={{ 
            height: "15%",
            transitionDuration: "300ms" 
          }}
        />
      ))}
    </div>
  );
}
