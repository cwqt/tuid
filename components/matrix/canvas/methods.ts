import { Borders } from 'common/characters';
import { Coordinates, Dimensions, IMatrixSquare } from 'common/interfaces';

const makeFont = (
  fontFamily: string,
  size: number,
  bold: boolean,
  italic: boolean
) => {
  const styles = [bold && 'bold', italic && 'italic'].filter(v => v);

  // e.g. 'bold italic 14px Roboto Mono'
  const font = `${
    styles.length ? styles.join(' ') : 'normal'
  } ${size}px ${fontFamily}`;

  return font;
};

export const DEFAULT_FONT = makeFont('Roboto Mono', 13, false, false);

const borders = Object.values(Borders)
  .map(b => b.flat())
  .flat()
  .filter((b, idx, arr) => arr.indexOf(b) == idx && b !== ' ');

export const drawSquare = (
  { x, y }: Coordinates,
  { w, h }: Dimensions,
  square: IMatrixSquare,
  ctx: CanvasRenderingContext2D
) => {
  ctx.font = makeFont(
    'Roboto Mono',
    // use a larger font when rendering border characters to remove space in between them
    borders.includes(square.character) ? 16 : 13,
    square.bold,
    square.italic
  );

  if (square.background) {
    ctx.fillStyle = square.background;
    ctx.fillRect((x + 0.1) * w, y * h, w + 0.17, h);
  }

  if (square.character) {
    ctx.fillStyle = square.foreground;

    ctx.fillText(
      square.character,
      // center the character within it's box
      x * w + (w / 2 - ctx.measureText(square.character).width / 2),
      (y + 0.75) * h
    );
  }

  if (square.underline) {
    // place a line rect at the bottom
    ctx.fillStyle = square.foreground;
    ctx.fillRect(x * w, (y + 1) * h, w, 1);
  }

  if (square.strikeout) {
    // place a line half way through the square
    ctx.fillStyle = square.foreground;
    ctx.fillRect(x * w, (y + 0.4) * h, w, 1);
  }
};
