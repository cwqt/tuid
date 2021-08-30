import { Button, Heading } from '@chakra-ui/react';
import { css, cx } from '@emotion/css';
import { useStore } from 'common/store';
import React from 'react';
import Matrices from '../matrix/methods';
import { Borders } from '../../common/characters';

export default function SelectSidebar() {
  const { selection, editor, matrix, setMatrix } = useStore();

  const clearSelectedArea = () => {
    setMatrix(
      Matrices.insert(
        matrix,
        Matrices.slice(matrix, selection).map(row => row.map(square => null)),
        selection
      )
    );
  };

  const fillSelectedArea = () => {
    setMatrix(
      Matrices.insert(
        matrix,
        Matrices.slice(matrix, selection).map(row =>
          row.map(square =>
            square
              ? { ...square, background: editor.background }
              : Matrices.squares.create({
                  background: editor.background,
                  character: ' '
                })
          )
        ),
        selection
      )
    );
  };

  return (
    <>
      <div className="flex">
        <Button
          colorScheme="purple"
          isFullWidth
          disabled={selection == undefined}
          onClick={fillSelectedArea}
        >
          Fill selected background
        </Button>

        <div
          className={cx(
            'ml-2 w-10 h-10 rounded-lg',
            css({
              backgroundColor: editor.background,
              opacity: selection == undefined ? 0.5 : 1
            })
          )}
        ></div>
      </div>
      <p className="mt-2">
        Change fill colour by altering background color in <i>Input</i>
      </p>

      <div className="flex mt-4">
        <Button
          colorScheme="red"
          onClick={clearSelectedArea}
          isFullWidth
          disabled={selection == undefined}
        >
          Clear selected area
        </Button>
      </div>
    </>
  );
}
