
import React, { useState, useEffect } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { useApp } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Share2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { getQuoteForDate, getGradientForDate, colorGradients } from "@/data/quotes";
import { DailyQuote as DailyQuoteType } from "@/lib/types";

const DailyQuote = () => {
  const {
    dailyQuotes,
    currentQuote,
    getRandomQuote,
    saveDailyQuoteToCalendar
  } = useApp();
  
  const [quote, setQuote] = useState<DailyQuoteType | null>(currentQuote);
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [usedGradientIndexes, setUsedGradientIndexes] = useState<number[]>([]);
  
  // Initialize with today's quote and gradient
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todaysQuote = getQuoteForDate(today);
    
    console.log("Today's quote:", todaysQuote);
    
    setQuote(todaysQuote);
    setDate(today);
  }, []);
  
  const getNextQuote = () => {
    // Get a new quote first
    const newQuote = getRandomQuote();
    
    // Create a function to get a random gradient that hasn't been used recently
    const getUniqueRandomGradient = () => {
      // If we've used all or most gradients, reset the tracking
      if (usedGradientIndexes.length >= colorGradients.length - 5) {
        setUsedGradientIndexes([]);
      }
      
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * colorGradients.length);
      } while (usedGradientIndexes.includes(randomIndex));
      
      // Add this index to our used list
      setUsedGradientIndexes(prev => [...prev, randomIndex]);
      
      return colorGradients[randomIndex];
    };
    
    // Apply a unique random gradient
    const uniqueGradient = getUniqueRandomGradient();
    
    // Generate a new date for this quote
    const newDate = format(new Date(Date.now() + Math.random() * 7776000000), 'yyyy-MM-dd');
    
    console.log("New quote with unique gradient:", { ...newQuote, backgroundClass: uniqueGradient });
    
    // Set the quote with the unique gradient
    setQuote({
      ...newQuote,
      backgroundClass: uniqueGradient
    });
    setDate(newDate);
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
  
  // Format the date in Dutch
  const formattedDate = date ? format(new Date(date), 'd MMMM yyyy', { locale: nl }) : '';
  
  return (
    <MobileLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold mb-1">Quote van de Dag</h1>
          <p className="text-muted-foreground flex items-center justify-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formattedDate}</span>
          </p>
        </div>
        
        {quote ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <Card className={cn(
              "w-full max-w-md mx-auto animate-scale-in overflow-hidden",
              quote.backgroundClass || "bg-gradient-to-br from-blue-500 to-purple-600")
            }>
              <CardContent className="p-8 backdrop-blur-sm bg-black/10">
                <div className="text-center">
                  <p className="text-xl italic leading-relaxed mb-4 text-white font-medium">
                    "{quote.text}"
                  </p>
                  <p className="text-right text-white/90 font-medium">
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
            
            <Button onClick={getNextQuote} className="mt-4 px-6">
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
            {dailyQuotes.slice(0, 5).map(q => (
              <Card 
                key={q.id} 
                className={cn(
                  "neo-morphism cursor-pointer animate-slide-in", 
                  quote?.id === q.id && "ring-2 ring-primary/50",
                  q.backgroundClass || ""
                )} 
                onClick={() => setQuote(q)}
              >
                <CardContent className="p-4">
                  <p className={cn(
                    "italic text-sm mb-1",
                    q.backgroundClass?.includes('from-white') ? 'text-gray-800' : 'text-white'
                  )}>
                    "{q.text}"
                  </p>
                  <p className="text-right text-xs text-white/80">
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
