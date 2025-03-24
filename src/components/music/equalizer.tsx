
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

    const animate = () => {
      barsRef.current.forEach(bar => {
        if (!bar) return;
        
        // Random height between 15% and 95%
        const height = Math.floor(Math.random() * 80) + 15;
        
        // Smoother transition with CSS
        bar.style.height = `${height}%`;
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isActive]);

  return (
    <div className={cn("flex items-end justify-center h-16 gap-1 p-2 bg-card/30 rounded-md", className)}>
      {Array.from({ length: numBars }).map((_, index) => (
        <div
          key={index}
          ref={el => (barsRef.current[index] = el)}
          className={cn(
            "w-full rounded-t-sm transition-all duration-300 ease-in-out",
            isActive 
              ? "bg-gradient-to-t from-blue-700 to-blue-400" 
              : "bg-blue-300/30"
          )}
          style={{ height: "15%" }}
        />
      ))}
    </div>
  );
}
