export enum Direction {
  BUY = 'BUY',
  SELL = 'SELL'
}

export interface Signal {
  pair: string;
  time: string;
  duration: string;
  direction: Direction;
  mtg: string;
  timestamp: number;
}

export interface AnalysisResult {
  direction: string;
  reason: string;
}