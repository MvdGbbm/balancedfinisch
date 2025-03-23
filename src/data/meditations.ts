
import { Meditation } from "@/lib/types";

export const meditations: Meditation[] = [
  {
    id: "med-1",
    title: "Ochtend Meditatie",
    description: "Begin je dag met innerlijke rust en focus met deze korte meditatie.",
    audioUrl: "/audio/morning-meditation.mp3", // Updated path with leading slash
    duration: 10,
    category: "Ochtend",
    coverImageUrl: "/images/morning-meditation.jpg",
    tags: ["ochtend", "beginners", "focus"],
    createdAt: "2023-01-01T08:00:00Z",
  },
  {
    id: "med-2",
    title: "Diepe Ademhalingsmeditatie",
    description: "Verbeter je ademhaling en verminder stress met deze geleide meditatie.",
    audioUrl: "/audio/breathing.mp3", // Updated path with leading slash
    duration: 15,
    category: "Ademhaling",
    coverImageUrl: "/images/breathing.jpg",
    tags: ["ademhaling", "stress", "ontspanning"],
    createdAt: "2023-01-02T10:30:00Z",
  },
  {
    id: "med-3",
    title: "Slaapmeditatie",
    description: "Ontspan je lichaam en geest voor een rustgevende nachtrust.",
    audioUrl: "/audio/sleep.mp3", // Updated path with leading slash
    duration: 20,
    category: "Slaap",
    coverImageUrl: "/images/sleep.jpg",
    tags: ["slaap", "ontspanning", "avond"],
    createdAt: "2023-01-03T22:00:00Z",
  },
  {
    id: "med-4",
    title: "Werkfocus Meditatie",
    description: "Verbeter je concentratie en productiviteit tijdens het werk.",
    audioUrl: "/audio/work-focus.mp3", // Updated path with leading slash
    duration: 8,
    category: "Focus",
    coverImageUrl: "/images/work-focus.jpg",
    tags: ["focus", "werk", "productiviteit"],
    createdAt: "2023-01-04T13:00:00Z",
  },
  {
    id: "med-5",
    title: "Lichaamsscan Meditatie",
    description: "Leer bewust te zijn van je lichaam en breng ontspanning waar nodig.",
    audioUrl: "/audio/body-scan.mp3", // Updated path with leading slash
    duration: 18,
    category: "Mindfulness",
    coverImageUrl: "/images/body-scan.jpg",
    tags: ["lichaamsbewustzijn", "ontspanning", "mindfulness"],
    createdAt: "2023-01-05T16:45:00Z",
  },
  {
    id: "med-6",
    title: "Dankbaarheidsmeditatie",
    description: "Cultiveer een gevoel van dankbaarheid en positiviteit in je leven.",
    audioUrl: "/audio/gratitude.mp3", // Updated path with leading slash
    duration: 12,
    category: "Ochtend", // Changed to Ochtend to have more options in the morning meditation dropdown
    coverImageUrl: "/images/gratitude.jpg",
    tags: ["dankbaarheid", "positiviteit", "geluk"],
    createdAt: "2023-01-06T09:15:00Z",
  },
];
