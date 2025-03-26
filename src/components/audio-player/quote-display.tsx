
import React from "react";
import { DailyQuote } from "@/lib/types";

interface QuoteDisplayProps {
  quote: DailyQuote;
}

export const QuoteDisplay: React.FC<QuoteDisplayProps> = ({ quote }) => {
  return (
    <div className="mb-2 p-2 rounded-md bg-primary/10 text-center">
      <p className="text-sm italic">"{quote.text}"</p>
      <p className="text-xs text-muted-foreground mt-1">- {quote.author}</p>
    </div>
  );
};
