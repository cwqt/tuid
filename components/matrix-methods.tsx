// Handle moving the current cursor position from arrow keypresses

import { Area, Coordinates, IMatrixSquare } from 'common/interfaces';

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
  matrix.slice(area.y, area.h).map(row => row.slice(area.x, area.w));

const remove = (matrix: IMatrixSquare[][], area: Area): IMatrixSquare[][] =>
  matrix.map((row, y) =>
    row.map((square, x) =>
      // null all those within the area bounding box
      AABB(area, { x, y }) ? null : square
    )
  );

const insert = (
  matrix: IMatrixSquare[][],
  submatrix: IMatrixSquare[][],
  at: Coordinates
): IMatrixSquare[][] =>
  // why yes i am a functional programmer how could you tell
  ((bb: Area) =>
    matrix.map((row, y) =>
      row.map((square, x) =>
        AABB({ x, y }, bb) ? submatrix[y - at.y][x - at.x] : square
      )
    ))({
    x: at.x,
    y: at.y,
    w: submatrix[0].length - 1,
    h: submatrix.length - 1
  });

export default {
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

// const m = matrix.reduce<TerminalMatrix>((m, row, y) => {
//   console.log(y);

//   if (ny <= y && y <= ny) {
//     console.log(y, ny);

//     m[y] = [
//       ...row.slice(0, start.x),
//       ...activeDragMatrixSlice[y - ny],
//       ...row.slice(start.x + (end.x - start.x))
//     ];
//   } else {
//     m[y] = row;
//   }

//   return m;
// }, []);
