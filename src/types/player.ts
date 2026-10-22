import type { DisplayCoordinate, LogicalCoordinate } from "../brands";

export type LogicalPoint = { x: LogicalCoordinate; y: LogicalCoordinate };
export type DisplayPoint = { x: DisplayCoordinate; y: DisplayCoordinate };

// Pause is a UI edge action; held simulation actions cannot queue it across ticks.
export type InputState = { left: boolean; right: boolean; fire: boolean };

export type PlayerState = {
  position: LogicalPoint;
  lives: number;
  contactInvulnerabilityRemaining: number;
};

export type InputController = {
  read: () => InputState;
  clear: () => void;
  destroy: () => void;
};
