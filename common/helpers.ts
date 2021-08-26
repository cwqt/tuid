import { useEffect, useState } from 'react';

export function clamp(min, num, max) {
  return num <= min ? min : num >= max ? max : num;
}

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
