
import React from "react";
import { Button } from "@/components/ui/button";

interface ErrorMessageProps {
  handleRetry: () => void;
  isRetrying: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  handleRetry,
  isRetrying
}) => {
  return (
    <div className="p-2 rounded-md bg-destructive/10 text-destructive text-center">
      <p className="text-sm">Er is een probleem met het laden van de audio.</p>
      <Button 
        variant="outline" 
        size="sm" 
        className="mt-1" 
        onClick={handleRetry}
        disabled={isRetrying}
      >
        {isRetrying ? "Opnieuw laden..." : "Opnieuw proberen"}
      </Button>
    </div>
  );
};
