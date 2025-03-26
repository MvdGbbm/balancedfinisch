import React, { useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { useApp } from "@/context/AppContext";
import { 
  Card, 
  CardContent, 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit, Trash2, Plus, Quote } from "lucide-react";
import { DailyQuote } from "@/lib/types";

const AdminQuotes = () => {
  const { dailyQuotes, addQuote, updateQuote, deleteQuote } = useApp();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<DailyQuote | null>(null);
  
  const [text, setText] = useState("");
  const [author, setAuthor] = useState("");
  
  const resetForm = () => {
    setText("");
    setAuthor("");
  };
  
  const handleOpenNew = () => {
    setCurrentQuote(null);
    resetForm();
    setIsDialogOpen(true);
  };
  
  const handleEdit = (quote: DailyQuote) => {
    setCurrentQuote(quote);
    setText(quote.text);
    setAuthor(quote.author);
    setIsDialogOpen(true);
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm("Weet je zeker dat je deze quote wilt verwijderen?")) {
      deleteQuote(id);
    }
  };
  
  const handleSave = () => {
    if (!text || !author) {
      alert("Vul alle verplichte velden in");
      return;
    }
    
    if (currentQuote) {
      updateQuote(currentQuote.id, {
        text,
        author,
      });
    } else {
      addQuote({
        text,
        author,
      });
    }
    
    setIsDialogOpen(false);
    resetForm();
  };
  
  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">inspiratie Quotes Beheren</h1>
          <Button onClick={handleOpenNew}>
            <Plus className="h-4 w-4 mr-2" />
            Nieuwe Quote
          </Button>
        </div>
        
        <p className="text-muted-foreground">
          Voeg nieuwe inspirerende quotes toe of bewerk bestaande quotes
        </p>
        
        <div className="space-y-4 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dailyQuotes.map((quote) => (
              <Card key={quote.id} className="overflow-hidden animate-fade-in">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Quote className="h-5 w-5 text-primary mt-1 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="italic mb-2">{quote.text}</p>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">
                          — {quote.author}
                        </p>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(quote)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(quote.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {dailyQuotes.length === 0 && (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">
                Er zijn nog geen quotes. Voeg je eerste quote toe!
              </p>
              <Button onClick={handleOpenNew}>
                <Plus className="h-4 w-4 mr-2" />
                Nieuwe Quote
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentQuote ? "Quote Bewerken" : "Nieuwe Quote"}
            </DialogTitle>
            <DialogDescription>
              Vul de details in voor de inspirerende quote
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text">Quote Tekst</Label>
              <Textarea
                id="text"
                placeholder="Voer de quote tekst in"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="author">Auteur</Label>
              <Input
                id="author"
                placeholder="Naam van de auteur"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuleren
            </Button>
            <Button onClick={handleSave}>
              Opslaan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminQuotes;
