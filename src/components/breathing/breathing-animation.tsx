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
  currentCycle?: number;
  totalCycles?: number;
  exerciseCompleted?: boolean;
}
const BreathingAnimation: React.FC<BreathingAnimationProps> = ({
  technique,
  voiceUrls,
  isVoiceActive,
  currentPhase: externalPhase,
  onPhaseChange,
  currentCycle = 1,
  totalCycles = 5,
  exerciseCompleted = false
}) => {
  const getCountForPhase = (currentPhase: BreathingPhase, breathingTechnique: BreathingTechnique): number => {
    if (breathingTechnique === '4-7-8') {
      switch (currentPhase) {
        case 'inhale':
          return 4;
        case 'hold':
          return 7;
        case 'exhale':
          return 8;
        case 'pause':
          return 0;
        default:
          return 4;
      }
    } else if (breathingTechnique === 'box-breathing') {
      switch (currentPhase) {
        case 'inhale':
          return 4;
        case 'hold':
          return 4;
        case 'exhale':
          return 4;
        case 'pause':
          return 4;
        default:
          return 4;
      }
    } else if (breathingTechnique === 'diaphragmatic') {
      switch (currentPhase) {
        case 'inhale':
          return 5;
        case 'hold':
          return 2;
        case 'exhale':
          return 6;
        case 'pause':
          return 1;
        default:
          return 5;
      }
    }
    return 4;
  };
  const getNextPhase = (currentPhase: BreathingPhase): BreathingPhase => {
    switch (currentPhase) {
      case 'inhale':
        return 'hold';
      case 'hold':
        return 'exhale';
      case 'exhale':
        return 'pause';
      case 'pause':
        return 'inhale';
      default:
        return 'inhale';
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
  const phase = externalPhase || internalPhase;

  useEffect(() => {
    if (!externalPhase) {
      setInternalPhase('inhale');
    }
    setCount(getCountForPhase(externalPhase || 'inhale', technique));
    setIsActive(true);
    audioErrorCountRef.current = 0;
    if (voiceUrls && isVoiceActive) {
      validateVoiceUrls(voiceUrls);
    }
  }, [technique, externalPhase, voiceUrls, isVoiceActive]);

  const validateVoiceUrls = async (urls: {
    inhale: string;
    hold: string;
    exhale: string;
  }) => {
    if (!urls.inhale || !urls.hold || !urls.exhale) {
      console.log("Voice URLs are incomplete, skipping validation");
      return false;
    }
    try {
      const [inhaleValid, holdValid, exhaleValid] = await Promise.all([preloadAudio(urls.inhale), preloadAudio(urls.hold), preloadAudio(urls.exhale)]);
      const allValid = inhaleValid && holdValid && exhaleValid;
      if (!allValid) {
        console.error("One or more voice audio URLs failed validation");
        audioErrorCountRef.current = 5;
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

  const playAudio = async (phaseType: BreathingPhase) => {
    if (!voiceUrls || !isVoiceActive || !audioRef.current || audioLoadingRef.current) return;
    let audioUrl = '';
    switch (phaseType) {
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
    audioLoadingRef.current = true;
    try {
      console.log(`Attempting to play ${phaseType} audio: ${audioUrl}`);
      const isValid = await preloadAudio(audioUrl);
      if (!isValid) {
        throw new Error(`Failed to preload ${phaseType} audio`);
      }
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.volume = 1.0;
        try {
          await audioRef.current.play();
          console.log(`Playing ${phaseType} audio successfully`);
          audioErrorCountRef.current = 0;
        } catch (playError) {
          console.error(`Error playing ${phaseType} audio:`, playError);
          if (audioErrorCountRef.current < 5) {
            audioErrorCountRef.current++;
            if (audioErrorCountRef.current === 3) {
              toast.error("Fout bij afspelen van audio. Controleer de URL's.");
            }
          }
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

  useEffect(() => {
    if (previousPhaseRef.current !== phase) {
      console.log(`Phase changed from ${previousPhaseRef.current} to ${phase}`);
      if (phase !== 'pause' && isVoiceActive && voiceUrls) {
        playAudio(phase);
      }
      previousPhaseRef.current = phase;
    }
  }, [phase, voiceUrls, isVoiceActive, isActive]);

  useEffect(() => {
    if (!isVoiceActive && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    } else if (isVoiceActive && voiceUrls && audioRef.current && isActive) {
      playAudio(phase);
    }
  }, [isVoiceActive, voiceUrls, isActive, phase]);

  useEffect(() => {
    if (!isActive || exerciseCompleted) return;
    
    const interval = setInterval(() => {
      setCount(prevCount => {
        if (prevCount <= 1) {
          const nextPhase = getNextPhase(phase);
          if (!externalPhase) {
            setInternalPhase(nextPhase);
          } else if (onPhaseChange) {
            onPhaseChange(nextPhase);
          }
          return getCountForPhase(nextPhase, technique);
        }
        return prevCount - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [phase, technique, isActive, externalPhase, onPhaseChange, exerciseCompleted]);

  const getMessage = (): string => {
    switch (phase) {
      case 'inhale':
        return 'Adem in';
      case 'hold':
        return 'Houd vast';
      case 'exhale':
        return 'Adem uit';
      case 'pause':
        return '';
      default:
        return 'Adem in';
    }
  };

  const circleClass = () => {
    if (exerciseCompleted) {
      return 'scale-100'; // Reset to default scale when exercise is completed
    }
    
    switch (phase) {
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
        audioRef.current.pause();
      } else {
        playAudio(phase);
      }
    }
  };

  const shouldShowCounter = phase !== 'pause' && !exerciseCompleted;
  const circleSize = 'w-48 h-48';
  const innerCircleSize = 'w-40 h-40';

  return <div className="breathe-animation-container h-[450px] flex flex-col items-center justify-center my-0 rounded-lg">
      <audio ref={audioRef} onError={() => {
        console.error("Audio element error");
        audioErrorCountRef.current++;
        if (audioErrorCountRef.current === 3) {
          toast.error("Fout bij het afspelen van audio. Controleer of alle URL's correct zijn.");
        }
      }} />
      
      <div className={`breathe-circle ${circleSize} ${circleClass()}`} style={animationStyle()} onClick={toggleActive}>
        <div className={`breathe-inner-circle ${innerCircleSize}`}>
          <div className="flex flex-col items-center justify-center text-center">
            {!exerciseCompleted ? (
              <>
                <p className="text-xl font-light mb-2">{getMessage()}</p>
                {shouldShowCounter && <p className="text-3xl font-medium">{count}</p>}
              </>
            ) : (
              <p className="text-xl font-light">Voltooid</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-white/70 my-0 py-[11px]">
          Cyclus {currentCycle} van {totalCycles}
        </p>
      </div>
    </div>;
};
export default BreathingAnimation;
