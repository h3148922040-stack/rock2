
export interface GearConfig {
  id: string;
  teeth: number;
  radius: number;
  color: string;
  label: string;
  speedMultiplier: number; // base speed multiplier
  position: { x: number; y: number };
}

export interface ClockState {
  time: number; // in seconds from start of day
  isPaused: boolean;
  speed: number; // simulation speed multiplier
}

export interface ExplainerContent {
  title: string;
  description: string;
  funFact: string;
}
