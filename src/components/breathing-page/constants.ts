
import { BreathingPattern, VoiceURLs } from './types';

export const defaultBreathingPatterns: BreathingPattern[] = [
  {
    id: "1",
    name: "4-7-8 Techniek",
    description: "Een kalmerende ademhalingstechniek die helpt bij ontspanning",
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
    cycles: 5,
    startUrl: "",
  },
  {
    id: "2",
    name: "Box Breathing",
    description: "Vierkante ademhaling voor focus en kalmte",
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4, 
    cycles: 4,
    startUrl: "",
  },
  {
    id: "3",
    name: "Relaxerende Ademhaling",
    description: "Eenvoudige techniek voor diepe ontspanning",
    inhale: 4,
    hold1: 2,
    exhale: 6,
    hold2: 0,
    cycles: 6,
    startUrl: "",
  },
];

export const defaultVoiceUrls: Record<string, VoiceURLs> = {
  vera: {
    start: "",
    inhale: "https://storage.googleapis.com/breathly-963a5.appspot.com/breathing/inhale_nl_female.mp3",
    hold: "https://storage.googleapis.com/breathly-963a5.appspot.com/breathing/hold_nl_female.mp3",
    exhale: "https://storage.googleapis.com/breathly-963a5.appspot.com/breathing/exhale_nl_female.mp3",
  },
  marco: {
    start: "",
    inhale: "https://storage.googleapis.com/breathly-963a5.appspot.com/breathing/inhale_nl_male.mp3",
    hold: "https://storage.googleapis.com/breathly-963a5.appspot.com/breathing/hold_nl_male.mp3", 
    exhale: "https://storage.googleapis.com/breathly-963a5.appspot.com/breathing/exhale_nl_male.mp3",
  }
};

// Make sure the "inademen", "vasthouden", and "uitademen" prompts match the image
export const phaseTranslations = {
  inhale: "Inademen",
  hold: "Vasthouden",
  exhale: "Uitademen",
  rest: "Rust",
  start: "Start",
  end: "Voltooid"
};
