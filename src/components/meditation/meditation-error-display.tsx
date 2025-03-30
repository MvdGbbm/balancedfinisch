
import React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { RefreshCw } from "lucide-react";

interface MeditationErrorDisplayProps {
  message: string;
  onRetry: () => void;
}

export const MeditationErrorDisplay: React.FC<MeditationErrorDisplayProps> = ({
  message,
  onRetry
}) => {
  return (
    <div className="p-4 rounded-md bg-black border border-destructive/20">
      <Alert variant="destructive" className="mb-4">
        <AlertTitle>Fout bij laden van meditatie</AlertTitle>
        <AlertDescription className="mt-2">{message}</AlertDescription>
      </Alert>
      
      <Button 
        onClick={onRetry} 
        variant="outline"
        className="w-full"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Opnieuw proberen
      </Button>
    </div>
  );
};

export default MeditationErrorDisplay;
