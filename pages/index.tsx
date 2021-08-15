/**
 * sidebar
 *   [x] add/remove characters, special chars etc
 *   [x] set foreground & background colour
 *   [x] set font styling; bold, italic, underline, strikeout
 *   [x] vary dimensions of the terminal
 *   [x] change color palette & have change affect terminal
 *
 * terminal
 *   [x] 2d grid with monospace characters
 *   [ ] select region
 *       [ ] apply style across selected region
 *       [ ] drag to move all characters in selected region
 *  */

import dynamic from 'next/dynamic';
import React, { useEffect } from 'react';
import Sidebar from '../components/sidebar';
import { useStore } from '../data/store';

const TerminalNoSSR = dynamic(() => import('../components/matrix'), {
  ssr: false
});

export default function Home() {
  const setMatrix = useStore(state => state.setMatrix);
  useEffect(() => setMatrix(98, 59));

  return (
    <div className="flex h-screen w-screen bg-gray-300">
      <Sidebar className="p-4 m-4 shadow rounded w-1/4"></Sidebar>
      <TerminalNoSSR className="h-full"></TerminalNoSSR>
    </div>
  );
}
