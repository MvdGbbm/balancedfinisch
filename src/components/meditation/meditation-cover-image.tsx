
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { MeditationCoverImageProps } from "./types";

export const MeditationCoverImage: React.FC<MeditationCoverImageProps> = ({
  imageUrl,
  title,
  onError
}) => {
  if (!imageUrl) return null;
  
  return (
    <div className="mb-4">
      <img 
        src={imageUrl}
        alt={title}
        className="w-full h-48 object-cover rounded-lg"
        onError={onError}
      />
    </div>
  );
};

export const ImageErrorMessage: React.FC = () => {
  return (
    <Alert className="mb-4" variant="default">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Kon de afbeelding niet laden. De meditatie is nog steeds beschikbaar.
      </AlertDescription>
    </Alert>
  );
};
