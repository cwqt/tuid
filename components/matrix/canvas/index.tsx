import { Coordinates, Dimensions, MouseButton } from 'common/interfaces';
import { useStore } from 'common/store';
import React, { MouseEventHandler } from 'react';
import { useEffect } from 'react';
import { useRef } from 'react';
import { KeyboardEventHandler, MouseEvent } from 'react';
import { drawSquare } from './square.canvas';

export interface MatrixCanvasProps {
  onMouseDown: (button: MouseButton) => void;
  onMouseMove: (coords: Coordinates) => void;
  onKeyDown: (key: string) => void;
  characterDimensions: Dimensions;
}

export const MatrixCanvas = (props: MatrixCanvasProps) => {
  const { matrix } = useStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = props.characterDimensions.w * matrix[0].length;
    canvas.height = props.characterDimensions.h * matrix.length;

    const context = canvas.getContext('2d');
    contextRef.current = context;
  }, []);

  useEffect(() => {
    if (!contextRef.current) return;

    console.log('re-render canvas!');

    matrix.forEach((row, y) =>
      row.forEach(
        (square, x) =>
          square &&
          drawSquare(
            { x, y },
            props.characterDimensions,
            square,
            contextRef.current
          )
      )
    );
  }, [matrix]);

  const getCanvasCoordinates = (event: MouseEvent): Coordinates => {
    // normalise into 0,0 coordinate space from window coords
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  };

  const handleMouseMove: MouseEventHandler = event =>
    props.onMouseMove(getCanvasCoordinates(event));

  const handleMouseDown: MouseEventHandler = event =>
    props.onMouseDown(event.button);

  const handleKeyDown: KeyboardEventHandler = event =>
    props.onKeyDown(event.key);

  return (
    <canvas
      className="border border-1 border-gray-100 mt-4 bg-gray-300"
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onKeyDown={handleKeyDown}
    />
  );
};
