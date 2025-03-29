
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MusicTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const MusicTabs: React.FC<MusicTabsProps> = ({
  activeTab,
  onTabChange
}) => {
  return (
    <TabsList className="grid grid-cols-3 mb-4 sticky top-0 z-30 bg-background">
      <TabsTrigger 
        value="music" 
        onClick={() => onTabChange("music")}
        data-state={activeTab === "music" ? "active" : "inactive"}
      >
        Muziek
      </TabsTrigger>
      <TabsTrigger 
        value="playlists" 
        onClick={() => onTabChange("playlists")}
        data-state={activeTab === "playlists" ? "active" : "inactive"}
      >
        Afspeellijsten
      </TabsTrigger>
      <TabsTrigger 
        value="radio" 
        onClick={() => onTabChange("radio")}
        data-state={activeTab === "radio" ? "active" : "inactive"}
      >
        Streaming
      </TabsTrigger>
    </TabsList>
  );
}
