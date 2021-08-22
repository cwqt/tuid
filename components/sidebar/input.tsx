import { Button, Checkbox, Heading } from '@chakra-ui/react';
import { css, cx } from '@emotion/css';
import color from 'common/color';
import specialCharacters from 'common/special-characters';
import { useStore } from 'common/store';
import { useEffect } from 'react';
import { useState } from 'react';

export const thisIsAnUnusedExport =
  'this export only exists to disable fast refresh for this file';

export default function InputSidebar(props: { className?: string }) {
  const {
    editor,
    setEditorProperties,
    selectedSpecialCharacter,
    setSelectedSpecialCharacter,
    terminalBackgroundColor
  } = useStore();

  // create a 14 x 9 grid of all colors, inc. a special row for black to white
  const initialGrid = color
    .grid(14, 8, ['#f25d94', '#edff82', '#643aff', '#14f9d5'])
    .concat(color.grid(12, 1, ['#000000', '#ffffff']));
  // and then add pure white & default terminal background
  initialGrid[initialGrid.length - 1].push('#ffffff');
  initialGrid[initialGrid.length - 1].push(terminalBackgroundColor);

  // we'll update the current terminal colour grid square when it changes from the terminal tab
  const [grid, setGrid] = useState<string[][]>(initialGrid);

  // subscribe to terminal background color changing & update terminal color grid square to new color
  useEffect(() => {
    const g = grid.map(g => g.slice());
    g[g.length - 1][g[g.length - 1].length - 1] = terminalBackgroundColor;
    setGrid(g);
  }, [terminalBackgroundColor]);

  const [depth, setDepth] = useState<'background' | 'foreground'>('foreground');

  return (
    <div>
      <div className="flex items-center justify-between">
        <Heading as="h2" size="md">
          Colors
        </Heading>
      </div>

      <div className="flex flex-col my-2">
        {grid.map((row, ridx) => {
          return (
            <div key={ridx} className="flex">
              {row.map((column, cidx) => {
                return (
                  <div
                    onClick={() => setEditorProperties({ [depth]: column })}
                    key={ridx + cidx}
                    className={cx(
                      'w-5 h-5 hover:z-10 rounded-sm overflow-visible transform transition duration-150 cursor-pointer',
                      css({
                        backgroundColor: column,
                        margin: '1px',
                        ':hover': {
                          border: '1px solid white',
                          transform: 'scale(2)'
                        }
                      })
                    )}
                  ></div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <Button
          onClick={() => setDepth('foreground')}
          size="sm"
          colorScheme="teal"
          variant={depth == 'foreground' ? 'outline' : 'ghost'}
        >
          <span className="opacity-90 center">Foreground</span>
          <div
            className={cx(
              'ml-2 w-6 h-6 rounded  border border-gray-300',
              css({
                backgroundColor: editor.foreground
              })
            )}
          ></div>
        </Button>

        <Button
          onClick={() => setDepth('background')}
          size="sm"
          colorScheme="teal"
          variant={depth == 'background' ? 'outline' : 'ghost'}
        >
          <span className="opacity-90 center">Background</span>
          <div
            className={cx(
              'ml-2 w-6 h-6 rounded  border border-gray-300',
              css({
                backgroundColor: editor.background
              })
            )}
          ></div>
        </Button>
      </div>

      <Heading as="h2" size="md" className="my-4">
        Text options
      </Heading>

      <div className="grid grid-cols-2 mb-2">
        <Checkbox
          onChange={() => setEditorProperties({ bold: !editor.bold })}
          isChecked={editor.bold}
        >
          Bold
        </Checkbox>
        <Checkbox
          onChange={() => setEditorProperties({ italic: !editor.italic })}
          isChecked={editor.italic}
        >
          Italic
        </Checkbox>
        <Checkbox
          onChange={() => setEditorProperties({ underline: !editor.underline })}
          isChecked={editor.underline}
        >
          Underlined
        </Checkbox>
        <Checkbox
          onChange={() => setEditorProperties({ strikeout: !editor.strikeout })}
          isChecked={editor.strikeout}
        >
          Strikeout
        </Checkbox>
      </div>

      <Heading as="h2" size="md" className="my-4">
        Special Characters
      </Heading>

      <div className="grid grid-cols-2 gap-y-4">
        {Object.entries(specialCharacters).map(([key, value]) => {
          return (
            <div key={key}>
              <Heading as="h3" size="md" className="mb-2 text-center">
                {key}
              </Heading>

              {value.map((row, ridx) => {
                return (
                  <div className="flex w-full justify-center" key={ridx}>
                    {row.map((character, cidx) => (
                      <Button
                        key={ridx + cidx}
                        onClick={() => setSelectedSpecialCharacter(character)}
                        size="xs"
                        colorScheme="teal"
                        variant={
                          character == selectedSpecialCharacter
                            ? 'solid'
                            : 'ghost'
                        }
                      >
                        <span className="w-4 text-lg font-mono">
                          {character}
                        </span>
                      </Button>
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
