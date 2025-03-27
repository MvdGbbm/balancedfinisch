
import React, { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export type BreathingTechnique = '4-7-8' | 'box-breathing' | 'diaphragmatic';
type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'pause';

interface BreathingAnimationProps {
  technique: BreathingTechnique;
  voiceUrls: {
    inhale: string;
    hold: string;
    exhale: string;
  } | null;
  isVoiceActive: boolean;
}

const BreathingAnimation: React.FC<BreathingAnimationProps> = ({ 
  technique, 
  voiceUrls,
  isVoiceActive
}) => {
  const getCountForPhase = (currentPhase: BreathingPhase, breathingTechnique: BreathingTechnique): number => {
    if (breathingTechnique === '4-7-8') {
      switch(currentPhase) {
        case 'inhale': return 4; // 4 seconds for inhale
        case 'hold': return 7;   // 7 seconds hold
        case 'exhale': return 8; // 8 seconds exhale
        case 'pause': return 0;  // No pause
        default: return 4;
      }
    } else if (breathingTechnique === 'box-breathing') {
      switch(currentPhase) {
        case 'inhale': return 4; // 4 counts for inhale
        case 'hold': return 4;   // 4 counts hold
        case 'exhale': return 4; // 4 counts exhale
        case 'pause': return 4;  // 4 counts pause
        default: return 4;
      }
    } else if (breathingTechnique === 'diaphragmatic') {
      switch(currentPhase) {
        case 'inhale': return 5; // 5 seconds for deep inhale
        case 'hold': return 2;   // 2 seconds slight hold
        case 'exhale': return 6; // 6 seconds slow exhale
        case 'pause': return 1;  // 1 second pause
        default: return 5;
      }
    }
    
    return 4; // Default
  };
  
  const getNextPhase = (currentPhase: BreathingPhase): BreathingPhase => {
    switch (currentPhase) {
      case 'inhale': return 'hold';
      case 'hold': return 'exhale';
      case 'exhale': return 'pause';
      case 'pause': return 'inhale';
      default: return 'inhale';
    }
  };

  const [phase, setPhase] = useState<BreathingPhase>('inhale');
  const [count, setCount] = useState(getCountForPhase('inhale', technique));
  const [isActive, setIsActive] = useState(true);
  const isMobile = useIsMobile();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousPhaseRef = useRef<BreathingPhase | null>(null);
  
  // Reset animation state when technique changes
  useEffect(() => {
    setPhase('inhale');
    setCount(getCountForPhase('inhale', technique));
    setIsActive(true);
    // Also play inhale audio when technique changes
    if (voiceUrls && isVoiceActive && audioRef.current) {
      audioRef.current.src = voiceUrls.inhale;
      audioRef.current.play().catch(err => console.error("Error playing audio:", err));
    }
  }, [technique]);
  
  // Play appropriate audio when phase changes or when voice becomes active
  useEffect(() => {
    if (voiceUrls && isVoiceActive && audioRef.current) {
      // Only play audio if the phase has actually changed or if this is the first time
      if (previousPhaseRef.current !== phase || previousPhaseRef.current === null) {
        let audioUrl = '';
        
        // Get the correct audio URL based on the current phase
        switch(phase) {
          case 'inhale':
            audioUrl = voiceUrls.inhale;
            break;
          case 'hold':
            audioUrl = voiceUrls.hold;
            break;
          case 'exhale':
            audioUrl = voiceUrls.exhale;
            break;
          default:
            audioUrl = '';
        }
        
        // Only play if we have a URL and the animation is active
        if (audioUrl && isActive) {
          console.log("Playing audio for phase:", phase, "URL:", audioUrl);
          audioRef.current.src = audioUrl;
          audioRef.current.play().catch(err => console.error("Error playing audio:", err));
        }
        
        // Update previous phase
        previousPhaseRef.current = phase;
      }
    }
  }, [phase, voiceUrls, isVoiceActive, isActive]);

  // Stop audio when voice becomes inactive
  useEffect(() => {
    if (!isVoiceActive && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [isVoiceActive]);

  // Also play initial audio when voice becomes active
  useEffect(() => {
    if (isVoiceActive && voiceUrls && audioRef.current && isActive) {
      // Play the audio for the current phase
      let audioUrl = '';
      switch(phase) {
        case 'inhale':
          audioUrl = voiceUrls.inhale;
          break;
        case 'hold':
          audioUrl = voiceUrls.hold;
          break;
        case 'exhale':
          audioUrl = voiceUrls.exhale;
          break;
        default:
          audioUrl = '';
      }
      
      if (audioUrl) {
        console.log("Initial play for current phase:", phase, "URL:", audioUrl);
        audioRef.current.src = audioUrl;
        audioRef.current.play().catch(err => console.error("Error playing audio:", err));
      }
    }
  }, [isVoiceActive, voiceUrls, isActive]);
  
  // Main breathing timer effect
  useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(() => {
      setCount((prevCount) => {
        if (prevCount <= 1) {
          setPhase((currentPhase) => getNextPhase(currentPhase));
          const nextPhase = getNextPhase(phase);
          return getCountForPhase(nextPhase, technique);
        }
        return prevCount - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [phase, technique, isActive]);

  const getMessage = (): string => {
    switch(phase) {
      case 'inhale': return 'Adem in';
      case 'hold': return 'Houd vast';
      case 'exhale': return 'Adem uit';
      case 'pause': return ''; // Removed 'Rust' text
      default: return 'Adem in';
    }
  };

  const circleClass = () => {
    const duration = getCountForPhase(phase, technique);
    
    switch(phase) {
      case 'inhale': 
        return `grow-animation`;
      case 'hold': 
        return 'scale-125'; 
      case 'exhale': 
        return `shrink-animation`;
      case 'pause': 
        return 'scale-100';
      default: 
        return 'scale-100';
    }
  };

  const animationStyle = () => {
    const duration = getCountForPhase(phase, technique);
    
    return {
      animationDuration: `${duration}s`
    };
  };

  const toggleActive = () => {
    setIsActive(!isActive);
  };

  const shouldShowCounter = phase !== 'pause';

  const circleSize = 'w-48 h-48';
  const innerCircleSize = 'w-40 h-40';

  return (
    <div className="breathe-animation-container h-[450px] flex flex-col items-center justify-center">
      {/* Hidden audio element to play voice guidance */}
      <audio ref={audioRef} />
      
      <div 
        className={`breathe-circle ${circleSize} ${circleClass()}`}
        style={animationStyle()}
        onClick={toggleActive}
      >
        <div className={`breathe-inner-circle ${innerCircleSize}`}>
          <div className="flex flex-col items-center justify-center text-center">
            <p className="text-xl font-light mb-2">{getMessage()}</p>
            {shouldShowCounter && (
              <p className="text-3xl font-medium">{count}</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-16 text-center">
        <button 
          onClick={toggleActive}
          className="px-4 py-2 rounded-lg bg-tranquil-400/40 hover:bg-tranquil-400/60 text-foreground transition-colors"
        >
          {isActive ? 'Pauze' : 'Hervat'}
        </button>
      </div>
    </div>
  );
};

export default BreathingAnimation;
