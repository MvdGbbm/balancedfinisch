
import React from "react";
import { DailyQuote } from "./utils";
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
  return (
    <div className={cn(
      "p-3 rounded-lg text-center space-y-1",
      transparentBackground 
        ? "bg-transparent" 
        : "bg-primary/10 backdrop-blur-sm border border-primary/10",
      className
    )}>
      <p className="text-sm italic">{quote.text}</p>
      {quote.author && (
        <p className="text-xs text-muted-foreground">— {quote.author}</p>
      )}
    </div>
  );
};
