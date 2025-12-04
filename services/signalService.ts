
import { Signal, Direction } from '../types';

export const generateSignal = (asset: string, time: string): Signal => {
  const directions = [Direction.BUY, Direction.SELL];
  const dir = directions[Math.floor(Math.random() * directions.length)];
  
  return {
    pair: asset,
    time: time,
    duration: '1 MINUTE', // M1 Strategy
    direction: dir,
    mtg: 'USE MTG 1 IF LOSS',
    timestamp: Date.now()
  };
};
