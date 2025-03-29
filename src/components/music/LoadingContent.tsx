
import React from "react";

interface LoadingContentProps {
  message: string;
}

export const LoadingContent: React.FC<LoadingContentProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center h-48 w-full">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
};
