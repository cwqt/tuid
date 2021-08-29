import { Area, Coordinates, IMatrixSquare } from 'common/interfaces';

const create = (
  width: number,
  height: number,
  m: IMatrixSquare[][] = []
): IMatrixSquare[][] => {
  let matrix: IMatrixSquare[][] =
    // on initial load, matrix length will be 0x0, so create a fresh matrix
    m.length == 0
      ? Array.from({ length: height }, () =>
          Array.from({ length: width }, undefined)
        )
      : m;

  // if matrix was not starting from 0x0, then this matrix == m
  if (matrix == m) {
    // change in height
    if (height != m.length) {
      if (height < m.length) {
        // height decremented
        matrix = m.slice(0, height);
      } else {
        // height incremented
        matrix = m.concat(
          Array.from({ length: height - m.length }, () =>
            Array.from({ length: width }, () => undefined)
          )
        );
      }
    }

    // change in width
    if (width != m[0].length) {
      for (let y = 0; y < matrix.length - 1; y++) {
        if (width < matrix[y].length) {
          // width decremented
          matrix[y] = m[y].slice(0, width);
        } else {
          // width incremented
          matrix[y] = m[y].concat(
            Array.from({ length: width - m[y].length }, () => undefined)
          );
        }
      }
    }
  }

  return matrix;
};

// Handle moving the current cursor position from arrow keypresses
// account for wrapping / boundaries of terminal
const retreatColumn = (
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

const advanceColumn = (
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

const advanceRow = (
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

const retreatRow = (
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

// axis-aligned bounding box collision detection
const AABB = (a: Area | Coordinates, b: Area | Coordinates) =>
  a.x <= b.x + (b['w'] || 0) &&
  b.x <= a.x + (a['w'] || 0) &&
  a.y <= b.y + (b['h'] || 0) &&
  b.y <= a.y + (a['h'] || 0);

const slice = (matrix: IMatrixSquare[][], area: Area) =>
  matrix
    .slice(area.y, area.y + area.h)
    .map(row => row.slice(area.x, area.x + area.w));

const remove = (matrix: IMatrixSquare[][], area: Area): IMatrixSquare[][] =>
  matrix.map((row, y) =>
    row.map((square, x) =>
      // null all those within the area bounding box
      AABB(area, { x, y }) ? null : square
    )
  );

const insert = (
  matrix: IMatrixSquare[][],
  subMatrix: IMatrixSquare[][],
  at: Coordinates
): IMatrixSquare[][] =>
  // why yes i am a functional programmer how could you tell
  ((bb: Area) =>
    matrix.map((row, y) =>
      row.map((square, x) =>
        AABB({ x, y }, bb) ? subMatrix[y - at.y][x - at.x] : square
      )
    ))({
    x: at.x,
    y: at.y,
    w: subMatrix[0].length - 1,
    h: subMatrix.length - 1
  });

export default {
  create,
  AABB,
  slice,
  insert,
  remove,
  position: {
    rows: {
      advance: advanceRow,
      retreat: retreatRow
    },
    cols: {
      advance: advanceColumn,
      retreat: retreatColumn
    }
  }
};
