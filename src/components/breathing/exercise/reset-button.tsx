
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ResetButtonProps {
  onReset: () => void;
}

export function ResetButton({ onReset }: ResetButtonProps) {
  return (
    <div className="flex justify-center mt-3">
      <Button 
        onClick={onReset} 
        variant="outline"
        size="sm"
        className="text-white/80 border-white/20 hover:bg-white/10"
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Reset
      </Button>
    </div>
  );
}
