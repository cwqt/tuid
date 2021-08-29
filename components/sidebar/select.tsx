import { useStore } from 'common/store';
import { useEffect } from 'react';
import { Button, ButtonGroup } from '@chakra-ui/react';
import { css, cx } from '@emotion/css';
import Matrices from '../matrix/methods';
import { createMatrixSquare } from 'common/interfaces';

export default function SelectSidebar(props: { className?: string }) {
  const { selection, editor, matrix, setMatrix } = useStore();

  const clearSelectedArea = () => {};

  const fillSelectedArea = () => {
    setMatrix(
      Matrices.insert(
        matrix,
        Matrices.slice(matrix, selection).map(row =>
          row.map(square =>
            square
              ? { ...square, background: editor.background }
              : createMatrixSquare({
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
    <div>
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
    </div>
  );
}
