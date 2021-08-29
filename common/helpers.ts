import { useEffect, useRef, useState } from 'react';
import { Coordinates } from './interfaces';

export const clamp = (min: number, num: number, max: number): number =>
  num <= min ? min : num >= max ? max : num;

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

export const delta = (
  start: Coordinates = { x: 0, y: 0 },
  end: Coordinates = { x: 0, y: 0 }
): Coordinates => ({
  x: end.x - start.x,
  y: end.y - start.y
});

export const usePrevious = <T>(value: T) => {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};
