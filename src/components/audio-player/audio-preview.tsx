
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { preloadAudio } from './utils';

interface AudioPreviewProps {
  url: string;
  onError?: () => void;
  label: string;
  onRetry?: () => void;
}

export const AudioPreview: React.FC<AudioPreviewProps> = ({ 
  url, 
  onError,
  label,
  onRetry
}) => {
  const [loading, setLoading] = React.useState(false);
  
  const handleRetry = async () => {
    setLoading(true);
    
    try {
      const canPlay = await preloadAudio(url);
      
      if (canPlay) {
        console.log('Successfully validated audio URL on retry');
        if (onRetry) onRetry();
      } else {
        console.error('Audio URL still invalid on retry:', url);
        if (onError) onError();
      }
    } catch (e) {
      console.error('Error retrying audio:', e);
      if (onError) onError();
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4 mr-2" />
      <AlertDescription className="flex flex-col gap-2">
        <span>
          Kon de audio niet laden. URL: {label.substring(0, 50)}
          {label.length > 50 ? '...' : ''}
        </span>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRetry}
          disabled={loading}
          className="self-start"
        >
          {loading ? 'Controleren...' : 'Opnieuw proberen'}
        </Button>
      </AlertDescription>
    </Alert>
  );
};
