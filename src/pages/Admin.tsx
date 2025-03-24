
import React, { useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  FileMusic, 
  MessageSquareQuote,
  Edit,
  Music
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";

const Admin = () => {
  const navigate = useNavigate();
  const { meditations, soundscapes, dailyQuotes } = useApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple authentication - in a real app, use a secure auth method
    if (username === "admin" && password === "admin") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Ongeldige gebruikersnaam of wachtwoord. Probeer admin/admin.");
    }
  };
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md animate-fade-in">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>
              Log in om toegang te krijgen tot het admin dashboard
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Gebruikersnaam
                </label>
                <Input
                  id="username"
                  placeholder="Voer je gebruikersnaam in"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Wachtwoord
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Voer je wachtwoord in"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                Inloggen
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }
  
  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Beheer de content van de Balanced Mind Meditation app
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <FileMusic className="h-5 w-5 text-primary" />
                <span>Meditaties</span>
              </CardTitle>
              <CardDescription>
                Beheer de meditatie content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {meditations.length} meditaties beschikbaar
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => navigate("/admin/meditations")}
                variant="outline"
                className="w-full"
              >
                <Edit className="h-4 w-4 mr-2" />
                Bewerken
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5 text-primary" />
                <span>Muziek</span>
              </CardTitle>
              <CardDescription>
                Beheer de muziek content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Voeg rustgevende muziek toe
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => navigate("/admin/music")}
                variant="outline"
                className="w-full"
              >
                <Edit className="h-4 w-4 mr-2" />
                Bewerken
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5 text-primary" />
                <span>Soundscapes</span>
              </CardTitle>
              <CardDescription>
                Beheer de soundscape content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {soundscapes.length} soundscapes beschikbaar
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => navigate("/admin/soundscapes")}
                variant="outline"
                className="w-full"
              >
                <Edit className="h-4 w-4 mr-2" />
                Bewerken
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <MessageSquareQuote className="h-5 w-5 text-primary" />
                <span>Dagelijkse Quotes</span>
              </CardTitle>
              <CardDescription>
                Beheer de inspirerende quotes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {dailyQuotes.length} quotes beschikbaar
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => navigate("/admin/quotes")}
                variant="outline"
                className="w-full"
              >
                <Edit className="h-4 w-4 mr-2" />
                Bewerken
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Admin;
