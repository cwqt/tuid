export interface IMatrixSquare {
  character: string; // any utf-8 character
  foreground: string; // hex color
  background: string; // hex color
  underline: boolean;
  strikeout: boolean;
  bold: boolean;
  italic: boolean;
}

export const createMatrixSquare = (
  square: Partial<IMatrixSquare> = {}
): IMatrixSquare => ({
  character: square.character ?? " ",
  foreground: square.foreground || "#fff",
  background: square.background || "transparent",
  underline: square.underline ?? false,
  strikeout: square.strikeout ?? false,
  bold: square.bold ?? false,
  italic: square.italic ?? false,
});

// x ---->     y
// [[],[],[]]  |
// [[],[],[]]  |
// [[],[],[]]  v
// [[],[],[]]
// matrix[y][x]
export type TerminalMatrix = (IMatrixSquare | undefined)[][];
export type TerminalDepth = "foreground" | "background";

export interface IEditorOptions {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikeout: boolean;
  color: string;
  depth: TerminalDepth;
}
