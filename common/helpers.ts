import { useEffect, useRef, useState } from 'react';
import { Coordinates } from './interfaces';
import { IMatrixSquare } from './interfaces';
import Matrices from '../components/matrix/methods';

export function useKeyPress(): { key: string } {
  const [keyPressed, setKeyPressed] = useState<{ key: string }>({
    key: undefined
  });

  function downHandler({ key }): void {
    setKeyPressed({ key });
  }

  // Add event listeners
  useEffect(() => {
    window.addEventListener('keydown', downHandler);
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('keydown', downHandler);
    };
  }, []); // Empty array ensures that effect is only run on mount and unmount

  return keyPressed;
}

export const usePrevious = <T>(value: T) => {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

export const clamp = (min: number, num: number, max: number): number =>
  num <= min ? min : num >= max ? max : num;

export const delta = (
  start: Coordinates = { x: 0, y: 0 },
  end: Coordinates = { x: 0, y: 0 }
): Coordinates => ({
  // dx, dy
  x: end.x - start.x,
  y: end.y - start.y
});

export const randomMatrixSquare = (): IMatrixSquare =>
  Matrices.squares.create({
    character: (x => x.split('')[Math.floor(Math.random() * x.length - 1)])(
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    ),
    bold: Math.random() < 0.5,
    underline: Math.random() < 0.5,
    strikeout: Math.random() < 0.5,
    italic: Math.random() < 0.5,
    background: '#' + Math.floor(Math.random() * 16777215).toString(16),
    foreground: '#' + Math.floor(Math.random() * 16777215).toString(16)
  });
