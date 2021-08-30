import { css, cx } from '@emotion/css';
import { delta } from 'common/helpers';
import {
  Area,
  Coordinates,
  createMatrixSquare,
  Dimensions,
  MouseButton,
  TerminalMatrix
} from 'common/interfaces';
import { useStore } from 'common/store';
import React, { MouseEventHandler } from 'react';
import { useEffect } from 'react';
import { useRef } from 'react';
import { KeyboardEventHandler, MouseEvent } from 'react';
import { createHiDPICanvas, getCanvasCoordinates } from './helpers';
import { drawSquare } from './methods';

export interface MatrixCanvasProps {
  onMouseDown: (button: MouseButton) => void;
  onMouseMove: (coords: Coordinates) => void;
  onKeyDown: (key: string) => void;
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
    const ctx = contextRef.current;

    const { w, h } = props.characterDimensions;

    ctx.font = '14px Roboto Mono';
    // draw the background colour
    ctx.fillStyle = terminalBackgroundColor;
    ctx.fillRect(0, 0, matrix[0].length * w, matrix.length * h);

    // draw all matrix grid squares
    const squares = (offset: Coordinates, matrix: TerminalMatrix) =>
      matrix.forEach((row, y) =>
        row.forEach(
          (square, x) =>
            square &&
            drawSquare(
              { x: x + offset.x, y: y + offset.y },
              props.characterDimensions,
              square,
              ctx
            )
        )
      );

    squares({ x: 0, y: 0 }, matrix);

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
    ctx.strokeStyle = '#fff';
    ctx.setLineDash([]);
    ctx.strokeRect(cursor.x * w, cursor.y * h, w, h);
  };

  const handleMouseMove: MouseEventHandler = event =>
    props.onMouseMove(getCanvasCoordinates(canvasRef.current, event));

  const handleMouseDown: MouseEventHandler = event =>
    props.onMouseDown(event.button);

  const handleKeyDown: KeyboardEventHandler = event =>
    props.onKeyDown(event.key);

  // on initial load, create the canvas
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
        'p-4 rounded-md shadow',
        css({ backgroundColor: terminalBackgroundColor })
      )}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onKeyDown={handleKeyDown}
        onContextMenu={e => e.preventDefault()}
      />
    </div>
  );
};
