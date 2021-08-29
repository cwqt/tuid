import { forwardRef } from '@chakra-ui/react';
import { css, cx } from '@emotion/css';
import { IMatrixSquare } from 'common/interfaces';
import { memo } from 'react';

type UiMatrixSquare = IMatrixSquare & {
  isBordered: boolean;
  className: string;
};

export const MatrixSquare = memo(
  forwardRef((props: UiMatrixSquare, ref) => {
    return (
      <span
        ref={ref}
        className={cx(
          props.className,
          'font-mono leading-4 text-sm select-none',
          css({
            border: `${props.isBordered ? 1 : 0}px solid white`,
            width: '1ch',
            height: '1em',
            color: props.foreground,
            backgroundColor: props.background,
            fontWeight: props.bold ? 'bold' : 'normal',
            fontStyle: props.italic ? 'italic' : 'normal',
            textDecoration: props.strikeout
              ? 'line-through'
              : props.underline
              ? 'underline'
              : 'normal'
          })
        )}
      >
        {props.character}
      </span>
    );
  })
);
