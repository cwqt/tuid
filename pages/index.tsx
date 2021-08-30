/**
 * todo list:
 *
 * misc
 *  [ ] README.md on terminal
 *  [ ] clear entire terminal
 *
 * sidebar
 *   [x] add/remove characters, special chars etc
 *   [x] set foreground & background colour
 *   [x] set font styling; bold, italic, underline, strikeout
 *   [x] vary dimensions of the terminal
 *   [x] change color palette & have change affect terminal
 *   [ ] bucket fill follow border characters
 *   [x] drag & place outline characters
 *
 * terminal
 *   [x] 2d grid with monospace characters
 *   [x] select region
 *       [x] drag to move all characters in selected region
 *       [ ] apply editor style across selected region
 *       [x] delete selection
 * canvas
 *   [x] convert terminal to using html5 canvas for performance
 *
 * keybindings
 *   [ ] undo & redo
 *   [ ] copy, cut & paste
 *       [ ] from clipboard
 *       [ ] from terminal selection
 *   [ ] delete selection
 *  */

import { css, cx } from '@emotion/css';
import dynamic from 'next/dynamic';
import React, { useEffect } from 'react';
import { useStore } from '../common/store';
import Matrices from '../components/matrix/methods';
import Sidebar from '../components/sidebar';

import README from '../README.tui';

const TerminalNoSSR = dynamic(() => import('../components/matrix'), {
  ssr: false
});

export default function Home() {
  const { matrix, importState } = useStore();

  useEffect(() => {
    importState(README);
  }, []);

  return (
    <div className="flex h-screen w-screen bg-gray-300">
      {/* Hold off first render until matrix value has been set */}
      {matrix.length && (
        <>
          <Sidebar
            className={cx(
              'm-4 shadow rounded',
              css({ minWidth: '340px', maxWidth: '340px' })
            )}
          ></Sidebar>
          <TerminalNoSSR className="h-full flex-shrink-1"></TerminalNoSSR>
        </>
      )}
    </div>
  );
}
