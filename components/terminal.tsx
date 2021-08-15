import { css, cx } from "@emotion/css";
import useMouse from "@react-hook/mouse-position";
import classnames from "classnames";
import { clamp, useKeyPress } from "data/helpers";
import { createMatrixSquare } from "data/interfaces";
import React, { useEffect, useRef, useState } from "react";
import useDimensions from "react-use-dimensions";
import { useStore } from "../data/store";
import { MatrixSquare } from "./matrix-square";

export const DEFAULT_TERMINAL_BACKGROUND_COLOR = "#1f2937";

export default function Terminal(props: { className?: string }) {
  const {
    matrix,
    setMatrixSquareProperty,
    selectedSpecialCharacter,
    terminalBackgroundColor,
  } = useStore();
  const [cursor, setCursor] = useState<{
    x: number;
    y: number;
  }>({ x: undefined, y: undefined });

  // 30x100 grid is 3,000 nodes - having event listeners on every one to check if
  // hovered is slow as dog, instead use mouse position and some maths to figure out
  // which grid square the mouse is lies over
  const mouseRef = useRef(null);
  const mouse = useMouse(mouseRef, {
    leaveDelay: 0,
    enterDelay: 0,
    fps: 60,
  });

  // We need to know the width & height of one of these MatrixSquares
  // since they use ch/rems for dimensions, which we'll need in px to
  // find x,y position of square in the grid
  const hiddenSquareProps = createMatrixSquare({ character: "X" });
  const [hiddenSquareRef, { width, height }] = useDimensions();
  useEffect(() => {
    if (width && height && mouse?.x && mouse?.y && matrix) {
      const [x, y] = [
        clamp(0, Math.trunc(mouse.x / width), matrix[0].length - 1),
        clamp(0, Math.trunc(mouse.y / height), matrix.length - 1),
      ];

      setCursor({ x: x, y: y });
    } else {
      // set undefined once mouse leaves terminal bounding box
      setCursor({ x: undefined, y: undefined });
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
    const { key } = keyPressed;
    const { x, y } = cursor;

    // Only handle keypresses if the mouse is currently over this grid square
    if (x != undefined && y != undefined) {
      switch (key) {
        case "Backspace":
          const { x: nx, y: ny } = retreatColumn({ x, y }, matrix);
          setCursor({ x: nx, y: ny });
          setMatrixSquareProperty(nx, ny, { character: " " });
          break;
        case "ArrowDown":
          setCursor(advanceRow({ x, y }, matrix));
          break;
        case "ArrowUp":
          setCursor(retreatRow({ x, y }, matrix));
          break;
        case "ArrowLeft":
          setCursor(retreatColumn({ x, y }, matrix));
          break;
        case "ArrowRight":
          setCursor(advanceColumn({ x, y }, matrix));
          break;
        case "Shift":
        case "Meta":
        case "Alt":
        case "Control":
        case "Enter":
        case "Tab":
        case "CapsLock":
        case "Escape":
          // ignore these
          break;
        default:
          setMatrixSquareProperty(x, y, { character: key });
          setCursor(advanceColumn({ x, y }, matrix));
      }
    }
  }, [keyPressed]);

  // We'll use mouse-presses over the terminal to insert a special character into the terminal
  const insertSpecialCharacter = () => {
    const { x, y } = cursor;
    if (x != undefined && y != undefined) {
      if (selectedSpecialCharacter) {
        setMatrixSquareProperty(x, y, { character: selectedSpecialCharacter });
      } else {
        setMatrixSquareProperty(x, y, {
          character: matrix[y][x]?.character || " ",
        });
      }
    }
  };

  return (
    <div>
      <div className={classnames(props.className, "flex flex-col m-4 ml-0")}>
        {/* Our reference element to capture px dimensions of ch / rem value, hidden for UI */}
        <MatrixSquare
          className="opacity-0 absolute"
          onClick={() => {}}
          ref={hiddenSquareRef}
          {...hiddenSquareProps}
        ></MatrixSquare>

        <div
          id="terminal"
          className={cx(
            "p-4 rounded-md shadow",
            css({ backgroundColor: terminalBackgroundColor })
          )}
          onClick={insertSpecialCharacter}
        >
          {/* has no padding, so no need to do any offset calculations to find grid square */}
          {/* all matrix squares are positioned relative to this container, offsetted by their x & y value */}
          <div
            ref={mouseRef}
            className={cx(
              "relative border border-gray-600",
              css({
                width: `${matrix[0].length * width}px`,
                height: `${matrix.length * height}px`,
              })
            )}
          >
            {/* show a cursor MatrixSquare with all the styles currently  */}
            {/* don't show cursor character outside the border of the dimensions */}
            {0 <= cursor.x &&
              cursor.x < matrix[0].length &&
              0 <= cursor.y &&
              cursor.y < matrix.length && (
                <MatrixSquare
                  className={cx(
                    "absolute",
                    css({
                      left: `${cursor.x * width}px`,
                      top: `${cursor.y * height}px`,
                    })
                  )}
                  {...hiddenSquareProps}
                  character={matrix[cursor.y][cursor.x]?.character || " "}
                  is_bordered={true}
                ></MatrixSquare>
              )}

            {matrix.map((row, y) => {
              return (
                <div key={`column-${y}`} className="flex">
                  {row.map((column, x) => {
                    return (
                      matrix[y][x] != undefined && (
                        <MatrixSquare
                          className={cx(
                            "absolute",
                            css({
                              left: `${x * width}px`,
                              top: `${y * height}px`,
                            })
                          )}
                          key={`${x}-${y}`}
                          {...column}
                        ></MatrixSquare>
                      )
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
