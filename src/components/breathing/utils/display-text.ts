
/**
 * Display Text Utilities
 * Functions for generating text for breathing phases and patterns
 */

import { BreathingPhase } from '../types';

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
