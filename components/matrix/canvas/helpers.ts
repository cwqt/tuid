import { Coordinates } from 'common/interfaces';
import { MouseEvent } from 'react';

export const getCanvasCoordinates = (
  canvas: HTMLCanvasElement,
  event: MouseEvent
): Coordinates => {
  // normalise into 0,0 coordinate space from window coords
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
};

export const createHiDPICanvas = (
  canvas: HTMLCanvasElement,
  w: number,
  h: number
) => {
  // dpr on retina is 2x, so this'll 4x the canvas res, so 400px -> 1600px
  const ratio = window.devicePixelRatio / 0.5;

  canvas.width = w * ratio;
  canvas.height = h * ratio;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';

  canvas.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);
  return canvas;
};
