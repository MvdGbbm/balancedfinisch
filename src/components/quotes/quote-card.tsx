
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DailyQuote } from "@/lib/types";
import { cn } from "@/lib/utils";

interface QuoteCardProps {
  quote: DailyQuote;
  backgroundIndex: number;
  className?: string;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({ 
  quote, 
  backgroundIndex,
  className 
}) => {
  // Get background image CSS class
  const getBackgroundClass = () => {
    return `bg-quote-${backgroundIndex + 1}`;
  };

  return (
    <Card 
      className={cn(
        "glass-morphism w-full max-w-md mx-auto animate-scale-in bg-cover bg-center text-white",
        getBackgroundClass(),
        className
      )}
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url('/backgrounds/${getBackgroundClass()}.jpg')`,
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        borderRadius: "10px",
        border: "1px solid rgba(255, 255, 255, 0.18)"
      }}
    >
      <CardContent className="p-6">
        <div className="text-center">
          <p className="text-xl italic leading-relaxed mb-4 text-white">
            "{quote.text}"
          </p>
          <p className="text-right text-white/80">
            — {quote.author}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
