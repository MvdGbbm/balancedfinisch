
import React, { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { preloadAudio } from '@/components/audio-player/utils';

export type BreathingTechnique = '4-7-8' | 'box-breathing' | 'diaphragmatic';
export type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'pause';

interface BreathingAnimationProps {
  technique: BreathingTechnique;
  voiceUrls: {
    inhale: string;
    hold: string;
    exhale: string;
  } | null;
  isVoiceActive: boolean;
  currentPhase?: BreathingPhase;
  onPhaseChange?: (phase: BreathingPhase) => void;
}

const BreathingAnimation: React.FC<BreathingAnimationProps> = ({ 
  technique, 
  voiceUrls,
  isVoiceActive,
  currentPhase: externalPhase,
  onPhaseChange
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

  const [internalPhase, setInternalPhase] = useState<BreathingPhase>('inhale');
  const [count, setCount] = useState(getCountForPhase('inhale', technique));
  const [isActive, setIsActive] = useState(true);
  const isMobile = useIsMobile();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousPhaseRef = useRef<BreathingPhase | null>(null);
  const audioErrorCountRef = useRef<number>(0);
  const audioLoadingRef = useRef<boolean>(false);
  
  // Use external phase if provided, otherwise use internal phase
  const phase = externalPhase || internalPhase;
  
  // Reset animation state when technique changes
  useEffect(() => {
    if (!externalPhase) {
      setInternalPhase('inhale');
    }
    setCount(getCountForPhase(externalPhase || 'inhale', technique));
    setIsActive(true);
    
    // Reset audio error count
    audioErrorCountRef.current = 0;
    
    // Pre-validate voice URLs if available
    if (voiceUrls && isVoiceActive) {
      validateVoiceUrls(voiceUrls);
    }
  }, [technique, externalPhase, voiceUrls, isVoiceActive]);
  
  // Validate all voice URLs at once
  const validateVoiceUrls = async (urls: { inhale: string; hold: string; exhale: string; }) => {
    if (!urls.inhale || !urls.hold || !urls.exhale) {
      console.log("Voice URLs are incomplete, skipping validation");
      return false;
    }
    
    try {
      // Test all URLs in parallel
      const [inhaleValid, holdValid, exhaleValid] = await Promise.all([
        preloadAudio(urls.inhale),
        preloadAudio(urls.hold),
        preloadAudio(urls.exhale)
      ]);
      
      const allValid = inhaleValid && holdValid && exhaleValid;
      
      if (!allValid) {
        console.error("One or more voice audio URLs failed validation");
        audioErrorCountRef.current = 5; // Set to max to prevent repeated errors
        toast.error("Fout bij het laden van audio. Controleer of alle URL's correct zijn.");
        return false;
      }
      
      console.log("All voice URLs validated successfully");
      return true;
    } catch (error) {
      console.error("Error validating voice URLs:", error);
      return false;
    }
  };
  
  // Function to safely play audio with proper error handling
  const playAudio = async (phaseType: BreathingPhase) => {
    if (!voiceUrls || !isVoiceActive || !audioRef.current || audioLoadingRef.current) return;
    
    let audioUrl = '';
    switch(phaseType) {
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
    
    if (!audioUrl) {
      console.log(`No audio URL for ${phaseType} phase`);
      return;
    }
    
    // Prevent multiple simultaneous playback attempts
    audioLoadingRef.current = true;
    
    try {
      console.log(`Attempting to play ${phaseType} audio: ${audioUrl}`);
      
      // Preload audio to check if it's valid
      const isValid = await preloadAudio(audioUrl);
      
      if (!isValid) {
        throw new Error(`Failed to preload ${phaseType} audio`);
      }
      
      // Now set the actual audio element's source and play
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.volume = 1.0;
        
        try {
          await audioRef.current.play();
          console.log(`Playing ${phaseType} audio successfully`);
          audioErrorCountRef.current = 0; // Reset error count on success
        } catch (playError) {
          console.error(`Error playing ${phaseType} audio:`, playError);
          
          // Only increment error counter if we haven't reached max
          if (audioErrorCountRef.current < 5) {
            audioErrorCountRef.current++;
            
            if (audioErrorCountRef.current === 3) {
              toast.error("Fout bij afspelen van audio. Controleer de URL's.");
            }
          }
          
          // If this is a user interaction error, try playing on next user interaction
          if (playError.name === 'NotAllowedError') {
            console.log("Audio playback requires user interaction");
          }
        }
      }
    } catch (error) {
      console.error(`Error with ${phaseType} audio:`, error);
      audioErrorCountRef.current++;
      
      if (audioErrorCountRef.current === 3) {
        toast.error("Fout bij het afspelen van audio. Controleer of alle URL's correct zijn.");
      }
    } finally {
      audioLoadingRef.current = false;
    }
  };
  
  // Play appropriate audio when phase changes or when voice becomes active
  useEffect(() => {
    if (previousPhaseRef.current !== phase) {
      console.log(`Phase changed from ${previousPhaseRef.current} to ${phase}`);
      if (phase !== 'pause' && isVoiceActive && voiceUrls) {
        playAudio(phase);
      }
      previousPhaseRef.current = phase;
    }
  }, [phase, voiceUrls, isVoiceActive, isActive]);

  // Stop audio when voice becomes inactive
  useEffect(() => {
    if (!isVoiceActive && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    } else if (isVoiceActive && voiceUrls && audioRef.current && isActive) {
      // Play initial audio
      playAudio(phase);
    }
  }, [isVoiceActive, voiceUrls, isActive, phase]);
  
  // Main breathing timer effect
  useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(() => {
      setCount((prevCount) => {
        if (prevCount <= 1) {
          const nextPhase = getNextPhase(phase);
          
          // If we're using internal phase state, update it
          if (!externalPhase) {
            setInternalPhase(nextPhase);
          } else if (onPhaseChange) {
            // If we're using external phase, call the change handler
            onPhaseChange(nextPhase);
          }
          
          return getCountForPhase(nextPhase, technique);
        }
        return prevCount - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [phase, technique, isActive, externalPhase, onPhaseChange]);

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
    if (audioRef.current && isVoiceActive) {
      if (isActive) {
        // Pausing
        audioRef.current.pause();
      } else {
        // Resuming
        playAudio(phase);
      }
    }
  };

  const shouldShowCounter = phase !== 'pause';

  const circleSize = 'w-48 h-48';
  const innerCircleSize = 'w-40 h-40';

  return (
    <div className="breathe-animation-container h-[450px] flex flex-col items-center justify-center">
      {/* Hidden audio element to play voice guidance */}
      <audio ref={audioRef} onError={() => {
        console.error("Audio element error");
        audioErrorCountRef.current++;
        if (audioErrorCountRef.current === 3) {
          toast.error("Fout bij het afspelen van audio. Controleer of alle URL's correct zijn.");
        }
      }} />
      
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
