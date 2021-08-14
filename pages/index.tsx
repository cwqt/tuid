import { useStore } from "../data/store";
import React, { useEffect } from "react";
import Sidebar from "../components/sidebar";
import Terminal from "../components/terminal";

/**
 * sidebar
 *   add/remove characters, special chars etc
 *      select character, click terminal grid
 *   set foreground & background colour
 *   vary dimensions of the terminal
 *   change color palette & have change affect terminal
 *
 * terminal
 *   2d grid with monospace characters
 */

import dynamic from "next/dynamic";

const TerminalNoSSR = dynamic(() => import("../components/terminal"), {
  ssr: false,
});

export default function Home() {
  const setMatrix = useStore((state) => state.setMatrix);
  useEffect(() => setMatrix(100, 30));

  return (
    <div className="flex h-screen">
      <Sidebar className="w-1/4 h-full p-4"></Sidebar>
      <TerminalNoSSR className="w-3/4 h-full"></TerminalNoSSR>
    </div>
  );
}
