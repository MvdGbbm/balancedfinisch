
import React from "react";
import { DailyQuote } from "@/lib/types";
import { cn } from "@/lib/utils";

interface QuoteDisplayProps {
  quote: DailyQuote;
  className?: string;
  transparentBackground?: boolean;
}

export const QuoteDisplay: React.FC<QuoteDisplayProps> = ({ 
  quote, 
  className,
  transparentBackground = false 
}) => {
  // Determine if the background is light or dark based on quote.backgroundClass
  const isLightBackground = quote.backgroundClass?.includes('from-white') || 
                            quote.backgroundClass?.includes('from-rose-100') || 
                            quote.backgroundClass?.includes('from-amber-100') ||
                            quote.backgroundClass?.includes('from-emerald-100') ||
                            quote.backgroundClass?.includes('from-cyan-100') ||
                            quote.backgroundClass?.includes('from-lime-100') ||
                            quote.backgroundClass?.includes('from-yellow-100');
  
  return (
    <div 
      className={cn(
        "mb-2 p-3 rounded-md text-center overflow-hidden shadow-md",
        transparentBackground 
          ? "bg-transparent border-none shadow-none" 
          : (quote.backgroundClass || "bg-primary/10"),
        className
      )}
    >
      <p className={cn(
        "text-sm italic font-medium",
        transparentBackground
          ? "text-white"
          : (isLightBackground ? "text-gray-800" : "text-white")
      )}>
        "{quote.text}"
      </p>
      <p className={cn(
        "text-xs mt-1",
        transparentBackground
          ? "text-gray-200"
          : (isLightBackground ? "text-gray-600" : "text-gray-200")
      )}>
        - {quote.author}
      </p>
    </div>
  );
};
