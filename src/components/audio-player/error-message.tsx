
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Link2 } from "lucide-react";

interface ErrorMessageProps {
  handleRetry: () => void;
  isRetrying: boolean;
  message?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  handleRetry,
  isRetrying,
  message = "Er is een probleem met het laden van de audio."
}) => {
  return (
    <div className="p-2 rounded-md bg-destructive/10 text-destructive text-center">
      <div className="flex items-center justify-center gap-1 mb-1">
        <AlertCircle className="h-3.5 w-3.5" />
        <p className="text-sm">{message}</p>
      </div>
      
      <div className="text-xs text-muted-foreground mt-1 mb-2">
        <p>Mogelijke oplossingen:</p>
        <ul className="list-disc list-inside text-left mt-0.5">
          <li>Controleer of de URL naar een geldig audiobestand verwijst</li>
          <li>Controleer of het bestand toegankelijk is (niet privé)</li>
          <li>Probeer een ander audio-formaat (.mp3, .aac, .wav)</li>
        </ul>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="mt-1" 
        onClick={handleRetry}
        disabled={isRetrying}
      >
        {isRetrying ? (
          <>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            Opnieuw laden...
          </>
        ) : (
          <>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Opnieuw proberen
          </>
        )}
      </Button>
    </div>
  );
};
