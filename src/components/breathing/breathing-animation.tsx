
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
      case 'pause': return ''; // No text for pause phase
      default: return 'Adem in';
    }
  };

  // Enhanced circle classes with gradients based on phase
  const getCircleStyles = () => {
    const baseClasses = "relative flex items-center justify-center rounded-full shadow-lg transition-all";
    
    switch(phase) {
      case 'inhale': 
        return `${baseClasses} grow-animation bg-gradient-to-br from-cyan-400 to-blue-500`;
      case 'hold': 
        return `${baseClasses} scale-130 bg-gradient-to-br from-violet-400 to-purple-500`;
      case 'exhale': 
        return `${baseClasses} shrink-animation bg-gradient-to-br from-indigo-400 to-blue-500`;
      case 'pause':
      default: 
        return `${baseClasses} scale-100 bg-gradient-to-br from-teal-400 to-blue-400`;
    }
  };

  // Enhanced inner circle classes with glass effect
  const getInnerCircleStyles = () => {
    const baseClasses = "flex items-center justify-center rounded-full backdrop-blur-md";
    
    switch(phase) {
      case 'inhale':
        return `${baseClasses} bg-cyan-50/20 shadow-inner`;
      case 'hold':
        return `${baseClasses} bg-violet-50/20 shadow-inner`;
      case 'exhale':
        return `${baseClasses} bg-indigo-50/20 shadow-inner`;
      case 'pause':
      default:
        return `${baseClasses} bg-teal-50/20 shadow-inner`;
    }
  };

  const animationStyle = () => {
    const duration = getCountForPhase(phase, technique);
    
    return {
      animationDuration: `${duration}s`,
      boxShadow: `0 0 30px ${
        phase === 'inhale' ? 'rgba(56, 189, 248, 0.5)' : 
        phase === 'hold' ? 'rgba(167, 139, 250, 0.5)' : 
        phase === 'exhale' ? 'rgba(99, 102, 241, 0.5)' : 
        'rgba(45, 212, 191, 0.5)'
      }`
    };
  };

  const toggleActive = () => {
    setIsActive(!isActive);
  };

  const shouldShowCounter = phase !== 'pause';

  const circleSize = isMobile ? 'w-52 h-52' : 'w-62 h-62';
  const innerCircleSize = isMobile ? 'w-42 h-42' : 'w-52 h-52';

  return (
    <div className="breathe-animation-container h-[450px] flex flex-col items-center justify-center">
      {/* Outer glow */}
      <div 
        className="absolute rounded-full opacity-30 blur-xl"
        style={{
          width: circleSize === 'w-52 h-52' ? '220px' : '260px',
          height: circleSize === 'w-52 h-52' ? '220px' : '260px',
          background: `radial-gradient(circle, ${
            phase === 'inhale' ? 'rgba(56, 189, 248, 0.8)' : 
            phase === 'hold' ? 'rgba(167, 139, 250, 0.8)' : 
            phase === 'exhale' ? 'rgba(99, 102, 241, 0.8)' : 
            'rgba(45, 212, 191, 0.8)'
          } 0%, transparent 70%)`
        }}
      />
      
      {/* Main circle */}
      <div 
        className={`${getCircleStyles()} ${circleSize}`}
        style={animationStyle()}
        onClick={toggleActive}
      >
        {/* Decorative rings */}
        <div className="absolute w-full h-full rounded-full opacity-30 border border-white"></div>
        <div className="absolute w-[95%] h-[95%] rounded-full opacity-20 border border-white"></div>
        
        {/* Inner circle with glass effect */}
        <div className={`${getInnerCircleStyles()} ${innerCircleSize}`}>
          <div className="flex flex-col items-center justify-center text-center">
            <p className="text-xl font-light mb-2 text-white drop-shadow-md">{getMessage()}</p>
            {shouldShowCounter && (
              <p className="text-3xl font-medium text-white drop-shadow-lg">{count}</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-16 text-center space-y-8">
        <div className="flex justify-center">
          <button 
            onClick={toggleActive}
            className="px-3 py-1 h-8 rounded-md text-sm font-medium bg-primary/40 hover:bg-primary/60 text-foreground transition-colors flex items-center shadow-md"
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
