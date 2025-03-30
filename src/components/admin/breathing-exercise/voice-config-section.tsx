
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VoiceUrlForm } from "./voice-url-form";
import { UseFormReturn } from "react-hook-form";
import { VoiceUrls } from "@/components/admin/breathing-exercise/types";

interface VoiceConfigSectionProps {
  veraForm: UseFormReturn<VoiceUrls>;
  marcoForm: UseFormReturn<VoiceUrls>;
  onVeraSubmit: (data: VoiceUrls) => void;
  onMarcoSubmit: (data: VoiceUrls) => void;
}

export function VoiceConfigSection({ 
  veraForm, 
  marcoForm, 
  onVeraSubmit, 
  onMarcoSubmit 
}: VoiceConfigSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Vera Stem Configuratie</CardTitle>
        </CardHeader>
        <CardContent>
          <VoiceUrlForm 
            form={veraForm} 
            onSubmit={onVeraSubmit} 
            voiceName="Vera" 
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Marco Stem Configuratie</CardTitle>
        </CardHeader>
        <CardContent>
          <VoiceUrlForm 
            form={marcoForm} 
            onSubmit={onMarcoSubmit} 
            voiceName="Marco" 
          />
        </CardContent>
      </Card>
    </div>
  );
}
