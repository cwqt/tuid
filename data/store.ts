import create from "zustand";

export interface IMatrixSquare {
  character: string; // any utf-8 character
  foreground: string; // hex color
  background: string; // hex color
  underlined: boolean;
  bold: boolean;
  italic: boolean;
}

export const createMatrixSquare = (
  square: Partial<IMatrixSquare> = {}
): IMatrixSquare => ({
  character: square.character ?? " ",
  foreground: square.foreground || "#fff",
  background: square.background || "#000",
  underlined: square.underlined ?? false,
  bold: square.bold ?? false,
  italic: square.italic ?? false,
});

// matrix[x][y]
// x ---->     y
// [[],[],[]]  |
// [[],[],[]]  |
// [[],[],[]]  v
// [[],[],[]]
// matrix[y][x]
type TerminalMatrix = IMatrixSquare[][];

export const useStore = create<{
  matrix: TerminalMatrix;
  setMatrix: (width: number, height: number) => void;
  setMatrixSquareProperty: (
    x: number,
    y: number,
    data: Partial<IMatrixSquare>
  ) => void;
}>((set) => ({
  matrix: [],
  setMatrix: (width, height) =>
    set((state) => ({
      ...state,
      matrix: Array.from({ length: height }, () =>
        Array.from({ length: width }, createMatrixSquare)
      ),
    })),

  setMatrixSquareProperty: (x, y, data) =>
    set((state) => {
      state.matrix[y][x] = { ...state.matrix[y][x], ...data };
      return state;
    }),
}));
