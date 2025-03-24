
import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface EqualizerProps {
  isActive: boolean;
  className?: string;
}

export function Equalizer({ isActive, className }: EqualizerProps) {
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const animationRef = useRef<number | null>(null);
  const numBars = 12;

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

    // Function to generate a more natural looking spectrum analyzer
    // Heights will vary more gradually between neighboring bars
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
      
      // Scale to appropriate percentage range (15% to 95%)
      return heights.map(h => Math.floor(h * 80) + 15);
    };

    const animate = () => {
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
        requestAnimationFrame(animate);
      }, 180) as unknown as number;
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
  }, [isActive, numBars]);

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
