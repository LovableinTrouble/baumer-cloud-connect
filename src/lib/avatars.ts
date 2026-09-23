export interface AvatarPreset {
  id: string;
  label: string;
  emoji: string;
  from: string;
  to: string;
  accent: string;
  kind: "moon" | "sun" | "popcorn" | "ghost" | "cat" | "fox" | "panda" | "alien" | "robot" | "rocket" | "wave" | "flame" | "owl" | "bear" | "frog" | "tiger" | "rabbit" | "whale";
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: "moon", label: "Moon", emoji: "", from: "#25345f", to: "#6176b8", accent: "#f6d98b", kind: "moon" },
  { id: "star", label: "Star", emoji: "", from: "#6b3a35", to: "#d1854d", accent: "#ffe2a7", kind: "sun" },
  { id: "popcorn", label: "Popcorn", emoji: "", from: "#74343e", to: "#d1745a", accent: "#ffd17c", kind: "popcorn" },
  { id: "ghost", label: "Ghost", emoji: "", from: "#284d58", to: "#5da69e", accent: "#d6fff0", kind: "ghost" },
  { id: "cat", label: "Cat", emoji: "", from: "#6b415b", to: "#c8828e", accent: "#ffd6c7", kind: "cat" },
  { id: "fox", label: "Fox", emoji: "", from: "#794126", to: "#d68b39", accent: "#ffe0a6", kind: "fox" },
  { id: "panda", label: "Panda", emoji: "", from: "#3d4955", to: "#8798a3", accent: "#f0eee5", kind: "panda" },
  { id: "alien", label: "Alien", emoji: "", from: "#285663", to: "#61ae8b", accent: "#c2ffd6", kind: "alien" },
  { id: "robot", label: "Robot", emoji: "", from: "#303a59", to: "#7185ac", accent: "#d6e5ff", kind: "robot" },
  { id: "rocket", label: "Rocket", emoji: "", from: "#5f304e", to: "#b96a65", accent: "#ffc18d", kind: "rocket" },
  { id: "wave", label: "Wave", emoji: "", from: "#24516c", to: "#4e9aaa", accent: "#b9f0ee", kind: "wave" },
  { id: "flame", label: "Flame", emoji: "", from: "#713c2f", to: "#bd7e3c", accent: "#ffe19b", kind: "flame" },
  { id: "owl", label: "Owl", emoji: "", from: "#373b5c", to: "#88738a", accent: "#f2d9b1", kind: "owl" },
  { id: "bear", label: "Bear", emoji: "", from: "#503d36", to: "#a9785c", accent: "#f4c58e", kind: "bear" },
  { id: "frog", label: "Frog", emoji: "", from: "#285644", to: "#6aab76", accent: "#d7f3a3", kind: "frog" },
  { id: "tiger", label: "Tiger", emoji: "", from: "#79432c", to: "#c6853c", accent: "#ffe3a9", kind: "tiger" },
  { id: "rabbit", label: "Rabbit", emoji: "", from: "#59425e", to: "#ad7d9a", accent: "#ffd3dc", kind: "rabbit" },
  { id: "whale", label: "Whale", emoji: "", from: "#254b68", to: "#5685ab", accent: "#b9e2ef", kind: "whale" },
];

export const PRESET_PREFIX = "preset:";

export function presetValue(id: string) {
  return `${PRESET_PREFIX}${id}`;
}

export function findPreset(value?: string | null) {
  if (!value || !value.startsWith(PRESET_PREFIX)) return null;
  return AVATAR_PRESETS.find((preset) => preset.id === value.slice(PRESET_PREFIX.length)) ?? null;
}
