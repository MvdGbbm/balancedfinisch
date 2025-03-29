
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface PageHeaderProps {
  onRefresh: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ onRefresh }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-2xl font-bold">Ademhalingsoefeningen</h1>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRefresh}
        className="flex items-center gap-1"
      >
        <RefreshCw className="h-4 w-4" />
        Ververs
      </Button>
    </div>
  );
};
