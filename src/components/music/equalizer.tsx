
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
  const numBars = 32; // Keep the same number of bars

  // Setup audio analyzer if audio element is provided
  useEffect(() => {
    if (!audioElement) return;
    
    // Track if this is a new audio element by checking its id
    const currentAudioId = audioElement.dataset.equalizerId || audioElement.src;
    const isNewAudioElement = currentAudioId !== audioElementId;
    
    // Clean up old connections before creating new ones
    if (sourceRef.current && (isNewAudioElement || !isActive)) {
      try {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      } catch (err) {
        console.log("Error disconnecting previous source:", err);
      }
    }
    
    // If we're deactivating or switching elements, disconnect and clean up
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
    
    // Set an identifier on the audio element to track it
    if (!audioElement.dataset.equalizerId) {
      audioElement.dataset.equalizerId = `eq-${Date.now()}`;
    }
    setAudioElementId(audioElement.dataset.equalizerId || audioElement.src);
    
    // Create audio context and analyzer on first render or when we need a new one
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyzerRef.current = audioContextRef.current.createAnalyser();
        analyzerRef.current.fftSize = 1024; // Keep the same FFT size
        analyzerRef.current.smoothingTimeConstant = 0.85; // Increased from 0.7 for smoother transitions
        
        const bufferLength = analyzerRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);
        
        console.log("Created new AudioContext for equalizer");
      } catch (err) {
        console.error("Failed to create audio context:", err);
        return;
      }
    }
    
    // Connect the audio element to the analyzer if not already connected
    if (audioElement && audioContextRef.current && !sourceRef.current) {
      try {
        // Check if the element already has a source node
        if (!audioElement.dataset.connected) {
          sourceRef.current = audioContextRef.current.createMediaElementSource(audioElement);
          sourceRef.current.connect(analyzerRef.current);
          analyzerRef.current.connect(audioContextRef.current.destination);
          
          // Mark the element as connected
          audioElement.dataset.connected = "true";
          console.log("Connected audio element to analyzer");
        } else {
          console.log("Audio element already connected to a source node, using simulation mode");
        }
      } catch (err) {
        console.error("Error connecting audio element:", err);
        // If we fail to connect the source, we'll use simulation mode
        audioElement.dataset.connected = "failed";
      }
    }
    
    return () => {
      // Cleanup function will be called when:
      // 1. Component unmounts
      // 2. audioElement changes
      // 3. isActive changes
      // We'll handle the actual cleanup at the start of the next effect run
    };
  }, [audioElement, isActive, audioElementId]);

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
      if (analyzerRef.current && dataArrayRef.current && audioElement && audioElement.dataset.connected === "true") {
        analyzerRef.current.getByteFrequencyData(dataArrayRef.current);
        
        // Apply frequency weighting for more natural visualization with reduced sensitivity
        const frequencyData = dataArrayRef.current;
        const frequencyBands = []; 
        
        // Log scale distribution of frequency bins to better match human hearing
        for (let i = 0; i < numBars; i++) {
          // Calculate exponential position in the frequency range
          const scale = Math.pow(frequencyData.length, i / numBars) / 10;
          const index = Math.min(Math.floor(scale), frequencyData.length - 1);
          
          // Collect weighted values from nearby frequency bins for smoother visualization
          let sum = 0;
          let count = 0;
          const range = 5; // Increased from 3 to 5 for more averaging (smoother)
          
          for (let j = Math.max(0, index - range); j <= Math.min(frequencyData.length - 1, index + range); j++) {
            // Apply exponential weighting to increase sensitivity
            const weight = 1.0 - Math.abs(j - index) / (range + 1);
            sum += Math.pow(frequencyData[j] / 255, 1.2) * 255 * weight * 0.7; // Added 0.7 multiplier to reduce overall sensitivity
            count += weight;
          }
          
          const value = count > 0 ? sum / count : 0;
          
          // Reduced boosting factors for less dramatic movement
          const bassBoost = i < numBars / 4 ? 1.1 : 1.0; // Reduced from 1.3 to 1.1
          const trebleBoost = i > (numBars * 3) / 4 ? 1.1 : 1.0; // Reduced from 1.2 to 1.1
          
          const boostedValue = value * bassBoost * trebleBoost;
          
          // Convert to percentage (15-80%) with 15% minimum height, reduced from 10-100%
          frequencyBands.push(Math.max(15, Math.min(80, (boostedValue / 255) * 65 + 15)));
        }
        
        return frequencyBands;
      } else {
        // Fallback: Generate simulated less reactive heights
        let heights = Array(numBars).fill(0).map(() => Math.random() * 0.5 + 0.15); // Reduced range for less dramatic movement
        
        // Simulate frequency response patterns (more bass, mid falloff, some treble)
        for (let i = 0; i < numBars; i++) {
          // Bass boost for first quarter
          if (i < numBars / 4) {
            heights[i] *= 1.3;
          }
          // Mid cut
          else if (i < numBars / 2) {
            heights[i] *= 0.8;
          }
          // Some high frequency emphasis
          else if (i > (numBars * 3) / 4) {
            heights[i] *= 1.1;
          }
        }
        
        // Smooth the values for a more natural pattern
        for (let i = 0; i < 5; i++) { // Increased from 3 to 5 smoothing passes
          const newHeights = [...heights];
          for (let j = 1; j < heights.length - 1; j++) {
            // Each bar is influenced by its neighbors (smoothing)
            newHeights[j] = (heights[j-1] + heights[j] * 2 + heights[j+1]) / 4;
          }
          heights = newHeights;
        }
        
        // Scale to appropriate percentage range (15% to 75%) - reduced from 10% to 100%
        return heights.map(h => Math.floor(h * 60) + 15);
      }
    };

    const animate = () => {
      const heights = generateHeights();
      
      barsRef.current.forEach((bar, index) => {
        if (!bar) return;
        
        // Apply the height from our generator
        const height = heights[index];
        
        // Add different transition speeds for different frequency ranges
        // Lower frequencies (bass) tend to change more slowly than higher ones
        const baseDuration = 180; // Increased from 120ms for slower transitions
        const duration = index < numBars / 3 
          ? baseDuration + 70  // Bass - slower transitions
          : index < (2 * numBars) / 3 
            ? baseDuration     // Mids - medium transitions
            : baseDuration - 30; // Highs - faster transitions
            
        bar.style.transitionDuration = `${duration}ms`;
        bar.style.height = `${height}%`;
      });
      
      // Slower frame rate for less responsive movement
      animationRef.current = setTimeout(() => {
        requestAnimationFrame(animate);
      }, 70) as unknown as number; // Increased from 50ms to 70ms for less frequent updates
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
            height: "15%", // Increased minimum height from 10% to 15%
            transitionDuration: "200ms" 
          }}
        />
      ))}
    </div>
  );
}
