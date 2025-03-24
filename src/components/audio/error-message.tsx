
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ErrorMessageProps {
  onRetry: () => void;
  isRetrying: boolean;
  customMessage?: string;
}

export function ErrorMessage({ onRetry, isRetrying, customMessage }: ErrorMessageProps) {
  return (
    <div className="p-3 rounded-md bg-destructive/10 text-destructive">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="h-4 w-4" />
        <p className="text-sm font-medium">
          {customMessage || "Er is een probleem met het laden van de audio."}
        </p>
      </div>
      <p className="text-xs mb-2">Mogelijke oorzaken:</p>
      <ul className="text-xs list-disc pl-4 mb-2 space-y-1">
        <li>De bestandsindeling wordt niet ondersteund</li>
        <li>Het audiobestand bestaat niet of is verwijderd</li>
        <li>Er is een probleem met je internetverbinding</li>
        <li>De audio URL is leeg of ongeldig</li>
      </ul>
      <Button 
        variant="outline" 
        size="sm" 
        className="mt-1 w-full text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10 hover:border-destructive/50" 
        onClick={onRetry}
        disabled={isRetrying}
      >
        {isRetrying ? "Opnieuw laden..." : "Opnieuw proberen"}
      </Button>
    </div>
  );
}
