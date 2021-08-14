import { Heading } from "@chakra-ui/react";
import { cx, css } from "@emotion/css";
import color from "data/color";
import { useStore } from "data/store";
import { useState } from "react";

export default function Sidebar(props: { className?: string }) {
  const { selectedColor, setSelectedColor } = useStore();

  const grid = color.grid(14, 8);

  return (
    <div className={props.className}>
      <Heading as="h1">tui designer</Heading>

      <p className="my-4">https://gitlab.com/cxss/tui-designer</p>

      <Heading as="h2" size="lg">
        Colors
      </Heading>
      <div className="flex flex-col my-2">
        {grid.map((row, ridx) => {
          return (
            <div key={ridx} className="flex">
              {row.map((column, cidx) => {
                return (
                  <div
                    key={ridx + cidx}
                    className={cx(
                      "w-5 h-5 rounded-sm m-0.5 hover:scale-150 hover:shadow-inner transform transition duration-150 cursor-pointer",
                      css({
                        backgroundColor: column,
                      })
                    )}
                  ></div>
                );
              })}
            </div>
          );
        })}
      </div>

      <Heading as="h2" size="lg">
        Special Characters
      </Heading>

      <br />
    </div>
  );
}
