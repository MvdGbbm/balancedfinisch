
import React, { useState, useEffect } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { useApp } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getQuoteForDate, getBackgroundForDate } from "@/data/quotes";

const DailyQuote = () => {
  const {
    dailyQuotes,
    currentQuote,
    getRandomQuote,
    saveDailyQuoteToCalendar
  } = useApp();
  
  // Get today's quote based on the current date
  const [quote, setQuote] = useState(currentQuote || getQuoteForDate());
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const [previousQuotes, setPreviousQuotes] = useState<string[]>([]);
  
  // On first load, get the current day's quote
  useEffect(() => {
    const todaysQuote = getQuoteForDate();
    setQuote(todaysQuote);
    
    // Load previous quotes from localStorage
    const storedPreviousQuotes = localStorage.getItem('previousQuoteIds');
    if (storedPreviousQuotes) {
      setPreviousQuotes(JSON.parse(storedPreviousQuotes));
    }
    
    // Set background based on today's date
    setBackgroundIndex(Math.abs(new Date().getDate()) % 10);
  }, []);
  
  // Update previous quotes when quote changes
  useEffect(() => {
    if (quote && !previousQuotes.includes(quote.id)) {
      const newPreviousQuotes = [quote.id, ...previousQuotes].slice(0, 5);
      setPreviousQuotes(newPreviousQuotes);
      localStorage.setItem('previousQuoteIds', JSON.stringify(newPreviousQuotes));
    }
  }, [quote]);
  
  const getNextQuote = () => {
    const newQuote = getRandomQuote();
    setQuote(newQuote);
    // Cycle through backgrounds
    setBackgroundIndex((backgroundIndex + 1) % 10);
  };
  
  const handleSaveToJournal = () => {
    if (quote) {
      saveDailyQuoteToCalendar(quote);
    }
  };
  
  const handleShare = () => {
    if (quote) {
      if (navigator.share) {
        navigator.share({
          title: 'Mijn quote van de dag',
          text: `"${quote.text}" - ${quote.author}`
        }).catch(error => {
          console.error('Fout bij delen:', error);
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        alert(`"${quote.text}" - ${quote.author}\n\nKopieer deze tekst om te delen.`);
      }
    }
  };
  
  // Get background image CSS class
  const getBackgroundClass = () => {
    return `bg-quote-${backgroundIndex + 1}`;
  };
  
  return (
    <MobileLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold mb-1">Selecteer jouw Quote van de Dag</h1>
          <p className="text-muted-foreground">
            Laat je inspireren door wijze woorden
          </p>
        </div>
        
        {quote ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <Card 
              className={cn(
                "glass-morphism w-full max-w-md mx-auto animate-scale-in bg-cover bg-center text-white",
                getBackgroundClass()
              )}
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url('/backgrounds/${getBackgroundClass()}.jpg')`,
                boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
                borderRadius: "10px",
                border: "1px solid rgba(255, 255, 255, 0.18)"
              }}
            >
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-xl italic leading-relaxed mb-4 text-white">
                    "{quote.text}"
                  </p>
                  <p className="text-right text-white/80">
                    — {quote.author}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-center gap-3 mt-8">
              <Button onClick={handleSaveToJournal} variant="outline" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>Opslaan in Dagboek</span>
              </Button>
              
              <Button onClick={handleShare} variant="outline" className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                <span>Delen</span>
              </Button>
            </div>
            
            <Button onClick={getNextQuote} className="mt-4 px-6 bg-blue-500 hover:bg-blue-600 text-white">
              <span>Volgende</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            <p>Geen quote beschikbaar.</p>
          </div>
        )}
        
        <div className="mt-8">
          <h2 className="text-lg font-medium mb-3">Eerder getoonde quotes</h2>
          <div className="space-y-3">
            {dailyQuotes.filter(q => previousQuotes.includes(q.id)).map(q => (
              <Card 
                key={q.id} 
                className={cn(
                  "neo-morphism cursor-pointer animate-slide-in", 
                  quote?.id === q.id && "ring-2 ring-primary/50"
                )}
                onClick={() => setQuote(q)}
              >
                <CardContent className="p-4">
                  <p className="italic text-sm mb-1">"{q.text}"</p>
                  <p className="text-right text-xs text-muted-foreground">
                    — {q.author}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default DailyQuote;
