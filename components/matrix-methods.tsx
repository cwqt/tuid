// Handle moving the current cursor position from arrow keypresses

import { Area, IMatrixSquare } from 'common/interfaces';

// account for wrapping / boundaries of terminal
export const retreatColumn = (
  current: { x: number; y: number },
  matrix: any[][]
): { x: number; y: number } => {
  let nx = current.x - 1;
  let ny = current.y;

  // handle if backing beyond terminal boundary
  if (nx < 0) {
    nx = matrix[0].length - 1;
    ny = ny - 1;
  }

  // handle if backing beyond y plane
  if (ny < 0) {
    ny = 0;
  }

  return { x: nx, y: ny };
};

export const advanceColumn = (
  current: { x: number; y: number },
  matrix: any[][]
): { x: number; y: number } => {
  // move cursor to next position
  let nx = current.x + 1;
  let ny = current.y;

  // handle if cursor x incremented over matrix width
  if (nx > matrix[0].length - 1) {
    nx = 0;
    ny = ny + 1;
  }

  // handle if cursor y incremented over matrix height
  if (ny > matrix.length - 1) {
    ny = ny - 1;
  }

  return { x: nx, y: ny };
};

export const advanceRow = (
  current: { x: number; y: number },
  matrix: any[][]
): { x: number; y: number } => {
  let nx = current.x;
  let ny = current.y + 1;

  if (ny > matrix.length - 1) {
    ny = matrix.length - 1;
  }

  return { x: nx, y: ny };
};

export const retreatRow = (
  current: { x: number; y: number },
  matrix: any[][]
): { x: number; y: number } => {
  let nx = current.x;
  let ny = current.y - 1;

  if (ny < 0) {
    ny = 0;
  }

  return { x: nx, y: ny };
};

export const sliceMatrix = (matrix: IMatrixSquare[][], area: Area) =>
  matrix.slice(area.y, area.h).map(row => row.slice(area.x, area.w));
