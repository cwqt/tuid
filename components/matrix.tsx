import { css, cx } from '@emotion/css';
import useMouse from '@react-hook/mouse-position';
import classnames from 'classnames';
import { clamp, useKeyPress } from 'common/helpers';
import {
  Coordinates,
  createMatrixSquare,
  IMatrixSquare,
  SelectionRegion,
  TerminalMatrix
} from 'common/interfaces';
import React, { useEffect, useRef, useState } from 'react';
import useDimensions from 'react-use-dimensions';
import { applyStyle, useStore } from '../common/store';
import { MatrixSquare } from './matrix-square';

const usePrevious = <T,>(value: T) => {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

export default function Terminal(props: { className?: string }) {
  const {
    matrix,
    setMatrixSquareProperty,
    selectedSpecialCharacter,
    terminalBackgroundColor,
    editor,
    mode,
    selection: storeSelection,
    setSelection: setStoreSelection
  } = useStore();
  const [cursor, setCursor] = useState<Coordinates | undefined>();
  const [cursorStyle, setCursorStyle] = useState(
    applyStyle(editor, createMatrixSquare())
  );

  useEffect(() => {
    setCursorStyle(
      applyStyle(
        editor,
        createMatrixSquare({ character: selectedSpecialCharacter || ' ' })
      )
    );
  }, [editor, selectedSpecialCharacter]);

  // 30x100 grid is 3,000 nodes - having event listeners on every one to check if
  // hovered is slow as dog, instead use mouse position and some maths to figure out
  // which grid square the mouse is lies over
  const mouseRef = useRef(null);
  const mouse = useMouse(mouseRef, {
    leaveDelay: 0,
    enterDelay: 0,
    fps: 60
  });
  // store previous value to compare against to resolve bug with cursor
  // moving back and forth, read below
  const prevMouse = usePrevious(mouse);

  // We need to know the width & height of one of these MatrixSquares
  // since they use ch/rems for dimensions, which we'll need in px to
  // find x,y position of square in the grid
  const hiddenSquareProps = createMatrixSquare({ character: 'X' });
  const [hiddenSquareRef, { width, height }] = useDimensions();
  useEffect(() => {
    if (width && height && mouse?.x && mouse?.y && matrix) {
      // weird bug where typing will cause cursor to switch back and forth
      // even though the mouse position hasn't actually move - i suspect this
      // has something to do with the actual mouse cursor itself changing
      if (mouse.x == prevMouse?.x && mouse.y == prevMouse?.y) return;

      const [x, y] = [
        clamp(0, Math.trunc(mouse.x / width), matrix[0].length - 1),
        clamp(0, Math.trunc(mouse.y / height), matrix.length - 1)
      ];

      setCursor({ x: x, y: y });
    } else {
      // set to last known position when leaving terminal bounding box
      setCursor({ x: cursor?.x, y: cursor?.y });
    }
  }, [mouse]);

  // Handle moving the current cursor position from arrow keypresses
  // account for wrapping / boundaries of terminal
  const retreatColumn = (
    current: { x: number; y: number },
    matrix: any[][]
  ): { x: number; y: number } => {
    let nx = current.x - 1;
    let ny = current.y;

    // handle if backing beyond terminal boundary
    if (nx < 0) {
      nx = matrix[0].length - 1;
      ny = ny - 1;
    }

    // handle if backing beyond y plane
    if (ny < 0) {
      ny = 0;
    }

    return { x: nx, y: ny };
  };

  const advanceColumn = (
    current: { x: number; y: number },
    matrix: any[][]
  ): { x: number; y: number } => {
    // move cursor to next position
    let nx = current.x + 1;
    let ny = current.y;

    // handle if cursor x incremented over matrix width
    if (nx > matrix[0].length - 1) {
      nx = 0;
      ny = ny + 1;
    }

    // handle if cursor y incremented over matrix height
    if (ny > matrix.length - 1) {
      ny = ny - 1;
    }

    return { x: nx, y: ny };
  };

  const advanceRow = (
    current: { x: number; y: number },
    matrix: any[][]
  ): { x: number; y: number } => {
    let nx = current.x;
    let ny = current.y + 1;

    if (ny > matrix.length - 1) {
      ny = matrix.length - 1;
    }

    return { x: nx, y: ny };
  };

  const retreatRow = (
    current: { x: number; y: number },
    matrix: any[][]
  ): { x: number; y: number } => {
    let nx = current.x;
    let ny = current.y - 1;

    if (ny < 0) {
      ny = 0;
    }

    return { x: nx, y: ny };
  };

  // Listen for keyboard events - store key state in object so that subsequent presses of the
  // same key trigger useEffect as value is pointing to a different location
  const keyPressed = useKeyPress();
  useEffect(() => {
    if (mode !== 'input' || !cursor) return;
    const { key } = keyPressed;
    const { x, y } = cursor;

    // Only handle keypresses if the mouse is currently over this grid square
    if (x != undefined && y != undefined) {
      switch (key) {
        case 'Delete': {
          const { x: nx, y: ny } = advanceColumn({ x, y }, matrix);
          setCursor({ x: nx, y: ny });
          setMatrixSquareProperty(nx, ny, null);
          break;
        }
        case 'Backspace': {
          const { x: nx, y: ny } = retreatColumn({ x, y }, matrix);
          setCursor({ x: nx, y: ny });
          setMatrixSquareProperty(nx, ny, null);
          break;
        }
        case 'ArrowDown':
          setCursor(advanceRow({ x, y }, matrix));
          break;
        case 'ArrowUp':
          setCursor(retreatRow({ x, y }, matrix));
          break;
        case 'ArrowLeft':
          setCursor(retreatColumn({ x, y }, matrix));
          break;
        case 'ArrowRight':
          setCursor(advanceColumn({ x, y }, matrix));
          break;
        case 'Shift':
        case 'Meta':
        case 'Alt':
        case 'Control':
        case 'Enter':
        case 'Tab':
        case 'CapsLock':
        case 'Escape':
          // ignore these
          break;
        default:
          setMatrixSquareProperty(x, y, { character: key });
          setCursor(advanceColumn({ x, y }, matrix));
      }
    }
  }, [keyPressed]);

  // holds the current in-progress selection
  const [selectionStart, setSelectionStart] = useState<
    Coordinates | undefined
  >();
  const [selection, setSelection] = useState<SelectionRegion | undefined>();
  // holds the current state of if a drag action is taking place
  // using a start & end we can find a delta to move all contents by at the end of a drag
  const [dragLocation, setDragLocation] = useState<
    | {
        start: Coordinates;
        end: Coordinates;
      }
    | undefined
  >();
  // sub-section of the matrix that is currently being dragged around
  const [dragSlice, setDragSlice] = useState<IMatrixSquare[][]>();

  // We'll use mouse-presses over the terminal to insert a special character into the terminal
  const handleMouseDown = () => {
    // in select mode, clicking means being a selection
    if (mode == 'select') {
      // check for a currently stored selection, i.e. one has currently _just_ been made
      if (!storeSelection) {
        // check for a starting point, if not then this click is ending the selection
        if (!selectionStart) {
          setStoreSelection(undefined);
          setSelectionStart({ x: cursor.x, y: cursor.y });
          setSelection({ x: cursor.x, y: cursor.y, w: 1, h: 1 });
        } else {
          // selection ending
          // store the selection & then delete the in-progress one
          setStoreSelection({ ...selection! });
          setSelectionStart(undefined);
          setSelection(undefined);
        }
      } else {
        // there's current selection area
        const [c, s] = [cursor, storeSelection];
        // check if this is the start of the drag operation by checking click within
        // bounding box of selected region
        if (
          !dragLocation &&
          // AABB
          s.x <= c.x &&
          c.x <= s.x + s.w &&
          s.y <= c.y &&
          c.y <= s.y + s.h
        ) {
          // starting a drag, take a slice of the area we're going to be shifting around
          // so it can be visualised on top of the existing matrix squares
          const slice = matrix
            .slice(s.y, s.y + s.h)
            .map(row => row.slice(s.x, s.x + s.w));

          setDragSlice(slice);
          setDragLocation({
            start: { x: c.x, y: c.y },
            end: { x: s.x, y: s.y }
          });
          console.log('clicked inside region!');
        } else {
          endSelection();
        }
      }
    }

    // in input mode, clicking means inserting a special selected character
    if (mode == 'input') {
      if (!cursor) return;
      const { x, y } = cursor;
      if (x != undefined && y != undefined) {
        if (selectedSpecialCharacter) {
          setMatrixSquareProperty(x, y, {
            character: selectedSpecialCharacter
          });
        } else {
          setMatrixSquareProperty(x, y, {
            character: matrix[y][x]?.character || ' '
          });
        }
      }
    }
  };

  const endSelection = () => {
    setStoreSelection(undefined);
    setSelectionStart(undefined);
    setSelection(undefined);
  };

  // in select mode, listen for mouse movements to expand the current in-progress selection area
  useEffect(() => {
    if (mode == 'select') {
      // check in select mode & there is a current in progress selection
      if (selectionStart && selection) {
        // c: current point, s: initial point
        const [c, s] = [{ ...cursor }, { ...selectionStart }];

        let [w, h] = [Math.abs(c.x - s.x), Math.abs(c.y - s.y)];
        let [x, y] = [s.x, s.y];

        if (c.y < s.y) {
          y = c.y;
          h = Math.abs(c.y - s.y);
        }

        if (c.x < s.x) {
          x = c.x;
          w = Math.abs(c.x - s.x);
        }

        setSelection({ x, y, w, h });
      }

      // check if there's a current drag action
      if (dragLocation) {
        setDragLocation({
          start: dragLocation.start,
          end: { x: cursor.x, y: cursor.y }
        });
      }
    }
  }, [cursor]);

  useEffect(() => {
    if (mode !== 'select') {
      endSelection();
    }
  }, [mode]);

  type MatrixSquaresProps = {
    matrix: TerminalMatrix;
    offset?: { x: number; y: number };
  };
  const MatrixSquares: React.FC<MatrixSquaresProps> = ({
    matrix,
    offset
  }: MatrixSquaresProps) => {
    offset = offset || { x: 0, y: 0 };

    return (
      <>
        {matrix.map((row, y) => {
          return row.map((column, x) => {
            return (
              matrix[y][x] != undefined && (
                <MatrixSquare
                  className={cx(
                    'absolute',
                    css({
                      left: `${(offset.x + x) * width}px`,
                      top: `${(offset.y + y) * height}px`
                    })
                  )}
                  key={matrix[y][x].__id}
                  {...column}
                ></MatrixSquare>
              )
            );
          });
        })}
      </>
    );
  };

  return (
    <div>
      <p>
        {cursor?.x},{cursor?.y}
        <br />
        {selectionStart?.x},{selectionStart?.y}
        <br />
        {selection?.x},{selection?.y},{selection?.w},{selection?.h},
      </p>

      <div
        className={classnames(
          props.className,
          'flex flex-col m-4 ml-0 relative'
        )}
      >
        {/* Our reference element to capture px dimensions of ch / rem value, hidden for UI */}
        <MatrixSquare
          ref={hiddenSquareRef}
          className="opacity-0 absolute"
          {...hiddenSquareProps}
        ></MatrixSquare>

        <div
          id="terminal"
          className={cx(
            'p-4 rounded-md shadow',
            css({ backgroundColor: terminalBackgroundColor })
          )}
          onMouseDown={handleMouseDown}
        >
          {/* has no padding, so no need to do any offset calculations to find grid square
              all matrix squares are positioned relative to this container, offsetted by
              their x * width & y * height */}
          <div
            ref={mouseRef}
            className={cx(
              'relative border border-gray-600',
              css({
                width: `${matrix[0].length * width}px`,
                height: `${matrix.length * height}px`
              })
            )}
          >
            {/* for selection mode, outline progressing selection area */}
            {mode == 'select' && selection && selectionStart && (
              <div
                className={cx(
                  'absolute border border-gray-100 z-10',
                  css({
                    left: `${selection.x * width}px`,
                    top: `${selection.y * height}px`,
                    width: `${selection.w * width}px`,
                    height: `${selection.h * height}px`
                  })
                )}
              ></div>
            )}
            {/* if an area is currently selected (in the store), show that & handle dragging motion */}
            {mode == 'select' && storeSelection && (
              <div
                className={cx(
                  'absolute border border-dashed z-10 cursor-move',
                  // highlight if currently in a dragging action
                  dragLocation ? 'border-pink-500' : 'border-gray-100',
                  css({
                    left: `${
                      ((dragLocation?.end?.x || 0) + storeSelection.x) * width
                    }px`,
                    top: `${
                      ((dragLocation?.end?.y || 0) + storeSelection.y) * height
                    }px`,
                    width: `${storeSelection.w * width}px`,
                    height: `${storeSelection.h * height}px`
                  })
                )}
              ></div>
            )}

            {/* drag around */}
            {dragSlice && (
              <MatrixSquares
                matrix={dragSlice}
                offset={dragLocation.end}
              ></MatrixSquares>
            )}

            {/* for input mode, show a cursor MatrixSquare with all the styles currently 
                don't show cursor character outside the border of the dimensions */}
            {mode == 'input' &&
              cursor &&
              0 <= cursor.x &&
              cursor.x < matrix[0].length &&
              0 <= cursor.y &&
              cursor.y < matrix.length && (
                <MatrixSquare
                  className={cx(
                    'absolute z-10',
                    css({
                      left: `${cursor.x * width}px`,
                      top: `${cursor.y * height}px`,
                      backgroundColor: editor.background
                    })
                  )}
                  {...cursorStyle}
                  character={
                    selectedSpecialCharacter ||
                    matrix[cursor.y][cursor.x]?.character ||
                    cursorStyle.character
                  }
                  is_bordered={true}
                ></MatrixSquare>
              )}

            <MatrixSquares matrix={matrix}></MatrixSquares>
          </div>
        </div>
      </div>
    </div>
  );
}
