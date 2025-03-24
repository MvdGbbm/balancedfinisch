
import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { AudioWaveform } from "lucide-react";

interface EqualizerProps {
  isActive: boolean;
  className?: string;
  audioElement?: HTMLAudioElement | null; // Optional audio element to analyze
}

export function Equalizer({ isActive, className, audioElement }: EqualizerProps) {
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const animationRef = useRef<number | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const [audioElementId, setAudioElementId] = useState<string | null>(null);
  const numBars = 38; // 38 bars for the equalizer
  
  // New: Store previous values for smoother transitions
  const previousValuesRef = useRef<number[]>(Array(numBars).fill(15));

  useEffect(() => {
    if (!audioElement) return;
    
    const currentAudioId = audioElement.dataset.equalizerId || audioElement.src;
    const isNewAudioElement = currentAudioId !== audioElementId;
    
    if (sourceRef.current && (isNewAudioElement || !isActive)) {
      try {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      } catch (err) {
        console.log("Error disconnecting previous source:", err);
      }
    }
    
    if (!isActive || isNewAudioElement) {
      if (analyzerRef.current) {
        try {
          analyzerRef.current.disconnect();
        } catch (err) {
          console.log("Error disconnecting analyzer:", err);
        }
      }
      
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        try {
          audioContextRef.current.close();
          audioContextRef.current = null;
        } catch (err) {
          console.log("Error closing audio context:", err);
        }
      }
    }
    
    if (!isActive) return;
    
    if (!audioElement.dataset.equalizerId) {
      audioElement.dataset.equalizerId = `eq-${Date.now()}`;
    }
    setAudioElementId(audioElement.dataset.equalizerId || audioElement.src);
    
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyzerRef.current = audioContextRef.current.createAnalyser();
        analyzerRef.current.fftSize = 1024;
        analyzerRef.current.smoothingTimeConstant = 0.65;
        
        const bufferLength = analyzerRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);
        
        console.log("Created new AudioContext for equalizer");
      } catch (err) {
        console.error("Failed to create audio context:", err);
        return;
      }
    }
    
    if (audioElement && audioContextRef.current && !sourceRef.current) {
      try {
        if (!audioElement.dataset.connected) {
          sourceRef.current = audioContextRef.current.createMediaElementSource(audioElement);
          sourceRef.current.connect(analyzerRef.current);
          analyzerRef.current.connect(audioContextRef.current.destination);
          
          audioElement.dataset.connected = "true";
          console.log("Connected audio element to analyzer");
        } else {
          console.log("Audio element already connected to a source node, using simulation mode");
        }
      } catch (err) {
        console.error("Error connecting audio element:", err);
        audioElement.dataset.connected = "failed";
      }
    }
    
    return () => {};
  }, [audioElement, isActive, audioElementId]);

  useEffect(() => {
    if (!isActive) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      barsRef.current.forEach(bar => {
        if (bar) bar.style.height = "15%";
      });
      
      return;
    }

    const generateHeights = () => {
      if (analyzerRef.current && dataArrayRef.current && audioElement && audioElement.dataset.connected === "true") {
        // Reduce sensitivity by adjusting the smoothingTimeConstant (if not already set)
        if (analyzerRef.current.smoothingTimeConstant < 0.8) {
          analyzerRef.current.smoothingTimeConstant = 0.8; // Increased from 0.65 for smoother transitions
        }
        
        analyzerRef.current.getByteFrequencyData(dataArrayRef.current);
        
        const frequencyData = dataArrayRef.current;
        const frequencyBands = [];
        
        // Improved frequency mapping with reduced sensitivity
        for (let i = 0; i < numBars; i++) {
          // More balanced logarithmic scale
          const scale = Math.pow(frequencyData.length, (i / numBars) * 0.7) / 10;
          const index = Math.min(Math.floor(scale), frequencyData.length - 1);
          
          let sum = 0;
          let count = 0;
          // Wider range for smoother averaging
          const range = i < numBars / 3 ? 6 : 4;
          
          for (let j = Math.max(0, index - range); j <= Math.min(frequencyData.length - 1, index + range); j++) {
            const weight = 1.0 - Math.abs(j - index) / (range + 1);
            // Reduce power factor for less dramatic peaks
            sum += Math.pow(frequencyData[j] / 255, 1.1) * 255 * weight;
            count += weight;
          }
          
          const value = count > 0 ? sum / count : 0;
          
          // More balanced boost factors
          let boost = 1.0;
          if (i < numBars / 6) {
            boost = 1.7; // Reduced from 2.2 for less extreme bass
          } else if (i < numBars / 3) {
            boost = 1.4; // Reduced from 1.8
          } else if (i < numBars / 2) {
            boost = 1.1; // Reduced from 1.2
          } else if (i > (numBars * 3) / 4) {
            boost = 1.1; // Slightly reduced
          }
          
          const boostedValue = value * boost;
          
          // Apply damping factor to avoid too dramatic changes
          const dampingFactor = 0.7; // Lower = more damping
          const minHeight = 10; // Slightly higher minimum for better visual
          const rawHeight = Math.max(minHeight, Math.min(95, (boostedValue / 255) * 100));
          
          // Apply smoothing with previous values
          const smoothedHeight = (rawHeight * dampingFactor) + 
                               (previousValuesRef.current[i] * (1 - dampingFactor));
          
          previousValuesRef.current[i] = smoothedHeight;
          frequencyBands.push(smoothedHeight);
        }
        
        return frequencyBands;
      } else {
        // Improved simulation mode with less dramatic movements
        let heights = Array(numBars).fill(0).map((_, i) => {
          // Generate smoother patterns
          if (i < numBars / 6) {
            return Math.random() * 0.6 + 0.2; // Less variation
          } else if (i < numBars / 3) {
            return Math.random() * 0.5 + 0.2;
          } else {
            return Math.random() * 0.4 + 0.1;
          }
        });
        
        // More moderate boost for simulation
        for (let i = 0; i < numBars; i++) {
          if (i < numBars / 6) {
            heights[i] *= 1.5; // Reduced from 1.8
          } else if (i < numBars / 3) {
            heights[i] *= 1.2; // Reduced from 1.4
          } else if (i < numBars / 2) {
            heights[i] *= 0.8; // Slightly reduced
          } else if (i > (numBars * 3) / 4) {
            heights[i] *= 1.1; // Reduced from 1.3
          }
        }
        
        // Apply more smoothing passes for a more natural look
        for (let i = 0; i < 4; i++) {
          const newHeights = [...heights];
          for (let j = 1; j < heights.length - 1; j++) {
            newHeights[j] = (heights[j-1] + heights[j] * 2 + heights[j+1]) / 4;
          }
          heights = newHeights;
        }
        
        // Apply smoothing with previous values for simulation too
        for (let i = 0; i < numBars; i++) {
          const rawHeight = Math.floor(heights[i] * 80) + 10;
          const dampingFactor = 0.6; // Higher damping for simulation
          heights[i] = (rawHeight * dampingFactor) + 
                      (previousValuesRef.current[i] * (1 - dampingFactor));
          previousValuesRef.current[i] = heights[i];
        }
        
        return heights;
      }
    };

    const animate = () => {
      const heights = generateHeights();
      
      barsRef.current.forEach((bar, index) => {
        if (!bar) return;
        
        const height = heights[index];
        
        // Slower transitions for all frequencies for more stability
        const baseDuration = 150; // Increased from 100
        const duration = index < numBars / 4 
          ? baseDuration + 80 // Even slower for deep bass (up from 50)
          : index < numBars / 2 
            ? baseDuration + 40 // Increased from 20
            : baseDuration;
        
        bar.style.transitionDuration = `${duration}ms`;
        bar.style.height = `${height}%`;
      });
      
      // Slower frame rate for less CPU usage and smoother appearance
      animationRef.current = setTimeout(() => {
        requestAnimationFrame(animate);
      }, 60) as unknown as number; // Increased from 40ms for slower updates
    };

    animate();

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isActive, numBars, audioElement]);

  return (
    <div className={cn(
      "relative flex items-end justify-center h-16 gap-[1px] p-2 bg-card/20 backdrop-blur-sm rounded-lg overflow-hidden border border-white/5",
      className
    )}>
      {isActive && (!audioElement || audioElement.dataset.connected !== "true") && (
        <div className="absolute top-1 right-1 text-xs text-muted-foreground flex items-center opacity-50">
          <AudioWaveform className="h-3 w-3 mr-1" />
          <span>Simulatie</span>
        </div>
      )}
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-40 z-0"></div>
      
      {Array.from({ length: numBars }).map((_, index) => (
        <div
          key={index}
          ref={el => (barsRef.current[index] = el)}
          className={cn(
            "relative w-full rounded-t-md transition-all ease-out",
            isActive 
              // Enhanced gradient with more blue in lower frequencies 
              ? index < numBars / 4
                ? "bg-gradient-to-t from-blue-800 via-blue-600 to-blue-400" 
                : index < numBars / 2
                  ? "bg-gradient-to-t from-blue-700 via-blue-500 to-blue-300"
                  : "bg-gradient-to-t from-blue-700 via-blue-500 to-purple-400"
              : "bg-blue-400/20"
          )}
          style={{ 
            height: "8%",
            transitionDuration: "200ms",
          }}
        >
          {isActive && (
            <div className="absolute bottom-0 inset-x-0 h-full bg-gradient-to-t from-transparent to-white/30 opacity-50"></div>
          )}
          <div className="absolute bottom-0 inset-x-0 h-[2px] bg-white/20 rounded-sm"></div>
        </div>
      ))}
      
      <div className="absolute bottom-0 inset-x-0 h-full transform scale-y-[-0.2] translate-y-full opacity-30 blur-[1px] pointer-events-none">
        {Array.from({ length: numBars }).map((_, index) => (
          <div
            key={`reflection-${index}`}
            className={cn(
              "absolute bottom-0 rounded-b-md transition-all ease-out",
              isActive 
                ? index < numBars / 4
                  ? "bg-gradient-to-b from-blue-800/50 via-blue-600/30 to-blue-400/10"
                  : index < numBars / 2
                    ? "bg-gradient-to-b from-blue-700/50 via-blue-500/30 to-blue-300/10"
                    : "bg-gradient-to-b from-blue-700/50 via-blue-500/30 to-purple-400/10"
                : "bg-blue-400/5"
            )}
            style={{
              left: `${(index / numBars) * 100}%`,
              width: `${100 / numBars - 0.5}%`,
              height: barsRef.current[index]?.style.height || "8%",
              transitionDuration: "200ms"
            }}
          />
        ))}
      </div>
    </div>
  );
}
