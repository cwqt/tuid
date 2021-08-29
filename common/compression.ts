import { nanoid } from 'nanoid';
import color from './color';
import {
  ExportedState,
  ICompressedMatrix,
  ICompressedMatrixSquare,
  IMatrixSquare,
  TerminalMatrix
} from './interfaces';

const decompressMatrixSquare = (
  square: ICompressedMatrixSquare,
  colors: ExportedState['matrix']['colors']
): IMatrixSquare => ({
  __id: nanoid(),
  character: square[0],
  bold: square[1] == 1 ? true : false,
  italic: square[2] == 1 ? true : false,
  underline: square[3] == 1 ? true : false,
  strikeout: square[4] == 1 ? true : false,
  foreground: colors[square[5]],
  background: colors[square[6]]
});

const compressMatrixSquare = (
  square: IMatrixSquare,
  colors: ExportedState['matrix']['colors']
): ICompressedMatrixSquare => [
  square.character,
  square.bold ? 1 : 0,
  square.italic ? 1 : 0,
  square.underline ? 1 : 0,
  square.strikeout ? 1 : 0,
  colors.includes(square.foreground)
    ? colors.findIndex(color => color == square.foreground)
    : (colors.push(square.foreground), colors.length - 1),
  colors.includes(square.background)
    ? colors.findIndex(color => color == square.background)
    : (colors.push(square.background), colors.length - 1)
];

const compressMatrix = (matrix: TerminalMatrix): ExportedState['matrix'] =>
  matrix.reduce(
    (compressed, _, rowIdx) => {
      for (let colIdx = 0; colIdx < matrix[rowIdx].length - 1; colIdx++) {
        if (matrix[rowIdx][colIdx]) {
          compressed.data[`${rowIdx},${colIdx}`] = compressMatrixSquare(
            matrix[rowIdx][colIdx],
            compressed.colors
          );
        }
      }

      return compressed;
    },
    {
      data: {},
      colors: [],
      dimensions: { width: matrix[0].length, height: matrix.length }
    }
  );

const decompressMatrix = (matrix: ExportedState['matrix']): TerminalMatrix => {
  const decompressed = Array.from({ length: matrix.dimensions.height }, () =>
    Array.from({ length: matrix.dimensions.width }, () => undefined)
  );

  Object.entries(matrix.data).forEach(
    ([position, square]: [string, ICompressedMatrixSquare]) => {
      const [rowIdx, colIdx] = position.split(',');
      decompressed[rowIdx][colIdx] = decompressMatrixSquare(
        square,
        matrix.colors
      );
    }
  );

  return decompressed;
};

export default {
  matrix: {
    compress: compressMatrix,
    decompress: decompressMatrix
  },
  square: {
    compress: compressMatrixSquare,
    decompress: decompressMatrixSquare
  }
};
