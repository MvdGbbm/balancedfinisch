
import React from "react";

interface QuoteDisplayProps {
  text: string;
  author: string;
}

export function QuoteDisplay({ text, author }: QuoteDisplayProps) {
  return (
    <div className="mb-2 p-2 rounded-md bg-primary/10 text-center">
      <p className="text-sm italic">"{text}"</p>
      <p className="text-xs text-muted-foreground mt-1">- {author}</p>
    </div>
  );
}
