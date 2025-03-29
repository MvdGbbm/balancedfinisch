
/**
 * Utility functions for breathing exercises
 * This file contains utilities for managing breathing phases, 
 * animations, timers, and display formatting
 */

import { BreathingPhase } from './types';

// -------------------------
// Phase Management Functions
// -------------------------

/**
 * Determines the next phase in the breathing cycle
 * @param currentPhase - The current breathing phase
 * @param holdTime - Duration of hold phase in seconds (0 means skip the hold phase)
 * @returns The next breathing phase
 */
export const getNextPhase = (currentPhase: BreathingPhase, holdTime: number = 0): BreathingPhase => {
  switch (currentPhase) {
    case 'start':
      return 'inhale';
    case 'inhale':
      return holdTime > 0 ? 'hold' : 'exhale';
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

/**
 * Gets the count duration for a specific breathing phase
 * @param currentPhase - The breathing phase to get the count for
 * @param inhaleTime - Duration of inhale phase in seconds
 * @param holdTime - Duration of hold phase in seconds
 * @param exhaleTime - Duration of exhale phase in seconds
 * @param pauseTime - Duration of pause phase in seconds
 * @returns The count duration in seconds
 */
export const getCountForPhase = (
  currentPhase: BreathingPhase,
  inhaleTime: number,
  holdTime: number,
  exhaleTime: number,
  pauseTime: number
): number => {
  switch (currentPhase) {
    case 'start':
      return 3; // Default 3 second countdown for start phase
    case 'inhale':
      return inhaleTime;
    case 'hold':
      return holdTime;
    case 'exhale':
      return exhaleTime;
    case 'pause':
      return pauseTime;
    default:
      return inhaleTime;
  }
};

/**
 * Maps a phase to its next phase based on the breathing pattern
 * @param phase - Current phase
 * @param skipHold - Whether to skip the hold phase
 * @returns Next phase in the sequence
 */
export const mapPhaseToNextPhase = (
  phase: BreathingPhase,
  skipHold: boolean = false
): BreathingPhase => {
  const phaseMap: Record<BreathingPhase, BreathingPhase> = {
    'start': 'inhale',
    'inhale': skipHold ? 'exhale' : 'hold',
    'hold': 'exhale',
    'exhale': 'pause',
    'pause': 'inhale',
    'end': 'start'
  };
  
  return phaseMap[phase] || 'inhale';
};

// -------------------------
// Display Text Functions
// -------------------------

/**
 * Gets the display message for a breathing phase
 * @param phase - The breathing phase
 * @param language - Optional language code (defaults to Dutch)
 * @returns The message to display for the phase
 */
export const getBreathingMessage = (
  phase: BreathingPhase, 
  language: 'nl' | 'en' = 'nl'
): string => {
  if (language === 'en') {
    switch (phase) {
      case 'start': return 'Start';
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'pause': return '';
      case 'end': return 'Completed';
      default: return 'Breathe In';
    }
  }
  
  // Default Dutch messages
  switch (phase) {
    case 'start':
      return 'Start';
    case 'inhale':
      return 'Adem in';
    case 'hold':
      return 'Houd vast';
    case 'exhale':
      return 'Adem uit';
    case 'pause':
      return '';
    case 'end':
      return 'Voltooid';
    default:
      return 'Adem in';
  }
};

/**
 * Creates a human-readable description of the breathing pattern
 * @param inhaleTime - Duration of inhale phase in seconds
 * @param holdTime - Duration of hold phase in seconds
 * @param exhaleTime - Duration of exhale phase in seconds
 * @param pauseTime - Duration of pause phase in seconds
 * @param language - Optional language code (defaults to Dutch)
 * @returns Description string of the pattern
 */
export const createPatternDescription = (
  inhaleTime: number,
  holdTime: number,
  exhaleTime: number,
  pauseTime: number,
  language: 'nl' | 'en' = 'nl'
): string => {
  const labels = language === 'en' 
    ? { inhale: 'Inhale', hold: 'Hold', exhale: 'Exhale', pause: 'Pause' }
    : { inhale: 'Inademen', hold: 'Vasthouden', exhale: 'Uitademen', pause: 'Pauze' };
    
  let parts = [];
  parts.push(`${labels.inhale}: ${inhaleTime}s`);
  
  if (holdTime > 0) {
    parts.push(`${labels.hold}: ${holdTime}s`);
  }
  
  parts.push(`${labels.exhale}: ${exhaleTime}s`);
  
  if (pauseTime > 0) {
    parts.push(`${labels.pause}: ${pauseTime}s`);
  }
  
  return parts.join(' • ');
};

// -------------------------
// Animation and Visual Functions
// -------------------------

/**
 * Gets the circle animation class based on the current phase
 * @param phase - The current breathing phase
 * @param exerciseCompleted - Whether the exercise is completed
 * @returns The CSS class for the animation
 */
export const getCircleAnimationClass = (
  phase: BreathingPhase, 
  exerciseCompleted: boolean
): string => {
  if (exerciseCompleted) {
    return 'scale-100'; // Reset to default scale when exercise is completed
  }
  
  switch (phase) {
    case 'start':
      return 'scale-100'; // No animation for start phase
    case 'inhale':
      return 'grow-animation';
    case 'hold':
      return 'scale-125';
    case 'exhale':
      return 'shrink-animation';
    case 'pause':
      return 'scale-100';
    default:
      return 'scale-100';
  }
};

/**
 * Gets an appropriate scale value for a breathing circle based on the phase
 * @param phase - Current breathing phase
 * @param progress - Current progress through the phase (0-100)
 * @returns Scale value (between 0.5 and 1.25)
 */
export const getCircleScale = (
  phase: BreathingPhase,
  progress: number = 0
): number => {
  const baseScale = 0.85;
  const maxScale = 1.25;
  const minScale = 0.5;
  
  switch (phase) {
    case 'inhale':
      // Scale from base to max during inhale
      return baseScale + ((maxScale - baseScale) * (progress / 100));
    case 'hold':
      // Stay at max scale during hold
      return maxScale;
    case 'exhale':
      // Scale from max to min during exhale
      return maxScale - ((maxScale - minScale) * (progress / 100));
    case 'pause':
      // Stay at min scale during pause
      return minScale;
    case 'start':
    case 'end':
    default:
      // Default scale for other phases
      return baseScale;
  }
};

/**
 * Gets a CSS transition duration string for animations
 * @param phaseTime - The duration of the phase in seconds
 * @returns CSS transition duration string
 */
export const getTransitionDuration = (phaseTime: number): string => {
  return `${phaseTime}s`;
};

// -------------------------
// Time and Cycle Calculations
// -------------------------

/**
 * Calculates the total duration of a complete breath cycle
 * @param inhaleTime - Duration of inhale phase in seconds
 * @param holdTime - Duration of hold phase in seconds
 * @param exhaleTime - Duration of exhale phase in seconds
 * @param pauseTime - Duration of pause phase in seconds
 * @returns The total cycle duration in seconds
 */
export const getTotalCycleDuration = (
  inhaleTime: number,
  holdTime: number,
  exhaleTime: number,
  pauseTime: number
): number => {
  return inhaleTime + holdTime + exhaleTime + pauseTime;
};

/**
 * Calculates the total exercise duration
 * @param cycles - Number of breathing cycles
 * @param inhaleTime - Duration of inhale phase in seconds
 * @param holdTime - Duration of hold phase in seconds
 * @param exhaleTime - Duration of exhale phase in seconds
 * @param pauseTime - Duration of pause phase in seconds
 * @returns The total exercise duration in seconds
 */
export const calculateExerciseDuration = (
  cycles: number,
  inhaleTime: number,
  holdTime: number,
  exhaleTime: number,
  pauseTime: number
): number => {
  const cycleDuration = getTotalCycleDuration(inhaleTime, holdTime, exhaleTime, pauseTime);
  // Add start phase duration (3 seconds)
  return cycles * cycleDuration + 3;
};

/**
 * Calculates the progress percentage through the current cycle
 * @param currentCycle - Current cycle number
 * @param totalCycles - Total number of cycles in the exercise
 * @returns Progress percentage (0-100)
 */
export const calculateCycleProgress = (
  currentCycle: number,
  totalCycles: number
): number => {
  return Math.min(((currentCycle - 1) / totalCycles) * 100, 100);
};

// -------------------------
// Formatting and Display Helpers
// -------------------------

/**
 * Formats a seconds value into a MM:SS string
 * @param seconds - The seconds to format
 * @returns Formatted time string
 */
export const formatTimeFromSeconds = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Determines if a phase should show a counter
 * @param phase - The breathing phase
 * @param exerciseCompleted - Whether the exercise is completed
 * @returns Boolean indicating if counter should be shown
 */
export const shouldShowCounter = (
  phase: BreathingPhase, 
  exerciseCompleted: boolean
): boolean => {
  return (phase !== 'pause' && phase !== 'start') && !exerciseCompleted;
};

/**
 * Generates a user-friendly text for the remaining time
 * @param seconds - Seconds remaining
 * @returns Formatted remaining time text
 */
export const formatRemainingTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds} ${seconds === 1 ? 'seconde' : 'seconden'}`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (remainingSeconds === 0) {
    return `${minutes} ${minutes === 1 ? 'minuut' : 'minuten'}`;
  }
  
  return `${minutes} ${minutes === 1 ? 'minuut' : 'minuten'} en ${remainingSeconds} ${remainingSeconds === 1 ? 'seconde' : 'seconden'}`;
};

/**
 * Converts a breathing pattern to a simple numeric pattern string
 * @param inhaleTime - Duration of inhale phase in seconds
 * @param holdTime - Duration of hold phase in seconds
 * @param exhaleTime - Duration of exhale phase in seconds
 * @param pauseTime - Duration of pause phase in seconds
 * @returns Pattern string (e.g., "4-7-8" for 4-7-8 technique)
 */
export const createPatternString = (
  inhaleTime: number,
  holdTime: number,
  exhaleTime: number,
  pauseTime: number
): string => {
  let pattern = `${inhaleTime}`;
  
  if (holdTime > 0) {
    pattern += `-${holdTime}`;
  }
  
  pattern += `-${exhaleTime}`;
  
  if (pauseTime > 0) {
    pattern += `-${pauseTime}`;
  }
  
  return pattern;
};
