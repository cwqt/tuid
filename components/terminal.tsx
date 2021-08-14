import { createMatrixSquare, IMatrixSquare, useStore } from "../data/store";
import {
  memo,
  MutableRefObject,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import classnames from "classnames";
import { cx, css } from "@emotion/css";
import useMouse from "@react-hook/mouse-position";
import useThrottle from "@react-hook/throttle";

import { forwardRef } from "@chakra-ui/react";

import useDimensions from "react-use-dimensions";

// const Borders = ["─", " ", "│", "│", "╭", "╮", "┘", "└"];

const Borders = {
  Square: [
    ["╭", "─", "╮"],
    ["│", " ", "│"],
    ["└", "─", "┘"],
  ],
};

// 8 x 14 grid,

function clamp(min, num, max) {
  return num <= min ? min : num >= max ? max : num;
}

function useKeyPress(): { key: string } {
  // State for keeping track of pressed key
  const [keyPressed, setKeyPressed] = useState<{ key: string }>({
    key: undefined,
  });

  // If pressed key is our target key then set to true
  function downHandler({ key }): void {
    setKeyPressed({ key });
  }

  // Add event listeners
  useEffect(() => {
    window.addEventListener("keydown", downHandler);
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener("keydown", downHandler);
    };
  }, []); // Empty array ensures that effect is only run on mount and unmount

  return keyPressed;
}

type UiMatrixSquare = IMatrixSquare & { is_bordered: boolean };

const MatrixSquare = memo(
  forwardRef((props: UiMatrixSquare, ref) => {
    return (
      <div
        ref={ref}
        className={cx(
          "font-mono",
          css({
            border: `${props.is_bordered ? 1 : 0}px solid white`,
            width: "1ch",
            height: "1em",
            color: props.foreground,
            // backgroundColor: props.background,
            "hover:": {
              backgroundColor: "red",
            },
          })
        )}
      >
        {props.character}
      </div>
    );
  })
);

export default function Terminal(props: { className?: string }) {
  const { matrix, setMatrixSquareProperty } = useStore();
  const [cursor, setCursor] = useState<{
    x: number;
    y: number;
  }>({ x: undefined, y: undefined });

  // 30x100 grid is 3,000 nodes - having event listeners on every one to check if
  // hovered is slow as dog, instead use mouse position and some maths to figure out
  // which grid square the mouse is lies over
  const mouseRef = useRef(null);
  const mouse = useMouse(mouseRef, {
    leaveDelay: 500,
    enterDelay: 500,
    fps: 60,
  });

  // We need to know the width & height of one of these MatrixSquares
  // since they use ch/rems for dimensions, which we'll need in px to
  // find x,y position of square in the grid
  const hiddenSquareProps = createMatrixSquare({ character: "X" });
  const [hiddenSquareRef, { width, height }] = useDimensions();

  useEffect(() => {
    if (width && height && mouse?.x && mouse?.y && matrix) {
      console.log(mouse.y / height);

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

  return (
    <div>
      <div className={classnames(props.className, "flex flex-col")}>
        {/* Our reference element to capture px dimensions of ch / rem value, hidden for UI */}
        <MatrixSquare
          onClick={() => {}}
          ref={hiddenSquareRef}
          {...hiddenSquareProps}
        ></MatrixSquare>

        <div id="terminal" className="bg-gray-800 p-4 rounded-md shadow">
          {/* has no padding, so no need to do any offset calculations to find grid square */}
          <div ref={mouseRef} className="border border-white">
            {matrix.map((row, y) => {
              return (
                <div key={`column-${y}`} className="flex">
                  {row.map((column, x) => {
                    return (
                      <MatrixSquare
                        key={`${x}-${y}`}
                        {...column}
                        is_bordered={cursor.x == x && cursor.y == y}
                      ></MatrixSquare>
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
