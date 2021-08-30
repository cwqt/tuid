import { css, cx } from '@emotion/css';
import { delta } from 'common/helpers';
import {
  Area,
  Coordinates,
  Dimensions,
  MouseButton,
  TerminalMatrix
} from 'common/interfaces';
import { useStore } from 'common/store';
import React, {
  KeyboardEventHandler,
  MouseEventHandler,
  useEffect,
  useRef
} from 'react';
import { createHiDPICanvas, getCanvasCoordinates } from './helpers';
import { drawSquare } from './methods';

export interface MatrixCanvasProps {
  onMouseDown?: (button: MouseButton) => void;
  onMouseMove?: (coords: Coordinates) => void;
  onKeyDown?: (key: string) => void;
  onKeyUp?: (key: string) => void;

  // dynamically changing data
  cursor: Coordinates;
  characterDimensions: Dimensions;
  drag: { start: Coordinates; end: Coordinates } | undefined;
  selection: Area | undefined;
  activeSelection: Area | undefined;
  dragSlice: TerminalMatrix;
}

export const MatrixCanvas = (props: MatrixCanvasProps) => {
  const { matrix, terminalBackgroundColor } = useStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D>(null);

  const create = () => {
    const canvas = createHiDPICanvas(
      canvasRef.current,
      props.characterDimensions.w * matrix[0].length,
      props.characterDimensions.h * matrix.length
    );

    contextRef.current = canvas.getContext('2d');
  };

  const render = (cursor: Coordinates) => {
    if (!contextRef.current) return;
    const { w, h } = props.characterDimensions;
    const ctx = contextRef.current;

    const squares = (offset: Coordinates, matrix: TerminalMatrix) => {
      // iterate backwards to prevent clipping
      for (let y = matrix.length - 1; y >= 0; y--) {
        for (let x = matrix[y].length - 1; x >= 0; x--) {
          matrix[y][x] &&
            drawSquare(
              { x: x + offset.x, y: y + offset.y },
              props.characterDimensions,
              matrix[y][x],
              ctx
            );
        }
      }
    };

    // draw the background colour
    ctx.fillStyle = terminalBackgroundColor;
    ctx.fillRect(0, 0, matrix[0].length * w, matrix.length * h);

    // draw all the the matrix squares
    squares({ x: 0, y: 0 }, matrix);

    // draw in-progress selection
    if (props.activeSelection) {
      ctx.strokeStyle = '#fff';
      ctx.setLineDash([]);
      ctx.strokeRect(
        props.activeSelection.x * w,
        props.activeSelection.y * h,
        props.activeSelection.w * w,
        props.activeSelection.h * h
      );
    }

    // draw set selection outline
    if (props.selection) {
      ctx.setLineDash([3]);
      ctx.strokeStyle = '#fff';
      ctx.strokeRect(
        props.selection.x * w,
        props.selection.y * h,
        props.selection.w * w,
        props.selection.h * h
      );
    }

    // drag dragged area outline & preview of slice
    if (props.drag) {
      const d = delta(props.drag.start, props.drag.end);

      ctx.fillStyle = terminalBackgroundColor;
      ctx.fillRect(
        (props.selection.x + d.x) * w,
        (props.selection.y + d.y) * h,
        props.selection.w * w,
        props.selection.h * h
      );

      ctx.setLineDash([3]);
      ctx.strokeStyle = 'rgb(236, 72, 153)';
      ctx.strokeRect(
        (props.selection.x + d.x) * w,
        (props.selection.y + d.y) * h,
        props.selection.w * w,
        props.selection.h * h
      );

      squares(
        delta(props.drag.start, {
          x: props.drag.end.x + props.selection.x,
          y: props.drag.end.y + props.selection.y
        }),
        props.dragSlice
      );
    }

    // draw the mouse cursor last for z-indexing above all
    if (props.cursor) {
      ctx.strokeStyle = '#fff';
      ctx.setLineDash([]);
      ctx.strokeRect(cursor.x * w, cursor.y * h, w, h);
    }
  };

  const handleMouseMove: MouseEventHandler = event =>
    props.onMouseMove?.(getCanvasCoordinates(canvasRef.current, event));

  const handleMouseDown: MouseEventHandler = event =>
    props.onMouseDown?.(event.button);

  const handleKeyDown: KeyboardEventHandler = event =>
    props.onKeyDown?.(event.key);

  const handleKeyUp: KeyboardEventHandler = event => props.onKeyUp?.(event.key);

  // on initial load or dimensions change, create the canvas
  useEffect(create, []);

  // trigger a re-render whenever any of these values change
  useEffect(
    () => render(props.cursor),
    [matrix, terminalBackgroundColor, props.cursor]
  );

  return (
    <div
      onContextMenu={e => e.preventDefault()}
      className={cx(
        'p-2 rounded-md shadow',
        css({ backgroundColor: terminalBackgroundColor })
      )}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        tabIndex={1}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onContextMenu={e => e.preventDefault()}
      />
    </div>
  );
};
