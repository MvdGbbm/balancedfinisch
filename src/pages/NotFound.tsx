
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-4 max-w-md mx-auto animate-fade-in">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <p className="text-xl font-medium mb-2">Pagina niet gevonden</p>
        <p className="text-muted-foreground mb-4">
          De pagina "{location.pathname}" bestaat niet of is verplaatst.
        </p>
        <div className="flex justify-center">
          <Button onClick={() => navigate("/")} size="lg">
            Terug naar Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
