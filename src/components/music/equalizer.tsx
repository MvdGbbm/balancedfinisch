
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
  const numBars = 16; // Reduced from 32 to 16 for a more basic look

  // Setup audio analyzer if audio element is provided
  useEffect(() => {
    if (!audioElement) return;
    
    const currentAudioId = audioElement.dataset.equalizerId || audioElement.src;
    const isNewAudioElement = currentAudioId !== audioElementId;
    
    // Clean up previous connections
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
        analyzerRef.current.fftSize = 512; // Reduced from 1024 for simpler processing
        analyzerRef.current.smoothingTimeConstant = 0.5; // Less smoothing for more responsiveness
        
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
        analyzerRef.current.getByteFrequencyData(dataArrayRef.current);
        
        const frequencyData = dataArrayRef.current;
        const frequencyBands = []; 
        
        // Simplified frequency distribution
        for (let i = 0; i < numBars; i++) {
          const index = Math.floor(i * (frequencyData.length / numBars));
          const value = frequencyData[index] / 255;
          
          // Basic percentage calculation with minimal transformation
          frequencyBands.push(Math.max(10, Math.min(90, value * 100)));
        }
        
        return frequencyBands;
      } else {
        // Basic simulation with minimal randomness
        return Array(numBars).fill(0).map(() => Math.random() * 50 + 20);
      }
    };

    const animate = () => {
      const heights = generateHeights();
      
      barsRef.current.forEach((bar, index) => {
        if (!bar) return;
        
        const height = heights[index];
        bar.style.transitionDuration = "80ms";
        bar.style.height = `${height}%`;
      });
      
      animationRef.current = setTimeout(() => {
        requestAnimationFrame(animate);
      }, 80) as unknown as number;
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
      "relative flex items-end justify-center h-20 gap-[1px] p-2 bg-card/30 rounded-md overflow-hidden", 
      className
    )}>
      {isActive && (!audioElement || audioElement.dataset.connected !== "true") && (
        <div className="absolute top-1 right-1 text-xs text-muted-foreground flex items-center opacity-50">
          <AudioWaveform className="h-3 w-3 mr-1" />
          <span>Simulatie</span>
        </div>
      )}
      {Array.from({ length: numBars }).map((_, index) => (
        <div
          key={index}
          ref={el => (barsRef.current[index] = el)}
          className={cn(
            "w-full rounded-t-sm transition-all ease-in-out",
            isActive 
              ? index % 2 === 0 
                ? "bg-gradient-to-t from-blue-700 to-blue-400" 
                : "bg-gradient-to-t from-indigo-700 to-indigo-400"
              : "bg-blue-300/30"
          )}
          style={{ 
            height: "10%",
            transitionDuration: "200ms" 
          }}
        />
      ))}
    </div>
  );
}
