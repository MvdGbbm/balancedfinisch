
import { useEffect, useRef, useState } from 'react';
import { FilterBand } from './types';
import { generateImpulseResponse } from './utils';

export function useAudioProcessor(
  isActive: boolean,
  audioRef?: React.RefObject<HTMLAudioElement>,
  initialFrequency: number = 528
) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [reverbEnabled, setReverbEnabled] = useState(false);
  const [reverbAmount, setReverbAmount] = useState(0.3);
  const [masterVolume, setMasterVolume] = useState(1);
  const [selectedFrequency, setSelectedFrequency] = useState("528");
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const convolverNodeRef = useRef<ConvolverNode | null>(null);
  const dryGainNodeRef = useRef<GainNode | null>(null);
  const wetGainNodeRef = useRef<GainNode | null>(null);
  
  const [currentBand, setCurrentBand] = useState<FilterBand>({
    frequency: initialFrequency,
    gain: 0,
    q: 2.5
  });
  
  useEffect(() => {
    if (!isActive || !audioRef?.current) {
      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.disconnect();
        } catch (error) {
          console.error("Error disconnecting source node:", error);
        }
        sourceNodeRef.current = null;
      }
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        setIsInitialized(false);
      }
      return;
    }

    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.error("Error creating AudioContext:", error);
        return;
      }
    }

    if (!isInitialized) {
      try {
        setupAudioProcessing();
      } catch (error) {
        console.error("Error in setup:", error);
      }
    }
    
    return () => {
      // Cleanup function
    };
  }, [isActive, audioRef, isInitialized]);
  
  useEffect(() => {
    if (!isInitialized || !filterNodeRef.current) return;
    
    filterNodeRef.current.frequency.value = currentBand.frequency;
    filterNodeRef.current.gain.value = currentBand.gain;
    filterNodeRef.current.Q.value = currentBand.q;
  }, [currentBand, isInitialized]);
  
  useEffect(() => {
    const freqValue = parseInt(selectedFrequency);
    setCurrentBand(prev => ({
      ...prev,
      frequency: freqValue
    }));
  }, [selectedFrequency]);
  
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = masterVolume;
    }
  }, [masterVolume]);
  
  useEffect(() => {
    if (isInitialized) {
      updateReverbMix();
    }
  }, [reverbEnabled, reverbAmount, isInitialized]);
  
  const setupAudioProcessing = () => {
    if (!audioContextRef.current || !audioRef?.current) return;
    
    try {
      // Make sure the audio element isn't already connected
      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.disconnect();
        } catch (error) {
          console.error("Error disconnecting existing source node:", error);
        }
        sourceNodeRef.current = null;
      }
      
      sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
      
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.value = masterVolume;
      
      filterNodeRef.current = audioContextRef.current.createBiquadFilter();
      filterNodeRef.current.type = 'peaking';
      filterNodeRef.current.frequency.value = currentBand.frequency;
      filterNodeRef.current.gain.value = currentBand.gain;
      filterNodeRef.current.Q.value = currentBand.q;
      
      convolverNodeRef.current = audioContextRef.current.createConvolver();
      
      dryGainNodeRef.current = audioContextRef.current.createGain();
      wetGainNodeRef.current = audioContextRef.current.createGain();
      
      updateReverbMix();
      
      generateImpulseResponse(audioContextRef.current, convolverNodeRef.current);
      
      sourceNodeRef.current.connect(filterNodeRef.current);
      filterNodeRef.current.connect(dryGainNodeRef.current);
      dryGainNodeRef.current.connect(gainNodeRef.current);
      
      sourceNodeRef.current.connect(convolverNodeRef.current);
      convolverNodeRef.current.connect(wetGainNodeRef.current);
      wetGainNodeRef.current.connect(gainNodeRef.current);
      
      gainNodeRef.current.connect(audioContextRef.current.destination);
      
      setIsInitialized(true);
    } catch (error) {
      console.error("Error setting up audio processing:", error);
      throw error;
    }
  };
  
  const updateReverbMix = () => {
    if (!dryGainNodeRef.current || !wetGainNodeRef.current) return;
    
    if (reverbEnabled) {
      dryGainNodeRef.current.gain.value = 1;
      wetGainNodeRef.current.gain.value = reverbAmount;
    } else {
      dryGainNodeRef.current.gain.value = 1;
      wetGainNodeRef.current.gain.value = 0;
    }
  };
  
  const handleBandChange = (value: number[]) => {
    setCurrentBand(prev => ({
      ...prev,
      gain: value[0]
    }));
  };
  
  const handleReverbAmountChange = (value: number[]) => {
    setReverbAmount(value[0]);
  };
  
  const handleVolumeChange = (value: number[]) => {
    setMasterVolume(value[0]);
  };
  
  const handleReverbToggle = (checked: boolean) => {
    setReverbEnabled(checked);
  };

  const handleReset = () => {
    setCurrentBand(prev => ({
      ...prev,
      gain: 0
    }));
    setReverbAmount(0.3);
    setReverbEnabled(false);
    setMasterVolume(1);
  };

  return {
    currentBand,
    handleBandChange,
    selectedFrequency,
    setSelectedFrequency,
    reverbEnabled,
    reverbAmount,
    handleReverbToggle,
    handleReverbAmountChange,
    masterVolume,
    handleVolumeChange,
    handleReset,
    isInitialized
  };
}
