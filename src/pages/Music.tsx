
import React from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Music as MusicIcon } from "lucide-react";

const Music = () => {
  return (
    <MobileLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Muziek</h1>
          <MusicIcon className="h-6 w-6 text-primary" />
        </div>
        
        <p className="text-muted-foreground">
          Ontdek rustgevende muziek en natuurgeluiden
        </p>

        <Card className="neo-morphism">
          <CardContent className="p-4">
            <p>Muziek pagina in ontwikkeling</p>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
};

export default Music;
