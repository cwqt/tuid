import { Coordinates, Dimensions, IMatrixSquare } from 'common/interfaces';

export const drawSquare = (
  { x, y }: Coordinates,
  { w, h }: Dimensions,
  square: IMatrixSquare,
  ctx: CanvasRenderingContext2D
) => {
  ctx.fillText(square.character, x * w, y * h);
};
