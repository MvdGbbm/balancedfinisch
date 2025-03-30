
import React from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { toast } from "sonner";
import { ImagePreviewProps } from "../types";

export const ImagePreview: React.FC<ImagePreviewProps> = ({ coverImageUrl }) => {
  if (!coverImageUrl) {
    return null;
  }

  return (
    <div className="rounded-md overflow-hidden relative border">
      <AspectRatio ratio={1/1}>
        <img 
          src={coverImageUrl} 
          alt="Preview" 
          className="w-full h-full object-cover" 
          onError={(e) => {
            e.currentTarget.src = "https://via.placeholder.com/400x400?text=Invalid+Image+URL";
            toast.error("Kon de afbeelding niet laden. Controleer de URL.");
          }}
        />
      </AspectRatio>
    </div>
  );
};
