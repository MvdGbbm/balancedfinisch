
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
    inhale: "https://nnblogtutorials.s3.ap-southeast-1.amazonaws.com/inhale.mp3",
    hold: "https://nnblogtutorials.s3.ap-southeast-1.amazonaws.com/hold.mp3",
    exhale: "https://nnblogtutorials.s3.ap-southeast-1.amazonaws.com/exhale.mp3",
  },
  marco: {
    start: "",
    inhale: "https://nnblogtutorials.s3.ap-southeast-1.amazonaws.com/inhale.mp3",
    hold: "https://nnblogtutorials.s3.ap-southeast-1.amazonaws.com/hold.mp3", 
    exhale: "https://nnblogtutorials.s3.ap-southeast-1.amazonaws.com/exhale.mp3",
  }
};
