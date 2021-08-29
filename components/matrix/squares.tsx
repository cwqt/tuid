import { css, cx } from '@emotion/css';
import { TerminalMatrix } from 'common/interfaces';
import { MatrixSquare } from './square';

type MatrixSquaresProps = {
  matrix: TerminalMatrix;
  offset?: { x: number; y: number };
  zIndex?: number;
};

export const MatrixSquares =
  (width: number, height: number): React.FC<MatrixSquaresProps> =>
  ({ matrix, offset, zIndex }: MatrixSquaresProps) => {
    offset = offset || { x: 0, y: 0 };

    return (
      <>
        {matrix.map((row, y) => {
          return row.map((square, x) => {
            return (
              matrix[y][x] != undefined && (
                <MatrixSquare
                  className={cx(
                    'absolute',
                    css({
                      zIndex: zIndex || 1,
                      left: `${(offset.x + x) * width}px`,
                      top: `${(offset.y + y) * height}px`,
                      border:
                        square.character == ' '
                          ? '1px solid rgba(255,255,255,0.2) !important'
                          : 'none'
                    })
                  )}
                  key={matrix[y][x].__id}
                  {...square}
                ></MatrixSquare>
              )
            );
          });
        })}
      </>
    );
  };
