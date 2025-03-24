
import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

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
  const numBars = 24; // Increased from 12 to 24 bars

  // Setup audio analyzer if audio element is provided
  useEffect(() => {
    if (!audioElement) return;
    
    // Create audio context and analyzer on first render
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyzerRef.current = audioContextRef.current.createAnalyser();
      analyzerRef.current.fftSize = 256; // More detailed frequency data
      analyzerRef.current.smoothingTimeConstant = 0.8; // Smoother transitions
      
      const bufferLength = analyzerRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
    }
    
    // Connect the audio element to the analyzer
    if (audioElement && audioContextRef.current && !sourceRef.current) {
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioElement);
      sourceRef.current.connect(analyzerRef.current);
      analyzerRef.current.connect(audioContextRef.current.destination);
    }
    
    return () => {
      // Cleanup if component unmounts
      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }
      
      if (analyzerRef.current) {
        analyzerRef.current.disconnect();
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [audioElement]);

  useEffect(() => {
    if (!isActive) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      // Reset all bars to minimal height when inactive
      barsRef.current.forEach(bar => {
        if (bar) bar.style.height = "15%";
      });
      
      return;
    }

    // Function to generate heights based on audio data or use simulation
    const generateHeights = () => {
      // Use audio data if available
      if (analyzerRef.current && dataArrayRef.current && audioElement) {
        analyzerRef.current.getByteFrequencyData(dataArrayRef.current);
        
        // Map frequency data to our number of bars
        const frequencyData = dataArrayRef.current;
        const step = Math.floor(frequencyData.length / numBars);
        
        return Array(numBars).fill(0).map((_, i) => {
          // Get average of frequency range for this bar
          let sum = 0;
          for (let j = 0; j < step; j++) {
            const index = i * step + j;
            if (index < frequencyData.length) {
              sum += frequencyData[index];
            }
          }
          const average = sum / step;
          
          // Convert to percentage (0-100%) with 15% minimum height
          return Math.max(15, Math.min(95, (average / 255) * 95));
        });
      } else {
        // Fallback: Generate simulated responsive heights
        let heights = Array(numBars).fill(0).map(() => Math.random() * 0.6 + 0.15);
        
        // Smooth the values for a more natural pattern
        for (let i = 0; i < 3; i++) { // Increased smoothing passes for better effect
          const newHeights = [...heights];
          for (let j = 1; j < heights.length - 1; j++) {
            // Each bar is influenced by its neighbors (smoothing)
            newHeights[j] = (heights[j-1] + heights[j] * 2 + heights[j+1]) / 4;
          }
          heights = newHeights;
        }
        
        // Scale to appropriate percentage range (15% to 95%)
        return heights.map(h => Math.floor(h * 80) + 15);
      }
    };

    const animate = () => {
      const heights = generateHeights();
      
      barsRef.current.forEach((bar, index) => {
        if (!bar) return;
        
        // Apply the height from our generator
        const height = heights[index];
        
        // Add different transition speeds for more natural movement
        const duration = 200 + (index % 5) * 40; // 200-360ms transitions
        bar.style.transitionDuration = `${duration}ms`;
        bar.style.height = `${height}%`;
      });
      
      // Faster frame rate for more responsive movement
      animationRef.current = setTimeout(() => {
        requestAnimationFrame(animate);
      }, 80) as unknown as number; // Reduced from 180ms to 80ms for quicker response
    };

    // Start the animation
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
    <div className={cn("flex items-end justify-center h-16 gap-[2px] p-2 bg-card/30 rounded-md", className)}>
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
            transitionDuration: "200ms" 
          }}
        />
      ))}
    </div>
  );
}
