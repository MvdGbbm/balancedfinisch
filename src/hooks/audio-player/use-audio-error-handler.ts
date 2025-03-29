
import { useState, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAudioValidation } from "./use-audio-validation";

interface UseAudioErrorHandlerProps {
  onError?: () => void;
}

export function useAudioErrorHandler({ onError }: UseAudioErrorHandlerProps) {
  const [loadError, setLoadError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const retryCountRef = useRef(0);
  const { toast } = useToast();
  const MAX_RETRY_COUNT = 3;
  
  const resetErrorState = useCallback(() => {
    setLoadError(false);
    setIsRetrying(false);
    retryCountRef.current = 0;
  }, []);

  const handleError = useCallback((error: Event | Error, audioUrl: string) => {
    console.error("Error loading audio:", error, "URL:", audioUrl);
    setLoadError(true);
    
    if (retryCountRef.current < MAX_RETRY_COUNT) {
      retryCountRef.current++;
      setIsRetrying(true);
      
      console.log(`Retrying (${retryCountRef.current}/${MAX_RETRY_COUNT})...`);
      
      return true; // Will retry
    } else {
      console.error("Maximum retry count reached");
      setIsRetrying(false);
      
      toast({
        variant: "destructive",
        title: "Fout bij laden",
        description: "Kon de audio niet laden na meerdere pogingen. Controleer of het bestand bestaat."
      });
      
      if (onError) onError();
      return false; // Won't retry
    }
  }, [toast, onError]);

  const manualRetry = useCallback(() => {
    setLoadError(false);
    setIsRetrying(true);
    retryCountRef.current = 0;
    
    toast({
      title: "Opnieuw laden",
      description: "Probeert audio opnieuw te laden."
    });

    return true;
  }, [toast]);

  return {
    loadError,
    isRetrying,
    retryCountRef,
    resetErrorState,
    handleError,
    manualRetry,
    MAX_RETRY_COUNT
  };
}
