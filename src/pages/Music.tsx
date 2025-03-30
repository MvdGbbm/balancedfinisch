
import React from "react";
import { MobileLayout } from "@/components/mobile-layout";

const Music = () => {
  return (
    <MobileLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Muziek</h1>
        </div>
        
        <p className="text-muted-foreground">
          Ontdek rustgevende muziek voor meditatie en ontspanning
        </p>
        
        <div className="text-center py-10 text-muted-foreground">
          <p>Muziekfunctionaliteit verwijderd op verzoek.</p>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Music;
