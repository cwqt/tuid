import classnames from 'classnames';
import { clamp, delta } from 'common/helpers';
import {
  Area,
  Coordinates,
  IMatrixSquare,
  MouseButton,
  TerminalMatrix
} from 'common/interfaces';
import React, { useCallback, useEffect, useState } from 'react';
import useDimensions from 'react-use-dimensions';
import { useStore } from '../../common/store';
import { MatrixCanvas } from './canvas';
import Matrices, { IMatrixDrag } from './methods';
import { MatrixSquare } from './square';
import { KeyboardEvent } from 'react';

export default function Terminal(props: { className?: string }) {
  const {
    matrix,
    setMatrix,
    setMatrixSquareProperty,
    selection: storeSelection,
    setSelection: setStoreSelection
  } = useStore();

  // current grid position of the mouse cursor over the terminal
  const [cursor, setCursor] = useState<Coordinates | undefined>();

  // Very scientific method of guessing optimal character width for display
  const width = 8;
  const height = 16;

  // holds the current in-progress selection initial & end point
  const [selectionStartPoint, setSelectionStartPoint] = useState<
    Coordinates | undefined
  >();
  const [activeSelection, setActiveSelection] = useState<Area | undefined>();

  // holds the current state of if a drag action is taking place using a start & end we can find a
  // delta to move all contents by at the end of a drag
  const [activeDrag, setActiveDrag] = useState<IMatrixDrag | undefined>();

  // move the cursor grid position according to the mouse px position within the canvas
  const handleMouseMove = useCallback(
    (mouse: Coordinates) => {
      if (width && height && mouse?.x && mouse?.y && matrix) {
        // weird bug where typing will cause cursor to switch back and forth
        // even though the mouse position hasn't actually move - i suspect this
        // has something to do with the actual mouse cursor itself changing
        // if (mouse.x == previousMouse?.x && mouse.y == previousMouse?.y) return;

        const [x, y] = [
          clamp(0, Math.trunc(mouse.x / width), matrix[0].length - 1),
          clamp(0, Math.trunc(mouse.y / height), matrix.length - 1)
        ];

        setCursor({ x: x, y: y });
      } else {
        // set to last known position when leaving terminal bounding box
        setCursor({ x: cursor?.x, y: cursor?.y });
      }
    },
    [width, height]
  );

  // Handle mouse presses for selections & drags
  const handleMouseDown = (button: MouseButton) => {
    // right click starts off an active selection
    if (button == MouseButton.Right) {
      if (!selectionStartPoint) {
        setStoreSelection(undefined);
        setSelectionStartPoint({ x: cursor.x, y: cursor.y });
        setActiveSelection({ x: cursor.x, y: cursor.y, w: 1, h: 1 });
      }
    }

    // left click can be:
    //   * finishing the current active selection
    //   * clicking inside a selection to start a drag
    //   * inputting a character
    if (button == MouseButton.Left) {
      if (selectionStartPoint) {
        // going to be ending this selection, store the selection &
        // then delete the in-progress one
        setStoreSelection({ ...activeSelection! });
        setSelectionStartPoint(undefined);
        setActiveSelection(undefined);
        return;
      }

      // if there's a stored selection, we may be beginning a drag, or just cancelling
      if (storeSelection) {
        const [c, s] = [cursor, storeSelection];

        if (!activeDrag) {
          // check if this is the start of the drag operation by checking click within
          // bounding box of selected region
          if (Matrices.AABB(s, c)) {
            // starting a drag, take a slice of the area we're going to be shifting around
            // so it can be visualised on top of the existing matrix squares
            const slice = Matrices.slice(matrix, s);

            // at-least one square needs to have something in it
            if (slice.flat().every(v => v == null)) return endSelection();

            // begin the drag!
            return setActiveDrag({
              start: { x: c.x, y: c.y },
              end: { x: c.x, y: c.y },
              slice: slice,
              bounding_box: { ...s }
            });
          } else {
            // clicked outside region, ending selection
            return endSelection();
          }
        }
      }

      // activeDrag can be from clipboard paste or selection move
      if (activeDrag) {
        // is the translation vector of the drag
        const { x: dx, y: dy } = delta(activeDrag.start, activeDrag.end);

        // new position vector of the selected region
        const [nx, ny] = [
          activeDrag.bounding_box.x + dx,
          activeDrag.bounding_box.y + dy
        ];

        // set the terminal matrix
        setMatrix(
          // insert sub-matrix into matrix
          Matrices.insert(
            // if there's a selection then we're dragging an area around, then we
            // need to remove that selected area and replace it with this area
            // if not this is a paste insert
            storeSelection ? Matrices.remove(matrix, storeSelection) : matrix,
            activeDrag.slice,
            { x: nx, y: ny }
          )
        );

        endDrag();
      }
    }
  };

  // Listen for keyboard events to insert characters into the matrix
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (storeSelection || !cursor) return;
      const { x, y } = cursor;

      // Only handle keypresses if the mouse is currently over this grid square
      if (event.metaKey) {
        switch (event.key) {
          case 'c': {
            console.log('copy');
            break;
          }
          case 'v': {
            console.log('paste');
            navigator.clipboard
              .readText()
              .then(text => {
                const body = text.split('\n');
                const slice = Array.from({ length: body.length }, (_, y) =>
                  Array.from({ length: body[0].length }, (_, x) =>
                    Matrices.squares.create({ character: body[y][x] })
                  )
                );

                setActiveDrag({
                  start: cursor,
                  end: cursor,
                  slice: slice,
                  bounding_box: {
                    x: cursor.x,
                    y: cursor.y,
                    w: slice[0].length,
                    h: slice.length
                  }
                });
              })
              .catch(err => {
                console.error(err);
              });

            break;
          }
          case 'x': {
            console.log('cut');
            break;
          }
        }
      } else {
        switch (event.key) {
          case 'Delete': {
            const { x: nx, y: ny } = Matrices.position.cols.advance(
              { x, y },
              matrix
            );
            setCursor({ x: nx, y: ny });
            setMatrixSquareProperty(nx, ny, null);
            break;
          }
          case 'Backspace': {
            const { x: nx, y: ny } = Matrices.position.cols.retreat(
              { x, y },
              matrix
            );
            setCursor({ x: nx, y: ny });
            setMatrixSquareProperty(nx, ny, null);
            break;
          }
          case 'ArrowDown':
            setCursor(Matrices.position.rows.advance({ x, y }, matrix));
            break;
          case 'ArrowUp':
            setCursor(Matrices.position.rows.retreat({ x, y }, matrix));
            break;
          case 'ArrowLeft':
            setCursor(Matrices.position.cols.retreat({ x, y }, matrix));
            break;
          case 'ArrowRight':
            setCursor(Matrices.position.cols.advance({ x, y }, matrix));
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
            setMatrixSquareProperty(x, y, { character: event.key });
            setCursor(Matrices.position.cols.advance({ x, y }, matrix));
        }
      }
    },
    [matrix, cursor, storeSelection]
  );

  // listen for cursor position changes to expand the current in-progress selection area
  useEffect(() => {
    // update active selection to fill region between start & current cursor when it moves
    if (selectionStartPoint && activeSelection) {
      // c: current point, s: initial point
      const [c, s] = [{ ...cursor }, { ...selectionStartPoint }];

      let [w, h] = [Math.abs(c.x - s.x) + 1, Math.abs(c.y - s.y) + 1];
      let [x, y] = [s.x, s.y];

      if (c.y < s.y) {
        y = c.y;
        h = Math.abs(c.y - s.y);
      }

      if (c.x < s.x) {
        x = c.x;
        w = Math.abs(c.x - s.x);
      }

      setActiveSelection({ x, y, w, h });
    }

    // update active drag end point to mirror cursor position when it moves
    if (activeDrag) {
      setActiveDrag({
        ...activeDrag,
        end: { x: cursor.x, y: cursor.y }
      });
    }
  }, [cursor]);

  const endSelection = useCallback(() => {
    setStoreSelection(undefined);
    setSelectionStartPoint(undefined);
    setActiveSelection(undefined);
  }, []);

  const endDrag = useCallback(() => {
    setStoreSelection(undefined);
    setActiveDrag(undefined);
  }, []);

  return (
    <div>
      {/* <p className="p-4 bg-white absolute top-4 right-4 rounded shadow w-96">
        cursor: {cursor?.x},{cursor?.y}
        <br />
        selection start: {selectionStartPoint?.x},{selectionStartPoint?.y}
        <br />
        active selection: {activeSelection?.x},{activeSelection?.y},
        {activeSelection?.w},{activeSelection?.h}
        <br />
        active drag start:
        {activeDrag?.start?.x},{activeDrag?.start?.y}
        <br />
        active drag end: {activeDrag?.end?.x},{activeDrag?.end?.y}
        <br />
        stored selection: {storeSelection?.x},{storeSelection?.y},
        {storeSelection?.w},{storeSelection?.h}
      </p> */}

      <div
        className={classnames(
          props.className,
          'flex flex-col m-4 ml-0 relative'
        )}
      >
        {width && height && (
          <MatrixCanvas
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onKeyDown={handleKeyDown}
            characterDimensions={{ w: width, h: height }}
            selection={storeSelection}
            activeSelection={activeSelection}
            drag={activeDrag}
            cursor={cursor}
          ></MatrixCanvas>
        )}
      </div>
    </div>
  );
}
