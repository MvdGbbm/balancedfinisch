
import React from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { MeditationExternalLinksProps } from "./types";

export const MeditationExternalLinks: React.FC<MeditationExternalLinksProps> = ({
  selectedMeditation,
  currentAudioUrl,
  onPlayExternalLink
}) => {
  return (
    <div className="flex gap-2 mb-4">
      <Button
        variant="outline"
        className={`flex-1 ${selectedMeditation.veraLink ? 
          (currentAudioUrl === selectedMeditation.veraLink ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'hover:bg-blue-600 hover:text-white') 
          : 'opacity-50 bg-transparent'}`}
        onClick={() => onPlayExternalLink('vera')}
        disabled={!selectedMeditation.veraLink}
        type="button"
      >
        <ExternalLink className="h-4 w-4 mr-2" />
        Vera
      </Button>
      
      <Button
        variant="outline"
        className={`flex-1 ${selectedMeditation.marcoLink ? 
          (currentAudioUrl === selectedMeditation.marcoLink ? 'bg-purple-500 hover:bg-purple-600 text-white' : 'hover:bg-purple-600 hover:text-white') 
          : 'opacity-50 bg-transparent'}`}
        onClick={() => onPlayExternalLink('marco')}
        disabled={!selectedMeditation.marcoLink}
        type="button"
      >
        <ExternalLink className="h-4 w-4 mr-2" />
        Marco
      </Button>
    </div>
  );
};
