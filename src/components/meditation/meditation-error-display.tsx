
import React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, AlertCircle, Info } from "lucide-react";

interface MeditationErrorDisplayProps {
  message: string;
  onRetry: () => void;
  isRetrying?: boolean;
  details?: string;
}

export const MeditationErrorDisplay: React.FC<MeditationErrorDisplayProps> = ({
  message,
  onRetry,
  isRetrying = false,
  details
}) => {
  return (
    <div className="p-4 rounded-md bg-black border border-destructive/20">
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4 mr-2" />
        <AlertTitle>Fout bij laden van meditatie</AlertTitle>
        <AlertDescription className="mt-2">{message}</AlertDescription>
        
        {details && (
          <div className="mt-3 text-xs bg-destructive/10 p-2 rounded border border-destructive/20">
            <div className="flex items-start gap-1">
              <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <p>{details}</p>
            </div>
          </div>
        )}
      </Alert>
      
      <Button 
        onClick={onRetry} 
        variant="outline"
        className="w-full"
        disabled={isRetrying}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
        {isRetrying ? 'Opnieuw laden...' : 'Opnieuw proberen'}
      </Button>
    </div>
  );
};

export default MeditationErrorDisplay;
