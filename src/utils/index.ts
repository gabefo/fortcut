import { Point, Rect } from '../types';

export const point = (x: number, y: number): Point => ({
  x: Math.round(x),
  y: Math.round(y),
});

export const rect = (x: number, y: number, width: number, height: number): Rect => ({
  x: Math.round(x),
  y: Math.round(y),
  width: Math.round(width),
  height: Math.round(height),
});
