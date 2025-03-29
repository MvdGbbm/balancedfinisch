
import React from "react";
import { MeditationErrorDisplay } from "@/components/meditation/meditation-error-display";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { Meditation } from "@/lib/types";
import { toast } from "sonner";

interface MeditationErrorViewProps {
  selectedMeditation: Meditation;
  handleRetryAudio: () => void;
  isRetrying: boolean;
  onPlayExternalLink: (linkType: 'vera' | 'marco') => void;
}

export const MeditationErrorView: React.FC<MeditationErrorViewProps> = ({
  selectedMeditation,
  handleRetryAudio,
  isRetrying,
  onPlayExternalLink
}) => {
  return (
    <div className="mt-4">
      <MeditationErrorDisplay
        message="Geen audio beschikbaar voor deze meditatie."
        additionalDetails={
          selectedMeditation.veraLink || selectedMeditation.marcoLink 
            ? "Probeer de externe links hieronder." 
            : "Probeer een andere meditatie te selecteren."
        }
        onRetry={handleRetryAudio}
        isRetrying={isRetrying}
      />
      
      {(selectedMeditation.veraLink || selectedMeditation.marcoLink) && (
        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            className={`flex-1 ${selectedMeditation.veraLink ? 'hover:bg-blue-600 hover:text-white' : 'opacity-50 bg-transparent'}`}
            onClick={() => onPlayExternalLink('vera')}
            disabled={!selectedMeditation.veraLink}
            type="button"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Probeer Vera
          </Button>
          
          <Button
            variant="outline"
            className={`flex-1 ${selectedMeditation.marcoLink ? 'hover:bg-purple-600 hover:text-white' : 'opacity-50 bg-transparent'}`}
            onClick={() => onPlayExternalLink('marco')}
            disabled={!selectedMeditation.marcoLink}
            type="button"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Probeer Marco
          </Button>
        </div>
      )}
    </div>
  );
};
