
import React from "react";
import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { MobileLayout } from "@/components/mobile-layout";
import { RefreshCw, Home, ArrowLeft } from "lucide-react";

export const ErrorBoundary = () => {
  const error = useRouteError();
  const navigate = useNavigate();
  
  let errorMessage = "Er is een onverwachte fout opgetreden.";
  let statusCode = "Error";
  
  if (isRouteErrorResponse(error)) {
    statusCode = error.status.toString();
    errorMessage = error.statusText || error.data.message || errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  const reload = () => {
    window.location.reload();
  };

  const goBack = () => {
    navigate(-1);
  };

  const goHome = () => {
    navigate("/");
  };

  return (
    <MobileLayout showNav={false}>
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 space-y-6 animate-fade-in">
        <div className="w-full max-w-md mx-auto text-center">
          <h1 className="text-6xl font-bold text-primary mb-2">{statusCode}</h1>
          <p className="text-xl font-medium mb-4">Oeps! Er is iets misgegaan</p>
          
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Er is een fout opgetreden</AlertTitle>
            <AlertDescription className="mt-2">{errorMessage}</AlertDescription>
          </Alert>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={reload} 
              className="w-full" 
              variant="default"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Vernieuw pagina
            </Button>
            
            <Button 
              onClick={goBack} 
              className="w-full" 
              variant="outline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ga terug
            </Button>
            
            <Button 
              onClick={goHome} 
              className="w-full" 
              variant="secondary"
            >
              <Home className="h-4 w-4 mr-2" />
              Terug naar Home
            </Button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default ErrorBoundary;
