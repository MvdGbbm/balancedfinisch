
import { HealingFrequency } from "./types";

// Healing frequencies in Hz with Dutch translations
export const HEALING_FREQUENCIES: HealingFrequency[] = [
  { value: "174", label: "174 Hz - Pijnvermindering" },
  { value: "258", label: "258 Hz - Genezing & Herstel" },
  { value: "396", label: "396 Hz - Bevrijding" },
  { value: "417", label: "417 Hz - Transformatie" },
  { value: "528", label: "528 Hz - Reparatie & DNA" },
  { value: "639", label: "639 Hz - Verbinding" },
  { value: "741", label: "741 Hz - Expressie" },
  { value: "852", label: "852 Hz - Intuïtie" },
  { value: "963", label: "963 Hz - Ontwaking" },
];

export const DEFAULT_FILTER_BAND = {
  frequency: 528,
  gain: 0,
  q: 2.5
};

export const DEFAULT_REVERB_AMOUNT = 0.3;
