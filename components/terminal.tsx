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
import useSize from "@react-hook/size";
import { forwardRef } from "@chakra-ui/react";

const Borders = ["─", " ", "│", "│", "╭", "╮", "┘", "└"];

function clamp(min, num, max) {
  return num <= min ? min : num >= max ? max : num;
}

function useKeyPress(): string {
  // State for keeping track of pressed key
  const [keyPressed, setKeyPressed] = useState<string>();

  // If pressed key is our target key then set to true
  function downHandler({ key }): void {
    setKeyPressed(key);
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

const MatrixSquare = memo(
  forwardRef((props: IMatrixSquare, ref) => {
    return (
      <div
        ref={ref}
        className={cx(
          "font-mono,",
          css({
            width: "1ch",
            height: "1em",
            color: props.foreground,
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
  const [currentHovered, setCurrentHovered] = useState<[number, number]>();

  // 30x100 grid is 3,000 nodes - having event listeners on every one to check if
  // hovered is slow as dog, instead use mouse position and some maths to figure out
  // which grid square the mouse is lies over

  const mouseRef = useRef(null);
  const mouse = useMouse(mouseRef, {
    fps: 30,
  });

  const handleClick = (x, y) => (
    console.log(x, y), setMatrixSquareProperty(x, y, { character: "X" })
  );

  // We need to know the width & height of one of these MatrixSquares
  // since they use ch/rems for dimensions, which we'll need in px to
  // find x,y position of square in the grid
  const hiddenSquareProps = createMatrixSquare({ character: "X" });
  const hiddenSquareRef = useRef(null);
  const [width, height] = useSize(hiddenSquareRef);

  useEffect(() => {
    if (width && height && mouse?.x && mouse?.y && matrix) {
      const [x, y] = [
        clamp(0, Math.floor(mouse.x / width), matrix[0].length - 1),
        clamp(0, Math.floor(mouse.y / height), matrix.length - 1),
      ];

      setCurrentHovered([x, y]);
      setMatrixSquareProperty(x, y, { character: "X" });
    }
  }, [mouse]);

  return (
    <div>
      {/* x: ${mouse.x}
      y: ${mouse.y} */}
      <div
        className={classnames(
          props.className,
          "flex items-center justify-center"
        )}
      >
        {/* Our reference element to capture px dimensions of ch / rem value, hidden for UI */}
        <MatrixSquare
          onClick={() => {}}
          className="hidden"
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
