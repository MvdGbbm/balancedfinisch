
import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Pause, Play } from 'lucide-react';

export type BreathingTechnique = '4-7-8' | 'box-breathing' | 'diaphragmatic';
type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'pause';

interface BreathingAnimationProps {
  technique: BreathingTechnique;
  onReset?: () => void;
}

const BreathingAnimation: React.FC<BreathingAnimationProps> = ({ technique, onReset }) => {
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
  
  useEffect(() => {
    setPhase('inhale');
    setCount(getCountForPhase('inhale', technique));
    setIsActive(true);
  }, [technique]);
  
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
        return 'scale-130'; 
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

  const circleSize = isMobile ? 'w-52 h-52' : 'w-62 h-62';
  const innerCircleSize = isMobile ? 'w-42 h-42' : 'w-52 h-52';

  // Colors based on current phase
  const getCircleGradient = () => {
    switch(phase) {
      case 'inhale': 
        return 'from-cyan-500 to-blue-600';
      case 'hold': 
        return 'from-indigo-500 to-purple-600';
      case 'exhale': 
        return 'from-blue-500 to-indigo-600';
      case 'pause': 
        return 'from-blue-400 to-blue-600';
      default: 
        return 'from-blue-400 to-blue-600';
    }
  };

  return (
    <div className="breathe-animation-container h-[450px] flex flex-col items-center justify-center">
      <div 
        className={`breathe-circle ${circleSize} ${circleClass()} bg-gradient-to-br ${getCircleGradient()} shadow-lg shadow-primary/20`}
        style={{
          ...animationStyle(),
          boxShadow: '0 5px 30px rgba(59, 130, 246, 0.5)'
        }}
        onClick={toggleActive}
      >
        <div className={`breathe-inner-circle ${innerCircleSize} backdrop-blur-md bg-white/20 border border-white/30 dark:border-white/10`}>
          <div className="flex flex-col items-center justify-center text-center">
            <p className="text-xl font-light mb-2 text-white drop-shadow-md">{getMessage()}</p>
            {shouldShowCounter && (
              <p className="text-4xl font-medium text-white drop-shadow-lg">{count}</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-16 text-center space-y-8">
        <div className="flex justify-center">
          <button 
            onClick={toggleActive}
            className="px-3 py-1 h-8 rounded-md text-sm font-medium bg-primary/40 hover:bg-primary/60 text-foreground transition-colors flex items-center shadow-sm hover:shadow-md"
          >
            {isActive ? <Pause className="mr-1 h-3.5 w-3.5" /> : <Play className="mr-1 h-3.5 w-3.5" />}
            {isActive ? 'Pauze' : 'Hervat'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BreathingAnimation;
