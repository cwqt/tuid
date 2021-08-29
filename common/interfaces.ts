import { nanoid } from 'nanoid';

export interface IMatrixSquare {
  character: string; // any utf-8 character
  foreground: string; // hex color
  background: string; // hex color
  underline: boolean;
  strikeout: boolean;
  bold: boolean;
  italic: boolean;
  __id: string;
}

export const DEFAULT_TERMINAL_BACKGROUND_COLOR = '#1f2937' as const;

export const createMatrixSquare = (
  square: Partial<Omit<IMatrixSquare, '__id'>> = {}
): IMatrixSquare => ({
  __id: nanoid(),
  character: square.character ?? ' ',
  foreground: square.foreground || '#fff',
  background: square.background || 'transparent',
  underline: square.underline ?? false,
  strikeout: square.strikeout ?? false,
  bold: square.bold ?? false,
  italic: square.italic ?? false
});

// x ---->     y
// [[],[],[]]  |
// [[],[],[]]  |
// [[],[],[]]  v
// [[],[],[]]
// matrix[y][x]
export type TerminalMatrix = (IMatrixSquare | undefined)[][];

export interface IEditorOptions {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikeout: boolean;
  foreground: string;
  background: string;
}

export type ICompressedMatrix = {
  [index in `${string},${string}`]: ICompressedMatrixSquare;
};

export type ICompressedMatrixSquare = [
  IMatrixSquare['character'],
  number, // bold
  number, // italic
  number, // underline
  number, // strikeout
  number, // mapped foreground
  number // mapped background
];

export interface ExportedState {
  file_title: string;
  matrix: {
    dimensions: { width: number; height: number };
    colors: string[];
    data: ICompressedMatrix;
  };
  settings: {
    terminal_background_color: string;
  };
}

export type Area = { x: number; y: number; w: number; h: number };
export type Coordinates = { x: number; y: number };
