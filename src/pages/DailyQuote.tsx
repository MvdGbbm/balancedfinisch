import React, { useState } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { useApp } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CalendarPlus, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
const DailyQuote = () => {
  const {
    dailyQuotes,
    currentQuote,
    getRandomQuote,
    saveDailyQuoteToCalendar
  } = useApp();
  const [quote, setQuote] = useState(currentQuote);
  const getNextQuote = () => {
    const newQuote = getRandomQuote();
    setQuote(newQuote);
  };
  const handleSaveToCalendar = () => {
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
  return <MobileLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold mb-1">Mijn Quote van de Dag</h1>
          <p className="text-muted-foreground">
            Laat je inspireren door wijze woorden
          </p>
        </div>
        
        {quote ? <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <Card className="glass-morphism w-full max-w-md mx-auto animate-scale-in">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-xl italic leading-relaxed mb-4">
                    "{quote.text}"
                  </p>
                  <p className="text-right text-muted-foreground">
                    — {quote.author}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-center gap-3 mt-8">
              <Button onClick={handleSaveToCalendar} variant="outline" className="flex items-center gap-2">
                <CalendarPlus className="h-4 w-4" />
                <span>Opslaan in Dagboek</span>
              </Button>
              
              <Button onClick={handleShare} variant="outline" className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                <span>Delen</span>
              </Button>
            </div>
            
            <Button onClick={getNextQuote} className="mt-4 px-6">
              <span>Volgende</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div> : <div className="text-center py-10 text-muted-foreground">
            <p>Geen quote beschikbaar.</p>
          </div>}
        
        <div className="mt-8">
          <h2 className="text-lg font-medium mb-3">Eerder getoonde quotes</h2>
          <div className="space-y-3">
            {dailyQuotes.slice(0, 5).map(q => <Card key={q.id} className={cn("neo-morphism cursor-pointer animate-slide-in", quote?.id === q.id && "ring-2 ring-primary/50")} onClick={() => setQuote(q)}>
                <CardContent className="p-4">
                  <p className="italic text-sm mb-1">"{q.text}"</p>
                  <p className="text-right text-xs text-muted-foreground">
                    — {q.author}
                  </p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </div>
    </MobileLayout>;
};
export default DailyQuote;