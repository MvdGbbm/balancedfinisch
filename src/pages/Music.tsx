
import React from 'react';
import { MobileLayout } from '@/components/mobile-layout';

// Placeholder component since we're removing Music functionality
const Music = () => {
  return (
    <MobileLayout>
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Muziek</h1>
        <p className="text-muted-foreground">
          Deze functie is momenteel niet beschikbaar.
        </p>
      </div>
    </MobileLayout>
  );
};

export default Music;
