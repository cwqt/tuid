/**
 * sidebar
 *   [x] add/remove characters, special chars etc
 *   [x] set foreground & background colour
 *   [x] set font styling; bold, italic, underline, strikeout
 *   [x] vary dimensions of the terminal
 *   [x] change color palette & have change affect terminal
 *   [ ] bucket fill follow outline characters
 *   [ ] drag & place outline characters
 *
 * terminal
 *   [x] 2d grid with monospace characters
 *   [x] select region
 *       [x] drag to move all characters in selected region
 *       [ ] apply style across selected region
 *
 * canvas
 *   [ ] convert terminal to using html5 canvas for performance
 *  */

import dynamic from 'next/dynamic';
import React, { useEffect, useMemo } from 'react';
import Sidebar from '../components/sidebar';
import { useStore } from '../common/store';

const TerminalNoSSR = dynamic(() => import('../components/matrix'), {
  ssr: false
});

export default function Home() {
  const { matrix, setMatrix, setMatrixSquareProperty } = useStore();

  useEffect(() => {
    // setMatrix(98, 59);
    setMatrix(40, 20);

    'hello world'
      .split('')
      .forEach((c, idx) =>
        setMatrixSquareProperty(idx + 1, 1, { character: c })
      );
  }, []);

  return (
    <div className="flex h-screen w-screen bg-gray-300">
      {/* Hold off first render until matrix value has been set */}
      {matrix.length && (
        <>
          <Sidebar className="p-4 m-4 shadow rounded w-1/4"></Sidebar>
          <TerminalNoSSR className="h-full"></TerminalNoSSR>
        </>
      )}
    </div>
  );
}
