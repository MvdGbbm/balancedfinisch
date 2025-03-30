
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { DailyQuote } from "@/lib/types";

export interface QuoteDisplayProps {
  quote: DailyQuote;
  onClose: () => void;
}

export const QuoteDisplay: React.FC<QuoteDisplayProps> = ({ quote, onClose }) => {
  return (
    <Card className="border-t-4 border-t-primary mt-4 animate-fade-in">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <p className="italic text-sm">{quote.text}</p>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 -mt-1 -mr-1"
            onClick={onClose}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
      <CardFooter className="px-4 py-2 border-t text-xs text-muted-foreground">
        — {quote.author}
      </CardFooter>
    </Card>
  );
};
